'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useToastStore } from '@/lib/stores';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Award,
  Save,
  X,
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
  created_at: string;
  updated_at: string;
}

export default function AdminReferralTiers() {
  const [tiers, setTiers] = useState<ReferralRewardTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLevel, setEditLevel] = useState<number | null>(null);
  const [form, setForm] = useState({ level: '', reward_amount: '' });
  const [saving, setSaving] = useState(false);
  const [deleteLevel, setDeleteLevel] = useState<number | null>(null);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const { addToast } = useToastStore();

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminReferralTiers();
      setTiers(Array.isArray(res.tiers) ? res.tiers : []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load referral reward tiers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditLevel(null);
    setForm({ level: '', reward_amount: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (tier: ReferralRewardTier) => {
    setEditLevel(tier.level);
    setForm({ level: String(tier.level), reward_amount: String(tier.reward_amount) });
    setDialogOpen(true);
  };

  const startInlineEdit = (tier: ReferralRewardTier) => {
    setEditingLevel(tier.level);
    setEditAmount(String(tier.reward_amount));
  };

  const cancelInlineEdit = () => {
    setEditingLevel(null);
    setEditAmount('');
  };

  const handleInlineSave = async (level: number) => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      addToast('Reward amount must be a non-negative number', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.createReferralTier({ level, reward_amount: amount });
      addToast(`Level ${level} reward updated`, 'success');
      setEditingLevel(null);
      setEditAmount('');
      loadTiers();
    } catch (err: any) {
      addToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const level = parseInt(form.level, 10);
    const rewardAmount = parseFloat(form.reward_amount);

    if (isNaN(level) || level < 1) {
      addToast('Level must be a positive integer', 'error');
      return;
    }
    if (isNaN(rewardAmount) || rewardAmount < 0) {
      addToast('Reward amount must be a non-negative number', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.createReferralTier({ level, reward_amount: rewardAmount });
      addToast(editLevel ? 'Tier updated' : 'Tier created', 'success');
      setDialogOpen(false);
      loadTiers();
    } catch (err: any) {
      addToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteLevel === null) return;
    setSaving(true);
    try {
      await api.deleteReferralTier(deleteLevel);
      addToast(`Level ${deleteLevel} tier deleted`, 'success');
      setDeleteLevel(null);
      loadTiers();
    } catch (err: any) {
      addToast(err.message || 'Delete failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getLevelLabel = (level: number) => {
    const suffixes: Record<number, string> = {
      1: 'st', 2: 'nd', 3: 'rd',
    };
    const suffix = suffixes[level] || 'th';
    return `${level}${suffix}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ev-text">Referral Reward Tiers</h1>
          <p className="text-ev-muted text-sm mt-1">Set reward amounts for each referral level</p>
        </div>
        <button onClick={openCreateDialog} className="ev-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Tier
        </button>
      </div>

      {/* Info Card */}
      <div className="ev-card p-4">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-ev-blue mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-ev-text">How Referral Levels Work</p>
            <p className="text-xs text-ev-muted mt-1">
              When a user&apos;s referral activates, the system determines the level based on how many
              activated referrals that user already has. The 1st activated referral gets Level 1 reward,
              the 2nd gets Level 2, and so on. If no tier is defined for a level, the default referral
              reward from settings is used.
            </p>
          </div>
        </div>
      </div>

      {/* Tiers Table */}
      <div className="ev-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ev-blue" />
          </div>
        ) : tiers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ev-muted">
            <Award className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No referral reward tiers configured</p>
            <p className="text-xs mt-1">Add tiers to set different rewards for each referral level</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ev-card-border">
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Level</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Label</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Reward Amount</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => (
                  <tr key={tier.id} className="border-b border-ev-card-border hover:bg-ev-bg transition-colors">
                    <td className="py-3 px-4 text-ev-text font-bold">{tier.level}</td>
                    <td className="py-3 px-4 text-ev-muted">{getLevelLabel(tier.level)} Referral</td>
                    <td className="py-3 px-4">
                      {editingLevel === tier.level ? (
                        <div className="flex items-center gap-2">
                          <span className="text-ev-muted">Rs</span>
                          <input
                            type="number"
                            className="ev-input w-24 px-2 py-1 text-sm"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            min="0"
                            step="1"
                          />
                          <button
                            onClick={() => handleInlineSave(tier.level)}
                            disabled={saving}
                            className="p-1 rounded hover:bg-ev-bg text-[#10B981] transition-colors"
                          >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={cancelInlineEdit}
                            className="p-1 rounded hover:bg-ev-bg text-ev-muted transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#10B981] font-semibold">Rs {tier.reward_amount}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startInlineEdit(tier)}
                          className="p-1.5 rounded-lg hover:bg-ev-bg text-ev-muted hover:text-ev-blue transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteLevel(tier.level)}
                          className="p-1.5 rounded-lg hover:bg-ev-bg text-ev-muted hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-ev-card border-ev-card-border">
          <DialogHeader>
            <DialogTitle className="text-ev-text">
              {editLevel ? `Edit Level ${editLevel} Tier` : 'Add Referral Reward Tier'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-ev-muted mb-1">Level *</label>
              <input
                type="number"
                className="ev-input w-full px-4 py-2.5"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                placeholder="e.g. 1 for first referral"
                min="1"
                disabled={editLevel !== null}
              />
              <p className="text-xs text-ev-muted mt-1">
                1 = 1st referral, 2 = 2nd referral, etc.
              </p>
            </div>
            <div>
              <label className="block text-sm text-ev-muted mb-1">Reward Amount (Rs) *</label>
              <input
                type="number"
                className="ev-input w-full px-4 py-2.5"
                value={form.reward_amount}
                onChange={(e) => setForm({ ...form, reward_amount: e.target.value })}
                placeholder="e.g. 200"
                min="0"
                step="1"
              />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="ev-btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="ev-btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editLevel ? 'Update' : 'Create'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteLevel !== null} onOpenChange={() => setDeleteLevel(null)}>
        <DialogContent className="bg-ev-card border-ev-card-border">
          <DialogHeader>
            <DialogTitle className="text-ev-text">Delete Referral Reward Tier</DialogTitle>
          </DialogHeader>
          <p className="text-ev-muted text-sm">
            Are you sure you want to delete the Level {deleteLevel} reward tier? Referrals at this level
            will fall back to the default referral reward from settings.
          </p>
          <DialogFooter>
            <button onClick={() => setDeleteLevel(null)} className="ev-btn-secondary">
              Cancel
            </button>
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
