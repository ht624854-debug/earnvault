import { create } from 'zustand';
import { api } from './api-client';

// Apply theme colors from settings to CSS custom properties
function applyThemeFromSettings(s: Record<string, string>) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (s.theme_primary_color) {
    root.style.setProperty('--primary', s.theme_primary_color);
    root.style.setProperty('--ring', s.theme_primary_color);
    root.style.setProperty('--sidebar-primary', s.theme_primary_color);
    root.style.setProperty('--sidebar-ring', s.theme_primary_color);
    root.style.setProperty('--chart-1', s.theme_primary_color);
  }
  if (s.theme_bg_color) {
    root.style.setProperty('--background', s.theme_bg_color);
  }
  if (s.theme_card_color) {
    root.style.setProperty('--card', s.theme_card_color);
    root.style.setProperty('--popover', s.theme_card_color);
  }
  if (s.theme_text_color) {
    root.style.setProperty('--foreground', s.theme_text_color);
    root.style.setProperty('--card-foreground', s.theme_text_color);
    root.style.setProperty('--popover-foreground', s.theme_text_color);
  }
  if (s.theme_border_color) {
    root.style.setProperty('--border', s.theme_border_color);
    root.style.setProperty('--sidebar-border', s.theme_border_color);
    root.style.setProperty('--input', s.theme_border_color);
  }
  // Update document title with brand name
  if (s.brand_name) {
    document.title = `${s.brand_name} - Earn Real Rewards Daily`;
  }
  // Update favicon if logo_url is set
  if (s.logo_url) {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = s.logo_url;
    }
  }
}

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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,

  login: async (username: string, password: string) => {
    const res = await api.login(username, password);
    if (res.error) throw new Error(res.error);
    const user = res.user;
    const isAdmin = user?.role === 'admin';
    set({
      user,
      isAuthenticated: true,
      isAdmin,
      isLoading: false,
    });
  },

  adminLogin: async (username: string, password: string) => {
    const res = await api.adminLogin(username, password);
    if (res.error) throw new Error(res.error);
    set({
      user: res.admin || res.user,
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
    });
  },

  register: async (data: any) => {
    const res = await api.register(data);
    if (res.error) throw new Error(res.error);
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
    const token = sessionStorage.getItem('ev_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null, isAdmin: false });
      return;
    }
    try {
      const res = await api.getMe();
      if (res.error || !res.user) {
        sessionStorage.removeItem('ev_token');
        set({ isLoading: false, isAuthenticated: false, user: null, isAdmin: false });
        return;
      }
      set({
        user: res.user,
        isAuthenticated: true,
        isAdmin: res.user.role === 'admin',
        isLoading: false,
      });
    } catch {
      sessionStorage.removeItem('ev_token');
      set({ isLoading: false, isAuthenticated: false, user: null, isAdmin: false });
    }
  },

  refreshUser: async () => {
    try {
      const res = await api.getMe();
      if (res.user) {
        set({ user: res.user });
      }
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
      const settings = res.settings || {};
      set({ settings, isLoading: false });
      // Apply theme colors from settings to CSS variables
      applyThemeFromSettings(settings);
    } catch {
      set({ isLoading: false, settings: {} });
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
  | 'bonuses'
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
  | 'admin-referrals'
  | 'admin-referral-tiers'
  | 'admin-bonus-campaigns'
  | 'admin-security';

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
