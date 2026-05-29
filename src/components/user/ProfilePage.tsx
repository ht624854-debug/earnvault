'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Copy,
  CheckCircle2,
  Camera,
  Lock,
  X,
  Upload,
  Users,
  Wallet,
  ImageIcon,
} from 'lucide-react';
import { useAuthStore, useToastStore } from '@/lib/stores';
import { api } from '@/lib/api-client';

export default function ProfilePage() {
  const { user, refreshUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        mobile: user.mobile || '',
      });
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.first_name.trim() || !editForm.last_name.trim()) {
      addToast('Name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      let avatarUrl = user?.avatar || '';
      if (avatarFile) {
        const uploadRes = await api.uploadFile(avatarFile);
        avatarUrl = uploadRes.url;
      }
      await api.updateProfile({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        mobile: editForm.mobile,
        avatar: avatarUrl,
      });
      await refreshUser();
      addToast('Profile updated successfully!', 'success');
      setShowEditModal(false);
      setAvatarFile(null);
      setAvatarPreview('');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      addToast('All fields are required', 'error');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.changePassword(passwordForm.current_password, passwordForm.new_password);
      addToast('Password changed successfully!', 'success');
      setShowPasswordModal(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      addToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCode = async () => {
    if (user?.referral_code) {
      try {
        await navigator.clipboard.writeText(user.referral_code);
        addToast('Referral code copied!', 'success');
      } catch {
        addToast('Failed to copy', 'error');
      }
    }
  };

  const initials = user
    ? `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-[#1F1F1F] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-[#F5F5F5]">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Profile Card */}
        <motion.div className="ev-card p-5 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="absolute inset-0 ev-gradient-red opacity-5" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#DC2626]"
                />
              ) : (
                <div className="w-16 h-16 ev-gradient-red rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#F5F5F5]">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-sm text-[#737373]">@{user?.username}</p>
              <span
                className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                  user?.package_status === 'Active'
                    ? 'bg-[#10B981]/10 text-[#10B981]'
                    : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                }`}
              >
                {user?.package_status || 'Inactive'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div className="ev-card divide-y divide-[#1F1F1F]" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-3 p-4">
            <Mail className="w-4 h-4 text-[#737373]" />
            <div className="flex-1">
              <p className="text-xs text-[#737373]">Email</p>
              <p className="text-sm text-[#F5F5F5]">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Phone className="w-4 h-4 text-[#737373]" />
            <div className="flex-1">
              <p className="text-xs text-[#737373]">Mobile</p>
              <p className="text-sm text-[#F5F5F5]">{user?.mobile}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Wallet className="w-4 h-4 text-[#737373]" />
            <div className="flex-1">
              <p className="text-xs text-[#737373]">Main Balance</p>
              <p className="text-sm text-[#F5F5F5] font-semibold">Rs. {(user?.main_balance || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Wallet className="w-4 h-4 text-[#737373]" />
            <div className="flex-1">
              <p className="text-xs text-[#737373]">Deposit Balance</p>
              <p className="text-sm text-[#F5F5F5] font-semibold">Rs. {(user?.deposit_balance || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Copy className="w-4 h-4 text-[#737373]" />
            <div className="flex-1">
              <p className="text-xs text-[#737373]">Referral Code</p>
              <p className="text-sm text-[#DC2626] font-semibold">{user?.referral_code}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-xs text-[#737373] hover:text-[#F5F5F5] flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Users className="w-4 h-4 text-[#737373]" />
            <div className="flex-1">
              <p className="text-xs text-[#737373]">Total Referrals</p>
              <p className="text-sm text-[#F5F5F5] font-semibold">--</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={() => setShowEditModal(true)}
            className="ev-btn-secondary py-3 flex items-center justify-center gap-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <User className="w-4 h-4" /> Edit Profile
          </motion.button>
          <motion.button
            onClick={() => setShowPasswordModal(true)}
            className="ev-btn-secondary py-3 flex items-center justify-center gap-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Lock className="w-4 h-4" /> Change Password
          </motion.button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="w-full max-w-md bg-[#141414] border border-[#1F1F1F] rounded-t-2xl sm:rounded-2xl p-5"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#F5F5F5]">Edit Profile</h3>
                <button onClick={() => setShowEditModal(false)} className="text-[#737373] hover:text-[#F5F5F5]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Avatar Upload */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {avatarPreview || user?.avatar ? (
                    <img
                      src={avatarPreview || user?.avatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#DC2626]"
                    />
                  ) : (
                    <div className="w-20 h-20 ev-gradient-red rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {initials}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 w-7 h-7 bg-[#1A1A1A] border border-[#262626] rounded-full flex items-center justify-center cursor-pointer hover:border-[#DC2626] transition-colors">
                    <Camera className="w-3.5 h-3.5 text-[#737373]" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#737373] mb-1">First Name</label>
                    <input
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="ev-input w-full px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#737373] mb-1">Last Name</label>
                    <input
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      className="ev-input w-full px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#737373] mb-1">Mobile</label>
                  <input
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="ev-input w-full px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="ev-btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              className="w-full max-w-md bg-[#141414] border border-[#1F1F1F] rounded-t-2xl sm:rounded-2xl p-5"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#F5F5F5]">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-[#737373] hover:text-[#F5F5F5]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#737373] mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="ev-input w-full px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#737373] mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="ev-input w-full px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#737373] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="ev-input w-full px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="ev-btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Change Password
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
