'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Inbox, CheckCircle2, Zap, Users, Clock, Timer } from 'lucide-react';
import { useAuthStore, useToastStore, useSettingsStore } from '@/lib/stores';
import { api } from '@/lib/api-client';

interface BonusCampaign {
  id: string;
  name: string;
  required_referrals: number;
  reward_amount: number;
  time_limit_hours: number;
  status: string; // Not Started, In Progress, Completed, Expired, Claimed
  current_referrals: number;
  progress: number;
  time_remaining_ms: number;
  started_at: string | null;
  expires_at: string | null;
  user_campaign_id: string | null;
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Expired';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function BonusesPage() {
  const { user, refreshUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { settings } = useSettingsStore();
  const brandName = settings.brand_name || 'EarnVault';

  const [bonusCampaigns, setBonusCampaigns] = useState<BonusCampaign[]>([]);
  const [claimingBonus, setClaimingBonus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const bonusRes = await api.getBonusCampaigns().catch(() => ({ campaigns: [] }));
      setBonusCampaigns(Array.isArray(bonusRes.campaigns) ? bonusRes.campaigns : []);
    } catch {
      addToast('Failed to load bonus data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimBonus = async (campaignId: string) => {
    setClaimingBonus(campaignId);
    try {
      const res = await api.claimBonusCampaign(campaignId);
      addToast(`🎉 Bonus claimed! Rs ${res.reward_amount} added to your balance!`, 'success');
      refreshUser();
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to claim bonus', 'error');
    } finally {
      setClaimingBonus(null);
    }
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
          <h1 className="text-lg font-bold text-ev-text">Bonuses</h1>
          <p className="text-xs text-ev-muted mt-0.5">Earn bonus rewards through referral campaigns</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Bonus Campaigns Section */}
        {bonusCampaigns.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-base font-semibold text-ev-text">Bonus Campaigns</h2>
            </div>
            <div className="space-y-3">
              {bonusCampaigns.map((campaign, i) => {
                const isCompleted = campaign.status === 'Completed';
                const isExpired = campaign.status === 'Expired';
                const isClaimed = campaign.status === 'Claimed';
                const isInProgress = campaign.status === 'In Progress' || campaign.status === 'Not Started';

                return (
                  <motion.div
                    key={campaign.id}
                    className="ev-card p-4 relative overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isClaimed ? 'bg-[#10B981]/10' : isExpired ? 'bg-red-500/10' : 'bg-[#F59E0B]/10'
                        }`}>
                          <Trophy className={`w-5 h-5 ${
                            isClaimed ? 'text-[#10B981]' : isExpired ? 'text-red-500' : 'text-[#F59E0B]'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-ev-text">{campaign.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-medium flex items-center gap-1 ${
                              isClaimed ? 'text-[#10B981]' : isExpired ? 'text-red-500' : 'text-[#F59E0B]'
                            }`}>
                              {isClaimed ? (
                                <><CheckCircle2 className="w-3 h-3" /> Claimed</>
                              ) : isExpired ? (
                                <>Expired</>
                              ) : isCompleted ? (
                                <><CheckCircle2 className="w-3 h-3" /> Completed!</>
                              ) : (
                                <><Clock className="w-3 h-3" /> In Progress</>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-[#10B981]">
                          Rs. {campaign.reward_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Referral Progress */}
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-3.5 h-3.5 text-ev-muted" />
                      <span className="text-xs text-ev-muted">
                        {campaign.current_referrals}/{campaign.required_referrals} referrals
                      </span>
                      <span className="text-[10px] text-ev-blue font-semibold ml-auto">
                        {campaign.progress}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-ev-bg rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isClaimed ? 'bg-[#10B981]' : isExpired ? 'bg-red-500' : 'ev-gradient-red'
                        }`}
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>

                    {/* Time Limit & Action */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-ev-muted flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {isClaimed ? 'Reward claimed!' : isExpired ? 'Time limit expired' :
                          campaign.time_remaining_ms > 0
                            ? `${formatTimeRemaining(campaign.time_remaining_ms)} time limit`
                            : 'Time limit expired'
                        }
                      </span>

                      {isCompleted && !isClaimed && (
                        <button
                          onClick={() => handleClaimBonus(campaign.id)}
                          disabled={claimingBonus === campaign.id}
                          className="ev-btn-primary text-[10px] px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
                        >
                          {claimingBonus === campaign.id ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Zap className="w-3 h-3" /> Claim Reward
                            </>
                          )}
                        </button>
                      )}

                      {isInProgress && !isCompleted && (
                        <span className="text-[10px] text-ev-muted">
                          Keep referring to unlock
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-ev-muted">
            <Inbox className="w-12 h-12 mb-3" />
            <p className="text-sm">No bonus campaigns right now</p>
            <p className="text-xs mt-1">Check back later for new campaigns</p>
          </div>
        )}
      </div>
    </div>
  );
}
