import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/settings';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const { id } = await params;

    const withdrawRequest = await db.withdrawRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!withdrawRequest) {
      return NextResponse.json(
        { error: 'Withdraw request not found' },
        { status: 404 }
      );
    }

    if (withdrawRequest.status !== 'Approved') {
      return NextResponse.json(
        { error: 'Only approved requests can be marked as paid' },
        { status: 400 }
      );
    }

    await db.withdrawRequest.update({
      where: { id },
      data: {
        status: 'Paid',
        processed_by: adminId,
      },
    });

    await createAuditLog(
      adminId,
      'MARK_WITHDRAWAL_PAID',
      'WithdrawRequest',
      id,
      `Marked withdrawal as paid for user ${withdrawRequest.user.username}, amount: ${withdrawRequest.amount}`
    );

    return NextResponse.json({
      message: 'Withdraw request marked as paid',
    });
  } catch (error) {
    console.error('Mark paid error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
