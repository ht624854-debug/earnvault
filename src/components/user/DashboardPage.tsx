'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LogOut,
  Target,
  Zap,
  Wallet,
  Gift,
  Award,
  Users,
  HeadphonesIcon,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Inbox,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore, useRouterStore, useToastStore, useSettingsStore } from '@/lib/stores';
import { api } from '@/lib/api-client';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
}

interface DashboardData {
  main_balance: number;
  deposit_balance: number;
  package_status: string;
  total_earned: number;
  total_referrals: number;
  pending_withdrawals: number;
  recent_transactions: Transaction[];
}

const FAKE_TRANSACTIONS = [
  { name: 'Sara M.', action: 'earned', amount: 350, method: 'Task Reward', type: 'earn' },
  { name: 'Usman A.', action: 'withdrew', amount: 8000, method: 'JazzCash', type: 'withdraw' },
  { name: 'Fatima R.', action: 'earned', amount: 200, method: 'Referral Bonus', type: 'earn' },
  { name: 'Ahmed K.', action: 'withdrew', amount: 5200, method: 'Easypaisa', type: 'withdraw' },
  { name: 'Ayesha B.', action: 'earned', amount: 150, method: 'Daily Code', type: 'earn' },
  { name: 'Bilal S.', action: 'withdrew', amount: 6500, method: 'Easypaisa', type: 'withdraw' },
  { name: 'Zainab K.', action: 'earned', amount: 500, method: 'Task Reward', type: 'earn' },
  { name: 'Ali H.', action: 'withdrew', amount: 3100, method: 'Bank Transfer', type: 'withdraw' },
  { name: 'Maryam T.', action: 'earned', amount: 300, method: 'Referral Bonus', type: 'earn' },
  { name: 'Omar F.', action: 'withdrew', amount: 9500, method: 'SadaPay', type: 'withdraw' },
  { name: 'Iqra J.', action: 'earned', amount: 100, method: 'Daily Code', type: 'earn' },
  { name: 'Hassan N.', action: 'withdrew', amount: 4200, method: 'JazzCash', type: 'withdraw' },
];

function LiveTransactionsFeed() {
  const [visibleItems, setVisibleItems] = useState(() =>
    Array.from({ length: 4 }, (_, i) => ({
      ...FAKE_TRANSACTIONS[i % FAKE_TRANSACTIONS.length],
      id: i,
    }))
  );

  useEffect(() => {
    let counter = 4;
    const interval = setInterval(() => {
      counter++;
      const nextIdx = (counter - 1) % FAKE_TRANSACTIONS.length;
      setVisibleItems((old) => [
        ...old.slice(1),
        { ...FAKE_TRANSACTIONS[nextIdx], id: counter },
      ]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-[#10B981]" />
        <p className="text-sm font-semibold text-[#10B981]">Live Transactions</p>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
        </span>
      </div>
      <div className="space-y-2 overflow-hidden" style={{ height: '160px' }}>
        {visibleItems.map((item) => (
          <motion.div
            key={item.id}
            className="flex items-center gap-3 bg-ev-card/80 backdrop-blur-sm border border-ev-card-border rounded-xl px-3 py-2.5"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'earn' ? 'bg-[#10B981]/10' : 'bg-ev-blue/10'}`}>
              {item.type === 'earn' ? (
                <ArrowDownLeft className="w-4 h-4 text-[#10B981]" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-ev-blue" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ev-text truncate">
                <span className="font-semibold">{item.name}</span>{' '}
                <span className="text-ev-muted">{item.action}</span>
              </p>
              <p className="text-[10px] text-ev-muted">{item.method}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-xs font-bold ${item.type === 'earn' ? 'text-[#10B981]' : 'text-ev-blue'}`}>
                {item.type === 'earn' ? '+' : '-'}Rs {item.amount.toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuthStore();
  const { navigate } = useRouterStore();
  const { addToast } = useToastStore();
  const { settings } = useSettingsStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getDashboard();
        setData(res);
      } catch {
        addToast('Failed to load dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'info');
    navigate('landing');
  };

  const actionCards = [
    { icon: Target, label: 'Task', page: 'tasks' as const, color: '#2563EB' },
    { icon: Zap, label: 'Activation', page: 'activation' as const, color: '#F59E0B' },
    { icon: Wallet, label: 'Withdraw', page: 'withdraw' as const, color: '#10B981' },
    { icon: Gift, label: 'Reward', page: 'rewards' as const, color: '#8B5CF6' },
    { icon: Award, label: 'Bonuses', page: 'rewards' as const, color: '#EC4899' },
    { icon: Users, label: 'Network', page: 'refer' as const, color: '#06B6D4' },
    { icon: HeadphonesIcon, label: 'Support', page: 'support' as const, color: '#6366F1' },
    { icon: Download, label: 'Download', page: 'download' as const, color: '#F97316' },
  ];

  const statusBadge = (status: string) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 rounded-full px-2.5 py-0.5 text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 rounded-full px-2.5 py-0.5 text-xs font-medium">
        <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full" />
        Inactive
      </span>
    );
  };

  const transactionIcon = (type: string) => {
    if (['withdrawal', 'admin_adjustment'].includes(type) && data) {
      return <ArrowUpRight className="w-4 h-4 text-ev-blue" />;
    }
    return <ArrowDownLeft className="w-4 h-4 text-[#10B981]" />;
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = ['withdrawal'].includes(type) ? '-' : '+';
    return `${prefix}Rs. ${Math.abs(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ev-bg flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-ev-blue/30 border-t-ev-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ev-bg pb-24">
      {/* Header */}
      <div className="bg-ev-bg border-b border-ev-card-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 ev-gradient-red rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-ev-text font-semibold">Hello, {user?.username || 'User'}</p>
              <p className="text-xs text-ev-muted">Welcome to your Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-ev-muted hover:text-ev-blue transition-colors px-3 py-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Balance Card */}
        <motion.div
          className="ev-card p-5 relative overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 ev-gradient-red opacity-5" />
          <div className="relative z-10">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-ev-muted mb-1">Main Balance</p>
                <p className="text-xl font-bold text-ev-text">
                  Rs. {((data?.main_balance ?? user?.main_balance) || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-ev-muted mb-1">Deposit Balance</p>
                <p className="text-xl font-bold text-ev-text">
                  Rs. {((data?.deposit_balance ?? user?.deposit_balance) || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-ev-muted mb-1">Status</p>
                <div className="mt-1">{statusBadge(data?.package_status || user?.package_status || 'Inactive')}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Menu Grid */}
        <div className="grid grid-cols-4 gap-3">
          {actionCards.map((card, i) => (
            <motion.button
              key={i}
              onClick={() => navigate(card.page)}
              className="ev-card p-3 sm:p-4 flex flex-col items-center gap-2 hover:border-ev-blue/30 transition-colors"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: card.color + '15' }}
              >
                <card.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: card.color }} />
              </div>
              <span className="text-[10px] sm:text-xs text-ev-muted font-medium">{card.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Live Transactions - AFTER action cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LiveTransactionsFeed />
        </motion.div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-ev-text">Recent Transactions</h2>
          </div>
          <div className="ev-card divide-y divide-ev-card-border">
            {Array.isArray(data?.recent_transactions) && data.recent_transactions.length > 0 ? (
              data.recent_transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 bg-ev-bg rounded-lg flex items-center justify-center">
                    {transactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ev-text truncate">{tx.description || tx.type}</p>
                    <p className="text-xs text-ev-muted">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      ['withdrawal'].includes(tx.type) ? 'text-ev-blue' : 'text-[#10B981]'
                    }`}
                  >
                    {formatAmount(tx.amount, tx.type)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-ev-muted">
                <Inbox className="w-10 h-10 mb-2" />
                <p className="text-sm">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
