import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    // Get active daily codes with claim counts
    const codes = await db.dailyCode.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        code: true,
        max_claims: true,
        current_claims: true,
        is_active: true,
        created_at: true,
        reward_tiers: true,
        _count: {
          select: { claims: true },
        },
      },
    });

    // Parse reward tiers and check if user already claimed
    const authResult = requireAuth(request);
    const userId = !(authResult instanceof NextResponse) ? authResult.userId : null;

    let userClaimedIds: Set<string> = new Set();
    if (userId) {
      const claims = await db.dailyCodeClaim.findMany({
        where: { user_id: userId },
        select: { code_id: true, position: true, reward_amount: true },
      });
      userClaimedIds = new Set(claims.map(c => c.code_id));
    }

    // Only show codes that still have claims available
    const availableCodes = codes
      .filter(c => c.current_claims < c.max_claims)
      .map(c => {
        const tiers = JSON.parse(c.reward_tiers || '[]');
        const nextPosition = c.current_claims + 1;
        
        // Find the next position's reward
        let nextReward = 0;
        const tierForNext = tiers.find((t: { position: number; amount: number }) => t.position === nextPosition);
        if (tierForNext) {
          nextReward = tierForNext.amount;
        } else if (tiers.length > 0) {
          const sortedTiers = [...tiers].sort((a: { position: number }, b: { position: number }) => a.position - b.position);
          const applicableTier = sortedTiers.filter((t: { position: number }) => t.position <= nextPosition).pop();
          nextReward = applicableTier ? (applicableTier as { amount: number }).amount : 0;
        }

        return {
          id: c.id,
          code: c.code,
          max_claims: c.max_claims,
          current_claims: c.current_claims,
          remaining: c.max_claims - c.current_claims,
          next_reward: nextReward,
          user_already_claimed: userClaimedIds.has(c.id),
          created_at: c.created_at,
        };
      });

    return NextResponse.json({ codes: availableCodes });
  } catch (error) {
    console.error('Get daily codes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
