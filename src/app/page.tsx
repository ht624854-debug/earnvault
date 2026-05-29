'use client';

import { useEffect } from 'react';
import { useAuthStore, useSettingsStore, useRouterStore } from '@/lib/stores';
import { AnimatePresence, motion } from 'framer-motion';

// User pages
import LandingPage from '@/components/user/LandingPage';
import LoginPage from '@/components/user/LoginPage';
import RegisterPage from '@/components/user/RegisterPage';
import DashboardPage from '@/components/user/DashboardPage';
import TasksPage from '@/components/user/TasksPage';
import ActivationPage from '@/components/user/ActivationPage';
import WithdrawPage from '@/components/user/WithdrawPage';
import ReferPage from '@/components/user/ReferPage';
import RewardsPage from '@/components/user/RewardsPage';
import ProfilePage from '@/components/user/ProfilePage';
import SupportPage from '@/components/user/SupportPage';
import DownloadPage from '@/components/user/DownloadPage';

// Admin pages
import AdminLoginPage from '@/components/admin/AdminLoginPage';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminUserDetail from '@/components/admin/AdminUserDetail';
import AdminActivations from '@/components/admin/AdminActivations';
import AdminWithdrawals from '@/components/admin/AdminWithdrawals';
import AdminTasks from '@/components/admin/AdminTasks';
import AdminTaskSubmissions from '@/components/admin/AdminTaskSubmissions';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminPaymentMethods from '@/components/admin/AdminPaymentMethods';
import AdminRewardCampaigns from '@/components/admin/AdminRewardCampaigns';
import AdminTransactions from '@/components/admin/AdminTransactions';
import AdminAuditLogs from '@/components/admin/AdminAuditLogs';
import AdminSupport from '@/components/admin/AdminSupport';
import AdminReferrals from '@/components/admin/AdminReferrals';
import AdminSecurity from '@/components/admin/AdminSecurity';

// Shared
import BottomNav from '@/components/shared/BottomNav';
import WhatsAppPopup from '@/components/shared/WhatsAppPopup';
import Toast from '@/components/shared/Toast';

function PageRouter() {
  const { page, params } = useRouterStore();
  const { isAuthenticated, isAdmin } = useAuthStore();

  // Admin pages
  if (isAdmin) {
    const adminPageMap: Record<string, React.ReactNode> = {
      'admin-dashboard': <AdminDashboard />,
      'admin-users': <AdminUsers />,
      'admin-user-detail': <AdminUserDetail />,
      'admin-activations': <AdminActivations />,
      'admin-withdrawals': <AdminWithdrawals />,
      'admin-tasks': <AdminTasks />,
      'admin-task-submissions': <AdminTaskSubmissions />,
      'admin-settings': <AdminSettings />,
      'admin-payment-methods': <AdminPaymentMethods />,
      'admin-reward-campaigns': <AdminRewardCampaigns />,
      'admin-transactions': <AdminTransactions />,
      'admin-audit-logs': <AdminAuditLogs />,
      'admin-support': <AdminSupport />,
      'admin-referrals': <AdminReferrals />,
      'admin-security': <AdminSecurity />,
    };

    if (page === 'admin-login') {
      return <AdminLoginPage />;
    }

    const content = adminPageMap[page] || <AdminDashboard />;
    return <AdminLayout>{content}</AdminLayout>;
  }

  // Auth pages (no bottom nav)
  if (!isAuthenticated) {
    const authPageMap: Record<string, React.ReactNode> = {
      'landing': <LandingPage />,
      'login': <LoginPage />,
      'register': <RegisterPage />,
      'admin-login': <AdminLoginPage />,
    };
    return (
      <>
        {authPageMap[page] || <LandingPage />}
        <WhatsAppPopup />
      </>
    );
  }

  // User pages (with bottom nav)
  const userPageMap: Record<string, React.ReactNode> = {
    'dashboard': <DashboardPage />,
    'tasks': <TasksPage />,
    'activation': <ActivationPage />,
    'withdraw': <WithdrawPage />,
    'refer': <ReferPage />,
    'rewards': <RewardsPage />,
    'profile': <ProfilePage />,
    'support': <SupportPage />,
    'download': <DownloadPage />,
    'support-ticket': <SupportPage />,
  };

  return (
    <>
      <div className="pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {userPageMap[page] || <DashboardPage />}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav />
      <WhatsAppPopup />
    </>
  );
}

export default function Home() {
  const { checkAuth, isLoading } = useAuthStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, [checkAuth, loadSettings]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#737373] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <PageRouter />
      <Toast />
    </div>
  );
}
