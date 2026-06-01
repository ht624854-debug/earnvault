import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const tiers = await db.referralRewardTier.findMany({
      orderBy: { level: 'asc' },
      select: {
        level: true,
        reward_amount: true,
      },
    });

    return NextResponse.json({ tiers });
  } catch (error) {
    console.error('Get public referral reward tiers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
