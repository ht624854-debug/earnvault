'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, CheckCircle2, Inbox, Share2, UserPlus } from 'lucide-react';
import { useAuthStore, useToastStore } from '@/lib/stores';
import { api } from '@/lib/api-client';

interface Referral {
  id: string;
  referred_user: {
    first_name: string;
    last_name: string;
    username: string;
    package_status: string;
    created_at: string;
  };
  status: string;
  reward_status: string;
  reward_amount: number;
  created_at: string;
}

export default function ReferPage() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [refRes, linkRes] = await Promise.all([api.getReferrals(), api.getReferralLink()]);
        setReferrals(refRes.referrals || refRes || []);
        setReferralLink(linkRes.link || linkRes || '');
      } catch {
        addToast('Failed to load referral data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      addToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy link', 'error');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join EarnVault',
          text: `Join me on EarnVault and start earning! Use my referral link:`,
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-[#F5F5F5]">Referral Network</h1>
          <p className="text-xs text-[#737373] mt-0.5">Invite friends and earn rewards</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-5">
        {/* Stats */}
        <motion.div className="grid grid-cols-2 gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="ev-card p-4 text-center">
            <Users className="w-7 h-7 text-[#DC2626] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#F5F5F5]">{referrals.length}</p>
            <p className="text-xs text-[#737373]">Total Referrals</p>
          </div>
          <div className="ev-card p-4 text-center">
            <UserPlus className="w-7 h-7 text-[#10B981] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#F5F5F5]">
              {referrals.filter((r) => r.referred_user?.package_status === 'Active').length}
            </p>
            <p className="text-xs text-[#737373]">Active Referrals</p>
          </div>
        </motion.div>

        {/* Referral Link */}
        <motion.div className="ev-card p-5 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="absolute inset-0 ev-gradient-red opacity-5" />
          <div className="relative z-10">
            <h2 className="text-base font-semibold text-[#F5F5F5] mb-3">Your Referral Link</h2>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2.5 text-sm text-[#737373] truncate">
                {referralLink}
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30'
                    : 'ev-btn-primary'
                }`}
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <button
              onClick={handleShare}
              className="ev-btn-secondary w-full flex items-center justify-center gap-2 mt-3 py-2.5 text-sm"
            >
              <Share2 className="w-4 h-4" /> Share Link
            </button>
          </div>
        </motion.div>

        {/* Referral Code */}
        {user?.referral_code && (
          <motion.div className="ev-card p-4 flex items-center justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div>
              <p className="text-xs text-[#737373]">Referral Code</p>
              <p className="text-lg font-bold text-[#DC2626]">{user.referral_code}</p>
            </div>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(user.referral_code);
                  addToast('Code copied!', 'success');
                } catch {
                  addToast('Failed to copy', 'error');
                }
              }}
              className="text-sm text-[#737373] hover:text-[#F5F5F5] flex items-center gap-1"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </motion.div>
        )}

        {/* Referral List */}
        <div>
          <h2 className="text-base font-semibold text-[#F5F5F5] mb-3">Your Referrals</h2>
          {referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map((ref, i) => (
                <motion.div
                  key={ref.id}
                  className="ev-card p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-sm font-bold text-[#DC2626]">
                      {ref.referred_user?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F5F5F5] truncate">
                        {ref.referred_user?.first_name} {ref.referred_user?.last_name}
                      </p>
                      <p className="text-xs text-[#737373]">@{ref.referred_user?.username}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                          ref.referred_user?.package_status === 'Active'
                            ? 'bg-[#10B981]/10 text-[#10B981]'
                            : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        }`}
                      >
                        {ref.referred_user?.package_status || 'Inactive'}
                      </span>
                      <p className="text-[10px] text-[#737373] mt-0.5">
                        Reward: {ref.reward_status === 'Paid' ? 'Paid' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="ev-card p-8 flex flex-col items-center text-[#737373]">
              <Inbox className="w-10 h-10 mb-2" />
              <p className="text-sm">No referrals yet</p>
              <p className="text-xs mt-1">Share your link to start building your network</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
