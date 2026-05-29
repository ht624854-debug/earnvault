'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, DollarSign } from 'lucide-react';
import { useAuthStore, useRouterStore, useToastStore, useSettingsStore } from '@/lib/stores';

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
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-8">
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
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Welcome Back</h1>
          <p className="text-[#737373] text-sm mt-1">Sign in to your {brandName} account</p>
        </div>

        {/* Form */}
        <div className="ev-card p-6">
          {error && (
            <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-lg p-3 mb-4 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#737373] mb-1.5">
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
              <label className="block text-sm font-medium text-[#737373] mb-1.5">Password</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#F5F5F5] transition-colors"
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

          <div className="mt-5 text-center space-y-3">
            <p className="text-sm text-[#737373]">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate('register')}
                className="text-[#DC2626] hover:underline font-medium"
              >
                Register
              </button>
            </p>
            <button
              onClick={() => navigate('admin-login')}
              className="text-xs text-[#525252] hover:text-[#737373] transition-colors"
            >
              Admin Login
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('landing')}
          className="block mx-auto mt-6 text-sm text-[#737373] hover:text-[#F5F5F5] transition-colors"
        >
          &larr; Back to Home
        </button>
      </motion.div>
    </div>
  );
}
