import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/settings';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const { id } = await params;
    const body = await request.json();

    const paymentMethod = await db.paymentMethod.findUnique({ where: { id } });
    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    const allowedFields = [
      'name',
      'account_title',
      'account_number',
      'instructions',
      'icon',
      'is_active',
      'sort_order',
    ];

    const updateData: Record<string, unknown> = {};
    const changes: string[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (paymentMethod[field as keyof typeof paymentMethod] !== body[field]) {
          changes.push(
            `${field}: "${paymentMethod[field as keyof typeof paymentMethod]}" → "${body[field]}"`
          );
          updateData[field] = body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }

    const updatedMethod = await db.paymentMethod.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(
      adminId,
      'UPDATE_PAYMENT_METHOD',
      'PaymentMethod',
      id,
      `Updated payment method ${paymentMethod.name}. Changes: ${changes.join('; ')}`
    );

    return NextResponse.json({ paymentMethod: updatedMethod });
  } catch (error) {
    console.error('Update payment method error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const { id } = await params;

    const paymentMethod = await db.paymentMethod.findUnique({ where: { id } });
    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    await db.paymentMethod.delete({ where: { id } });

    await createAuditLog(
      adminId,
      'DELETE_PAYMENT_METHOD',
      'PaymentMethod',
      id,
      `Deleted payment method: ${paymentMethod.name}`
    );

    return NextResponse.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Delete payment method error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
