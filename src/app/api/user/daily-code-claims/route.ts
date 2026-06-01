import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const claims = await db.dailyCodeClaim.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        code: {
          select: {
            code: true,
          },
        },
      },
    });

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Get user daily code claims error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
