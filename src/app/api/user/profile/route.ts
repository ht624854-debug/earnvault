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
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        username: true,
        mobile: true,
        avatar: true,
        referral_code: true,
        main_balance: true,
        deposit_balance: true,
        package_status: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { first_name, last_name, mobile, avatar } = body;

    const updateData: Record<string, string> = {};

    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (mobile !== undefined) {
      // Check mobile uniqueness if changing
      const existingMobile = await db.user.findFirst({
        where: { mobile, id: { not: userId } },
      });
      if (existingMobile) {
        return NextResponse.json({ error: 'Mobile number already in use' }, { status: 409 });
      }
      updateData.mobile = mobile;
    }
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        username: true,
        mobile: true,
        avatar: true,
        referral_code: true,
        main_balance: true,
        deposit_balance: true,
        package_status: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
