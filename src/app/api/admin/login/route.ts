import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/settings';

// Simple in-memory rate limiter
const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Rate limiting check
    const clientKey = `admin_${request.headers.get('x-forwarded-for') || 'unknown'}`;
    const attempts = loginAttempts[clientKey];

    if (attempts && attempts.count >= MAX_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
      if (timeSinceLastAttempt < LOCKOUT_DURATION) {
        const remainingMinutes = Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 60000);
        return NextResponse.json(
          { error: `Too many failed attempts. Try again in ${remainingMinutes} minutes.` },
          { status: 429 }
        );
      }
      // Reset after lockout period
      delete loginAttempts[clientKey];
    }

    const user = await db.user.findFirst({
      where: {
        username,
        role: 'admin',
      },
    });

    if (!user) {
      // Record failed attempt
      if (!loginAttempts[clientKey]) {
        loginAttempts[clientKey] = { count: 0, lastAttempt: 0 };
      }
      loginAttempts[clientKey].count++;
      loginAttempts[clientKey].lastAttempt = Date.now();

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      // Record failed attempt
      if (!loginAttempts[clientKey]) {
        loginAttempts[clientKey] = { count: 0, lastAttempt: 0 };
      }
      loginAttempts[clientKey].count++;
      loginAttempts[clientKey].lastAttempt = Date.now();

      // Create audit log for failed attempt
      try {
        await createAuditLog(user.id, 'ADMIN_LOGIN_FAILED', 'admin', user.id, `Failed login attempt for username: ${username}`);
      } catch {
        // Ignore audit log error
      }

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is blocked' },
        { status: 403 }
      );
    }

    // Clear failed attempts on successful login
    delete loginAttempts[clientKey];

    const token = generateToken({ userId: user.id, role: user.role });

    // Create audit log for successful login
    try {
      await createAuditLog(user.id, 'ADMIN_LOGIN_SUCCESS', 'admin', user.id, 'Admin logged in successfully');
    } catch {
      // Ignore audit log error
    }

    return NextResponse.json({
      admin: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
