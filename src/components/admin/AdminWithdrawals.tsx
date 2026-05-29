'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useToastStore } from '@/lib/stores';
import {
  Check,
  X,
  Loader2,
  Wallet,
  DollarSign,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type WithdrawalFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'paid';

interface WithdrawRequest {
  id: string;
  user: { first_name: string; last_name: string; username: string };
  amount: number;
  method: string;
  account_title: string;
  account_number: string;
  status: string;
  created_at: string;
}

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<WithdrawalFilter>('all');
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { addToast } = useToastStore();

  const filters: { label: string; value: WithdrawalFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Paid', value: 'paid' },
  ];

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `status=${filter}` : '';
      const res = await api.getAdminWithdrawRequests(params);
      setRequests(Array.isArray(res.requests) ? res.requests : []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load withdrawals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.approveWithdraw(id);
      addToast('Withdrawal approved', 'success');
      loadRequests();
    } catch (err: any) {
      addToast(err.message || 'Approval failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog || !rejectReason) {
      addToast('Please provide a rejection reason', 'error');
      return;
    }
    setActionLoading(rejectDialog);
    try {
      await api.rejectWithdraw(rejectDialog, rejectReason);
      addToast('Withdrawal rejected', 'success');
      setRejectDialog(null);
      setRejectReason('');
      loadRequests();
    } catch (err: any) {
      addToast(err.message || 'Rejection failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async (id: string) => {
    setActionLoading(id);
    try {
      await api.markPaidWithdraw(id);
      addToast('Withdrawal marked as paid', 'success');
      loadRequests();
    } catch (err: any) {
      addToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Pending</Badge>;
      case 'paid':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Withdrawal Requests</h1>
        <p className="text-[#737373] text-sm mt-1">Review and process withdrawal requests</p>
      </div>

      {/* Filters */}
      <div className="ev-card p-4">
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30'
                  : 'bg-[#1A1A1A] text-[#A3A3A3] border border-[#262626] hover:bg-[#1F1F1F]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="ev-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#DC2626]" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#737373]">
            <Wallet className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No withdrawal requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F1F1F]">
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">User</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Method</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Account Title</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Account Number</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-3 px-4 text-[#F5F5F5]">
                      {req.user?.first_name} {req.user?.last_name}
                      <span className="text-[#737373] text-xs block">@{req.user?.username}</span>
                    </td>
                    <td className="py-3 px-4 text-[#F5F5F5] font-medium">Rs. {req.amount}</td>
                    <td className="py-3 px-4 text-[#A3A3A3]">{req.method}</td>
                    <td className="py-3 px-4 text-[#A3A3A3]">{req.account_title}</td>
                    <td className="py-3 px-4 text-[#A3A3A3] font-mono text-xs">{req.account_number}</td>
                    <td className="py-3 px-4">{getStatusBadge(req.status)}</td>
                    <td className="py-3 px-4 text-[#737373] text-xs">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={actionLoading === req.id}
                            className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            {actionLoading === req.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {(req.status === 'pending' || req.status === 'approved') && (
                          <button
                            onClick={() => setRejectDialog(req.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {req.status === 'approved' && (
                          <button
                            onClick={() => handleMarkPaid(req.id)}
                            disabled={actionLoading === req.id}
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                            title="Mark as Paid"
                          >
                            {actionLoading === req.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <DollarSign className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent className="bg-[#141414] border-[#1F1F1F]">
          <DialogHeader>
            <DialogTitle className="text-[#F5F5F5]">Reject Withdrawal</DialogTitle>
          </DialogHeader>
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-1">Rejection Reason</label>
            <textarea
              className="ev-input w-full px-4 py-2.5 min-h-[80px]"
              placeholder="Enter reason for rejection"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <button onClick={() => setRejectDialog(null)} className="ev-btn-secondary">
              Cancel
            </button>
            <button onClick={handleReject} className="ev-btn-primary flex items-center gap-2">
              Reject
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
