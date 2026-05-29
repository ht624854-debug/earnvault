import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { role: 'user' };

    if (search) {
      where.OR = [
        { first_name: { contains: search } },
        { last_name: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    if (filter === 'active') {
      where.status = 'active';
      where.package_status = 'Active';
    } else if (filter === 'inactive') {
      where.package_status = 'Inactive';
    } else if (filter === 'blocked') {
      where.status = 'blocked';
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          username: true,
          mobile: true,
          referral_code: true,
          main_balance: true,
          deposit_balance: true,
          package_status: true,
          status: true,
          created_at: true,
          updated_at: true,
          referred_by_id: true,
          _count: {
            select: {
              referrals_from: true,
              transactions: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
