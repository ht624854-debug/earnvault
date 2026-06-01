'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { useAuthStore, useRouterStore, useToastStore, useSettingsStore } from '@/lib/stores';

const FAKE_TRANSACTIONS = [
  { name: 'Ahmed K.', action: 'withdrew', amount: 5200, method: 'Easypaisa', type: 'withdraw' },
  { name: 'Sara M.', action: 'earned', amount: 350, method: 'Task Reward', type: 'earn' },
  { name: 'Usman A.', action: 'withdrew', amount: 8000, method: 'JazzCash', type: 'withdraw' },
  { name: 'Fatima R.', action: 'earned', amount: 200, method: 'Referral Bonus', type: 'earn' },
  { name: 'Ali H.', action: 'withdrew', amount: 3100, method: 'Bank Transfer', type: 'withdraw' },
  { name: 'Ayesha B.', action: 'earned', amount: 150, method: 'Daily Code', type: 'earn' },
  { name: 'Bilal S.', action: 'withdrew', amount: 6500, method: 'Easypaisa', type: 'withdraw' },
  { name: 'Zainab K.', action: 'earned', amount: 500, method: 'Task Reward', type: 'earn' },
  { name: 'Hassan N.', action: 'withdrew', amount: 4200, method: 'JazzCash', type: 'withdraw' },
  { name: 'Maryam T.', action: 'earned', amount: 300, method: 'Referral Bonus', type: 'earn' },
  { name: 'Omar F.', action: 'withdrew', amount: 9500, method: 'SadaPay', type: 'withdraw' },
  { name: 'Iqra J.', action: 'earned', amount: 100, method: 'Daily Code', type: 'earn' },
  { name: 'Danish P.', action: 'withdrew', amount: 2800, method: 'Easypaisa', type: 'withdraw' },
  { name: 'Nida L.', action: 'earned', amount: 750, method: 'Task Reward', type: 'earn' },
  { name: 'Kamran V.', action: 'withdrew', amount: 11000, method: 'Bank Transfer', type: 'withdraw' },
  { name: 'Hira W.', action: 'earned', amount: 200, method: 'Referral Bonus', type: 'earn' },
  { name: 'Rizwan Q.', action: 'withdrew', amount: 5600, method: 'JazzCash', type: 'withdraw' },
  { name: 'Sana E.', action: 'earned', amount: 450, method: 'Task Reward', type: 'earn' },
  { name: 'Tahir G.', action: 'withdrew', amount: 7300, method: 'Easypaisa', type: 'withdraw' },
  { name: 'Amna C.', action: 'earned', amount: 180, method: 'Daily Code', type: 'earn' },
];

function ScrollingTransactions() {
  const [visibleItems, setVisibleItems] = useState(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      ...FAKE_TRANSACTIONS[i % FAKE_TRANSACTIONS.length],
      id: i,
    }));
  });

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
    <div className="mt-6 w-full max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-[#10B981]" />
        <p className="text-xs font-semibold text-[#10B981]">Live Transactions</p>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
        </span>
      </div>
      <div className="space-y-2 overflow-hidden" style={{ height: '152px' }}>
        {visibleItems.map((item, i) => (
          <motion.div
            key={item.id}
            className="flex items-center gap-3 bg-ev-card/80 backdrop-blur-sm border border-ev-card-border rounded-xl px-3 py-2.5"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'earn' ? 'bg-[#10B981]/10' : 'bg-ev-blue/10'}`}>
              {item.type === 'earn' ? (
                <ArrowDownRight className="w-4 h-4 text-[#10B981]" />
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

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const { navigate } = useRouterStore();
  const { addToast } = useToastStore();
  const { settings } = useSettingsStore();

  const brandName = settings.brand_name || 'EarnVault';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      addToast('Welcome back!', 'success');
      navigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ev-bg flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 ev-gradient-red rounded-2xl flex items-center justify-center mx-auto mb-4 ev-glow-red">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ev-text">Welcome Back</h1>
          <p className="text-ev-muted text-sm mt-1">Sign in to your {brandName} account</p>
        </div>

        {/* Form */}
        <div className="ev-card p-6">
          {error && (
            <div className="bg-ev-blue/10 border border-ev-blue/30 rounded-lg p-3 mb-4 text-sm text-ev-blue">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ev-muted mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
                className="ev-input w-full px-4 py-2.5 text-sm"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ev-muted mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="ev-input w-full px-4 py-2.5 pr-10 text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ev-muted hover:text-ev-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ev-btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-ev-muted">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate('register')}
                className="text-ev-blue hover:underline font-medium"
              >
                Register
              </button>
            </p>
          </div>
        </div>

        {/* Scrolling Fake Transactions */}
        <ScrollingTransactions />

        <button
          onClick={() => navigate('landing')}
          className="block mx-auto mt-6 text-sm text-ev-muted hover:text-ev-text transition-colors"
        >
          &larr; Back to Home
        </button>
      </motion.div>
    </div>
  );
}
