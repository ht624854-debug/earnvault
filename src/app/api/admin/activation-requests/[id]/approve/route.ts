import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog, getSetting } from '@/lib/settings';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const { id } = await params;

    const activationRequest = await db.activationRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!activationRequest) {
      return NextResponse.json(
        { error: 'Activation request not found' },
        { status: 404 }
      );
    }

    if (activationRequest.status !== 'Pending') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    // Update activation request
    await db.activationRequest.update({
      where: { id },
      data: {
        status: 'Approved',
        approved_by: adminId,
      },
    });

    // Update user package status
    await db.user.update({
      where: { id: activationRequest.user_id },
      data: { package_status: 'Active' },
    });

    // Add amount to user deposit_balance
    const userBefore = await db.user.findUnique({
      where: { id: activationRequest.user_id },
    });
    const depositBefore = userBefore?.deposit_balance || 0;
    const depositAfter = depositBefore + activationRequest.amount;

    await db.user.update({
      where: { id: activationRequest.user_id },
      data: { deposit_balance: depositAfter },
    });

    // Create transaction record
    await db.transaction.create({
      data: {
        user_id: activationRequest.user_id,
        type: 'activation',
        amount: activationRequest.amount,
        status: 'Completed',
        balance_before: depositBefore,
        balance_after: depositAfter,
        reference_type: 'ActivationRequest',
        reference_id: id,
        description: `Account activation - ${activationRequest.amount} added to deposit balance`,
      },
    });

    // Check referral reward on activation - Multi-Level Commission System
    const referralRewardEnabled = await getSetting('referral_reward_on_activation');
    const isReferralRewardEnabled = referralRewardEnabled && referralRewardEnabled !== 'false' && referralRewardEnabled !== '0';

    if (isReferralRewardEnabled && activationRequest.user.referred_by_id) {
      // Get all commission levels defined by admin (sorted by level asc)
      const commissionLevels = await db.referralCommissionLevel.findMany({
        orderBy: { level: 'asc' },
      });

      // Trace the referral chain upwards from the activated user
      // Level 1 = direct referrer, Level 2 = referrer's referrer, etc.
      let currentUserId: string | null = activationRequest.user.referred_by_id;
      let level = 1;

      while (currentUserId && level <= 10) { // Safety limit of 10 levels
        const referrer = await db.user.findUnique({
          where: { id: currentUserId },
        });

        if (!referrer) break;

        // Find commission for this level
        let commissionAmount = 0;
        const levelConfig = commissionLevels.find((cl) => cl.level === level);

        if (levelConfig) {
          commissionAmount = levelConfig.commission_amount;
        } else if (level === 1) {
          // Level 1 fallback: use referral_reward setting
          commissionAmount = parseFloat(
            (await getSetting('referral_reward')) || '0'
          );
        }
        // If no config for this level and level > 1, commission = 0 (stop distributing)

        if (commissionAmount > 0) {
          const referrerBalanceBefore = referrer.main_balance;
          const referrerBalanceAfter = referrerBalanceBefore + commissionAmount;

          await db.user.update({
            where: { id: referrer.id },
            data: { main_balance: referrerBalanceAfter },
          });

          await db.transaction.create({
            data: {
              user_id: referrer.id,
              type: 'referral_reward',
              amount: commissionAmount,
              status: 'Completed',
              balance_before: referrerBalanceBefore,
              balance_after: referrerBalanceAfter,
              reference_type: 'User',
              reference_id: activationRequest.user_id,
              description: `Referral commission (Level ${level}) - ${activationRequest.user.username} activated`,
            },
          });

          // Update referral record for direct referrer (level 1)
          if (level === 1) {
            await db.referral.updateMany({
              where: {
                referrer_id: referrer.id,
                referred_user_id: activationRequest.user_id,
              },
              data: {
                reward_status: 'Paid',
                reward_amount: commissionAmount,
              },
            });
          }
        }

        // Move up the chain - find this referrer's referrer
        if (referrer.referred_by_id) {
          currentUserId = referrer.referred_by_id;
          level++;
        } else {
          break; // No more referrers in the chain
        }
      }
    }

    await createAuditLog(
      adminId,
      'APPROVE_ACTIVATION',
      'ActivationRequest',
      id,
      `Approved activation request for user ${activationRequest.user.username}, amount: ${activationRequest.amount}`
    );

    return NextResponse.json({
      message: 'Activation request approved successfully',
    });
  } catch (error) {
    console.error('Approve activation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
