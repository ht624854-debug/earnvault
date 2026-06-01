'use client';

import { useState } from 'react';
import { useAuthStore, useRouterStore, useToastStore, useSettingsStore } from '@/lib/stores';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuthStore();
  const { navigate } = useRouterStore();
  const { addToast } = useToastStore();
  const { settings } = useSettingsStore();
  const brandName = settings.brand_name || 'EarnVault';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      await adminLogin(username, password);
      addToast('Login successful', 'success');
      navigate('admin-dashboard');
    } catch (err: any) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ev-bg px-4">
      <div className="w-full max-w-md">
        <div className="ev-card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full ev-gradient-red flex items-center justify-center mb-4 ev-glow-red">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-ev-text">Admin Panel</h1>
            <p className="text-ev-muted mt-1 text-sm">Sign in to manage {brandName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ev-muted mb-1.5">Username</label>
              <input
                type="text"
                className="ev-input w-full px-4 py-2.5"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ev-muted mb-1.5">Password</label>
              <input
                type="password"
                className="ev-input w-full px-4 py-2.5"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="ev-btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('landing')}
              className="text-ev-muted hover:text-ev-blue transition-colors text-sm inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to main site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
