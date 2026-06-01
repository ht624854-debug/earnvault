'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Inbox, CheckCircle2, Zap, Users, Trophy, ArrowRight, Gift, Clock, Award, Timer } from 'lucide-react';
import { useAuthStore, useToastStore } from '@/lib/stores';
import { useSettingsStore } from '@/lib/stores';
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

interface AvailableCode {
  id: string;
  code: string;
  max_claims: number;
  current_claims: number;
  remaining: number;
  next_reward: number;
  user_already_claimed: boolean;
  created_at: string;
}

interface ClaimResult {
  position: number;
  reward_amount: number;
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

export default function RewardsPage() {
  const { user, refreshUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { settings } = useSettingsStore();
  const brandName = settings.brand_name || 'EarnVault';

  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [availableCodes, setAvailableCodes] = useState<AvailableCode[]>([]);
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [bonusCampaigns, setBonusCampaigns] = useState<BonusCampaign[]>([]);
  const [claimingBonus, setClaimingBonus] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [codesRes, claimsRes, bonusRes] = await Promise.all([
        fetch('/api/daily-codes', {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('ev_token')}` },
        }),
        fetch('/api/user/daily-code-claims', {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('ev_token')}` },
        }),
        api.getBonusCampaigns().catch(() => ({ campaigns: [] })),
      ]);

      const codesData = await codesRes.json();
      setAvailableCodes(Array.isArray(codesData.codes) ? codesData.codes : []);

      if (claimsRes.ok) {
        const claimsData = await claimsRes.json();
        setMyClaims(Array.isArray(claimsData.claims) ? claimsData.claims : []);
      }

      setBonusCampaigns(Array.isArray(bonusRes.campaigns) ? bonusRes.campaigns : []);
    } catch {
      addToast('Failed to load reward data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimCode = async () => {
    if (!codeInput.trim()) {
      addToast('Please enter a code', 'error');
      return;
    }
    setClaiming(true);
    setClaimResult(null);
    try {
      const res = await fetch('/api/daily-codes/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('ev_token')}`,
        },
        body: JSON.stringify({ code: codeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Claim failed');

      setClaimResult({ position: data.position, reward_amount: data.reward_amount });
      addToast(`🎉 You got Rs ${data.reward_amount}! Position #${data.position}`, 'success');
      setCodeInput('');
      refreshUser();
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to claim code', 'error');
    } finally {
      setClaiming(false);
    }
  };

  const handleQuickClaim = async (code: string) => {
    setCodeInput(code);
    setClaiming(true);
    setClaimResult(null);
    try {
      const res = await fetch('/api/daily-codes/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('ev_token')}`,
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Claim failed');

      setClaimResult({ position: data.position, reward_amount: data.reward_amount });
      addToast(`🎉 You got Rs ${data.reward_amount}! Position #${data.position}`, 'success');
      setCodeInput('');
      refreshUser();
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to claim code', 'error');
    } finally {
      setClaiming(false);
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

  const getPositionSuffix = (pos: number) => {
    const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
    return suffixes[pos] || 'th';
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
          <h1 className="text-lg font-bold text-ev-text">Rewards</h1>
          <p className="text-xs text-ev-muted mt-0.5">Earn bonus rewards through campaigns</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Bonus Campaigns Section */}
        {bonusCampaigns.length > 0 && (
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
                        <p className={`text-base font-bold ${isClaimed ? 'text-[#10B981]' : 'text-[#10B981]'}`}>
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
                        {isClaimed ? 'Reward claimed!' : isExpired ? 'Time expired' :
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
        )}

        {/* Claim Success Result */}
        {claimResult && (
          <motion.div
            className="ev-card p-5 relative overflow-hidden border-[#10B981]/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="absolute inset-0 bg-[#10B981]/5" />
            <div className="relative z-10 text-center">
              <div className="w-14 h-14 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-7 h-7 text-[#10B981]" />
              </div>
              <h3 className="text-lg font-bold text-ev-text mb-1">🎉 Code Claimed!</h3>
              <p className="text-sm text-ev-muted mb-2">You were the {claimResult.position}{getPositionSuffix(claimResult.position)} to claim</p>
              <p className="text-2xl font-bold text-[#10B981]">Rs {claimResult.reward_amount}</p>
              <button
                onClick={() => setClaimResult(null)}
                className="mt-3 text-xs text-ev-muted hover:text-ev-text transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {/* Enter Code Section */}
        <motion.div
          className="ev-card p-5 relative overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 ev-gradient-red opacity-[0.02]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-ev-blue/10 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-ev-blue" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ev-text">Enter Daily Code</h3>
                <p className="text-[10px] text-ev-muted">Get the code from admin or social media</p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                className="ev-input flex-1 px-4 py-3 font-mono tracking-widest text-center text-lg uppercase"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                maxLength={20}
                onKeyDown={(e) => e.key === 'Enter' && handleClaimCode()}
                disabled={claiming}
              />
              <button
                onClick={handleClaimCode}
                disabled={claiming || !codeInput.trim()}
                className="ev-btn-primary px-5 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {claiming ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Claim
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Available Codes */}
        {availableCodes.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-ev-text mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-ev-blue" />
              Available Codes
            </h2>
            <div className="space-y-2">
              {availableCodes.map((code, i) => (
                <motion.div
                  key={code.id}
                  className="ev-card p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-ev-blue/10 rounded-xl flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-ev-blue" />
                      </div>
                      <div>
                        <p className="text-base font-bold font-mono text-ev-text tracking-wider">{code.code}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-ev-muted flex items-center gap-1">
                            <Users className="w-3 h-3" /> {code.remaining} spots left
                          </span>
                          <span className="text-[10px] text-[#10B981] font-semibold flex items-center gap-0.5">
                            <Zap className="w-3 h-3" /> Next: Rs {code.next_reward}
                          </span>
                        </div>
                      </div>
                    </div>

                    {code.user_already_claimed ? (
                      <span className="text-xs text-[#10B981] flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleQuickClaim(code.code)}
                        disabled={claiming}
                        className="ev-btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        Claim <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-ev-bg rounded-full h-1.5">
                      <div
                        className="ev-gradient-red h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((code.current_claims / code.max_claims) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* My Claims History */}
        {myClaims.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-ev-text mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-ev-blue" />
              My Claimed Codes
            </h2>
            <div className="space-y-2">
              {myClaims.map((claim: any, i: number) => (
                <motion.div
                  key={claim.id}
                  className="ev-card p-3 flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#10B981]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#10B981]">
                      #{claim.position}
                    </div>
                    <div>
                      <p className="text-sm font-medium font-mono text-ev-text">{claim.code?.code || 'Code'}</p>
                      <p className="text-[10px] text-ev-muted">{claim.position}{getPositionSuffix(claim.position)} position</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#10B981]">+Rs {claim.reward_amount}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {availableCodes.length === 0 && myClaims.length === 0 && bonusCampaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-ev-muted">
            <Inbox className="w-12 h-12 mb-3" />
            <p className="text-sm">No active reward codes right now</p>
            <p className="text-xs mt-1">Check back later or enter a code above</p>
          </div>
        )}
      </div>
    </div>
  );
}
