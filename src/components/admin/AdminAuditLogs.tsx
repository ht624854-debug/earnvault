'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useToastStore } from '@/lib/stores';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ScrollText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AuditLog {
  id: string;
  admin: { first_name: string; last_name: string; username: string };
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAuditLogs(page);
      setLogs(Array.isArray(res.logs) ? res.logs : []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      addToast(err.message || 'Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action?.includes('approve')) return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (action?.includes('reject') || action?.includes('block') || action?.includes('delete'))
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    if (action?.includes('create') || action?.includes('add')) return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    if (action?.includes('update') || action?.includes('edit')) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    return 'bg-ev-bg text-ev-muted';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ev-text">Audit Logs</h1>
        <p className="text-ev-muted text-sm mt-1">Track admin actions and changes</p>
      </div>

      <div className="ev-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ev-blue" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ev-muted">
            <ScrollText className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ev-card-border">
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Admin</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Action</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Target Type</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Target ID</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Details</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-ev-card-border hover:bg-ev-bg transition-colors">
                    <td className="py-3 px-4 text-ev-text">
                      {log.admin?.first_name} {log.admin?.last_name}
                      <span className="text-ev-muted text-xs block">@{log.admin?.username}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-ev-muted capitalize">{log.target_type?.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-ev-muted font-mono text-xs">{log.target_id || '—'}</td>
                    <td className="py-3 px-4 text-ev-muted max-w-[250px] truncate">{log.details || '—'}</td>
                    <td className="py-3 px-4 text-ev-muted text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ev-card-border">
            <p className="text-sm text-ev-muted">Page {page} of {totalPages}</p>
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
