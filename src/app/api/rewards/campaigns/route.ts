import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const campaigns = await db.dailyRewardCampaign.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });

    // Check if user is authenticated to get progress
    const authResult = requireAuth(request);
    const userId = !(authResult instanceof NextResponse) ? authResult.userId : null;

    let campaignsWithProgress = campaigns;

    if (userId) {
      // Get user's claims for these campaigns
      const claims = await db.dailyRewardClaim.findMany({
        where: {
          user_id: userId,
          campaign_id: { in: campaigns.map(c => c.id) },
        },
      });

      // Get user's active referral count
      const referralCount = await db.referral.count({
        where: { referrer_id: userId },
      });

      campaignsWithProgress = campaigns.map(campaign => {
        const claim = claims.find(cl => cl.campaign_id === campaign.id);
        return {
          ...campaign,
          user_progress: claim?.progress || referralCount,
          user_status: claim?.status || (referralCount >= campaign.target_referrals ? 'Eligible' : 'InProgress'),
        };
      });
    }

    return NextResponse.json({ campaigns: campaignsWithProgress });
  } catch (error) {
    console.error('Get reward campaigns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
