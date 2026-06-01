'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useRouterStore, useToastStore } from '@/lib/stores';
import {
  Search,
  Eye,
  Ban,
  Unlock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type UserFilter = 'all' | 'active' | 'inactive' | 'blocked';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  main_balance: number;
  status: string;
  package_status: string;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<UserFilter>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { navigate } = useRouterStore();
  const { addToast } = useToastStore();

  const filters: { label: string; value: UserFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Blocked', value: 'blocked' },
  ];

  useEffect(() => {
    loadUsers();
  }, [filter, page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filter !== 'all') params.set('status', filter);
      params.set('page', page.toString());
      params.set('limit', '20');
      const res = await api.getAdminUsers(params.toString());
      setUsers(Array.isArray(res.users) ? res.users : []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      addToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        await api.unblockUser(userId);
        addToast('User unblocked', 'success');
      } else {
        await api.blockUser(userId);
        addToast('User blocked', 'success');
      }
      loadUsers();
    } catch (err: any) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Inactive</Badge>;
      case 'blocked':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Blocked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Users</h1>
        <p className="text-[#64748B] text-sm mt-1">Manage platform users</p>
      </div>

      {/* Search & Filters */}
      <div className="ev-card p-4">
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              className="ev-input w-full pl-10 pr-4 py-2.5"
              placeholder="Search by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="ev-btn-primary px-6">
            Search
          </button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30'
                  : 'bg-[#F0F7FF] text-[#64748B] border border-[#DBEAFE] hover:bg-[#EFF6FF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="ev-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
            <Users className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EFF6FF]">
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">Username</th>
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">Balance</th>
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#64748B] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#EFF6FF] hover:bg-[#F0F7FF] transition-colors">
                    <td className="py-3 px-4 text-[#1E293B]">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">{user.username}</td>
                    <td className="py-3 px-4 text-[#64748B]">{user.email}</td>
                    <td className="py-3 px-4 text-[#1E293B] font-medium">
                      Rs. {user.main_balance?.toLocaleString() ?? '0'}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate('admin-user-detail', { id: user.id })}
                          className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#2563EB] transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBlock(user.id, user.status === 'blocked')}
                          className={`p-1.5 rounded-lg hover:bg-[#EFF6FF] transition-colors ${
                            user.status === 'blocked'
                              ? 'text-green-600 hover:text-green-300'
                              : 'text-[#64748B] hover:text-[#2563EB]'
                          }`}
                          title={user.status === 'blocked' ? 'Unblock' : 'Block'}
                        >
                          {user.status === 'blocked' ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#EFF6FF]">
            <p className="text-sm text-[#64748B]">
              Page {page} of {totalPages}
            </p>
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
