import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; campaignId: string }> }
) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const { id: userId, campaignId } = await params;
    const body = await request.json();
    const { status, time_limit_hours } = body;

    // Verify the user campaign exists
    const userCampaign = await db.userBonusCampaign.findUnique({
      where: { id: campaignId },
      include: { campaign: true },
    });

    if (!userCampaign) {
      return NextResponse.json(
        { error: 'User campaign not found' },
        { status: 404 }
      );
    }

    if (userCampaign.user_id !== userId) {
      return NextResponse.json(
        { error: 'Campaign does not belong to this user' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    // Handle status change
    if (status !== undefined) {
      const validStatuses = ['In Progress', 'Completed', 'Expired', 'Claimed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.status = status;

      // Set timestamps based on status
      if (status === 'Completed' && !userCampaign.completed_at) {
        updateData.completed_at = new Date();
      }
      if (status === 'Claimed' && !userCampaign.claimed_at) {
        updateData.claimed_at = new Date();
        if (!userCampaign.completed_at) {
          updateData.completed_at = new Date();
        }
      }
      // Reset to In Progress
      if (status === 'In Progress') {
        updateData.completed_at = null;
        updateData.claimed_at = null;
      }
    }

    // Handle time extension
    if (time_limit_hours !== undefined) {
      const hours = Number(time_limit_hours);
      if (isNaN(hours) || hours <= 0) {
        return NextResponse.json(
          { error: 'time_limit_hours must be a positive number' },
          { status: 400 }
        );
      }
      // Extend from current expires_at or from now, whichever is later
      const now = new Date();
      const currentExpiry = new Date(userCampaign.expires_at);
      const baseTime = currentExpiry > now ? currentExpiry : now;
      updateData.expires_at = new Date(baseTime.getTime() + hours * 60 * 60 * 1000);

      // If was expired and we're extending, set back to In Progress
      if (userCampaign.status === 'Expired') {
        updateData.status = 'In Progress';
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No changes provided' },
        { status: 400 }
      );
    }

    const updatedCampaign = await db.userBonusCampaign.update({
      where: { id: campaignId },
      data: updateData,
      include: {
        campaign: true,
      },
    });

    return NextResponse.json({ userCampaign: updatedCampaign });
  } catch (error) {
    console.error('Update user bonus campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; campaignId: string }> }
) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const { id: userId, campaignId } = await params;

    // Verify the user campaign exists
    const userCampaign = await db.userBonusCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!userCampaign) {
      return NextResponse.json(
        { error: 'User campaign not found' },
        { status: 404 }
      );
    }

    if (userCampaign.user_id !== userId) {
      return NextResponse.json(
        { error: 'Campaign does not belong to this user' },
        { status: 400 }
      );
    }

    await db.userBonusCampaign.delete({
      where: { id: campaignId },
    });

    return NextResponse.json({
      message: 'Campaign removed from user successfully',
    });
  } catch (error) {
    console.error('Delete user bonus campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
