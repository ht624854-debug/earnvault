import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        {
          referrer: {
            OR: [
              { username: { contains: search } },
              { first_name: { contains: search } },
              { last_name: { contains: search } },
            ],
          },
        },
        {
          referred_user: {
            OR: [
              { username: { contains: search } },
              { first_name: { contains: search } },
              { last_name: { contains: search } },
            ],
          },
        },
      ];
    }

    const referrals = await db.referral.findMany({
      where,
      include: {
        referrer: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
          },
        },
        referred_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ referrals });
  } catch (error) {
    console.error('Get referrals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
