import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/settings';

export async function GET(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const tasks = await db.task.findMany({
      orderBy: { sort_order: 'asc' },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
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
      title,
      description,
      type,
      reward_amount,
      question,
      correct_answer,
      link_url,
      proof_required,
      daily_limit,
      is_active,
      sort_order,
    } = body;

    if (!title || !description || !type || reward_amount === undefined) {
      return NextResponse.json(
        { error: 'Title, description, type, and reward_amount are required' },
        { status: 400 }
      );
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        type,
        reward_amount: parseFloat(String(reward_amount)),
        question: question || '',
        correct_answer: correct_answer || '',
        link_url: link_url || '',
        proof_required: proof_required || false,
        daily_limit: daily_limit || 0,
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order || 0,
      },
    });

    await createAuditLog(
      adminId,
      'CREATE_TASK',
      'Task',
      task.id,
      `Created task: ${title}`
    );

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
