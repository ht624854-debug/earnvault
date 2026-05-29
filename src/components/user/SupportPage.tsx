'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeadphonesIcon,
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  Upload,
  X,
  Send,
  Phone,
  ImageIcon,
  ArrowLeft,
} from 'lucide-react';
import { useAuthStore, useToastStore, useSettingsStore } from '@/lib/stores';
import { api } from '@/lib/api-client';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

export default function SupportPage() {
  const { addToast } = useToastStore();
  const { settings } = useSettingsStore();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ subject: '', message: '' });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getTickets();
        setTickets(Array.isArray(res.tickets) ? res.tickets : []);
      } catch {
        addToast('Failed to load tickets', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      addToast('Subject and message are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      let screenshotUrl = '';
      if (screenshot) {
        const uploadRes = await api.uploadFile(screenshot);
        screenshotUrl = uploadRes.url;
      }
      await api.createTicket({
        subject: form.subject,
        message: form.message,
        screenshot: screenshotUrl,
      });
      addToast('Ticket created!', 'success');
      setForm({ subject: '', message: '' });
      setScreenshot(null);
      setScreenshotPreview('');
      setShowCreateForm(false);

      const res = await api.getTickets();
      setTickets(Array.isArray(res.tickets) ? res.tickets : []);
    } catch (err: any) {
      addToast(err.message || 'Failed to create ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const openTicket = async (ticketId: string) => {
    try {
      const res = await api.getTicket(ticketId);
      setActiveTicket(res.ticket || res);
    } catch {
      addToast('Failed to load ticket', 'error');
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1 bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/30 rounded-full px-2 py-0.5 text-xs font-medium">
            <XCircle className="w-3 h-3" /> Closed
          </span>
        );
      case 'Answered':
        return (
          <span className="inline-flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 rounded-full px-2 py-0.5 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" /> Answered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 rounded-full px-2 py-0.5 text-xs font-medium">
            <Clock className="w-3 h-3" /> Open
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-[#1F1F1F] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeTicket && (
              <button onClick={() => setActiveTicket(null)} className="text-[#737373] hover:text-[#F5F5F5]">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-[#F5F5F5]">Support</h1>
              <p className="text-xs text-[#737373] mt-0.5">
                {activeTicket ? activeTicket.subject : 'Get help with your account'}
              </p>
            </div>
          </div>
          {!activeTicket && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="ev-btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Ticket
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* WhatsApp Support */}
        {settings.support_whatsapp && (
          <motion.div className="ev-card p-4 flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-10 h-10 bg-[#25D366]/10 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-[#25D366]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#F5F5F5] font-medium">WhatsApp Support</p>
              <p className="text-xs text-[#737373]">Get instant help via WhatsApp</p>
            </div>
            <a
              href={settings.support_whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="ev-btn-primary text-xs px-3 py-1.5"
            >
              Chat Now
            </a>
          </motion.div>
        )}

        {/* Ticket Detail View */}
        {activeTicket ? (
          <div className="space-y-3">
            <div className="ev-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#F5F5F5]">{activeTicket.subject}</h3>
                {statusBadge(activeTicket.status)}
              </div>
              <p className="text-sm text-[#737373]">{activeTicket.message}</p>
              <p className="text-xs text-[#525252] mt-2">
                {new Date(activeTicket.created_at).toLocaleString()}
              </p>
            </div>

            {/* Replies */}
            {(activeTicket.replies || []).map((reply) => (
              <div
                key={reply.id}
                className={`ev-card p-4 ${
                  reply.sender_type === 'admin' ? 'border-l-2 border-l-[#DC2626]' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-medium ${
                      reply.sender_type === 'admin' ? 'text-[#DC2626]' : 'text-[#737373]'
                    }`}
                  >
                    {reply.sender_type === 'admin' ? 'Admin' : 'You'}
                  </span>
                  <span className="text-xs text-[#525252]">
                    {new Date(reply.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-[#F5F5F5]">{reply.message}</p>
              </div>
            ))}

            {(!activeTicket.replies || activeTicket.replies.length === 0) && (
              <div className="ev-card p-6 text-center text-[#737373] text-sm">
                No replies yet. We&apos;ll get back to you soon.
              </div>
            )}
          </div>
        ) : (
          /* Ticket List */
          <div className="space-y-3">
            {tickets.length > 0 ? (
              tickets.map((ticket, i) => (
                <motion.button
                  key={ticket.id}
                  onClick={() => openTicket(ticket.id)}
                  className="ev-card p-4 w-full text-left hover:border-[#DC2626]/30 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#F5F5F5] truncate">{ticket.subject}</h3>
                    {statusBadge(ticket.status)}
                  </div>
                  <p className="text-xs text-[#737373] line-clamp-1">{ticket.message}</p>
                  <p className="text-[10px] text-[#525252] mt-2">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </motion.button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-[#737373]">
                <Inbox className="w-12 h-12 mb-3" />
                <p className="text-sm">No support tickets</p>
                <p className="text-xs mt-1">Create a ticket if you need help</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              className="w-full max-w-md bg-[#141414] border border-[#1F1F1F] rounded-t-2xl sm:rounded-2xl p-5"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#F5F5F5]">Create Ticket</h3>
                <button onClick={() => setShowCreateForm(false)} className="text-[#737373] hover:text-[#F5F5F5]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#737373] mb-1">Subject</label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    className="ev-input w-full px-4 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#737373] mb-1">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your issue in detail"
                    rows={4}
                    className="ev-input w-full px-4 py-2.5 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#737373] mb-1">Screenshot (Optional)</label>
                  {screenshotPreview && (
                    <div className="relative mb-2">
                      <img src={screenshotPreview} alt="Screenshot" className="w-full h-32 object-cover rounded-lg border border-[#1F1F1F]" />
                      <button
                        onClick={() => { setScreenshot(null); setScreenshotPreview(''); }}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="ev-btn-secondary flex items-center justify-center gap-2 w-full py-2.5 cursor-pointer text-sm">
                    <Upload className="w-4 h-4" /> Upload Screenshot
                    <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                  </label>
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
                      <Send className="w-4 h-4" /> Submit Ticket
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
