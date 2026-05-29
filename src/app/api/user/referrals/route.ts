import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const referrals = await db.referral.findMany({
      where: { referrer_id: userId },
      include: {
        referred_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            avatar: true,
            package_status: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ referrals });
  } catch (error) {
    console.error('Get referrals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
