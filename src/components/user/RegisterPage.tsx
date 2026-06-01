'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
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
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 w-full max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-[#10B981]" />
        <p className="text-xs font-semibold text-[#10B981]">Live Transactions</p>
      </div>
      <div className="space-y-2 overflow-hidden" style={{ height: '152px' }}>
        {visibleItems.map((item) => (
          <motion.div
            key={item.id}
            className="flex items-center gap-3 bg-ev-card/80 backdrop-blur-sm border border-ev-card-border rounded-xl px-3 py-2.5"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
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

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    mobile: '',
    password: '',
    confirm_password: '',
    referral_code: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuthStore();
  const { navigate } = useRouterStore();
  const { addToast } = useToastStore();
  const { settings } = useSettingsStore();

  const brandName = settings.brand_name || 'EarnVault';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('reference');
    if (ref) {
      setForm((prev) => ({ ...prev, referral_code: ref.toUpperCase() }));
    }
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.first_name.trim()) e.first_name = 'First name is required';
    if (!form.last_name.trim()) e.last_name = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
      e.username = 'Username must be 3-20 characters (letters, numbers, underscores)';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter 10 digit mobile number';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        username: form.username,
        mobile: '+92' + form.mobile,
        password: form.password,
        referral_code: form.referral_code || undefined,
      });
      addToast('Account created successfully!', 'success');
      navigate('dashboard');
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
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
        <div className="text-center mb-6">
          <div className="w-14 h-14 ev-gradient-red rounded-2xl flex items-center justify-center mx-auto mb-4 ev-glow-red">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ev-text">Create Account</h1>
          <p className="text-ev-muted text-sm mt-1">Join {brandName} and start earning</p>
        </div>

        {/* Form */}
        <div className="ev-card p-6">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ev-muted mb-1">First Name</label>
                <input
                  value={form.first_name}
                  onChange={(e) => updateField('first_name', e.target.value)}
                  placeholder="First name"
                  className="ev-input w-full px-3 py-2.5 text-sm"
                />
                {errors.first_name && <p className="text-xs text-ev-blue mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ev-muted mb-1">Last Name</label>
                <input
                  value={form.last_name}
                  onChange={(e) => updateField('last_name', e.target.value)}
                  placeholder="Last name"
                  className="ev-input w-full px-3 py-2.5 text-sm"
                />
                {errors.last_name && <p className="text-xs text-ev-blue mt-1">{errors.last_name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ev-muted mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="your@email.com"
                className="ev-input w-full px-4 py-2.5 text-sm"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-ev-blue mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ev-muted mb-1">Username</label>
              <input
                value={form.username}
                onChange={(e) => updateField('username', e.target.value)}
                placeholder="Choose a username"
                className="ev-input w-full px-4 py-2.5 text-sm"
                autoComplete="username"
              />
              {errors.username && <p className="text-xs text-ev-blue mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ev-muted mb-1">Mobile Number</label>
              <div className="flex">
                <span className="bg-ev-bg border border-r-0 border-ev-card-border rounded-l-lg px-3 py-2.5 text-sm text-ev-muted flex items-center">
                  +92
                </span>
                <input
                  value={form.mobile}
                  onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="3XX XXXXXXX"
                  className="ev-input w-full rounded-l-none px-4 py-2.5 text-sm"
                  autoComplete="tel"
                />
              </div>
              {errors.mobile && <p className="text-xs text-ev-blue mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ev-muted mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Min 6 characters"
                  className="ev-input w-full px-4 py-2.5 pr-10 text-sm"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ev-muted hover:text-ev-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-ev-blue mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ev-muted mb-1">Confirm Password</label>
              <input
                type="password"
                value={form.confirm_password}
                onChange={(e) => updateField('confirm_password', e.target.value)}
                placeholder="Confirm your password"
                className="ev-input w-full px-4 py-2.5 text-sm"
                autoComplete="new-password"
              />
              {errors.confirm_password && <p className="text-xs text-ev-blue mt-1">{errors.confirm_password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ev-muted mb-1">
                Referral Code <span className="text-[#94A3B8]">(optional)</span>
              </label>
              <input
                value={form.referral_code}
                onChange={(e) => updateField('referral_code', e.target.value.toUpperCase())}
                placeholder="Enter referral code (if any)"
                className="ev-input w-full px-4 py-2.5 text-sm"
              />
              {form.referral_code && (
                <p className="text-xs text-[#10B981] mt-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  You'll earn extra rewards through this referral!
                </p>
              )}
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
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-ev-muted">
            Already have an account?{' '}
            <button onClick={() => navigate('login')} className="text-ev-blue hover:underline font-medium">
              Sign In
            </button>
          </p>
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
