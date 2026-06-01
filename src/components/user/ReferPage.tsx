'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, CheckCircle2, Inbox, Share2, UserPlus, Award, TrendingUp } from 'lucide-react';
import { useAuthStore, useToastStore, useSettingsStore } from '@/lib/stores';
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

interface RewardTier {
  level: number;
  reward_amount: number;
}

export default function ReferPage() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const { settings } = useSettingsStore();
  const brandName = settings.brand_name || 'EarnVault';

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [refRes, linkRes, tiersRes] = await Promise.all([
          api.getReferrals(),
          api.getReferralLink(),
          api.getReferralRewardTiers(),
        ]);
        setReferrals(Array.isArray(refRes.referrals) ? refRes.referrals : []);
        setReferralLink(linkRes.referral_link || '');
        setRewardTiers(Array.isArray(tiersRes.tiers) ? tiersRes.tiers : []);
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
          title: `Join ${brandName}`,
          text: `Join me on ${brandName} and start earning! Use my referral link:`,
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const getLevelLabel = (level: number) => {
    const suffixes: Record<number, string> = {
      1: 'st', 2: 'nd', 3: 'rd',
    };
    const suffix = suffixes[level] || 'th';
    return `${level}${suffix}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ev-bg flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-ev-blue/30 border-t-ev-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ev-bg pb-24">
      {/* Header */}
      <div className="bg-ev-bg border-b border-ev-card-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-ev-text">Referral Network</h1>
          <p className="text-xs text-ev-muted mt-0.5">Invite friends and earn rewards</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-5">
        {/* Stats */}
        <motion.div className="grid grid-cols-2 gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="ev-card p-4 text-center">
            <Users className="w-7 h-7 text-ev-blue mx-auto mb-2" />
            <p className="text-2xl font-bold text-ev-text">{referrals.length}</p>
            <p className="text-xs text-ev-muted">Total Referrals</p>
          </div>
          <div className="ev-card p-4 text-center">
            <UserPlus className="w-7 h-7 text-[#10B981] mx-auto mb-2" />
            <p className="text-2xl font-bold text-ev-text">
              {referrals.filter((r) => r.referred_user?.package_status === 'Active').length}
            </p>
            <p className="text-xs text-ev-muted">Active Referrals</p>
          </div>
        </motion.div>

        {/* Referral Reward Tiers */}
        {rewardTiers.length > 0 && (
          <motion.div
            className="ev-card p-5 relative overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="absolute inset-0 ev-gradient-red opacity-5" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-ev-blue" />
                <h2 className="text-base font-semibold text-ev-text">Referral Rewards</h2>
              </div>
              <p className="text-xs text-ev-muted mb-4">
                Earn different rewards based on how many referrals you have activated. Each level gives you a different reward!
              </p>
              <div className="space-y-2">
                {rewardTiers.map((tier, index) => {
                  const isActive = referrals.filter(
                    (r) => r.referred_user?.package_status?.toLowerCase() === 'active'
                  ).length >= tier.level;
                  return (
                    <motion.div
                      key={tier.level}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-[#10B981]/5 border-[#10B981]/20'
                          : 'bg-ev-bg border-ev-card-border'
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * index }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isActive
                              ? 'bg-[#10B981]/10 text-[#10B981]'
                              : 'bg-ev-card-border text-ev-muted'
                          }`}
                        >
                          {tier.level}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isActive ? 'text-[#10B981]' : 'text-ev-text'}`}>
                            {getLevelLabel(tier.level)} Referral
                          </p>
                          {isActive && (
                            <p className="text-[10px] text-[#10B981]">Earned!</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className={`w-3.5 h-3.5 ${isActive ? 'text-[#10B981]' : 'text-ev-muted'}`} />
                        <span className={`text-sm font-bold ${isActive ? 'text-[#10B981]' : 'text-ev-blue'}`}>
                          Rs {tier.reward_amount}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-ev-card-border">
                <p className="text-[10px] text-ev-muted">
                  Total potential: <span className="text-ev-blue font-bold">Rs {rewardTiers.reduce((sum, t) => sum + t.reward_amount, 0)}</span> across {rewardTiers.length} levels
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Referral Link */}
        <motion.div className="ev-card p-5 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="absolute inset-0 ev-gradient-red opacity-5" />
          <div className="relative z-10">
            <h2 className="text-base font-semibold text-ev-text mb-3">Your Referral Link</h2>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-ev-bg border border-ev-card-border rounded-lg px-3 py-2.5 text-sm text-ev-muted truncate">
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
              <p className="text-xs text-ev-muted">Referral Code</p>
              <p className="text-lg font-bold text-ev-blue">{user.referral_code}</p>
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
              className="text-sm text-ev-muted hover:text-ev-text flex items-center gap-1"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </motion.div>
        )}

        {/* Referral List */}
        <div>
          <h2 className="text-base font-semibold text-ev-text mb-3">Your Referrals</h2>
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
                    <div className="w-10 h-10 bg-ev-bg rounded-full flex items-center justify-center text-sm font-bold text-ev-blue">
                      {ref.referred_user?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ev-text truncate">
                        {ref.referred_user?.first_name} {ref.referred_user?.last_name}
                      </p>
                      <p className="text-xs text-ev-muted">@{ref.referred_user?.username}</p>
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
                      <p className="text-[10px] text-ev-muted mt-0.5">
                        Reward: {ref.reward_status === 'Paid' ? 'Paid' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="ev-card p-8 flex flex-col items-center text-ev-muted">
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
