import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, generateReferralCode } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, username, mobile, password, referral_code } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !username || !mobile || !password) {
      return NextResponse.json(
        { error: 'All fields are required: first_name, last_name, email, username, mobile, password' },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Check username uniqueness
    const existingUsername = await db.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    // Check mobile uniqueness
    const existingMobile = await db.user.findUnique({ where: { mobile } });
    if (existingMobile) {
      return NextResponse.json({ error: 'Mobile number already registered' }, { status: 409 });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let codeExists = await db.user.findUnique({ where: { referral_code: referralCode } });
    while (codeExists) {
      referralCode = generateReferralCode();
      codeExists = await db.user.findUnique({ where: { referral_code: referralCode } });
    }

    // Handle referral
    let referred_by_id: string | null = null;
    if (referral_code) {
      const referrer = await db.user.findUnique({ where: { referral_code } });
      if (referrer) {
        referred_by_id = referrer.id;
      }
    }

    // Create user
    const user = await db.user.create({
      data: {
        first_name,
        last_name,
        email,
        username,
        mobile,
        password_hash,
        referral_code: referralCode,
        referred_by_id,
        package_status: 'Inactive',
        role: 'user',
        status: 'active',
      },
    });

    // Create referral record if referrer exists
    if (referred_by_id) {
      await db.referral.create({
        data: {
          referrer_id: referred_by_id,
          referred_user_id: user.id,
          status: 'Active',
          reward_status: 'Unpaid',
          reward_amount: 0,
        },
      });
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, role: user.role });

    // Return user data without password_hash
    const { password_hash: _, ...userData } = user;

    return NextResponse.json({
      message: 'Registration successful',
      user: userData,
      token,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
