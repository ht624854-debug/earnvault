'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useToastStore } from '@/lib/stores';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Gift,
  Save,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface RewardCampaign {
  id: string;
  title: string;
  target_referrals: number;
  time_limit_hours: number;
  reward_amount: number;
  is_active: boolean;
  created_at: string;
}

const emptyForm = {
  title: '',
  target_referrals: '',
  time_limit_hours: '',
  reward_amount: '',
  is_active: true,
};

export default function AdminRewardCampaigns() {
  const [campaigns, setCampaigns] = useState<RewardCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminRewardCampaigns();
      setCampaigns(res.campaigns || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (campaign: RewardCampaign) => {
    setEditId(campaign.id);
    setForm({
      title: campaign.title || '',
      target_referrals: String(campaign.target_referrals || ''),
      time_limit_hours: String(campaign.time_limit_hours || ''),
      reward_amount: String(campaign.reward_amount || ''),
      is_active: campaign.is_active !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.target_referrals || !form.reward_amount) {
      addToast('Title, target referrals, and reward amount are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        target_referrals: parseInt(form.target_referrals),
        time_limit_hours: parseInt(form.time_limit_hours),
        reward_amount: parseFloat(form.reward_amount),
      };
      if (editId) {
        await api.updateAdminRewardCampaign(editId, data);
        addToast('Campaign updated', 'success');
      } else {
        await api.createAdminRewardCampaign(data);
        addToast('Campaign created', 'success');
      }
      setDialogOpen(false);
      loadCampaigns();
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
      await api.deleteAdminRewardCampaign(deleteId);
      addToast('Campaign deleted', 'success');
      setDeleteId(null);
      loadCampaigns();
    } catch (err: any) {
      addToast(err.message || 'Delete failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Reward Campaigns</h1>
          <p className="text-[#737373] text-sm mt-1">Manage referral reward campaigns</p>
        </div>
        <button onClick={openCreateDialog} className="ev-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Campaign
        </button>
      </div>

      {/* Campaign List */}
      <div className="ev-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#DC2626]" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#737373]">
            <Gift className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No campaigns found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F1F1F]">
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Title</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Target Referrals</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Time Limit</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Reward</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#737373] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-3 px-4 text-[#F5F5F5] font-medium">{campaign.title}</td>
                    <td className="py-3 px-4 text-[#A3A3A3]">{campaign.target_referrals}</td>
                    <td className="py-3 px-4 text-[#A3A3A3]">{campaign.time_limit_hours}h</td>
                    <td className="py-3 px-4 text-[#F5F5F5] font-medium">Rs. {campaign.reward_amount}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          campaign.is_active
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }
                      >
                        {campaign.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditDialog(campaign)}
                          className="p-1.5 rounded-lg hover:bg-[#1F1F1F] text-[#A3A3A3] hover:text-[#DC2626] transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(campaign.id)}
                          className="p-1.5 rounded-lg hover:bg-[#1F1F1F] text-[#A3A3A3] hover:text-red-400 transition-colors"
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
        <DialogContent className="bg-[#141414] border-[#1F1F1F]">
          <DialogHeader>
            <DialogTitle className="text-[#F5F5F5]">{editId ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#A3A3A3] mb-1">Title *</label>
              <input
                className="ev-input w-full px-4 py-2.5"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Campaign title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#A3A3A3] mb-1">Target Referrals *</label>
                <input
                  type="number"
                  className="ev-input w-full px-4 py-2.5"
                  value={form.target_referrals}
                  onChange={(e) => setForm({ ...form, target_referrals: e.target.value })}
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm text-[#A3A3A3] mb-1">Time Limit (hours)</label>
                <input
                  type="number"
                  className="ev-input w-full px-4 py-2.5"
                  value={form.time_limit_hours}
                  onChange={(e) => setForm({ ...form, time_limit_hours: e.target.value })}
                  placeholder="24"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#A3A3A3] mb-1">Reward Amount *</label>
                <input
                  type="number"
                  className="ev-input w-full px-4 py-2.5"
                  value={form.reward_amount}
                  onChange={(e) => setForm({ ...form, reward_amount: e.target.value })}
                  placeholder="500"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-[#A3A3A3]">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#DC2626]"
                  />
                  Active
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="ev-btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="ev-btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId ? 'Update' : 'Create'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-[#141414] border-[#1F1F1F]">
          <DialogHeader>
            <DialogTitle className="text-[#F5F5F5]">Delete Campaign</DialogTitle>
          </DialogHeader>
          <p className="text-[#A3A3A3] text-sm">Are you sure you want to delete this campaign?</p>
          <DialogFooter>
            <button onClick={() => setDeleteId(null)} className="ev-btn-secondary">
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
