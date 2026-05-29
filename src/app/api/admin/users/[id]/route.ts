import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/settings';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { created_at: 'desc' },
          take: 50,
        },
        referrals_from: {
          include: {
            referred_user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 50,
        },
        referrals_to: {
          include: {
            referrer: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
              },
            },
          },
        },
        task_subs: {
          include: {
            task: {
              select: { id: true, title: true, type: true },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 50,
        },
        withdraw_reqs: {
          orderBy: { created_at: 'desc' },
          take: 50,
        },
        activation_reqs: {
          orderBy: { created_at: 'desc' },
          take: 50,
        },
        _count: {
          select: {
            referrals_from: true,
            task_subs: true,
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const allowedFields = [
      'first_name',
      'last_name',
      'email',
      'username',
      'mobile',
      'package_status',
      'status',
    ];

    const updateData: Record<string, unknown> = {};
    const changes: string[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (user[field as keyof typeof user] !== body[field]) {
          changes.push(
            `${field}: "${user[field as keyof typeof user]}" → "${body[field]}"`
          );
          updateData[field] = body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(
      adminId,
      'UPDATE_USER',
      'User',
      id,
      changes.join('; ')
    );

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        username: updatedUser.username,
        mobile: updatedUser.mobile,
        package_status: updatedUser.package_status,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
