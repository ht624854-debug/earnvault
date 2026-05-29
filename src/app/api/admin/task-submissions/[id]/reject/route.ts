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

    await db.taskSubmission.update({
      where: { id },
      data: {
        status: 'Rejected',
        admin_note: reason || 'Rejected by admin',
      },
    });

    await createAuditLog(
      adminId,
      'REJECT_TASK_SUBMISSION',
      'TaskSubmission',
      id,
      `Rejected task submission for user ${submission.user.username}, task: "${submission.task.title}". Reason: ${reason || 'N/A'}`
    );

    return NextResponse.json({
      message: 'Task submission rejected',
    });
  } catch (error) {
    console.error('Reject task submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
