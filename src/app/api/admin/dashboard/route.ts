import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      blockedUsers,
      pendingActivations,
      pendingWithdrawals,
      approvedWithdrawals,
      taskRewards,
      referralRewards,
      todayRegistrations,
      todayTransactions,
    ] = await Promise.all([
      db.user.count({ where: { role: 'user' } }),
      db.user.count({ where: { role: 'user', status: 'active' } }),
      db.user.count({ where: { role: 'user', package_status: 'Inactive' } }),
      db.user.count({ where: { role: 'user', status: 'blocked' } }),
      db.activationRequest.count({ where: { status: 'Pending' } }),
      db.withdrawRequest.count({ where: { status: 'Pending' } }),
      db.withdrawRequest.aggregate({
        where: { status: { in: ['Approved', 'Paid'] } },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { type: 'task_reward' },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { type: 'referral_reward' },
        _sum: { amount: true },
      }),
      db.user.count({
        where: {
          role: 'user',
          created_at: { gte: today },
        },
      }),
      db.transaction.count({
        where: {
          created_at: { gte: today },
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      blockedUsers,
      pendingActivations,
      pendingWithdrawals,
      totalApprovedWithdrawals: approvedWithdrawals._sum.amount || 0,
      totalTaskRewards: taskRewards._sum.amount || 0,
      totalReferralRewards: referralRewards._sum.amount || 0,
      todayRegistrations,
      todayTransactions,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
