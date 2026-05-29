'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useToastStore } from '@/lib/stores';
import {
  Loader2,
  Headphones,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type SupportFilter = 'all' | 'open' | 'answered' | 'closed';

interface TicketReply {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
}

interface SupportTicket {
  id: string;
  user: { first_name: string; last_name: string; username: string };
  subject: string;
  status: string;
  message: string;
  replies: TicketReply[];
  created_at: string;
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SupportFilter>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const { addToast } = useToastStore();

  const filters: { label: string; value: SupportFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Answered', value: 'answered' },
    { label: 'Closed', value: 'closed' },
  ];

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `status=${filter}` : '';
      const res = await api.getAdminSupportTickets(params);
      setTickets(res.tickets || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setReplyMessage('');
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) {
      addToast('Please enter a reply message', 'error');
      return;
    }
    setSendingReply(true);
    try {
      await api.replyAdminTicket(selectedTicket.id, replyMessage);
      addToast('Reply sent', 'success');
      setReplyMessage('');
      // Refresh the ticket
      const res = await api.getAdminSupportTickets('');
      const updated = (res.tickets || []).find((t: SupportTicket) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
      loadTickets();
    } catch (err: any) {
      addToast(err.message || 'Reply failed', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Open</Badge>;
      case 'answered':
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Answered</Badge>;
      case 'closed':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Ticket detail view
  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedTicket(null)}
            className="p-2 rounded-lg hover:bg-[#1F1F1F] text-[#A3A3A3] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#F5F5F5]">{selectedTicket.subject}</h1>
            <p className="text-[#737373] text-sm">
              By {selectedTicket.user?.first_name} {selectedTicket.user?.last_name} (@{selectedTicket.user?.username}) — {new Date(selectedTicket.created_at).toLocaleString()}
            </p>
          </div>
          <div className="ml-auto">{getStatusBadge(selectedTicket.status)}</div>
        </div>

        {/* Ticket message */}
        <div className="ev-card p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1F1F1F] flex items-center justify-center text-sm font-bold text-[#A3A3A3] shrink-0">
              {selectedTicket.user?.first_name?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#F5F5F5]">
                {selectedTicket.user?.first_name} {selectedTicket.user?.last_name}
              </p>
              <p className="text-sm text-[#A3A3A3] mt-1">{selectedTicket.message}</p>
            </div>
          </div>
        </div>

        {/* Replies */}
        {selectedTicket.replies?.length > 0 && (
          <div className="space-y-3">
            {selectedTicket.replies.map((reply) => (
              <div key={reply.id} className="ev-card p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      reply.sender_type === 'admin'
                        ? 'bg-[#DC2626]/20 text-[#DC2626]'
                        : 'bg-[#1F1F1F] text-[#A3A3A3]'
                    }`}
                  >
                    {reply.sender_type === 'admin' ? 'A' : (selectedTicket.user?.first_name?.[0] || 'U')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#F5F5F5]">
                        {reply.sender_type === 'admin' ? 'Admin' : `${selectedTicket.user?.first_name} ${selectedTicket.user?.last_name}`}
                      </p>
                      <span className="text-xs text-[#737373]">{new Date(reply.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-[#A3A3A3] mt-1">{reply.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply form */}
        <div className="ev-card p-4">
          <label className="block text-sm text-[#A3A3A3] mb-2">Reply</label>
          <textarea
            className="ev-input w-full px-4 py-2.5 min-h-[100px]"
            placeholder="Type your reply..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleReply}
              disabled={sendingReply || !replyMessage.trim()}
              className="ev-btn-primary flex items-center gap-2"
            >
              {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Reply
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ticket list view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Support Tickets</h1>
        <p className="text-[#737373] text-sm mt-1">Manage user support requests</p>
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
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#737373]">
            <Headphones className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No support tickets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F1F1F]">
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">User</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Subject</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-3 px-4 text-[#F5F5F5]">
                      {ticket.user?.first_name} {ticket.user?.last_name}
                      <span className="text-[#737373] text-xs block">@{ticket.user?.username}</span>
                    </td>
                    <td className="py-3 px-4 text-[#F5F5F5] max-w-[250px] truncate">{ticket.subject}</td>
                    <td className="py-3 px-4">{getStatusBadge(ticket.status)}</td>
                    <td className="py-3 px-4 text-[#737373] text-xs">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleOpenTicket(ticket)}
                        className="ev-btn-secondary text-xs px-3 py-1.5"
                      >
                        View
                      </button>
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
