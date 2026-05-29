'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useToastStore } from '@/lib/stores';
import {
  Search,
  Loader2,
  Link2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Referral {
  id: string;
  referrer: { first_name: string; last_name: string; username: string };
  referred_user: { first_name: string; last_name: string; username: string };
  status: string;
  reward_status: string;
  reward_amount: number;
  created_at: string;
}

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToastStore();

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    setLoading(true);
    try {
      const params = search ? `search=${encodeURIComponent(search)}` : '';
      const res = await api.getAdminReferrals(params);
      setReferrals(res.referrals || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load referrals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadReferrals();
  };

  const getRewardStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Pending</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Unpaid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Referrals</h1>
        <p className="text-[#737373] text-sm mt-1">View and manage referral records</p>
      </div>

      {/* Search */}
      <div className="ev-card p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
            <input
              type="text"
              className="ev-input w-full pl-10 pr-4 py-2.5"
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="ev-btn-primary px-6">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="ev-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#DC2626]" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#737373]">
            <Link2 className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No referrals found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F1F1F]">
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Referrer</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Referred User</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Reward Status</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Reward Amount</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-3 px-4 text-[#F5F5F5]">
                      {ref.referrer?.first_name} {ref.referrer?.last_name}
                      <span className="text-[#737373] text-xs block">@{ref.referrer?.username}</span>
                    </td>
                    <td className="py-3 px-4 text-[#F5F5F5]">
                      {ref.referred_user?.first_name} {ref.referred_user?.last_name}
                      <span className="text-[#737373] text-xs block">@{ref.referred_user?.username}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          ref.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }
                      >
                        {ref.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{getRewardStatusBadge(ref.reward_status)}</td>
                    <td className="py-3 px-4 text-[#F5F5F5] font-medium">Rs. {ref.reward_amount}</td>
                    <td className="py-3 px-4 text-[#737373] text-xs">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
