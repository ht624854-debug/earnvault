import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog, createTransaction } from '@/lib/settings';

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
    const { amount, type, reason } = body;

    if (amount === undefined || amount === null || !type || !reason) {
      return NextResponse.json(
        { error: 'Amount, type, and reason are required' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Amount must be a number' },
        { status: 400 }
      );
    }

    if (!['main', 'deposit'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "main" or "deposit"' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'main') {
      const newBalance = user.main_balance + amount;
      if (newBalance < 0) {
        return NextResponse.json(
          { error: 'Insufficient balance for this adjustment' },
          { status: 400 }
        );
      }

      const balanceBefore = user.main_balance;
      const balanceAfter = newBalance;

      await db.user.update({
        where: { id },
        data: { main_balance: newBalance },
      });

      await db.transaction.create({
        data: {
          user_id: id,
          type: 'admin_adjustment',
          amount,
          status: 'Completed',
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description: reason,
          admin_note: `Admin adjustment by ${adminId}`,
        },
      });
    } else {
      const newBalance = user.deposit_balance + amount;
      if (newBalance < 0) {
        return NextResponse.json(
          { error: 'Insufficient deposit balance for this adjustment' },
          { status: 400 }
        );
      }

      const balanceBefore = user.deposit_balance;
      const balanceAfter = newBalance;

      await db.user.update({
        where: { id },
        data: { deposit_balance: newBalance },
      });

      await db.transaction.create({
        data: {
          user_id: id,
          type: 'admin_adjustment',
          amount,
          status: 'Completed',
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description: `Deposit balance: ${reason}`,
          admin_note: `Admin deposit adjustment by ${adminId}`,
        },
      });
    }

    await createAuditLog(
      adminId,
      'BALANCE_ADJUST',
      'User',
      id,
      `Adjusted ${type} balance by ${amount >= 0 ? '+' : ''}${amount}. Reason: ${reason}`
    );

    const updatedUser = await db.user.findUnique({ where: { id } });

    return NextResponse.json({
      message: 'Balance adjusted successfully',
      main_balance: updatedUser?.main_balance,
      deposit_balance: updatedUser?.deposit_balance,
    });
  } catch (error) {
    console.error('Balance adjust error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
