import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { getSetting, createTransaction } from '@/lib/settings';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const { id } = await params;
    const body = await request.json();
    const { answer, proof_image } = body;

    // Get task
    const task = await db.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (!task.is_active) {
      return NextResponse.json({ error: 'This task is no longer active' }, { status: 400 });
    }

    // Get user
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if inactive users can earn
    const allowInactive = await getSetting('allow_inactive_earning');
    if (user.package_status === 'Inactive' && allowInactive !== 'true') {
      return NextResponse.json(
        { error: 'You need an active package to submit tasks. Please activate your account first.' },
        { status: 403 }
      );
    }

    // Check daily limit
    if (task.daily_limit > 0) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todaySubmissions = await db.taskSubmission.count({
        where: {
          user_id: userId,
          task_id: id,
          created_at: { gte: todayStart },
        },
      });

      if (todaySubmissions >= task.daily_limit) {
        return NextResponse.json(
          { error: 'You have reached the daily limit for this task' },
          { status: 400 }
        );
      }
    }

    // Check if already submitted today for this task
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingSubmission = await db.taskSubmission.findFirst({
      where: {
        user_id: userId,
        task_id: id,
        created_at: { gte: todayStart },
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted this task today' },
        { status: 400 }
      );
    }

    // Determine submission status
    let status = 'Pending';
    let rewardAmount = 0;

    // For math/question tasks, auto-check answer
    if ((task.type === 'math' || task.type === 'question') && task.correct_answer) {
      if (answer && answer.trim().toLowerCase() === task.correct_answer.trim().toLowerCase()) {
        status = 'Approved';
        rewardAmount = task.reward_amount;
      } else {
        status = 'Rejected';
      }
    }

    // Create task submission
    const submission = await db.taskSubmission.create({
      data: {
        task_id: id,
        user_id: userId,
        answer: answer || '',
        proof_image: proof_image || '',
        status,
        reward_amount: rewardAmount,
      },
    });

    // If auto-approved, add reward to user balance and create transaction
    if (status === 'Approved' && rewardAmount > 0) {
      await createTransaction(
        userId,
        'task_reward',
        rewardAmount,
        'Completed',
        'task_submission',
        submission.id,
        `Reward for task: ${task.title}`
      );
    }

    return NextResponse.json({
      message: status === 'Approved'
        ? 'Task completed! Reward added to your balance.'
        : status === 'Rejected'
        ? 'Incorrect answer. Please try again tomorrow.'
        : 'Task submitted successfully. Pending review.',
      submission,
    }, { status: 201 });
  } catch (error) {
    console.error('Submit task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
