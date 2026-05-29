import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/settings';

export async function GET(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const paymentMethods = await db.paymentMethod.findMany({
      orderBy: { sort_order: 'asc' },
    });

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const body = await request.json();
    const {
      name,
      account_title,
      account_number,
      instructions,
      icon,
      is_active,
      sort_order,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const paymentMethod = await db.paymentMethod.create({
      data: {
        name,
        account_title: account_title || '',
        account_number: account_number || '',
        instructions: instructions || '',
        icon: icon || '',
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order || 0,
      },
    });

    await createAuditLog(
      adminId,
      'CREATE_PAYMENT_METHOD',
      'PaymentMethod',
      paymentMethod.id,
      `Created payment method: ${name}`
    );

    return NextResponse.json({ paymentMethod }, { status: 201 });
  } catch (error) {
    console.error('Create payment method error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
