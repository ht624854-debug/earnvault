import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/settings';

export async function GET(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const levels = await db.referralCommissionLevel.findMany({
      orderBy: { level: 'asc' },
    });

    return NextResponse.json({ levels });
  } catch (error) {
    console.error('Get commission levels error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const body = await request.json();
    const { level, commission_amount } = body;

    if (!level || level < 1) {
      return NextResponse.json({ error: 'Level must be at least 1' }, { status: 400 });
    }
    if (!commission_amount || commission_amount <= 0) {
      return NextResponse.json({ error: 'Commission amount must be greater than 0' }, { status: 400 });
    }

    const commissionLevel = await db.referralCommissionLevel.upsert({
      where: { level: parseInt(String(level)) },
      update: { commission_amount: parseFloat(String(commission_amount)) },
      create: {
        level: parseInt(String(level)),
        commission_amount: parseFloat(String(commission_amount)),
      },
    });

    await createAuditLog(
      adminId,
      'UPDATE_COMMISSION_LEVEL',
      'ReferralCommissionLevel',
      commissionLevel.id,
      `Set Level ${level} commission to Rs ${commission_amount}`
    );

    return NextResponse.json({ level: commissionLevel });
  } catch (error) {
    console.error('Create/update commission level error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
