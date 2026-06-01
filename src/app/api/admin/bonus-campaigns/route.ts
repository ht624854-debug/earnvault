import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const campaigns = await db.bonusCampaign.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { user_campaigns: true } },
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Get bonus campaigns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { name, required_referrals, reward_amount, time_limit_hours } = await request.json();

    if (!name || !required_referrals || !reward_amount || !time_limit_hours) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const campaign = await db.bonusCampaign.create({
      data: {
        name,
        required_referrals: parseInt(required_referrals),
        reward_amount: parseFloat(reward_amount),
        time_limit_hours: parseInt(time_limit_hours),
        is_active: true,
      },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Create bonus campaign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
