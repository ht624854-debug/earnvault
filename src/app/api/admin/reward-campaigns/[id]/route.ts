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

    const campaign = await db.dailyRewardCampaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json(
        { error: 'Reward campaign not found' },
        { status: 404 }
      );
    }

    const allowedFields = [
      'title',
      'target_referrals',
      'time_limit_hours',
      'reward_amount',
      'is_active',
    ];

    const updateData: Record<string, unknown> = {};
    const changes: string[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        let newValue = body[field];
        if (field === 'target_referrals' || field === 'time_limit_hours') {
          newValue = parseInt(String(newValue));
        }
        if (field === 'reward_amount') {
          newValue = parseFloat(String(newValue));
        }
        if (campaign[field as keyof typeof campaign] !== newValue) {
          changes.push(
            `${field}: "${campaign[field as keyof typeof campaign]}" → "${newValue}"`
          );
          updateData[field] = newValue;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }

    const updatedCampaign = await db.dailyRewardCampaign.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(
      adminId,
      'UPDATE_REWARD_CAMPAIGN',
      'DailyRewardCampaign',
      id,
      `Updated campaign ${campaign.title}. Changes: ${changes.join('; ')}`
    );

    return NextResponse.json({ campaign: updatedCampaign });
  } catch (error) {
    console.error('Update reward campaign error:', error);
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

    const campaign = await db.dailyRewardCampaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json(
        { error: 'Reward campaign not found' },
        { status: 404 }
      );
    }

    await db.dailyRewardCampaign.delete({ where: { id } });

    await createAuditLog(
      adminId,
      'DELETE_REWARD_CAMPAIGN',
      'DailyRewardCampaign',
      id,
      `Deleted campaign: ${campaign.title}`
    );

    return NextResponse.json({ message: 'Reward campaign deleted successfully' });
  } catch (error) {
    console.error('Delete reward campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
