'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Trophy, Clock, Users, Inbox, CheckCircle2, Zap } from 'lucide-react';
import { useAuthStore, useToastStore } from '@/lib/stores';
import { api } from '@/lib/api-client';

interface Campaign {
  id: string;
  title: string;
  target_referrals: number;
  time_limit_hours: number;
  reward_amount: number;
  is_active: boolean;
  user_progress?: number;
  user_status?: string;
}

export default function RewardsPage() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getRewardCampaigns();
        setCampaigns(res.campaigns || res || []);
      } catch {
        addToast('Failed to load reward campaigns', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const handleClaim = async (campaignId: string) => {
    setClaiming(campaignId);
    try {
      await api.claimReward(campaignId);
      addToast('Reward claimed successfully!', 'success');

      const res = await api.getRewardCampaigns();
      setCampaigns(res.campaigns || res || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to claim reward', 'error');
    } finally {
      setClaiming(null);
    }
  };

  const getProgress = (campaign: Campaign) => {
    const current = campaign.user_progress || 0;
    const target = campaign.target_referrals || 1;
    return Math.min((current / target) * 100, 100);
  };

  const getStatusInfo = (campaign: Campaign) => {
    if (campaign.user_status === 'Claimed') {
      return { label: 'Claimed', color: '#10B981', icon: CheckCircle2 };
    }
    if (getProgress(campaign) >= 100) {
      return { label: 'Eligible', color: '#DC2626', icon: Zap };
    }
    return { label: 'In Progress', color: '#F59E0B', icon: Clock };
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
          <h1 className="text-lg font-bold text-[#F5F5F5]">Rewards</h1>
          <p className="text-xs text-[#737373] mt-0.5">Earn bonus rewards through campaigns</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {campaigns.length > 0 ? (
          campaigns.map((campaign, i) => {
            const statusInfo = getStatusInfo(campaign);
            const StatusIcon = statusInfo.icon;
            const progress = getProgress(campaign);
            const canClaim = progress >= 100 && campaign.user_status !== 'Claimed';

            return (
              <motion.div
                key={campaign.id}
                className="ev-card p-5 relative overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="absolute inset-0 ev-gradient-red opacity-[0.02]" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#DC2626]/10 rounded-xl flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-[#DC2626]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#F5F5F5]">{campaign.title}</h3>
                        <span
                          className="inline-flex items-center gap-1 text-xs font-medium mt-0.5"
                          style={{ color: statusInfo.color }}
                        >
                          <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#10B981]">Rs. {campaign.reward_amount}</p>
                      <p className="text-[10px] text-[#737373]">Reward</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-[#737373] mb-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {campaign.user_progress || 0}/{campaign.target_referrals} referrals
                      </span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                      <motion.div
                        className="ev-gradient-red h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#737373] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {campaign.time_limit_hours} hours time limit
                    </span>

                    {canClaim ? (
                      <button
                        onClick={() => handleClaim(campaign.id)}
                        disabled={claiming === campaign.id}
                        className="ev-btn-primary text-xs px-4 py-1.5 flex items-center gap-1 disabled:opacity-50"
                      >
                        {claiming === campaign.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Gift className="w-3 h-3" /> Claim Reward
                          </>
                        )}
                      </button>
                    ) : campaign.user_status === 'Claimed' ? (
                      <span className="text-xs text-[#10B981] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Claimed
                      </span>
                    ) : (
                      <span className="text-xs text-[#525252]">Keep referring to unlock</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-[#737373]">
            <Inbox className="w-12 h-12 mb-3" />
            <p className="text-sm">No active reward campaigns</p>
            <p className="text-xs mt-1">Check back later for new campaigns</p>
          </div>
        )}
      </div>
    </div>
  );
}
