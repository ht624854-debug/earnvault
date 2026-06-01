import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/settings';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const { level: levelStr } = await params;
    const level = parseInt(levelStr);

    const commissionLevel = await db.referralCommissionLevel.findUnique({
      where: { level },
    });

    if (!commissionLevel) {
      return NextResponse.json({ error: 'Commission level not found' }, { status: 404 });
    }

    await db.referralCommissionLevel.delete({ where: { level } });

    await createAuditLog(
      adminId,
      'DELETE_COMMISSION_LEVEL',
      'ReferralCommissionLevel',
      commissionLevel.id,
      `Deleted Level ${level} commission`
    );

    return NextResponse.json({ message: 'Commission level deleted successfully' });
  } catch (error) {
    console.error('Delete commission level error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
