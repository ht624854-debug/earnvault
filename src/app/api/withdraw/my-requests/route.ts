import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const requests = await db.withdrawRequest.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Get withdraw requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
