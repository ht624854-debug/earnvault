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

    const activationRequest = await db.activationRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!activationRequest) {
      return NextResponse.json(
        { error: 'Activation request not found' },
        { status: 404 }
      );
    }

    if (activationRequest.status !== 'Pending') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    await db.activationRequest.update({
      where: { id },
      data: {
        status: 'Rejected',
        admin_note: reason || 'Rejected by admin',
        approved_by: adminId,
      },
    });

    await createAuditLog(
      adminId,
      'REJECT_ACTIVATION',
      'ActivationRequest',
      id,
      `Rejected activation request for user ${activationRequest.user.username}. Reason: ${reason || 'N/A'}`
    );

    return NextResponse.json({
      message: 'Activation request rejected successfully',
    });
  } catch (error) {
    console.error('Reject activation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
