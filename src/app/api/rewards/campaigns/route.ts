import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const campaigns = await db.dailyRewardCampaign.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Get reward campaigns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
