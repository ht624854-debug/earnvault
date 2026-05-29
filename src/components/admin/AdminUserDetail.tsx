'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useRouterStore, useToastStore } from '@/lib/stores';
import {
  ArrowLeft,
  User,
  Wallet,
  Ban,
  Unlock,
  Loader2,
  Save,
  DollarSign,
  ListChecks,
  Link2,
  FileCheck,
  CreditCard,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  mobile: string;
  main_balance: number;
  deposit_balance: number;
  package_status: string;
  status: string;
  referral_code: string;
  created_at: string;
}

export default function AdminUserDetail() {
  const { params, navigate } = useRouterStore();
  const { addToast } = useToastStore();
  const userId = params.id;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    mobile: '',
    package_status: '',
    status: '',
  });

  // Balance adjust
  const [balanceDialog, setBalanceDialog] = useState(false);
  const [balanceForm, setBalanceForm] = useState({
    amount: '',
    type: 'add',
    reason: '',
  });

  // Related data
  const [transactions, setTransactions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    if (userId) loadUser();
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUser(userId);
      const u = res.user;
      setUser(u);
      setEditForm({
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        email: u.email || '',
        username: u.username || '',
        mobile: u.mobile || '',
        package_status: u.package_status || '',
        status: u.status || '',
      });
      setTransactions(res.transactions || []);
      setReferrals(res.referrals || []);
      setTaskSubmissions(res.taskSubmissions || []);
      setWithdrawals(res.withdrawals || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    setSaving(true);
    try {
      await api.updateAdminUser(userId, editForm);
      addToast('User updated successfully', 'success');
      loadUser();
    } catch (err: any) {
      addToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBalanceAdjust = async () => {
    if (!balanceForm.amount || !balanceForm.reason) {
      addToast('Please fill all fields', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.adjustBalance(userId, {
        amount: parseFloat(balanceForm.amount),
        type: balanceForm.type,
        reason: balanceForm.reason,
      });
      addToast('Balance adjusted', 'success');
      setBalanceDialog(false);
      setBalanceForm({ amount: '', type: 'add', reason: '' });
      loadUser();
    } catch (err: any) {
      addToast(err.message || 'Adjustment failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockUnblock = async () => {
    try {
      if (user?.status === 'blocked') {
        await api.unblockUser(userId);
        addToast('User unblocked', 'success');
      } else {
        await api.blockUser(userId);
        addToast('User blocked', 'success');
      }
      loadUser();
    } catch (err: any) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#DC2626]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#737373]">
        <User className="w-12 h-12 mb-3 opacity-50" />
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('admin-users')}
          className="p-2 rounded-lg hover:bg-[#1F1F1F] text-[#A3A3A3] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-[#737373] text-sm">@{user.username}</p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="ev-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#F5F5F5] flex items-center gap-2">
            <User className="w-5 h-5 text-[#DC2626]" />
            User Information
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setBalanceDialog(true)}
              className="ev-btn-secondary text-sm flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Adjust Balance
            </button>
            <button
              onClick={handleBlockUnblock}
              className={`text-sm flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                user.status === 'blocked'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
              }`}
            >
              {user.status === 'blocked' ? (
                <><Unlock className="w-4 h-4" /> Unblock</>
              ) : (
                <><Ban className="w-4 h-4" /> Block</>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-[#1A1A1A] rounded-lg p-3">
            <p className="text-xs text-[#737373]">Main Balance</p>
            <p className="text-lg font-bold text-[#F5F5F5]">Rs. {user.main_balance?.toLocaleString()}</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-lg p-3">
            <p className="text-xs text-[#737373]">Deposit Balance</p>
            <p className="text-lg font-bold text-[#F5F5F5]">Rs. {user.deposit_balance?.toLocaleString()}</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-lg p-3">
            <p className="text-xs text-[#737373]">Status</p>
            <Badge
              className={
                user.status === 'active'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : user.status === 'blocked'
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }
            >
              {user.status}
            </Badge>
          </div>
          <div className="bg-[#1A1A1A] rounded-lg p-3">
            <p className="text-xs text-[#737373]">Package</p>
            <Badge variant="secondary">{user.package_status || 'None'}</Badge>
          </div>
        </div>

        <p className="text-xs text-[#737373]">
          Referral Code: <span className="text-[#DC2626] font-mono">{user.referral_code}</span> | Joined:{' '}
          {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Edit User Form */}
      <div className="ev-card p-6">
        <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4 flex items-center gap-2">
          <Save className="w-5 h-5 text-[#DC2626]" />
          Edit User
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-1">First Name</label>
            <input
              className="ev-input w-full px-4 py-2.5"
              value={editForm.first_name}
              onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-1">Last Name</label>
            <input
              className="ev-input w-full px-4 py-2.5"
              value={editForm.last_name}
              onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-1">Email</label>
            <input
              className="ev-input w-full px-4 py-2.5"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-1">Username</label>
            <input
              className="ev-input w-full px-4 py-2.5"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-1">Mobile</label>
            <input
              className="ev-input w-full px-4 py-2.5"
              value={editForm.mobile}
              onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-1">Package Status</label>
            <select
              className="ev-input w-full px-4 py-2.5"
              value={editForm.package_status}
              onChange={(e) => setEditForm({ ...editForm, package_status: e.target.value })}
            >
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-1">Status</label>
            <select
              className="ev-input w-full px-4 py-2.5"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleUpdateUser}
          disabled={saving}
          className="ev-btn-primary mt-4 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Related Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions */}
        <div className="ev-card p-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#DC2626]" />
            Transactions
          </h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-[#737373] text-center py-6">No transactions found</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {transactions.slice(0, 10).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg">
                  <div>
                    <p className="text-sm text-[#F5F5F5]">{tx.type}</p>
                    <p className="text-xs text-[#737373]">{tx.description}</p>
                  </div>
                  <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}Rs. {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referrals */}
        <div className="ev-card p-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#DC2626]" />
            Referrals
          </h2>
          {referrals.length === 0 ? (
            <p className="text-sm text-[#737373] text-center py-6">No referrals found</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {referrals.slice(0, 10).map((ref: any) => (
                <div key={ref.id} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg">
                  <div>
                    <p className="text-sm text-[#F5F5F5]">{ref.referred_user?.username || 'Unknown'}</p>
                    <p className="text-xs text-[#737373]">{new Date(ref.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge
                    className={
                      ref.reward_status === 'paid'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }
                  >
                    {ref.reward_status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Submissions */}
        <div className="ev-card p-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#DC2626]" />
            Task Submissions
          </h2>
          {taskSubmissions.length === 0 ? (
            <p className="text-sm text-[#737373] text-center py-6">No submissions found</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {taskSubmissions.slice(0, 10).map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg">
                  <div>
                    <p className="text-sm text-[#F5F5F5]">{sub.task?.title || 'Task'}</p>
                    <p className="text-xs text-[#737373]">Rs. {sub.reward_amount}</p>
                  </div>
                  <Badge
                    className={
                      sub.status === 'approved'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : sub.status === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }
                  >
                    {sub.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawals */}
        <div className="ev-card p-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#DC2626]" />
            Withdrawals
          </h2>
          {withdrawals.length === 0 ? (
            <p className="text-sm text-[#737373] text-center py-6">No withdrawals found</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {withdrawals.slice(0, 10).map((w: any) => (
                <div key={w.id} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg">
                  <div>
                    <p className="text-sm text-[#F5F5F5]">Rs. {w.amount}</p>
                    <p className="text-xs text-[#737373]">{new Date(w.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge
                    className={
                      w.status === 'paid' || w.status === 'approved'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : w.status === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }
                  >
                    {w.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Balance Adjust Dialog */}
      <Dialog open={balanceDialog} onOpenChange={setBalanceDialog}>
        <DialogContent className="bg-[#141414] border-[#1F1F1F]">
          <DialogHeader>
            <DialogTitle className="text-[#F5F5F5]">Adjust Balance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#A3A3A3] mb-1">Amount</label>
              <input
                type="number"
                className="ev-input w-full px-4 py-2.5"
                placeholder="Enter amount"
                value={balanceForm.amount}
                onChange={(e) => setBalanceForm({ ...balanceForm, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-[#A3A3A3] mb-1">Type</label>
              <select
                className="ev-input w-full px-4 py-2.5"
                value={balanceForm.type}
                onChange={(e) => setBalanceForm({ ...balanceForm, type: e.target.value })}
              >
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#A3A3A3] mb-1">Reason</label>
              <textarea
                className="ev-input w-full px-4 py-2.5 min-h-[80px]"
                placeholder="Enter reason for adjustment"
                value={balanceForm.reason}
                onChange={(e) => setBalanceForm({ ...balanceForm, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setBalanceDialog(false)} className="ev-btn-secondary">
              Cancel
            </button>
            <button onClick={handleBalanceAdjust} disabled={saving} className="ev-btn-primary flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
