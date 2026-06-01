import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const { id: userId } = await params;

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's current bonus campaigns with campaign details
    const userCampaigns = await db.userBonusCampaign.findMany({
      where: { user_id: userId },
      include: {
        campaign: true,
      },
      orderBy: { started_at: 'desc' },
    });

    // Get the IDs of campaigns the user is already enrolled in
    const enrolledIds = userCampaigns.map((uc) => uc.campaign_id);

    // Get all active campaigns the user is NOT enrolled in
    const availableCampaigns = await db.bonusCampaign.findMany({
      where: {
        is_active: true,
        id: { notIn: enrolledIds },
      },
      orderBy: { created_at: 'desc' },
    });

    // Count user's total referrals for progress display
    const referralCount = await db.referral.count({
      where: { referrer_id: userId },
    });

    return NextResponse.json({
      userCampaigns,
      availableCampaigns,
      referralCount,
    });
  } catch (error) {
    console.error('Get user bonus campaigns error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { campaign_id, time_limit_hours } = body;

    if (!campaign_id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify campaign exists
    const campaign = await db.bonusCampaign.findUnique({
      where: { id: campaign_id },
    });
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existing = await db.userBonusCampaign.findUnique({
      where: {
        user_id_campaign_id: {
          user_id: userId,
          campaign_id,
        },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'User is already enrolled in this campaign' },
        { status: 400 }
      );
    }

    // Determine time limit
    const hours = time_limit_hours || campaign.time_limit_hours;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const userCampaign = await db.userBonusCampaign.create({
      data: {
        user_id: userId,
        campaign_id,
        status: 'In Progress',
        started_at: now,
        expires_at: expiresAt,
      },
      include: {
        campaign: true,
      },
    });

    return NextResponse.json({ userCampaign });
  } catch (error) {
    console.error('Add user bonus campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
