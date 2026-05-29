import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, hashPassword } from '@/lib/auth';
import { requireAdmin, getTokenFromRequest } from '@/lib/middleware';
import { verifyToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/settings';

export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { current_password, new_username, new_password } = body;

    if (!current_password) {
      return NextResponse.json(
        { error: 'Current password is required to make changes' },
        { status: 400 }
      );
    }

    const admin = await db.user.findUnique({ where: { id: userId } });
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(current_password, admin.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    const updates: Record<string, string> = {};
    const changes: string[] = [];

    // Handle username change
    if (new_username && new_username.trim() !== admin.username) {
      // Check if username is already taken
      const existing = await db.user.findUnique({
        where: { username: new_username.trim() },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(new_username.trim())) {
        return NextResponse.json(
          { error: 'Username must be 3-20 characters (letters, numbers, underscores)' },
          { status: 400 }
        );
      }
      updates.username = new_username.trim();
      changes.push(`username: ${admin.username} → ${new_username.trim()}`);
    }

    // Handle password change
    if (new_password) {
      if (new_password.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters' },
          { status: 400 }
        );
      }
      const newHash = await hashPassword(new_password);
      updates.password_hash = newHash;
      changes.push('password changed');
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No changes requested' },
        { status: 400 }
      );
    }

    // Apply updates
    await db.user.update({
      where: { id: userId },
      data: updates,
    });

    // Create audit log
    await createAuditLog(
      userId,
      'ADMIN_CREDENTIALS_CHANGED',
      'admin',
      userId,
      changes.join(', ')
    );

    // Generate new token if username changed (since token contains userId but we keep same)
    const token = getTokenFromRequest(request);
    const decoded = token ? verifyToken(token) : null;

    return NextResponse.json({
      message: 'Credentials updated successfully',
      username: updates.username || admin.username,
      requireRelogin: !!new_password,
    });
  } catch (error) {
    console.error('Change admin credentials error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
