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
    // Priority: base_url from settings > NEXT_PUBLIC_BASE_URL > request headers
    let baseUrl = '';

    // First check settings in DB
    const baseUrlSetting = await db.setting.findUnique({
      where: { setting_key: 'base_url' },
    });
    if (baseUrlSetting?.setting_value) {
      baseUrl = baseUrlSetting.setting_value;
    }

    // Fallback to env variable
    if (!baseUrl) {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    }

    // Last fallback: construct from request headers
    if (!baseUrl) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
      const host = forwardedHost || request.headers.get('host') || request.nextUrl.host;
      baseUrl = `${forwardedProto}://${host}`;
    }

    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/+$/, '');
    // Use root path with query param since it's a SPA (no /register route)
    const referralLink = `${baseUrl}/?ref=${user.referral_code}`;

    return NextResponse.json({
      referral_code: user.referral_code,
      referral_link: referralLink,
    });
  } catch (error) {
    console.error('Get referral link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
