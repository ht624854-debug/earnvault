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

    if (withdrawRequest.status !== 'Pending') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    await db.withdrawRequest.update({
      where: { id },
      data: {
        status: 'Approved',
        processed_by: adminId,
      },
    });

    await createAuditLog(
      adminId,
      'APPROVE_WITHDRAWAL',
      'WithdrawRequest',
      id,
      `Approved withdrawal request for user ${withdrawRequest.user.username}, amount: ${withdrawRequest.amount}`
    );

    return NextResponse.json({
      message: 'Withdraw request approved successfully',
    });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
