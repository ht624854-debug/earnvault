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

    const submission = await db.taskSubmission.findUnique({
      where: { id },
      include: { user: true, task: true },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.status !== 'Pending') {
      return NextResponse.json(
        { error: 'Submission has already been processed' },
        { status: 400 }
      );
    }

    // Prevent duplicate reward - check if a task_reward transaction already exists for this submission
    const existingReward = await db.transaction.findFirst({
      where: {
        user_id: submission.user_id,
        type: 'task_reward',
        reference_type: 'TaskSubmission',
        reference_id: id,
      },
    });

    if (existingReward) {
      return NextResponse.json(
        { error: 'Reward has already been given for this submission' },
        { status: 400 }
      );
    }

    const rewardAmount = submission.reward_amount || submission.task.reward_amount;

    // Add reward to user main_balance
    const user = await db.user.findUnique({
      where: { id: submission.user_id },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const balanceBefore = user.main_balance;
    const balanceAfter = balanceBefore + rewardAmount;

    await db.user.update({
      where: { id: submission.user_id },
      data: { main_balance: balanceAfter },
    });

    // Update submission status
    await db.taskSubmission.update({
      where: { id },
      data: {
        status: 'Approved',
        reward_amount: rewardAmount,
      },
    });

    // Create transaction record
    await db.transaction.create({
      data: {
        user_id: submission.user_id,
        type: 'task_reward',
        amount: rewardAmount,
        status: 'Completed',
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: 'TaskSubmission',
        reference_id: id,
        description: `Task reward for "${submission.task.title}"`,
      },
    });

    await createAuditLog(
      adminId,
      'APPROVE_TASK_SUBMISSION',
      'TaskSubmission',
      id,
      `Approved task submission for user ${submission.user.username}, task: "${submission.task.title}", reward: ${rewardAmount}`
    );

    return NextResponse.json({
      message: 'Task submission approved and reward credited',
      reward_amount: rewardAmount,
    });
  } catch (error) {
    console.error('Approve task submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
