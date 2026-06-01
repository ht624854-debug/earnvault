'use client';

import { Home, Target, Wallet, Share2, User } from 'lucide-react';
import { useRouterStore, useAuthStore } from '@/lib/stores';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', page: 'dashboard' as const },
  { icon: Target, label: 'Task', page: 'tasks' as const },
  { icon: Wallet, label: 'Withdraw', page: 'withdraw' as const },
  { icon: Share2, label: 'Share', page: 'refer' as const },
  { icon: User, label: 'Profile', page: 'profile' as const },
];

const adminPages = [
  'admin-login',
  'admin-dashboard',
  'admin-users',
  'admin-user-detail',
  'admin-activations',
  'admin-withdrawals',
  'admin-tasks',
  'admin-task-submissions',
  'admin-settings',
  'admin-payment-methods',
  'admin-reward-campaigns',
  'admin-transactions',
  'admin-audit-logs',
  'admin-support',
  'admin-referrals',
];

const noNavPages = ['landing', 'login', 'register', 'admin-login'];

export default function BottomNav() {
  const { page, navigate } = useRouterStore();
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated || isAdmin) return null;
  if (noNavPages.includes(page)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F0F7FF]/95 backdrop-blur-xl border-t border-[#EFF6FF] safe-area-bottom">
      <div className="max-w-4xl mx-auto flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => {
          const isActive = page === item.page;
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px] relative"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav-indicator"
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#2563EB] rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
