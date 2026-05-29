import { create } from 'zustand';
import { api } from './api-client';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  mobile: string;
  avatar: string;
  referral_code: string;
  referred_by_id: string | null;
  main_balance: number;
  deposit_balance: number;
  package_status: string;
  role: string;
  status: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,

  login: async (username: string, password: string) => {
    const res = await api.login(username, password);
    set({
      user: res.user,
      isAuthenticated: true,
      isAdmin: res.user.role === 'admin',
      isLoading: false,
    });
  },

  adminLogin: async (username: string, password: string) => {
    const res = await api.adminLogin(username, password);
    set({
      user: res.admin,
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
    });
  },

  register: async (data: any) => {
    const res = await api.register(data);
    set({
      user: res.user,
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
    });
  },

  logout: () => {
    api.logout();
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('ev_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      const res = await api.getMe();
      set({
        user: res.user,
        isAuthenticated: true,
        isAdmin: res.user.role === 'admin',
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('ev_token');
      set({ isLoading: false, isAuthenticated: false, user: null, isAdmin: false });
    }
  },

  refreshUser: async () => {
    try {
      const res = await api.getMe();
      set({ user: res.user });
    } catch {
      // ignore
    }
  },
}));

// Settings store
interface SettingsState {
  settings: Record<string, string>;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {},
  isLoading: true,

  loadSettings: async () => {
    try {
      const res = await api.getSettings();
      set({ settings: res.settings, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

// Router store
type Page =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'tasks'
  | 'activation'
  | 'withdraw'
  | 'refer'
  | 'rewards'
  | 'profile'
  | 'support'
  | 'download'
  | 'support-ticket'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-user-detail'
  | 'admin-activations'
  | 'admin-withdrawals'
  | 'admin-tasks'
  | 'admin-task-submissions'
  | 'admin-settings'
  | 'admin-payment-methods'
  | 'admin-reward-campaigns'
  | 'admin-transactions'
  | 'admin-audit-logs'
  | 'admin-support'
  | 'admin-referrals';

interface RouterState {
  page: Page;
  params: Record<string, string>;
  navigate: (page: Page, params?: Record<string, string>) => void;
}

export const useRouterStore = create<RouterState>((set) => ({
  page: 'landing',
  params: {},

  navigate: (page: Page, params: Record<string, string> = {}) => {
    set({ page, params });
    window.scrollTo(0, 0);
  },
}));

// Toast store
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
