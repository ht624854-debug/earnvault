'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useToastStore } from '@/lib/stores';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Download,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type TransactionType = 'all' | 'activation' | 'withdrawal' | 'task_reward' | 'referral_reward' | 'balance_adjustment' | 'reward_claim';

interface Transaction {
  id: string;
  user: { first_name: string; last_name: string; username: string };
  type: string;
  amount: number;
  status: string;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
}

const transactionTypes: { label: string; value: TransactionType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Activation', value: 'activation' },
  { label: 'Withdrawal', value: 'withdrawal' },
  { label: 'Task Reward', value: 'task_reward' },
  { label: 'Referral Reward', value: 'referral_reward' },
  { label: 'Balance Adj.', value: 'balance_adjustment' },
  { label: 'Reward Claim', value: 'reward_claim' },
];

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadTransactions();
  }, [typeFilter, page]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      params.set('page', page.toString());
      params.set('limit', '20');
      const res = await api.getAdminTransactions(params.toString());
      setTransactions(Array.isArray(res.transactions) ? res.transactions : []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      addToast(err.message || 'Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      params.set('export', 'csv');
      const token = api.getToken();
      const res = await fetch(`/api/admin/transactions?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      addToast('CSV exported successfully', 'success');
    } catch (err: any) {
      addToast(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      activation: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      withdrawal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      task_reward: 'bg-green-500/10 text-green-600 border-green-500/20',
      referral_reward: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      balance_adjustment: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      reward_claim: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    };
    return (
      <Badge className={colors[type] || 'bg-[#EFF6FF] text-[#64748B]'}>
        {type?.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Transactions</h1>
          <p className="text-[#64748B] text-sm mt-1">View all platform transactions</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="ev-btn-secondary text-sm flex items-center gap-2"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="ev-card p-4">
        <div className="flex gap-2 flex-wrap">
          {transactionTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => { setTypeFilter(t.value); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === t.value
                  ? 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30'
                  : 'bg-[#F0F7FF] text-[#64748B] border border-[#DBEAFE] hover:bg-[#EFF6FF]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="ev-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
            <ArrowLeftRight className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EFF6FF]">
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">User</th>
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">Before</th>
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">After</th>
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">Description</th>
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-[#EFF6FF] hover:bg-[#F0F7FF] transition-colors">
                    <td className="py-3 px-4 text-[#1E293B]">
                      {tx.user?.first_name} {tx.user?.last_name}
                      <span className="text-[#64748B] text-xs block">@{tx.user?.username}</span>
                    </td>
                    <td className="py-3 px-4">{getTypeBadge(tx.type)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount > 0 ? '+' : ''}Rs. {tx.amount}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="capitalize">{tx.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-[#64748B] text-xs">Rs. {tx.balance_before}</td>
                    <td className="py-3 px-4 text-[#64748B] text-xs">Rs. {tx.balance_after}</td>
                    <td className="py-3 px-4 text-[#64748B] max-w-[200px] truncate">{tx.description}</td>
                    <td className="py-3 px-4 text-[#64748B] text-xs">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && transactions.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#EFF6FF]">
            <p className="text-sm text-[#64748B]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="ev-btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="ev-btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
