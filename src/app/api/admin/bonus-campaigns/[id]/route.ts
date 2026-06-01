import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id } = await params;

  try {
    const data = await request.json();
    const campaign = await db.bonusCampaign.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.required_referrals !== undefined && { required_referrals: parseInt(data.required_referrals) }),
        ...(data.reward_amount !== undefined && { reward_amount: parseFloat(data.reward_amount) }),
        ...(data.time_limit_hours !== undefined && { time_limit_hours: parseInt(data.time_limit_hours) }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
      },
    });
    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Update bonus campaign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id } = await params;

  try {
    await db.userBonusCampaign.deleteMany({ where: { campaign_id: id } });
    await db.bonusCampaign.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete bonus campaign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
