'use client';

import { useState, useEffect } from 'react';
import { useToastStore } from '@/lib/stores';
import {
  Plus,
  Trash2,
  Loader2,
  Ticket,
  Save,
  RefreshCw,
  Users,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface RewardTier {
  position: number;
  amount: number;
}

interface CodeClaim {
  id: string;
  user_id: string;
  position: number;
  reward_amount: number;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    username: string;
  };
}

interface DailyCode {
  id: string;
  code: string;
  max_claims: number;
  reward_tiers: string;
  reward_tiers_parsed: RewardTier[];
  is_active: boolean;
  current_claims: number;
  created_at: string;
  _count: { claims: number };
  claims: CodeClaim[];
}

const emptyForm = {
  code: '',
  max_claims: '10',
  reward_tiers: [] as RewardTier[],
  is_active: true,
};

export default function AdminRewardCampaigns() {
  const [codes, setCodes] = useState<DailyCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/daily-codes', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('ev_token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setCodes(Array.isArray(data.codes) ? data.codes : []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load daily codes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm(prev => ({ ...prev, code: result }));
  };

  const openCreateDialog = () => {
    setForm({
      code: '',
      max_claims: '10',
      reward_tiers: [
        { position: 1, amount: 100 },
        { position: 2, amount: 80 },
        { position: 3, amount: 50 },
      ],
      is_active: true,
    });
    setDialogOpen(true);
  };

  const addTier = () => {
    const nextPos = form.reward_tiers.length + 1;
    setForm(prev => ({
      ...prev,
      reward_tiers: [...prev.reward_tiers, { position: nextPos, amount: 0 }],
    }));
  };

  const removeTier = (index: number) => {
    setForm(prev => ({
      ...prev,
      reward_tiers: prev.reward_tiers
        .filter((_, i) => i !== index)
        .map((t, i) => ({ ...t, position: i + 1 })),
    }));
  };

  const updateTier = (index: number, field: 'position' | 'amount', value: string | number) => {
    setForm(prev => ({
      ...prev,
      reward_tiers: prev.reward_tiers.map((t, i) =>
        i === index ? { ...t, [field]: field === 'amount' ? parseFloat(String(value)) || 0 : parseInt(String(value)) || 1 } : t
      ),
    }));
  };

  const autoFillPositions = () => {
    const maxClaims = parseInt(form.max_claims) || 0;
    if (maxClaims <= 0) {
      addToast('Set max claims first', 'error');
      return;
    }
    const tiers: RewardTier[] = [];
    for (let i = 1; i <= maxClaims; i++) {
      const existing = form.reward_tiers.find(t => t.position === i);
      tiers.push({
        position: i,
        amount: existing?.amount || 0,
      });
    }
    setForm(prev => ({ ...prev, reward_tiers: tiers }));
  };

  const handleSave = async () => {
    if (!form.max_claims || parseInt(form.max_claims) < 1) {
      addToast('Max claims must be at least 1', 'error');
      return;
    }
    if (form.reward_tiers.length === 0) {
      addToast('Add at least one reward tier', 'error');
      return;
    }
    const hasInvalid = form.reward_tiers.some(t => !t.amount || t.amount <= 0);
    if (hasInvalid) {
      addToast('All reward amounts must be greater than 0', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/daily-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('ev_token')}`,
        },
        body: JSON.stringify({
          code: form.code || undefined,
          max_claims: parseInt(form.max_claims),
          reward_tiers: form.reward_tiers,
          is_active: form.is_active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      addToast('Daily code created!', 'success');
      setDialogOpen(false);
      loadCodes();
    } catch (err: any) {
      addToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/daily-codes/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('ev_token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      addToast('Daily code deleted', 'success');
      setDeleteId(null);
      loadCodes();
    } catch (err: any) {
      addToast(err.message || 'Delete failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (code: DailyCode) => {
    try {
      const res = await fetch(`/api/admin/daily-codes/${code.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('ev_token')}`,
        },
        body: JSON.stringify({ is_active: !code.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      addToast(code.is_active ? 'Code deactivated' : 'Code activated', 'success');
      loadCodes();
    } catch (err: any) {
      addToast(err.message || 'Update failed', 'error');
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      addToast('Code copied!', 'success');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      addToast('Failed to copy', 'error');
    }
  };

  const getPositionSuffix = (pos: number) => {
    const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
    return suffixes[pos] || 'th';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ev-text">Daily Codes</h1>
          <p className="text-ev-muted text-sm mt-1">Create reward codes with position-based prizes</p>
        </div>
        <button onClick={openCreateDialog} className="ev-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Code
        </button>
      </div>

      {/* How It Works Info */}
      <div className="ev-card p-4 bg-ev-blue/5 border-ev-blue/20">
        <div className="flex items-start gap-3">
          <Ticket className="w-5 h-5 text-ev-blue mt-0.5 shrink-0" />
          <div className="text-xs text-ev-muted space-y-1">
            <p className="font-semibold text-ev-text">How Daily Codes Work:</p>
            <p>• Create a unique code (like &quot;Vn7asM&quot;) and set how many users can claim it</p>
            <p>• Set <strong>different reward amounts for each position</strong> — 1st user gets Rs 100, 2nd gets Rs 80, 3rd gets Rs 50, etc.</p>
            <p>• Users enter the code on the Rewards page to claim their position-based prize</p>
            <p>• Once all positions are claimed, the code expires automatically</p>
          </div>
        </div>
      </div>

      {/* Codes List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-ev-blue" />
        </div>
      ) : codes.length === 0 ? (
        <div className="ev-card flex flex-col items-center justify-center py-20 text-ev-muted">
          <Ticket className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">No daily codes created yet</p>
          <p className="text-xs mt-1">Create your first code to start rewarding users</p>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((dailyCode) => {
            const tiers: RewardTier[] = dailyCode.reward_tiers_parsed || JSON.parse(dailyCode.reward_tiers || '[]');
            const isExpanded = expandedCode === dailyCode.id;
            const isFull = dailyCode.current_claims >= dailyCode.max_claims;

            return (
              <div key={dailyCode.id} className="ev-card overflow-hidden">
                {/* Code Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dailyCode.is_active && !isFull ? 'bg-ev-blue/10' : 'bg-ev-muted/10'}`}>
                        <Ticket className={`w-5 h-5 ${dailyCode.is_active && !isFull ? 'text-ev-blue' : 'text-ev-muted'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold font-mono text-ev-text tracking-wider">{dailyCode.code}</span>
                          <button
                            onClick={() => copyCode(dailyCode.code)}
                            className="p-1 rounded hover:bg-ev-bg text-ev-muted hover:text-ev-blue transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === dailyCode.code ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className={isFull ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : dailyCode.is_active ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}>
                            {isFull ? 'Full' : dailyCode.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-xs text-ev-muted flex items-center gap-1">
                            <Users className="w-3 h-3" /> {dailyCode.current_claims}/{dailyCode.max_claims} claimed
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(dailyCode)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          dailyCode.is_active
                            ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                            : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                        }`}
                      >
                        {dailyCode.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setExpandedCode(isExpanded ? null : dailyCode.id)}
                        className="p-1.5 rounded-lg hover:bg-ev-bg text-ev-muted transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteId(dailyCode.id)}
                        className="p-1.5 rounded-lg hover:bg-ev-bg text-ev-muted hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Reward Tiers Preview */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tiers.slice(0, 5).map((tier) => (
                      <div key={tier.position} className="flex items-center gap-1 bg-ev-bg border border-ev-card-border rounded-lg px-2.5 py-1.5 text-xs">
                        <span className="text-ev-muted">{tier.position}{getPositionSuffix(tier.position)}</span>
                        <span className="font-bold text-[#10B981]">Rs {tier.amount}</span>
                      </div>
                    ))}
                    {tiers.length > 5 && (
                      <div className="flex items-center bg-ev-bg border border-ev-card-border rounded-lg px-2.5 py-1.5 text-xs text-ev-muted">
                        +{tiers.length - 5} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details - Claims List */}
                {isExpanded && (
                  <div className="border-t border-ev-card-border bg-ev-bg/50">
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-ev-text mb-3">All Reward Tiers</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                        {tiers.map((tier) => {
                          const isClaimed = dailyCode.claims?.some(c => c.position === tier.position);
                          return (
                            <div key={tier.position} className={`rounded-lg p-2.5 text-center border ${isClaimed ? 'bg-[#10B981]/5 border-[#10B981]/20' : 'bg-ev-card border-ev-card-border'}`}>
                              <p className="text-[10px] text-ev-muted">{tier.position}{getPositionSuffix(tier.position)} Position</p>
                              <p className={`text-sm font-bold ${isClaimed ? 'text-[#10B981]' : 'text-ev-text'}`}>Rs {tier.amount}</p>
                              {isClaimed && <p className="text-[9px] text-[#10B981]">Claimed ✓</p>}
                            </div>
                          );
                        })}
                      </div>

                      {dailyCode.claims && dailyCode.claims.length > 0 && (
                        <>
                          <h4 className="text-sm font-semibold text-ev-text mb-3">Claim History</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                            {dailyCode.claims.map((claim) => (
                              <div key={claim.id} className="flex items-center justify-between bg-ev-card rounded-lg px-3 py-2 border border-ev-card-border">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-ev-blue/10 rounded-full flex items-center justify-center text-xs font-bold text-ev-blue">
                                    #{claim.position}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-ev-text">{claim.user?.first_name} {claim.user?.last_name}</p>
                                    <p className="text-[10px] text-ev-muted">@{claim.user?.username}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-bold text-[#10B981]">Rs {claim.reward_amount}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-ev-card border-ev-card-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-ev-text">Create Daily Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Code */}
            <div>
              <label className="block text-sm text-ev-muted mb-1">Code (leave empty for auto-generate)</label>
              <div className="flex gap-2">
                <input
                  className="ev-input flex-1 px-4 py-2.5 font-mono tracking-wider uppercase"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. Vn7asM"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="ev-btn-secondary flex items-center gap-1.5 px-3 py-2.5 text-xs shrink-0"
                  title="Generate random code"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate
                </button>
              </div>
            </div>

            {/* Max Claims */}
            <div>
              <label className="block text-sm text-ev-muted mb-1">Max Claims (kitne users claim kar sakte hain)</label>
              <input
                type="number"
                className="ev-input w-full px-4 py-2.5"
                value={form.max_claims}
                onChange={(e) => setForm({ ...form, max_claims: e.target.value })}
                placeholder="10"
                min="1"
              />
            </div>

            {/* Reward Tiers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-ev-muted">Reward Tiers (position-based amounts)</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={autoFillPositions}
                    className="text-[10px] px-2 py-1 rounded bg-ev-blue/10 text-ev-blue hover:bg-ev-blue/20 transition-colors"
                  >
                    Auto-fill all positions
                  </button>
                  <button
                    type="button"
                    onClick={addTier}
                    className="text-[10px] px-2 py-1 rounded bg-ev-blue/10 text-ev-blue hover:bg-ev-blue/20 transition-colors"
                  >
                    + Add tier
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin pr-1">
                {form.reward_tiers.map((tier, index) => (
                  <div key={index} className="flex items-center gap-2 bg-ev-bg rounded-lg p-2.5 border border-ev-card-border">
                    <div className="w-6 h-6 bg-ev-blue/10 rounded-full flex items-center justify-center text-xs font-bold text-ev-blue shrink-0">
                      {tier.position}
                    </div>
                    <span className="text-xs text-ev-muted shrink-0 w-14">{tier.position}{getPositionSuffix(tier.position)} user:</span>
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-xs text-ev-muted">Rs</span>
                      <input
                        type="number"
                        className="ev-input flex-1 px-3 py-1.5 text-sm"
                        value={tier.amount || ''}
                        onChange={(e) => updateTier(index, 'amount', e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    {form.reward_tiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTier(index)}
                        className="p-1 rounded text-ev-muted hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {form.reward_tiers.length > 0 && (
                <div className="mt-2 p-2 bg-ev-bg rounded-lg border border-ev-card-border">
                  <p className="text-[10px] text-ev-muted">
                    Total rewards: <span className="text-ev-text font-bold">Rs {form.reward_tiers.reduce((sum, t) => sum + (t.amount || 0), 0)}</span>
                    {' • '}
                    {form.reward_tiers.length} positions
                  </p>
                </div>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-ev-muted cursor-pointer">
                <div
                  className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${form.is_active ? 'bg-ev-blue' : 'bg-ev-card-border'}`}
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="ev-btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="ev-btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Create Code
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-ev-card border-ev-card-border">
          <DialogHeader>
            <DialogTitle className="text-ev-text">Delete Daily Code</DialogTitle>
          </DialogHeader>
          <p className="text-ev-muted text-sm">Are you sure? All claim records for this code will also be deleted.</p>
          <DialogFooter>
            <button onClick={() => setDeleteId(null)} className="ev-btn-secondary">Cancel</button>
            <button onClick={handleDelete} disabled={saving} className="bg-red-600 text-white font-semibold rounded-lg px-4 py-2.5 hover:bg-red-700 transition-colors flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
