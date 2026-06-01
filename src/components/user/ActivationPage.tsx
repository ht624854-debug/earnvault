'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  ImageIcon,
  X,
  Shield,
  Target,
  Wallet,
  Users,
  Inbox,
  Tag,
  Sparkles,
} from 'lucide-react';
import { useAuthStore, useToastStore, useSettingsStore } from '@/lib/stores';
import { api } from '@/lib/api-client';

interface PaymentMethod {
  id: string;
  name: string;
  account_title: string;
  account_number: string;
  instructions: string;
}

interface ActivationRequest {
  id: string;
  amount: number;
  sender_name: string;
  sender_number: string;
  transaction_id: string;
  proof_image: string;
  status: string;
  admin_note: string;
  created_at: string;
  payment_method: { name: string };
}

// Safe array extraction helper
function safeArray<T>(data: any, key: string): T[] {
  if (!data) return [];
  const arr = data[key] || data;
  return Array.isArray(arr) ? arr : [];
}

export default function ActivationPage() {
  const { user, refreshUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { settings } = useSettingsStore();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [existingRequests, setExistingRequests] = useState<ActivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    payment_method_id: '',
    sender_name: '',
    sender_number: '',
    transaction_id: '',
    amount: '',
  });
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');

  const activationFee = settings.activation_fee || '1500';
  const offerEnabled = settings.offer_enabled === 'true';
  const offerDiscount = settings.offer_discount || '0';
  const offerTitle = settings.offer_title || '';
  const offerDescription = settings.offer_description || '';

  const finalFee = offerEnabled && offerDiscount ? Math.max(0, parseFloat(activationFee) - parseFloat(offerDiscount)).toString() : activationFee;
  const hasOffer = offerEnabled && offerDiscount && parseFloat(offerDiscount) > 0;

  useEffect(() => {
    const load = async () => {
      try {
        const [pmRes, reqRes] = await Promise.all([
          api.getPaymentMethods(),
          api.getMyActivationRequests(),
        ]);
        // Safely extract arrays from API responses
        setPaymentMethods(safeArray<PaymentMethod>(pmRes, 'payment_methods'));
        setExistingRequests(safeArray<ActivationRequest>(reqRes, 'requests'));
      } catch (err: any) {
        console.error('Load error:', err);
        addToast('Failed to load data', 'error');
        setPaymentMethods([]);
        setExistingRequests([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.payment_method_id || !form.sender_name.trim() || !form.sender_number.trim() || !form.transaction_id.trim() || !form.amount.trim()) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let proofUrl = '';
      if (proofImage) {
        const uploadRes = await api.uploadFile(proofImage);
        proofUrl = uploadRes.url;
      }

      await api.requestActivation({
        payment_method_id: form.payment_method_id,
        sender_name: form.sender_name,
        sender_number: form.sender_number,
        transaction_id: form.transaction_id,
        amount: parseFloat(form.amount),
        proof_image: proofUrl,
      });

      addToast('Activation request submitted!', 'success');
      setForm({ payment_method_id: '', sender_name: '', sender_number: '', transaction_id: '', amount: '' });
      setProofImage(null);
      setProofPreview('');

      const reqRes = await api.getMyActivationRequests();
      setExistingRequests(safeArray<ActivationRequest>(reqRes, 'requests'));
    } catch (err: any) {
      addToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-ev-blue/10 text-ev-blue border border-ev-blue/30 rounded-full px-2.5 py-0.5 text-xs font-medium">
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

  const benefits = [
    { icon: Target, text: 'Access to all earning tasks' },
    { icon: Wallet, text: 'Withdraw your earnings anytime' },
    { icon: Users, text: 'Earn referral rewards' },
    { icon: Shield, text: 'Full platform access & priority support' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-ev-bg flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-ev-blue/30 border-t-ev-blue rounded-full animate-spin" />
      </div>
    );
  }

  const isActive = user?.package_status === 'Active';

  return (
    <div className="min-h-screen bg-ev-bg pb-24">
      {/* Header */}
      <div className="bg-ev-bg border-b border-ev-card-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-ev-text">Account Activation</h1>
          <p className="text-xs text-ev-muted mt-0.5">Activate your account to unlock earning features</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-5">
        {/* Active Status */}
        {isActive && (
          <motion.div className="ev-card p-4 border-[#10B981]/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
              <p className="text-[#10B981] font-medium">Your account is already activated!</p>
            </div>
          </motion.div>
        )}

        {/* Offer Banner */}
        {hasOffer && (
          <motion.div className="relative overflow-hidden rounded-xl border border-[#F59E0B]/30 bg-gradient-to-r from-[#F59E0B]/10 via-[#F59E0B]/5 to-transparent" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-sm font-bold text-[#F59E0B]">{offerTitle || 'Special Offer!'}</span>
                </div>
                {offerDescription && (
                  <p className="text-xs text-ev-muted mb-2">{offerDescription}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ev-muted line-through">Rs. {activationFee}</span>
                  <span className="text-sm font-bold text-[#10B981]">Rs. {finalFee}</span>
                  <span className="bg-[#10B981]/10 text-[#10B981] text-xs font-medium px-2 py-0.5 rounded-full">
                    Save Rs. {offerDiscount}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Fee Card */}
        <motion.div className="ev-card p-5 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="absolute inset-0 ev-gradient-red opacity-5" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 ev-gradient-red rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-ev-muted">Activation Fee</p>
                {hasOffer ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-ev-muted line-through">Rs. {activationFee}</span>
                    <span className="text-2xl font-bold text-[#10B981]">Rs. {finalFee}</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-ev-text">Rs. {activationFee}</p>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <b.icon className="w-4 h-4 text-ev-blue" />
                  <span className="text-sm text-ev-muted">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Activation Form */}
        {!isActive && (
          <motion.div className="ev-card p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-base font-semibold text-ev-text mb-4">Submit Activation Request</h2>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-sm font-medium text-ev-muted mb-1.5">Payment Method</label>
                <select
                  value={form.payment_method_id}
                  onChange={(e) => setForm({ ...form, payment_method_id: e.target.value })}
                  className="ev-input w-full px-4 py-2.5 text-sm appearance-none"
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name} - {pm.account_title}
                    </option>
                  ))}
                </select>
              </div>

              {form.payment_method_id && (() => {
                const selectedPm = paymentMethods.find((pm) => pm.id === form.payment_method_id);
                if (selectedPm?.instructions) {
                  return (
                    <div className="bg-ev-bg border border-ev-card-border rounded-lg p-3 text-xs text-ev-muted">
                      {selectedPm.instructions}
                      {selectedPm.account_number && (
                        <p className="mt-1 text-ev-text">Account: {selectedPm.account_number}</p>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ev-muted mb-1.5">Sender Name</label>
                  <input
                    value={form.sender_name}
                    onChange={(e) => setForm({ ...form, sender_name: e.target.value })}
                    placeholder="Your name"
                    className="ev-input w-full px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ev-muted mb-1.5">Sender Number</label>
                  <input
                    value={form.sender_number}
                    onChange={(e) => setForm({ ...form, sender_number: e.target.value })}
                    placeholder="Your number"
                    className="ev-input w-full px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ev-muted mb-1.5">Transaction ID</label>
                  <input
                    value={form.transaction_id}
                    onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                    placeholder="TXN ID"
                    className="ev-input w-full px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ev-muted mb-1.5">Amount</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder={finalFee}
                    className="ev-input w-full px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ev-muted mb-1.5">Proof Image (Optional)</label>
                {proofPreview && (
                  <div className="relative mb-2">
                    <img src={proofPreview} alt="Proof" className="w-full h-32 object-cover rounded-lg border border-ev-card-border" />
                    <button
                      onClick={() => { setProofImage(null); setProofPreview(''); }}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="ev-btn-secondary flex items-center justify-center gap-2 w-full py-2.5 cursor-pointer text-sm">
                  <Upload className="w-4 h-4" /> Upload Proof
                  <input type="file" accept="image/*" onChange={handleProofChange} className="hidden" />
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
                    <Zap className="w-4 h-4" /> Submit Request
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* Existing Requests */}
        <div>
          <h2 className="text-base font-semibold text-ev-text mb-3">Your Requests</h2>
          {existingRequests.length > 0 ? (
            <div className="space-y-3">
              {existingRequests.map((req) => (
                <div key={req.id} className="ev-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-ev-text">
                      {req.payment_method?.name || 'Payment'}
                    </span>
                    {statusBadge(req.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-y-1 text-xs text-ev-muted">
                    <span>Amount:</span>
                    <span className="text-ev-text">Rs. {req.amount}</span>
                    <span>TXN ID:</span>
                    <span className="text-ev-text">{req.transaction_id}</span>
                    <span>Date:</span>
                    <span className="text-ev-text">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                  {req.admin_note && (
                    <p className="text-xs text-ev-blue mt-2 border-t border-ev-card-border pt-2">
                      Note: {req.admin_note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="ev-card p-8 flex flex-col items-center text-ev-muted">
              <Inbox className="w-10 h-10 mb-2" />
              <p className="text-sm">No activation requests yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
