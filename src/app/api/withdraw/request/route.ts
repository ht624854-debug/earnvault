import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { getSetting, createTransaction } from '@/lib/settings';

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { amount, method, account_title, account_number } = body;

    if (!amount || !method || !account_title || !account_number) {
      return NextResponse.json(
        { error: 'All fields are required: amount, method, account_title, account_number' },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);

    // Check user is active
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.package_status !== 'Active') {
      return NextResponse.json(
        { error: 'You need an active package to make withdrawals' },
        { status: 403 }
      );
    }

    // Check minimum withdrawal from settings
    const minWithdrawal = parseFloat(await getSetting('minimum_withdrawal') || '0');
    if (parsedAmount < minWithdrawal) {
      return NextResponse.json(
        { error: `Minimum withdrawal amount is ${minWithdrawal}` },
        { status: 400 }
      );
    }

    // Check user has sufficient main_balance
    if (user.main_balance < parsedAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Deduct from main_balance and create transaction
    const transaction = await createTransaction(
      userId,
      'withdrawal',
      -parsedAmount,
      'Pending',
      'withdraw_request',
      undefined,
      `Withdrawal request via ${method}`
    );

    // Create withdraw request
    const withdrawRequest = await db.withdrawRequest.create({
      data: {
        user_id: userId,
        amount: parsedAmount,
        method,
        account_title,
        account_number,
        status: 'Pending',
      },
    });

    // Update transaction reference_id
    await db.transaction.update({
      where: { id: transaction.id },
      data: { reference_id: withdrawRequest.id },
    });

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      request: withdrawRequest,
    }, { status: 201 });
  } catch (error) {
    console.error('Create withdraw request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
