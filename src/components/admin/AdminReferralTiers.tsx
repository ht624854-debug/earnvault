'use client';

import { useState, useEffect } from 'react';
import { useToastStore } from '@/lib/stores';
import {
  Plus,
  Trash2,
  Loader2,
  Award,
  Save,
  X,
  Network,
  Pencil,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ReferralRewardTier {
  id: string;
  level: number;
  reward_amount: number;
}

interface CommissionLevel {
  id: string;
  level: number;
  commission_amount: number;
}

type TabType = 'tiers' | 'commissions';

export default function AdminReferralTiers() {
  const [activeTab, setActiveTab] = useState<TabType>('commissions');
  
  // Tiers state
  const [tiers, setTiers] = useState<ReferralRewardTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [editTierLevel, setEditTierLevel] = useState<number | null>(null);
  const [tierForm, setTierForm] = useState({ level: '', reward_amount: '' });
  const [editingTierLevel, setEditingTierLevel] = useState<number | null>(null);
  const [editTierAmount, setEditTierAmount] = useState('');
  const [deleteTierLevel, setDeleteTierLevel] = useState<number | null>(null);

  // Commissions state
  const [commissions, setCommissions] = useState<CommissionLevel[]>([]);
  const [commissionsLoading, setCommissionsLoading] = useState(true);
  const [commDialogOpen, setCommDialogOpen] = useState(false);
  const [editCommLevel, setEditCommLevel] = useState<number | null>(null);
  const [commForm, setCommForm] = useState({ level: '', commission_amount: '' });
  const [editingCommLevel, setEditingCommLevel] = useState<number | null>(null);
  const [editCommAmount, setEditCommAmount] = useState('');
  const [deleteCommLevel, setDeleteCommLevel] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadTiers();
    loadCommissions();
  }, []);

  const getToken = () => sessionStorage.getItem('ev_token');

  const loadTiers = async () => {
    setTiersLoading(true);
    try {
      const res = await fetch('/api/admin/referral-reward-tiers', {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTiers(Array.isArray(data.tiers) ? data.tiers : []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load tiers', 'error');
    } finally {
      setTiersLoading(false);
    }
  };

  const loadCommissions = async () => {
    setCommissionsLoading(true);
    try {
      const res = await fetch('/api/admin/referral-commission-levels', {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCommissions(Array.isArray(data.levels) ? data.levels : []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load commission levels', 'error');
    } finally {
      setCommissionsLoading(false);
    }
  };

  // Commission Level handlers
  const handleSaveCommission = async () => {
    const level = parseInt(commForm.level, 10);
    const amount = parseFloat(commForm.commission_amount);
    if (isNaN(level) || level < 1) { addToast('Level must be 1 or more', 'error'); return; }
    if (isNaN(amount) || amount <= 0) { addToast('Amount must be greater than 0', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/referral-commission-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ level, commission_amount: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addToast(editCommLevel ? 'Commission updated' : 'Commission level added', 'success');
      setCommDialogOpen(false);
      loadCommissions();
    } catch (err: any) {
      addToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInlineSaveCommission = async (level: number) => {
    const amount = parseFloat(editCommAmount);
    if (isNaN(amount) || amount <= 0) { addToast('Amount must be greater than 0', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/referral-commission-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ level, commission_amount: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addToast(`Level ${level} commission updated`, 'success');
      setEditingCommLevel(null);
      loadCommissions();
    } catch (err: any) {
      addToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCommission = async () => {
    if (deleteCommLevel === null) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/referral-commission-levels/${deleteCommLevel}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addToast(`Level ${deleteCommLevel} deleted`, 'success');
      setDeleteCommLevel(null);
      loadCommissions();
    } catch (err: any) {
      addToast(err.message || 'Delete failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Tier handlers (existing)
  const handleSaveTier = async () => {
    const level = parseInt(tierForm.level, 10);
    const rewardAmount = parseFloat(tierForm.reward_amount);
    if (isNaN(level) || level < 1) { addToast('Level must be 1 or more', 'error'); return; }
    if (isNaN(rewardAmount) || rewardAmount < 0) { addToast('Amount must be non-negative', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/referral-reward-tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ level, reward_amount: rewardAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addToast(editTierLevel ? 'Tier updated' : 'Tier created', 'success');
      setTierDialogOpen(false);
      loadTiers();
    } catch (err: any) {
      addToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInlineSaveTier = async (level: number) => {
    const amount = parseFloat(editTierAmount);
    if (isNaN(amount) || amount < 0) { addToast('Invalid amount', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/referral-reward-tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ level, reward_amount: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addToast(`Level ${level} updated`, 'success');
      setEditingTierLevel(null);
      loadTiers();
    } catch (err: any) {
      addToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTier = async () => {
    if (deleteTierLevel === null) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/referral-reward-tiers/${deleteTierLevel}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addToast(`Level ${deleteTierLevel} tier deleted`, 'success');
      setDeleteTierLevel(null);
      loadTiers();
    } catch (err: any) {
      addToast(err.message || 'Delete failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getLevelSuffix = (level: number) => {
    const s: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
    return s[level] || 'th';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ev-text">Referral System</h1>
        <p className="text-ev-muted text-sm mt-1">Manage referral rewards and commission levels</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-ev-card-border pb-0">
        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'commissions'
              ? 'border-ev-blue text-ev-blue'
              : 'border-transparent text-ev-muted hover:text-ev-text'
          }`}
        >
          <span className="flex items-center gap-1.5"><Network className="w-4 h-4" /> Multi-Level Commissions</span>
        </button>
        <button
          onClick={() => setActiveTab('tiers')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'tiers'
              ? 'border-ev-blue text-ev-blue'
              : 'border-transparent text-ev-muted hover:text-ev-text'
          }`}
        >
          <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Referral Reward Tiers</span>
        </button>
      </div>

      {/* ========== Multi-Level Commissions Tab ========== */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div />
            <button onClick={() => { setEditCommLevel(null); setCommForm({ level: '', commission_amount: '' }); setCommDialogOpen(true); }} className="ev-btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Level
            </button>
          </div>

          {/* Info */}
          <div className="ev-card p-4 bg-ev-blue/5 border-ev-blue/20">
            <div className="flex items-start gap-3">
              <Network className="w-5 h-5 text-ev-blue mt-0.5 shrink-0" />
              <div className="text-xs text-ev-muted space-y-1">
                <p className="font-semibold text-ev-text">Multi-Level Commission System</p>
                <p>Jab koi user activate hota hai, uske <strong>direct referrer (Level 1)</strong> ko commission milta hai, <strong>referrer ka referrer (Level 2)</strong> ko bhi, aur aage bhi chain mein.</p>
                <p><strong>Example:</strong> A→B→C→D chain mein D activate ho to: C ko Rs 300 (L1), B ko Rs 200 (L2), A ko Rs 100 (L3)</p>
              </div>
            </div>
          </div>

          {/* Commissions Table */}
          <div className="ev-card overflow-hidden">
            {commissionsLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-ev-blue" /></div>
            ) : commissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-ev-muted">
                <Network className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No commission levels configured</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ev-card-border">
                      <th className="text-left py-3 px-4 text-ev-muted font-medium">Level</th>
                      <th className="text-left py-3 px-4 text-ev-muted font-medium">Description</th>
                      <th className="text-left py-3 px-4 text-ev-muted font-medium">Commission</th>
                      <th className="text-left py-3 px-4 text-ev-muted font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((cl) => (
                      <tr key={cl.id} className="border-b border-ev-card-border hover:bg-ev-bg transition-colors">
                        <td className="py-3 px-4 text-ev-text font-bold">Level {cl.level}</td>
                        <td className="py-3 px-4 text-ev-muted">
                          {cl.level === 1 ? 'Direct Referrer' : cl.level === 2 ? "Referrer's Referrer" : `${cl.level}${getLevelSuffix(cl.level)} Level Upline`}
                        </td>
                        <td className="py-3 px-4">
                          {editingCommLevel === cl.level ? (
                            <div className="flex items-center gap-2">
                              <span className="text-ev-muted">Rs</span>
                              <input type="number" className="ev-input w-24 px-2 py-1 text-sm" value={editCommAmount} onChange={(e) => setEditCommAmount(e.target.value)} min="0" />
                              <button onClick={() => handleInlineSaveCommission(cl.level)} disabled={saving} className="p-1 rounded hover:bg-ev-bg text-[#10B981]">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              </button>
                              <button onClick={() => setEditingCommLevel(null)} className="p-1 rounded hover:bg-ev-bg text-ev-muted"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <span className="text-[#10B981] font-semibold">Rs {cl.commission_amount}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditingCommLevel(cl.level); setEditCommAmount(String(cl.commission_amount)); }} className="p-1.5 rounded-lg hover:bg-ev-bg text-ev-muted hover:text-ev-blue transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteCommLevel(cl.level)} className="p-1.5 rounded-lg hover:bg-ev-bg text-ev-muted hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== Referral Reward Tiers Tab ========== */}
      {activeTab === 'tiers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div />
            <button onClick={() => { setEditTierLevel(null); setTierForm({ level: '', reward_amount: '' }); setTierDialogOpen(true); }} className="ev-btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Tier
            </button>
          </div>

          <div className="ev-card p-4 bg-ev-blue/5 border-ev-blue/20">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-ev-blue mt-0.5 shrink-0" />
              <div className="text-xs text-ev-muted space-y-1">
                <p className="font-semibold text-ev-text">Referral Reward Tiers (by count)</p>
                <p>Ye system referee ki <strong>count</strong> pe based hai — 1st referral kitne paise, 2nd kitne, etc. Ye Multi-Level Commission se alag hai.</p>
              </div>
            </div>
          </div>

          <div className="ev-card overflow-hidden">
            {tiersLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-ev-blue" /></div>
            ) : tiers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-ev-muted">
                <Award className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No referral reward tiers configured</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ev-card-border">
                      <th className="text-left py-3 px-4 text-ev-muted font-medium">Level</th>
                      <th className="text-left py-3 px-4 text-ev-muted font-medium">Label</th>
                      <th className="text-left py-3 px-4 text-ev-muted font-medium">Reward</th>
                      <th className="text-left py-3 px-4 text-ev-muted font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((tier) => (
                      <tr key={tier.id} className="border-b border-ev-card-border hover:bg-ev-bg transition-colors">
                        <td className="py-3 px-4 text-ev-text font-bold">{tier.level}</td>
                        <td className="py-3 px-4 text-ev-muted">{tier.level}{getLevelSuffix(tier.level)} Referral</td>
                        <td className="py-3 px-4">
                          {editingTierLevel === tier.level ? (
                            <div className="flex items-center gap-2">
                              <span className="text-ev-muted">Rs</span>
                              <input type="number" className="ev-input w-24 px-2 py-1 text-sm" value={editTierAmount} onChange={(e) => setEditTierAmount(e.target.value)} min="0" />
                              <button onClick={() => handleInlineSaveTier(tier.level)} disabled={saving} className="p-1 rounded hover:bg-ev-bg text-[#10B981]">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              </button>
                              <button onClick={() => setEditingTierLevel(null)} className="p-1 rounded hover:bg-ev-bg text-ev-muted"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <span className="text-[#10B981] font-semibold">Rs {tier.reward_amount}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditingTierLevel(tier.level); setEditTierAmount(String(tier.reward_amount)); }} className="p-1.5 rounded-lg hover:bg-ev-bg text-ev-muted hover:text-ev-blue"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteTierLevel(tier.level)} className="p-1.5 rounded-lg hover:bg-ev-bg text-ev-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commission Dialog */}
      <Dialog open={commDialogOpen} onOpenChange={setCommDialogOpen}>
        <DialogContent className="bg-ev-card border-ev-card-border">
          <DialogHeader>
            <DialogTitle className="text-ev-text">{editCommLevel ? `Edit Level ${editCommLevel}` : 'Add Commission Level'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-ev-muted mb-1">Level *</label>
              <input type="number" className="ev-input w-full px-4 py-2.5" value={commForm.level} onChange={(e) => setCommForm({ ...commForm, level: e.target.value })} placeholder="1 = direct, 2 = level 2, etc." min="1" disabled={editCommLevel !== null} />
              <p className="text-xs text-ev-muted mt-1">1 = Direct referrer, 2 = Referrer ka referrer, 3 = Level 3 upline</p>
            </div>
            <div>
              <label className="block text-sm text-ev-muted mb-1">Commission Amount (Rs) *</label>
              <input type="number" className="ev-input w-full px-4 py-2.5" value={commForm.commission_amount} onChange={(e) => setCommForm({ ...commForm, commission_amount: e.target.value })} placeholder="e.g. 300" min="0" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setCommDialogOpen(false)} className="ev-btn-secondary">Cancel</button>
            <button onClick={handleSaveCommission} disabled={saving} className="ev-btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editCommLevel ? 'Update' : 'Create'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tier Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent className="bg-ev-card border-ev-card-border">
          <DialogHeader>
            <DialogTitle className="text-ev-text">{editTierLevel ? `Edit Level ${editTierLevel}` : 'Add Reward Tier'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-ev-muted mb-1">Level *</label>
              <input type="number" className="ev-input w-full px-4 py-2.5" value={tierForm.level} onChange={(e) => setTierForm({ ...tierForm, level: e.target.value })} placeholder="1 = first referral" min="1" disabled={editTierLevel !== null} />
            </div>
            <div>
              <label className="block text-sm text-ev-muted mb-1">Reward Amount (Rs) *</label>
              <input type="number" className="ev-input w-full px-4 py-2.5" value={tierForm.reward_amount} onChange={(e) => setTierForm({ ...tierForm, reward_amount: e.target.value })} placeholder="e.g. 200" min="0" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setTierDialogOpen(false)} className="ev-btn-secondary">Cancel</button>
            <button onClick={handleSaveTier} disabled={saving} className="ev-btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editTierLevel ? 'Update' : 'Create'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Commission Dialog */}
      <Dialog open={deleteCommLevel !== null} onOpenChange={() => setDeleteCommLevel(null)}>
        <DialogContent className="bg-ev-card border-ev-card-border">
          <DialogHeader><DialogTitle className="text-ev-text">Delete Commission Level</DialogTitle></DialogHeader>
          <p className="text-ev-muted text-sm">Delete Level {deleteCommLevel}? Users at this depth in the chain won&apos;t receive commission anymore.</p>
          <DialogFooter>
            <button onClick={() => setDeleteCommLevel(null)} className="ev-btn-secondary">Cancel</button>
            <button onClick={handleDeleteCommission} disabled={saving} className="bg-red-600 text-white font-semibold rounded-lg px-4 py-2.5 hover:bg-red-700 flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tier Dialog */}
      <Dialog open={deleteTierLevel !== null} onOpenChange={() => setDeleteTierLevel(null)}>
        <DialogContent className="bg-ev-card border-ev-card-border">
          <DialogHeader><DialogTitle className="text-ev-text">Delete Reward Tier</DialogTitle></DialogHeader>
          <p className="text-ev-muted text-sm">Delete Level {deleteTierLevel}? The default referral reward from settings will be used instead.</p>
          <DialogFooter>
            <button onClick={() => setDeleteTierLevel(null)} className="ev-btn-secondary">Cancel</button>
            <button onClick={handleDeleteTier} disabled={saving} className="bg-red-600 text-white font-semibold rounded-lg px-4 py-2.5 hover:bg-red-700 flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
