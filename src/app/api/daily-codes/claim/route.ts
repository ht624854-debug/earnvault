import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { createTransaction } from '@/lib/settings';

interface RewardTier {
  position: number;
  amount: number;
}

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { code: inputCode } = body;

    if (!inputCode || !inputCode.trim()) {
      return NextResponse.json({ error: 'Please enter a code' }, { status: 400 });
    }

    const codeValue = inputCode.trim();

    // Find the code
    const dailyCode = await db.dailyCode.findUnique({
      where: { code: codeValue },
    });

    if (!dailyCode) {
      return NextResponse.json({ error: 'Invalid code. Please check and try again.' }, { status: 404 });
    }

    if (!dailyCode.is_active) {
      return NextResponse.json({ error: 'This code is no longer active' }, { status: 400 });
    }

    if (dailyCode.current_claims >= dailyCode.max_claims) {
      return NextResponse.json({ error: 'This code has reached its maximum claims limit' }, { status: 400 });
    }

    // Check if user already claimed this code
    const existingClaim = await db.dailyCodeClaim.findUnique({
      where: {
        user_id_code_id: {
          user_id: userId,
          code_id: dailyCode.id,
        },
      },
    });

    if (existingClaim) {
      return NextResponse.json({ error: 'You have already claimed this code' }, { status: 400 });
    }

    // Determine position
    const position = dailyCode.current_claims + 1;

    // Parse reward tiers to find the amount for this position
    const tiers: RewardTier[] = JSON.parse(dailyCode.reward_tiers || '[]');
    const tierForPosition = tiers.find((t) => t.position === position);
    
    // If no specific tier for this position, use the last tier's amount or 0
    let rewardAmount = 0;
    if (tierForPosition) {
      rewardAmount = tierForPosition.amount;
    } else if (tiers.length > 0) {
      // Sort tiers by position and find the closest one at or below current position
      const sortedTiers = [...tiers].sort((a, b) => a.position - b.position);
      const applicableTier = sortedTiers.filter((t) => t.position <= position).pop();
      rewardAmount = applicableTier ? applicableTier.amount : 0;
    }

    if (rewardAmount <= 0) {
      return NextResponse.json({ error: 'No reward available for this position' }, { status: 400 });
    }

    // Create claim and update code in a transaction-like flow
    const claim = await db.dailyCodeClaim.create({
      data: {
        user_id: userId,
        code_id: dailyCode.id,
        position,
        reward_amount: rewardAmount,
      },
    });

    // Update current_claims count
    await db.dailyCode.update({
      where: { id: dailyCode.id },
      data: { current_claims: position },
    });

    // Add reward to user balance
    await createTransaction(
      userId,
      'daily_reward',
      rewardAmount,
      'Completed',
      'daily_code_claim',
      claim.id,
      `Daily code reward (Position #${position}, Code: ${codeValue})`
    );

    return NextResponse.json({
      message: 'Code claimed successfully!',
      claim,
      position,
      reward_amount: rewardAmount,
    });
  } catch (error) {
    console.error('Claim daily code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
