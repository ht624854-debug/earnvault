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

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.status === 'blocked') {
      return NextResponse.json(
        { error: 'User is already blocked' },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id },
      data: { status: 'blocked' },
    });

    await createAuditLog(
      adminId,
      'BLOCK_USER',
      'User',
      id,
      `Blocked user ${user.username}`
    );

    return NextResponse.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
