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
  Users,
  Wallet,
  Calendar,
  Shield,
  Gift,
  TrendingUp,
  CheckCircle,
  XCircle,
  Hash,
  CreditCard,
  Activity,
  Share2,
} from 'lucide-react';
import { useAuthStore, useToastStore, useSettingsStore } from '@/lib/stores';
import { api } from '@/lib/api-client';

export default function ProfilePage() {
  const { user, refreshUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { settings } = useSettingsStore();
  const brandName = settings.brand_name || 'EarnVault';

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [activeReferralCount, setActiveReferralCount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [refRes, dashRes] = await Promise.all([
          api.getReferrals().catch(() => ({ referrals: [] })),
          api.getDashboard().catch(() => ({} as any)),
        ]);
        const refs = Array.isArray(refRes.referrals) ? refRes.referrals : [];
        setReferralCount(refs.length);
        setActiveReferralCount(refs.filter((r: any) => r.referred_user?.package_status?.toLowerCase() === 'active').length);
        setTotalEarned(dashRes.total_earned || 0);
      } catch {
        // ignore
      }
    };
    loadData();
  }, []);

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

  const handleShareLink = async () => {
    const link = `${window.location.origin}/register?ref=${user?.referral_code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${brandName}`,
          text: `Join me on ${brandName} and start earning! Use my referral link:`,
          url: link,
        });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(link);
        addToast('Referral link copied!', 'success');
      } catch {
        addToast('Failed to copy', 'error');
      }
    }
  };

  const initials = user
    ? `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase()
    : 'U';

  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }) : '--';

  return (
    <div className="min-h-screen bg-ev-bg pb-24">
      {/* Header */}
      <div className="bg-ev-bg border-b border-ev-card-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-ev-text">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Profile Card with Balance - Enhanced */}
        <motion.div className="ev-card p-5 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="absolute inset-0 ev-gradient-red opacity-5" />
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-18 h-18 rounded-full object-cover border-3 border-ev-blue"
                    style={{ width: '72px', height: '72px' }}
                  />
                ) : (
                  <div className="w-[72px] h-[72px] ev-gradient-red rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                  user?.package_status === 'Active' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                }`}>
                  {user?.package_status === 'Active' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-ev-text">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-sm text-ev-muted">@{user?.username}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      user?.package_status === 'Active'
                        ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                        : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                    }`}
                  >
                    {user?.package_status === 'Active' ? '✓ Active Account' : '⏳ Not Activated'}
                  </span>
                </div>
              </div>
            </div>

            {/* Balance Cards - Enhanced */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-ev-blue/5 border border-ev-blue/10 rounded-xl p-3 text-center">
                <Wallet className="w-5 h-5 text-ev-blue mx-auto mb-1" />
                <p className="text-[10px] text-ev-muted">Main Balance</p>
                <p className="text-lg font-bold text-ev-blue">Rs {(user?.main_balance || 0).toLocaleString()}</p>
              </div>
              <div className="bg-[#10B981]/5 border border-[#10B981]/10 rounded-xl p-3 text-center">
                <TrendingUp className="w-5 h-5 text-[#10B981] mx-auto mb-1" />
                <p className="text-[10px] text-ev-muted">Deposit Balance</p>
                <p className="text-lg font-bold text-[#10B981]">Rs {(user?.deposit_balance || 0).toLocaleString()}</p>
              </div>
              <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/10 rounded-xl p-3 text-center">
                <Activity className="w-5 h-5 text-[#F59E0B] mx-auto mb-1" />
                <p className="text-[10px] text-ev-muted">Total Earned</p>
                <p className="text-lg font-bold text-[#F59E0B]">Rs {totalEarned.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats - Enhanced */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div className="ev-card p-3 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Users className="w-5 h-5 text-ev-blue mx-auto mb-1" />
            <p className="text-base font-bold text-ev-text">{referralCount}</p>
            <p className="text-[10px] text-ev-muted">Total Referrals</p>
          </motion.div>
          <motion.div className="ev-card p-3 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <CheckCircle2 className="w-5 h-5 text-[#10B981] mx-auto mb-1" />
            <p className="text-base font-bold text-ev-text">{activeReferralCount}</p>
            <p className="text-[10px] text-ev-muted">Active Referrals</p>
          </motion.div>
          <motion.div className="ev-card p-3 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Gift className="w-5 h-5 text-[#F59E0B] mx-auto mb-1" />
            <p className="text-base font-bold text-ev-blue">{user?.referral_code || '--'}</p>
            <p className="text-[10px] text-ev-muted">Referral Code</p>
          </motion.div>
        </div>

        {/* Referral Link Card */}
        <motion.div className="ev-card p-5 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="absolute inset-0 ev-gradient-red opacity-5" />
          <div className="relative z-10">
            <h3 className="text-sm font-semibold text-ev-text mb-3">Your Referral Link</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-ev-bg border border-ev-card-border rounded-lg px-3 py-2.5 text-sm text-ev-muted truncate">
                {window.location.origin}/register?ref={user?.referral_code || '...'}
              </div>
              <button
                onClick={async () => {
                  const link = `${window.location.origin}/register?ref=${user?.referral_code}`;
                  try {
                    await navigator.clipboard.writeText(link);
                    addToast('Link copied!', 'success');
                  } catch {
                    addToast('Failed to copy', 'error');
                  }
                }}
                className="ev-btn-primary flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </button>
            </div>
            <button
              onClick={handleShareLink}
              className="ev-btn-secondary w-full flex items-center justify-center gap-2 mt-3 py-2.5 text-sm"
            >
              <Share2 className="w-4 h-4" /> Share Link
            </button>
          </div>
        </motion.div>

        {/* Details Card - Enhanced */}
        <motion.div className="ev-card divide-y divide-ev-card-border" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-3 p-4">
            <div className="w-8 h-8 bg-ev-blue/10 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-ev-blue" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-ev-muted">Email</p>
              <p className="text-sm text-ev-text font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-8 h-8 bg-ev-blue/10 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-ev-blue" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-ev-muted">Mobile</p>
              <p className="text-sm text-ev-text font-medium">{user?.mobile || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-8 h-8 bg-ev-blue/10 rounded-lg flex items-center justify-center">
              <Hash className="w-4 h-4 text-ev-blue" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-ev-muted">Username</p>
              <p className="text-sm text-ev-text font-medium">@{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-8 h-8 bg-ev-blue/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-ev-blue" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-ev-muted">Referral Code</p>
              <p className="text-sm text-ev-blue font-bold">{user?.referral_code}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-xs text-ev-muted hover:text-ev-blue flex items-center gap-1 transition-colors"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-8 h-8 bg-ev-blue/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-ev-blue" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-ev-muted">Joined</p>
              <p className="text-sm text-ev-text font-medium">{joinDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-8 h-8 bg-ev-blue/10 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-ev-blue" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-ev-muted">Account Status</p>
              <p className={`text-sm font-medium ${user?.status === 'active' ? 'text-[#10B981]' : 'text-red-500'}`}>
                {user?.status === 'active' ? '✓ Active' : '✗ Blocked'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={() => setShowEditModal(true)}
            className="ev-btn-primary py-3 flex items-center justify-center gap-2 text-sm"
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
              className="w-full max-w-md bg-ev-card border border-ev-card-border rounded-t-2xl sm:rounded-2xl p-5"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-ev-text">Edit Profile</h3>
                <button onClick={() => setShowEditModal(false)} className="text-ev-muted hover:text-ev-text">
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
                      className="w-20 h-20 rounded-full object-cover border-2 border-ev-blue"
                    />
                  ) : (
                    <div className="w-20 h-20 ev-gradient-red rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {initials}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 w-7 h-7 bg-ev-bg border border-ev-card-border rounded-full flex items-center justify-center cursor-pointer hover:border-ev-blue transition-colors">
                    <Camera className="w-3.5 h-3.5 text-ev-muted" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-ev-muted mb-1">First Name</label>
                    <input
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="ev-input w-full px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ev-muted mb-1">Last Name</label>
                    <input
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      className="ev-input w-full px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ev-muted mb-1">Mobile</label>
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
              className="w-full max-w-md bg-ev-card border border-ev-card-border rounded-t-2xl sm:rounded-2xl p-5"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-ev-text">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-ev-muted hover:text-ev-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-ev-muted mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="ev-input w-full px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ev-muted mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="ev-input w-full px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ev-muted mb-1">Confirm New Password</label>
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
