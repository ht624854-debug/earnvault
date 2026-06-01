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

    const dailyCode = await db.dailyCode.findUnique({ where: { id } });
    if (!dailyCode) {
      return NextResponse.json({ error: 'Daily code not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.code !== undefined) updateData.code = body.code;
    if (body.max_claims !== undefined) updateData.max_claims = parseInt(String(body.max_claims));
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.reward_tiers !== undefined) {
      if (!Array.isArray(body.reward_tiers) || body.reward_tiers.length === 0) {
        return NextResponse.json({ error: 'At least one reward tier is required' }, { status: 400 });
      }
      updateData.reward_tiers = JSON.stringify(body.reward_tiers);
    }

    const updatedCode = await db.dailyCode.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(
      adminId,
      'UPDATE_DAILY_CODE',
      'DailyCode',
      id,
      `Updated daily code: ${dailyCode.code}`
    );

    return NextResponse.json({ code: updatedCode });
  } catch (error) {
    console.error('Update daily code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    const dailyCode = await db.dailyCode.findUnique({ where: { id } });
    if (!dailyCode) {
      return NextResponse.json({ error: 'Daily code not found' }, { status: 404 });
    }

    // Delete claims first (due to foreign key constraint)
    await db.dailyCodeClaim.deleteMany({ where: { code_id: id } });
    await db.dailyCode.delete({ where: { id } });

    await createAuditLog(
      adminId,
      'DELETE_DAILY_CODE',
      'DailyCode',
      id,
      `Deleted daily code: ${dailyCode.code}`
    );

    return NextResponse.json({ message: 'Daily code deleted successfully' });
  } catch (error) {
    console.error('Delete daily code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
