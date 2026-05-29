import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isExport = searchParams.get('export') === 'csv';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (type) {
      where.type = type;
    }

    // CSV export
    if (isExport) {
      const transactions = await db.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      const headers = [
        'ID',
        'User',
        'Email',
        'Type',
        'Amount',
        'Status',
        'Balance Before',
        'Balance After',
        'Description',
        'Created At',
      ];

      const rows = transactions.map((t) =>
        [
          t.id,
          `${t.user.first_name} ${t.user.last_name} (${t.user.username})`,
          t.user.email,
          t.type,
          t.amount,
          t.status,
          t.balance_before,
          t.balance_after,
          `"${t.description.replace(/"/g, '""')}"`,
          t.created_at.toISOString(),
        ].join(',')
      );

      const csv = [headers.join(','), ...rows].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=transactions.csv',
        },
      });
    }

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      db.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
