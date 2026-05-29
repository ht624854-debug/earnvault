'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useRouterStore, useToastStore } from '@/lib/stores';
import {
  Users,
  UserCheck,
  UserX,
  Ban,
  Zap,
  Wallet,
  CheckCircle,
  ListChecks,
  Gift,
  CalendarPlus,
  Loader2,
  TrendingUp,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  blockedUsers: number;
  pendingActivations: number;
  pendingWithdrawals: number;
  totalApprovedWithdrawals: number;
  totalTaskRewards: number;
  totalReferralRewards: number;
  todayRegistrations: number;
}

const statCards: { key: keyof DashboardStats; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'totalUsers', label: 'Total Users', icon: <Users className="w-5 h-5" />, color: 'text-blue-400' },
  { key: 'activeUsers', label: 'Active Users', icon: <UserCheck className="w-5 h-5" />, color: 'text-green-400' },
  { key: 'inactiveUsers', label: 'Inactive Users', icon: <UserX className="w-5 h-5" />, color: 'text-yellow-400' },
  { key: 'blockedUsers', label: 'Blocked Users', icon: <Ban className="w-5 h-5" />, color: 'text-red-400' },
  { key: 'pendingActivations', label: 'Pending Activations', icon: <Zap className="w-5 h-5" />, color: 'text-orange-400' },
  { key: 'pendingWithdrawals', label: 'Pending Withdrawals', icon: <Wallet className="w-5 h-5" />, color: 'text-purple-400' },
  { key: 'totalApprovedWithdrawals', label: 'Approved Withdrawals', icon: <CheckCircle className="w-5 h-5" />, color: 'text-emerald-400' },
  { key: 'totalTaskRewards', label: 'Total Task Rewards', icon: <ListChecks className="w-5 h-5" />, color: 'text-cyan-400' },
  { key: 'totalReferralRewards', label: 'Referral Rewards', icon: <Gift className="w-5 h-5" />, color: 'text-pink-400' },
  { key: 'todayRegistrations', label: 'Today Registrations', icon: <CalendarPlus className="w-5 h-5" />, color: 'text-teal-400' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { navigate } = useRouterStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminDashboard();
      setStats(res);
    } catch (err: any) {
      addToast(err.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#DC2626]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Dashboard</h1>
          <p className="text-[#737373] text-sm mt-1">Overview of your platform</p>
        </div>
        <button onClick={loadDashboard} className="ev-btn-secondary text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.key} className="ev-card p-4 hover:border-[#DC2626]/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className={`${card.color}`}>{card.icon}</span>
            </div>
            <p className="text-2xl font-bold text-[#F5F5F5]">{stats?.[card.key]?.toLocaleString() ?? '0'}</p>
            <p className="text-xs text-[#737373] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="ev-card p-6">
        <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('admin-users')}
            className="ev-btn-secondary text-sm flex items-center justify-center gap-2 py-3"
          >
            <Users className="w-4 h-4" />
            Manage Users
          </button>
          <button
            onClick={() => navigate('admin-activations')}
            className="ev-btn-secondary text-sm flex items-center justify-center gap-2 py-3"
          >
            <Zap className="w-4 h-4" />
            Activations
          </button>
          <button
            onClick={() => navigate('admin-withdrawals')}
            className="ev-btn-secondary text-sm flex items-center justify-center gap-2 py-3"
          >
            <Wallet className="w-4 h-4" />
            Withdrawals
          </button>
          <button
            onClick={() => navigate('admin-tasks')}
            className="ev-btn-secondary text-sm flex items-center justify-center gap-2 py-3"
          >
            <ListChecks className="w-4 h-4" />
            Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
