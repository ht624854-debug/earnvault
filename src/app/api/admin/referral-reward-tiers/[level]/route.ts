import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/settings';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const { level: levelStr } = await params;
    const level = parseInt(levelStr, 10);

    if (isNaN(level) || level < 1) {
      return NextResponse.json(
        { error: 'Invalid level' },
        { status: 400 }
      );
    }

    const tier = await db.referralRewardTier.findUnique({
      where: { level },
    });

    if (!tier) {
      return NextResponse.json(
        { error: 'Tier not found' },
        { status: 404 }
      );
    }

    await db.referralRewardTier.delete({
      where: { level },
    });

    await createAuditLog(
      adminId,
      'DELETE_REFERRAL_TIER',
      'ReferralRewardTier',
      tier.id,
      `Deleted level ${level} referral reward tier (was Rs ${tier.reward_amount})`
    );

    return NextResponse.json({ message: 'Tier deleted successfully' });
  } catch (error) {
    console.error('Delete referral reward tier error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
