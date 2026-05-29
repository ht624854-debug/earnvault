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

    const task = await db.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const allowedFields = [
      'title',
      'description',
      'type',
      'reward_amount',
      'question',
      'correct_answer',
      'link_url',
      'proof_required',
      'daily_limit',
      'is_active',
      'sort_order',
    ];

    const updateData: Record<string, unknown> = {};
    const changes: string[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        const newValue = field === 'reward_amount' ? parseFloat(String(body[field])) : body[field];
        if (task[field as keyof typeof task] !== newValue) {
          changes.push(`${field}: "${task[field as keyof typeof task]}" → "${newValue}"`);
          updateData[field] = newValue;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }

    const updatedTask = await db.task.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(
      adminId,
      'UPDATE_TASK',
      'Task',
      id,
      `Updated task ${task.title}. Changes: ${changes.join('; ')}`
    );

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
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

    const task = await db.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await db.task.delete({ where: { id } });

    await createAuditLog(
      adminId,
      'DELETE_TASK',
      'Task',
      id,
      `Deleted task: ${task.title}`
    );

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
