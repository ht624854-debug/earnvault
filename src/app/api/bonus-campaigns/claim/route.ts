import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const { campaign_id } = await request.json();
    if (!campaign_id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    // Get campaign
    const campaign = await db.bonusCampaign.findUnique({ where: { id: campaign_id } });
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get or create user's campaign entry
    let userCampaign = await db.userBonusCampaign.findUnique({
      where: {
        user_id_campaign_id: { user_id: userId, campaign_id },
      },
    });

    if (!userCampaign) {
      // Auto-enroll user in this campaign
      const now = new Date();
      const expiresAt = new Date(now.getTime() + campaign.time_limit_hours * 60 * 60 * 1000);
      userCampaign = await db.userBonusCampaign.create({
        data: {
          user_id: userId,
          campaign_id,
          status: 'In Progress',
          started_at: now,
          expires_at: expiresAt,
        },
      });
    }

    // Count active referrals
    const activeReferrals = await db.referral.count({
      where: {
        referrer_id: userId,
        referred_user: { package_status: { in: ['Active', 'active'] } },
      },
    });

    // Check if completed
    if (activeReferrals < campaign.required_referrals) {
      return NextResponse.json({ error: `Need ${campaign.required_referrals} referrals. You have ${activeReferrals}.` }, { status: 400 });
    }

    // Check time limit
    if (new Date() > userCampaign.expires_at) {
      await db.userBonusCampaign.update({
        where: { id: userCampaign.id },
        data: { status: 'Expired' },
      });
      return NextResponse.json({ error: 'Campaign time limit has expired' }, { status: 400 });
    }

    if (userCampaign.status === 'Claimed') {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 });
    }

    // Claim the reward!
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newBalance = user.main_balance + campaign.reward_amount;

    await db.$transaction([
      db.userBonusCampaign.update({
        where: { id: userCampaign.id },
        data: { status: 'Claimed', claimed_at: new Date() },
      }),
      db.user.update({
        where: { id: userId },
        data: { main_balance: newBalance },
      }),
      db.transaction.create({
        data: {
          user_id: userId,
          type: 'bonus_reward',
          amount: campaign.reward_amount,
          status: 'Completed',
          balance_before: user.main_balance,
          balance_after: newBalance,
          description: `Bonus campaign "${campaign.name}" reward claimed`,
          reference_type: 'bonus_campaign',
          reference_id: campaign.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      reward_amount: campaign.reward_amount,
      campaign_name: campaign.name,
      new_balance: newBalance,
    });
  } catch (error) {
    console.error('Claim bonus error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
