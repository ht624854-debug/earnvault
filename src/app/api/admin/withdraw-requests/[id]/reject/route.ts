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
    const body = await request.json();
    const { reason } = body;

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

    if (withdrawRequest.status !== 'Pending' && withdrawRequest.status !== 'Approved') {
      return NextResponse.json(
        { error: 'Request cannot be rejected at this stage' },
        { status: 400 }
      );
    }

    // Update request status
    await db.withdrawRequest.update({
      where: { id },
      data: {
        status: 'Rejected',
        admin_note: reason || 'Rejected by admin',
        processed_by: adminId,
      },
    });

    // Refund amount to user main_balance
    const user = await db.user.findUnique({
      where: { id: withdrawRequest.user_id },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const balanceBefore = user.main_balance;
    const balanceAfter = balanceBefore + withdrawRequest.amount;

    await db.user.update({
      where: { id: withdrawRequest.user_id },
      data: { main_balance: balanceAfter },
    });

    // Create transaction record for refund
    await db.transaction.create({
      data: {
        user_id: withdrawRequest.user_id,
        type: 'withdrawal',
        amount: withdrawRequest.amount,
        status: 'Failed',
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: 'WithdrawRequest',
        reference_id: id,
        description: `Withdrawal rejected - refund of ${withdrawRequest.amount}`,
        admin_note: reason || 'Rejected by admin',
      },
    });

    await createAuditLog(
      adminId,
      'REJECT_WITHDRAWAL',
      'WithdrawRequest',
      id,
      `Rejected withdrawal request for user ${withdrawRequest.user.username}, amount: ${withdrawRequest.amount}. Reason: ${reason || 'N/A'}`
    );

    return NextResponse.json({
      message: 'Withdraw request rejected and amount refunded',
    });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
