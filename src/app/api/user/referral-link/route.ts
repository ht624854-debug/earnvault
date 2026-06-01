import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { referral_code: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build full referral link with website URL
    // Priority: NEXT_PUBLIC_BASE_URL > request headers > host
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
      const host = forwardedHost || request.headers.get('host') || request.nextUrl.host;
      baseUrl = `${forwardedProto}://${host}`;
    }
    const referralLink = `${baseUrl}/register?ref=${user.referral_code}`;

    return NextResponse.json({
      referral_code: user.referral_code,
      referral_link: referralLink,
    });
  } catch (error) {
    console.error('Get referral link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
