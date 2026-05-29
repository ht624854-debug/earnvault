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

    // Recent transactions (last 10)
    const recentTransactions = await db.transaction.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    // Referral count
    const referralCount = await db.referral.count({
      where: { referrer_id: userId },
    });

    // Task submissions count
    const taskSubmissionsCount = await db.taskSubmission.count({
      where: { user_id: userId },
    });

    return NextResponse.json({
      ...user,
      recent_transactions: recentTransactions,
      referral_count: referralCount,
      task_submissions_count: taskSubmissionsCount,
      total_earned: recentTransactions
        .filter(t => ['task_reward', 'referral_reward', 'daily_reward', 'activation'].includes(t.type) && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0),
      total_referrals: referralCount,
      pending_withdrawals: 0,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
