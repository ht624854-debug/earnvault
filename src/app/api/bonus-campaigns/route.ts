import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    // Get active campaigns
    const campaigns = await db.bonusCampaign.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'asc' },
    });

    // Get user's campaign progress
    const userCampaigns = await db.userBonusCampaign.findMany({
      where: { user_id: userId },
      include: { campaign: true },
    });

    // Count user's active referrals
    const activeReferrals = await db.referral.count({
      where: {
        referrer_id: userId,
        referred_user: { package_status: { in: ['Active', 'active'] } },
      },
    });

    const now = new Date();

    // Build response for each campaign
    const result = campaigns.map((campaign) => {
      const userCamp = userCampaigns.find((uc) => uc.campaign_id === campaign.id);

      // If user hasn't been enrolled yet, auto-enroll them
      let status = 'Not Started';
      let startedAt: Date | null = null;
      let expiresAt: Date | null = null;
      let timeRemaining = 0;

      if (userCamp) {
        startedAt = userCamp.started_at;
        expiresAt = userCamp.expires_at;
        timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime());

        // Check if expired
        if (now > expiresAt && userCamp.status === 'In Progress') {
          status = 'Expired';
        } else {
          status = userCamp.status;
        }
      }

      const progress = Math.min(100, (activeReferrals / campaign.required_referrals) * 100);

      // Auto-complete if referrals met and still in progress
      if (activeReferrals >= campaign.required_referrals && status === 'In Progress') {
        status = 'Completed';
      }

      return {
        id: campaign.id,
        name: campaign.name,
        required_referrals: campaign.required_referrals,
        reward_amount: campaign.reward_amount,
        time_limit_hours: campaign.time_limit_hours,
        status,
        current_referrals: activeReferrals,
        progress: Math.round(progress),
        time_remaining_ms: timeRemaining,
        started_at: startedAt,
        expires_at: expiresAt,
        user_campaign_id: userCamp?.id || null,
      };
    });

    return NextResponse.json({ campaigns: result });
  } catch (error) {
    console.error('Get bonus campaigns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
