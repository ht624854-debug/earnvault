'use client';

import { useState } from 'react';
import { useAuthStore, useRouterStore } from '@/lib/stores';
import {
  LayoutDashboard,
  Users,
  Zap,
  Wallet,
  ListChecks,
  FileCheck,
  Link2,
  Gift,
  CreditCard,
  Settings,
  ArrowLeftRight,
  ScrollText,
  Headphones,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  page: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', page: 'admin-dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Users', page: 'admin-users', icon: <Users className="w-4 h-4" /> },
  { label: 'Activations', page: 'admin-activations', icon: <Zap className="w-4 h-4" /> },
  { label: 'Withdrawals', page: 'admin-withdrawals', icon: <Wallet className="w-4 h-4" /> },
  { label: 'Tasks', page: 'admin-tasks', icon: <ListChecks className="w-4 h-4" /> },
  { label: 'Task Submissions', page: 'admin-task-submissions', icon: <FileCheck className="w-4 h-4" /> },
  { label: 'Referrals', page: 'admin-referrals', icon: <Link2 className="w-4 h-4" /> },
  { label: 'Reward Campaigns', page: 'admin-reward-campaigns', icon: <Gift className="w-4 h-4" /> },
  { label: 'Payment Methods', page: 'admin-payment-methods', icon: <CreditCard className="w-4 h-4" /> },
  { label: 'Settings', page: 'admin-settings', icon: <Settings className="w-4 h-4" /> },
  { label: 'Transactions', page: 'admin-transactions', icon: <ArrowLeftRight className="w-4 h-4" /> },
  { label: 'Audit Logs', page: 'admin-audit-logs', icon: <ScrollText className="w-4 h-4" /> },
  { label: 'Support', page: 'admin-support', icon: <Headphones className="w-4 h-4" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { page, navigate } = useRouterStore();
  const { user, logout } = useAuthStore();

  const handleNavigate = (targetPage: string) => {
    navigate(targetPage as any);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('admin-login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg ev-gradient-red flex items-center justify-center ev-glow-red-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#F5F5F5]">EarnVault</h2>
            <p className="text-[10px] text-[#737373] uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
        {sidebarItems.map((item) => {
          const isActive = page === item.page;
          return (
            <button
              key={item.page}
              onClick={() => handleNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-0.5 ${
                isActive
                  ? 'bg-[#DC2626]/10 text-[#DC2626] ev-glow-red-sm'
                  : 'text-[#A3A3A3] hover:bg-[#1F1F1F] hover:text-[#F5F5F5]'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1F1F1F]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[#DC2626] font-bold text-sm">
            {user?.first_name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F5F5F5] truncate">
              {user?.first_name || 'Admin'}
            </p>
            <p className="text-xs text-[#737373] truncate">{user?.email || 'admin'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-[#0A0A0A] border-r border-[#1F1F1F] z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A] border-b border-[#1F1F1F]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg ev-gradient-red flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-[#F5F5F5]">EarnVault Admin</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#A3A3A3] hover:bg-[#1F1F1F] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 bg-[#0A0A0A] border-r border-[#1F1F1F]"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
