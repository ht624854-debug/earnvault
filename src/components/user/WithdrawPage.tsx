'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Inbox,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore, useRouterStore, useToastStore, useSettingsStore } from '@/lib/stores';
import { api } from '@/lib/api-client';

interface WithdrawRequest {
  id: string;
  amount: number;
  method: string;
  account_title: string;
  account_number: string;
  status: string;
  admin_note: string;
  created_at: string;
}

export default function WithdrawPage() {
  const { user } = useAuthStore();
  const { navigate } = useRouterStore();
  const { addToast } = useToastStore();
  const { settings } = useSettingsStore();

  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    amount: '',
    method: '',
    account_title: '',
    account_number: '',
  });

  const minWithdraw = parseFloat(settings.min_withdrawal || settings.minimum_withdrawal || '200');
  const isActive = user?.package_status === 'Active';
  const balance = user?.main_balance || 0;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getMyWithdrawRequests();
        setRequests(Array.isArray(res.requests) ? res.requests : []);
      } catch {
        addToast('Failed to load withdraw requests', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount < minWithdraw) {
      addToast(`Minimum withdrawal is Rs. ${minWithdraw}`, 'error');
      return;
    }
    if (amount > balance) {
      addToast('Insufficient balance', 'error');
      return;
    }
    if (!form.method.trim() || !form.account_title.trim() || !form.account_number.trim()) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.requestWithdraw({
        amount,
        method: form.method,
        account_title: form.account_title,
        account_number: form.account_number,
      });
      addToast('Withdrawal request submitted!', 'success');
      setForm({ amount: '', method: '', account_title: '', account_number: '' });

      const res = await api.getMyWithdrawRequests();
      setRequests(Array.isArray(res.requests) ? res.requests : []);
    } catch (err: any) {
      addToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#DC2626]/30 border-t-[#DC2626] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pb-24">
        <div className="bg-[#0A0A0A] border-b border-[#1F1F1F] sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-lg font-bold text-[#F5F5F5]">Withdraw</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-14 h-14 text-[#F59E0B] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#F5F5F5] mb-2">Account Not Active</h2>
          <p className="text-sm text-[#737373] mb-6">Activate your account to withdraw earnings</p>
          <button onClick={() => navigate('activation')} className="ev-btn-primary px-6 py-2.5 text-sm">
            Activate Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-[#1F1F1F] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-[#F5F5F5]">Withdraw</h1>
          <p className="text-xs text-[#737373] mt-0.5">Withdraw your earnings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-5">
        {/* Balance Card */}
        <motion.div className="ev-card p-5 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="absolute inset-0 ev-gradient-red opacity-5" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 ev-gradient-red rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#737373]">Available Balance</p>
              <p className="text-2xl font-bold text-[#F5F5F5]">Rs. {balance.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Withdraw Form */}
        <motion.div className="ev-card p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-base font-semibold text-[#F5F5F5] mb-4">Request Withdrawal</h2>
          <p className="text-xs text-[#737373] mb-4">
            Minimum withdrawal: <span className="text-[#DC2626] font-semibold">Rs. {minWithdraw}</span>
          </p>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-medium text-[#737373] mb-1.5">Amount (Rs.)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder={`Min ${minWithdraw}`}
                min={minWithdraw}
                max={balance}
                className="ev-input w-full px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#737373] mb-1.5">Payment Method</label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="ev-input w-full px-4 py-2.5 text-sm appearance-none"
              >
                <option value="">Select method</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Raast">Raast</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#737373] mb-1.5">Account Holder Name</label>
              <input
                value={form.account_title}
                onChange={(e) => setForm({ ...form, account_title: e.target.value })}
                placeholder="Enter account holder name"
                className="ev-input w-full px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#737373] mb-1.5">Account Number</label>
              <input
                value={form.account_number}
                onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                placeholder="Enter account number"
                className="ev-input w-full px-4 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="ev-btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" /> Request Withdrawal
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Existing Requests */}
        <div>
          <h2 className="text-base font-semibold text-[#F5F5F5] mb-3">Withdrawal History</h2>
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="ev-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#F5F5F5]">Rs. {req.amount.toLocaleString()}</span>
                    {statusBadge(req.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-y-1 text-xs text-[#737373]">
                    <span>Method:</span>
                    <span className="text-[#F5F5F5]">{req.method}</span>
                    <span>Account:</span>
                    <span className="text-[#F5F5F5]">{req.account_title}</span>
                    <span>Date:</span>
                    <span className="text-[#F5F5F5]">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                  {req.admin_note && (
                    <p className="text-xs text-[#DC2626] mt-2 border-t border-[#1F1F1F] pt-2">
                      Note: {req.admin_note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="ev-card p-8 flex flex-col items-center text-[#737373]">
              <Inbox className="w-10 h-10 mb-2" />
              <p className="text-sm">No withdrawal requests yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
