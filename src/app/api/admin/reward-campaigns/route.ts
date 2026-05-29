import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/settings';

export async function GET(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const campaigns = await db.dailyRewardCampaign.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { claims: true },
        },
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Get reward campaigns error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const body = await request.json();
    const {
      title,
      target_referrals,
      time_limit_hours,
      reward_amount,
      is_active,
    } = body;

    if (!title || target_referrals === undefined || time_limit_hours === undefined || reward_amount === undefined) {
      return NextResponse.json(
        { error: 'Title, target_referrals, time_limit_hours, and reward_amount are required' },
        { status: 400 }
      );
    }

    const campaign = await db.dailyRewardCampaign.create({
      data: {
        title,
        target_referrals: parseInt(String(target_referrals)),
        time_limit_hours: parseInt(String(time_limit_hours)),
        reward_amount: parseFloat(String(reward_amount)),
        is_active: is_active !== undefined ? is_active : true,
      },
    });

    await createAuditLog(
      adminId,
      'CREATE_REWARD_CAMPAIGN',
      'DailyRewardCampaign',
      campaign.id,
      `Created reward campaign: ${title}`
    );

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error('Create reward campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
