import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { createTransaction } from '@/lib/settings';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const { id } = await params;

    // Get campaign
    const campaign = await db.dailyRewardCampaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (!campaign.is_active) {
      return NextResponse.json({ error: 'This campaign is no longer active' }, { status: 400 });
    }

    // Check if already claimed
    const existingClaim = await db.dailyRewardClaim.findFirst({
      where: {
        user_id: userId,
        campaign_id: id,
        status: 'Claimed',
      },
    });

    if (existingClaim) {
      return NextResponse.json({ error: 'You have already claimed this reward' }, { status: 400 });
    }

    // Validate user has met campaign target (referral count)
    const referralCount = await db.referral.count({
      where: {
        referrer_id: userId,
        created_at: {
          gte: new Date(Date.now() - campaign.time_limit_hours * 60 * 60 * 1000),
        },
      },
    });

    if (referralCount < campaign.target_referrals) {
      return NextResponse.json(
        { error: `You need ${campaign.target_referrals} referrals to claim this reward. You currently have ${referralCount}.` },
        { status: 400 }
      );
    }

    // Find or create claim record
    let claim = await db.dailyRewardClaim.findFirst({
      where: {
        user_id: userId,
        campaign_id: id,
      },
    });

    if (claim) {
      // Update existing claim
      claim = await db.dailyRewardClaim.update({
        where: { id: claim.id },
        data: {
          progress: referralCount,
          status: 'Claimed',
          reward_amount: campaign.reward_amount,
        },
      });
    } else {
      // Create new claim
      claim = await db.dailyRewardClaim.create({
        data: {
          user_id: userId,
          campaign_id: id,
          progress: referralCount,
          status: 'Claimed',
          reward_amount: campaign.reward_amount,
        },
      });
    }

    // Add reward to user balance and create transaction
    await createTransaction(
      userId,
      'daily_reward',
      campaign.reward_amount,
      'Completed',
      'reward_claim',
      claim.id,
      `Reward claimed for campaign: ${campaign.title}`
    );

    return NextResponse.json({
      message: 'Reward claimed successfully!',
      claim,
      reward_amount: campaign.reward_amount,
    });
  } catch (error) {
    console.error('Claim reward error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
