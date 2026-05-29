import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

// Simple in-memory rate limiter
const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};
const MAX_ATTEMPTS = 10;
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
    const clientKey = `user_${request.headers.get('x-forwarded-for') || 'unknown'}`;
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
      delete loginAttempts[clientKey];
    }

    // Find user by username or email
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username },
        ],
      },
    });

    if (!user) {
      if (!loginAttempts[clientKey]) {
        loginAttempts[clientKey] = { count: 0, lastAttempt: 0 };
      }
      loginAttempts[clientKey].count++;
      loginAttempts[clientKey].lastAttempt = Date.now();

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      if (!loginAttempts[clientKey]) {
        loginAttempts[clientKey] = { count: 0, lastAttempt: 0 };
      }
      loginAttempts[clientKey].count++;
      loginAttempts[clientKey].lastAttempt = Date.now();

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return NextResponse.json({ error: 'Your account has been blocked. Please contact support.' }, { status: 403 });
    }

    // Clear failed attempts on successful login
    delete loginAttempts[clientKey];

    // Generate JWT token
    const token = generateToken({ userId: user.id, role: user.role });

    // Return user data without password_hash
    const { password_hash: _, ...userData } = user;

    return NextResponse.json({
      message: 'Login successful',
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
