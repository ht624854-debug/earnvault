'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuthStore, useToastStore, useRouterStore } from '@/lib/stores';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Key,
} from 'lucide-react';

export default function AdminSecurity() {
  const { user, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const { navigate } = useRouterStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentPassword) {
      addToast('Current password is required to make any changes', 'error');
      return;
    }

    if (newUsername && !/^[a-zA-Z0-9_]{3,20}$/.test(newUsername.trim())) {
      addToast('Username must be 3-20 characters (letters, numbers, underscores)', 'error');
      return;
    }

    if (newPassword && newPassword.length < 8) {
      addToast('New password must be at least 8 characters', 'error');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    if (!newUsername && !newPassword) {
      addToast('No changes to save', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await api.changeAdminCredentials({
        current_password: currentPassword,
        new_username: newUsername || undefined,
        new_password: newPassword || undefined,
      });

      addToast(res.message || 'Credentials updated successfully!', 'success');

      // If password was changed, require re-login for security
      if (res.requireRelogin) {
        addToast('Please login again with your new password', 'info');
        setTimeout(() => {
          logout();
          navigate('admin-login');
        }, 2000);
      }

      // Reset form
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addToast(err.message || 'Failed to update credentials', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Security</h1>
          <p className="text-[#64748B] text-sm mt-1">Manage admin credentials and security settings</p>
        </div>
      </div>

      {/* Current Admin Info */}
      <div className="ev-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 ev-gradient-red rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-[#1E293B]">{user?.first_name || 'Admin'}</p>
            <p className="text-sm text-[#64748B]">Current Username: <span className="text-[#2563EB] font-semibold">@{user?.username}</span></p>
            <p className="text-xs text-[#94A3B8]">Role: Administrator</p>
          </div>
        </div>
      </div>

      {/* Security Warning */}
      <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[#F59E0B]">Security Notice</p>
          <p className="text-xs text-[#64748B] mt-1">
            Changing your password will require you to login again. Make sure to remember your new credentials.
            Use a strong password with at least 8 characters including numbers and special characters.
          </p>
        </div>
      </div>

      {/* Change Username */}
      <div className="ev-card p-6">
        <h2 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#2563EB]" />
          Change Username
        </h2>
        <div>
          <label className="block text-sm text-[#64748B] mb-1.5">New Username</label>
          <input
            type="text"
            className="ev-input w-full px-4 py-2.5"
            placeholder={`Current: ${user?.username || 'admin'}`}
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20))}
          />
          <p className="text-xs text-[#94A3B8] mt-1.5">3-20 characters, letters, numbers, and underscores only</p>
        </div>
      </div>

      {/* Change Password */}
      <div className="ev-card p-6">
        <h2 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-[#2563EB]" />
          Change Password
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#64748B] mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="ev-input w-full px-4 py-2.5 pr-10"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#64748B] mb-1.5">Confirm New Password</label>
            <input
              type="password"
              className="ev-input w-full px-4 py-2.5"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-[#2563EB] mt-1">Passwords do not match</p>
            )}
            {newPassword && confirmPassword && newPassword === confirmPassword && (
              <p className="text-xs text-[#10B981] mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Current Password Confirmation */}
      <div className="ev-card p-6">
        <h2 className="text-lg font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#2563EB]" />
          Confirm Identity
        </h2>
        <div>
          <label className="block text-sm text-[#64748B] mb-1.5">Current Password (Required)</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              className="ev-input w-full px-4 py-2.5 pr-10"
              placeholder="Enter your current password to confirm changes"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1.5">You must enter your current password to save any changes</p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || !currentPassword || (!newUsername && !newPassword)}
        className="ev-btn-primary flex items-center justify-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving Changes...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4" />
            Save Security Changes
          </>
        )}
      </button>
    </div>
  );
}
