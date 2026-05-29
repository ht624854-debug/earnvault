import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const paymentMethods = await db.paymentMethod.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });

    return NextResponse.json({ payment_methods: paymentMethods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
