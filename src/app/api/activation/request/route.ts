import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { amount, payment_method_id, sender_name, sender_number, transaction_id, proof_image } = body;

    if (!amount || !payment_method_id || !sender_name || !sender_number || !transaction_id) {
      return NextResponse.json(
        { error: 'All fields are required: amount, payment_method_id, sender_name, sender_number, transaction_id' },
        { status: 400 }
      );
    }

    // Verify payment method exists and is active
    const paymentMethod = await db.paymentMethod.findUnique({
      where: { id: payment_method_id },
    });

    if (!paymentMethod || !paymentMethod.is_active) {
      return NextResponse.json({ error: 'Invalid or inactive payment method' }, { status: 400 });
    }

    const activationRequest = await db.activationRequest.create({
      data: {
        user_id: userId,
        amount: parseFloat(amount),
        payment_method_id,
        sender_name,
        sender_number,
        transaction_id,
        proof_image: proof_image || '',
        status: 'Pending',
      },
    });

    return NextResponse.json({
      message: 'Activation request submitted successfully',
      request: activationRequest,
    }, { status: 201 });
  } catch (error) {
    console.error('Create activation request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
