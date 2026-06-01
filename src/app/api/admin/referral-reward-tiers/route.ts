import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/settings';

export async function GET() {
  try {
    const tiers = await db.referralRewardTier.findMany({
      orderBy: { level: 'asc' },
    });

    return NextResponse.json({ tiers });
  } catch (error) {
    console.error('Get referral reward tiers error:', error);
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
    const { level, reward_amount } = body;

    if (!level || typeof level !== 'number' || level < 1) {
      return NextResponse.json(
        { error: 'Level must be a positive integer' },
        { status: 400 }
      );
    }

    if (typeof reward_amount !== 'number' || reward_amount < 0) {
      return NextResponse.json(
        { error: 'Reward amount must be a non-negative number' },
        { status: 400 }
      );
    }

    const tier = await db.referralRewardTier.upsert({
      where: { level },
      update: { reward_amount },
      create: { level, reward_amount },
    });

    await createAuditLog(
      adminId,
      'UPDATE_REFERRAL_TIER',
      'ReferralRewardTier',
      tier.id,
      `Set level ${level} reward to Rs ${reward_amount}`
    );

    return NextResponse.json({ tier });
  } catch (error) {
    console.error('Create/update referral reward tier error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
