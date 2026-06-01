'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useToastStore } from '@/lib/stores';
import {
  Check,
  X,
  Loader2,
  FileCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type SubmissionFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface TaskSubmission {
  id: string;
  user: { first_name: string; last_name: string; username: string };
  task: { title: string; type: string };
  answer: string;
  proof_image: string;
  status: string;
  reward_amount: number;
  created_at: string;
}

export default function AdminTaskSubmissions() {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SubmissionFilter>('all');
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const { addToast } = useToastStore();

  const filters: { label: string; value: SubmissionFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `status=${filter}` : '';
      const res = await api.getAdminTaskSubmissions(params);
      setSubmissions(Array.isArray(res.submissions) ? res.submissions : []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.approveTaskSubmission(id);
      addToast('Submission approved', 'success');
      loadSubmissions();
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
      await api.rejectTaskSubmission(rejectDialog, rejectReason);
      addToast('Submission rejected', 'success');
      setRejectDialog(null);
      setRejectReason('');
      loadSubmissions();
    } catch (err: any) {
      addToast(err.message || 'Rejection failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ev-text">Task Submissions</h1>
        <p className="text-ev-muted text-sm mt-1">Review user task submissions</p>
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
                  ? 'bg-ev-blue/10 text-ev-blue border border-ev-blue/30'
                  : 'bg-ev-bg text-ev-muted border border-ev-card-border hover:bg-ev-bg'
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
            <Loader2 className="w-6 h-6 animate-spin text-ev-blue" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ev-muted">
            <FileCheck className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No task submissions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ev-card-border">
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">User</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Task</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Answer</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Proof</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Reward</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} className="border-b border-ev-card-border hover:bg-ev-bg transition-colors">
                    <td className="py-3 px-4 text-ev-text">
                      {sub.user?.first_name} {sub.user?.last_name}
                      <span className="text-ev-muted text-xs block">@{sub.user?.username}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-ev-text">{sub.task?.title}</p>
                      <p className="text-ev-muted text-xs capitalize">{sub.task?.type?.replace('_', ' ')}</p>
                    </td>
                    <td className="py-3 px-4 text-ev-muted max-w-[200px] truncate">{sub.answer || '—'}</td>
                    <td className="py-3 px-4">
                      {sub.proof_image ? (
                        <button
                          onClick={() => setProofImage(sub.proof_image)}
                          className="p-1.5 rounded-lg hover:bg-ev-bg text-ev-blue transition-colors"
                          title="View proof"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(sub.status)}</td>
                    <td className="py-3 px-4 text-ev-text font-medium">Rs. {sub.reward_amount}</td>
                    <td className="py-3 px-4">
                      {sub.status?.toLowerCase() === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(sub.id)}
                            disabled={actionLoading === sub.id}
                            className="p-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            {actionLoading === sub.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setRejectDialog(sub.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
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
        <DialogContent className="bg-ev-card border-ev-card-border">
          <DialogHeader>
            <DialogTitle className="text-ev-text">Reject Submission</DialogTitle>
          </DialogHeader>
          <div>
            <label className="block text-sm text-ev-muted mb-1">Rejection Reason</label>
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

      {/* Proof Image Dialog */}
      <Dialog open={!!proofImage} onOpenChange={() => setProofImage(null)}>
        <DialogContent className="bg-ev-card border-ev-card-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-ev-text">Submission Proof</DialogTitle>
          </DialogHeader>
          {proofImage && (
            <img
              src={proofImage}
              alt="Submission proof"
              className="w-full rounded-lg cursor-pointer"
              onClick={() => window.open(proofImage, '_blank')}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
