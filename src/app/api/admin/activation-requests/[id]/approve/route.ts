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

    // Check referral reward on activation
    const referralRewardEnabled = await getSetting('referral_reward_on_activation');
    // Setting can be 'true', '1', or a numeric amount like '100' — all are truthy
    const isReferralRewardEnabled = referralRewardEnabled && referralRewardEnabled !== 'false' && referralRewardEnabled !== '0';
    if (isReferralRewardEnabled && activationRequest.user.referred_by_id) {
      const referrer = await db.user.findUnique({
        where: { id: activationRequest.user.referred_by_id },
      });

      if (referrer) {
        // Count how many referrals the referrer has that are now activated (to determine the level)
        const activatedReferrals = await db.referral.findMany({
          where: {
            referrer_id: referrer.id,
            status: 'Active',
          },
          include: {
            referred_user: {
              select: { package_status: true },
            },
          },
          orderBy: { created_at: 'asc' },
        });

        // Determine the level of this referral (1st, 2nd, 3rd, etc.)
        const activatedCount = activatedReferrals.filter(
          (r) => r.referred_user?.package_status?.toLowerCase() === 'active'
        ).length;

        // The current referral being approved counts as the latest activated one
        const referralLevel = activatedCount;

        // Look up the reward for that level from ReferralRewardTier table
        let referralRewardAmount = 0;
        const tier = await db.referralRewardTier.findUnique({
          where: { level: referralLevel },
        });

        if (tier) {
          referralRewardAmount = tier.reward_amount;
        } else {
          // Fall back to the referral_reward setting if no tier exists for that level
          referralRewardAmount = parseFloat(
            (await getSetting('referral_reward')) || '0'
          );
        }

        if (referralRewardAmount > 0) {
          const referrerBalanceBefore = referrer.main_balance;
          const referrerBalanceAfter = referrerBalanceBefore + referralRewardAmount;

          await db.user.update({
            where: { id: referrer.id },
            data: { main_balance: referrerBalanceAfter },
          });

          await db.transaction.create({
            data: {
              user_id: referrer.id,
              type: 'referral_reward',
              amount: referralRewardAmount,
              status: 'Completed',
              balance_before: referrerBalanceBefore,
              balance_after: referrerBalanceAfter,
              reference_type: 'User',
              reference_id: activationRequest.user_id,
              description: `Referral reward (Level ${referralLevel}) for referring ${activationRequest.user.username}`,
            },
          });

          // Update referral record
          await db.referral.updateMany({
            where: {
              referrer_id: referrer.id,
              referred_user_id: activationRequest.user_id,
            },
            data: {
              reward_status: 'Paid',
              reward_amount: referralRewardAmount,
            },
          });
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
