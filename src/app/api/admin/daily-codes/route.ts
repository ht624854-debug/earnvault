import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/settings';

function generateCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const codes = await db.dailyCode.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { claims: true },
        },
        claims: {
          select: {
            id: true,
            user_id: true,
            position: true,
            reward_amount: true,
            created_at: true,
            user: {
              select: {
                first_name: true,
                last_name: true,
                username: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    const codesWithParsedTiers = codes.map(code => ({
      ...code,
      reward_tiers_parsed: JSON.parse(code.reward_tiers || '[]'),
    }));

    return NextResponse.json({ codes: codesWithParsedTiers });
  } catch (error) {
    console.error('Get daily codes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const body = await request.json();
    const { code, max_claims, reward_tiers, is_active } = body;

    if (!max_claims || max_claims < 1) {
      return NextResponse.json(
        { error: 'Max claims must be at least 1' },
        { status: 400 }
      );
    }

    if (!reward_tiers || !Array.isArray(reward_tiers) || reward_tiers.length === 0) {
      return NextResponse.json(
        { error: 'At least one reward tier is required' },
        { status: 400 }
      );
    }

    for (const tier of reward_tiers) {
      if (!tier.position || tier.position < 1 || tier.position > max_claims) {
        return NextResponse.json(
          { error: `Position must be between 1 and ${max_claims}` },
          { status: 400 }
        );
      }
      if (!tier.amount || tier.amount <= 0) {
        return NextResponse.json(
          { error: 'Reward amount must be greater than 0' },
          { status: 400 }
        );
      }
    }

    const codeValue = code?.trim() || generateCode();

    const existing = await db.dailyCode.findUnique({ where: { code: codeValue } });
    if (existing) {
      return NextResponse.json(
        { error: 'A code with this value already exists' },
        { status: 400 }
      );
    }

    const dailyCode = await db.dailyCode.create({
      data: {
        code: codeValue,
        max_claims: parseInt(String(max_claims)),
        reward_tiers: JSON.stringify(reward_tiers),
        is_active: is_active !== undefined ? is_active : true,
      },
    });

    await createAuditLog(
      adminId,
      'CREATE_DAILY_CODE',
      'DailyCode',
      dailyCode.id,
      `Created daily code: ${codeValue} (max ${max_claims} claims)`
    );

    return NextResponse.json({ code: dailyCode }, { status: 201 });
  } catch (error) {
    console.error('Create daily code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
