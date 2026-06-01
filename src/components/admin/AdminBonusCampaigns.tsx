'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Plus, Trash2, Edit3, Check, X, Users, Clock, Zap } from 'lucide-react';
import { useToastStore } from '@/lib/stores';
import { api } from '@/lib/api-client';

interface Campaign {
  id: string;
  name: string;
  required_referrals: number;
  reward_amount: number;
  time_limit_hours: number;
  is_active: boolean;
  _count?: { user_campaigns: number };
  created_at: string;
}

export default function AdminBonusCampaigns() {
  const { addToast } = useToastStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    required_referrals: '',
    reward_amount: '',
    time_limit_hours: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    required_referrals: '',
    reward_amount: '',
    time_limit_hours: '',
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminBonusCampaigns();
      setCampaigns(Array.isArray(res.campaigns) ? res.campaigns : []);
    } catch {
      addToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!addForm.name || !addForm.required_referrals || !addForm.reward_amount || !addForm.time_limit_hours) {
      addToast('All fields are required', 'error');
      return;
    }
    try {
      await api.createAdminBonusCampaign({
        name: addForm.name,
        required_referrals: parseInt(addForm.required_referrals),
        reward_amount: parseFloat(addForm.reward_amount),
        time_limit_hours: parseInt(addForm.time_limit_hours),
      });
      addToast('Campaign created!', 'success');
      setShowAdd(false);
      setAddForm({ name: '', required_referrals: '', reward_amount: '', time_limit_hours: '' });
      loadCampaigns();
    } catch (err: any) {
      addToast(err.message || 'Failed to create campaign', 'error');
    }
  };

  const handleEdit = async (id: string) => {
    try {
      await api.updateAdminBonusCampaign(id, {
        name: editForm.name,
        required_referrals: parseInt(editForm.required_referrals),
        reward_amount: parseFloat(editForm.reward_amount),
        time_limit_hours: parseInt(editForm.time_limit_hours),
      });
      addToast('Campaign updated!', 'success');
      setEditingId(null);
      loadCampaigns();
    } catch (err: any) {
      addToast(err.message || 'Failed to update campaign', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign? All user progress will be lost.')) return;
    try {
      await api.deleteAdminBonusCampaign(id);
      addToast('Campaign deleted', 'success');
      loadCampaigns();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete campaign', 'error');
    }
  };

  const handleToggleActive = async (campaign: Campaign) => {
    try {
      await api.updateAdminBonusCampaign(campaign.id, { is_active: !campaign.is_active });
      addToast(`Campaign ${!campaign.is_active ? 'activated' : 'deactivated'}`, 'success');
      loadCampaigns();
    } catch (err: any) {
      addToast(err.message || 'Failed to toggle campaign', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-ev-blue/30 border-t-ev-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ev-text">Bonus Campaigns</h1>
          <p className="text-sm text-ev-muted mt-1">Manage referral bonus campaigns for users</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="ev-btn-primary flex items-center gap-2 text-sm px-4 py-2"
        >
          <Plus className="w-4 h-4" /> Add Campaign
        </button>
      </div>

      {/* Info */}
      <div className="ev-card p-4 border-ev-blue/20 bg-ev-blue/5">
        <p className="text-sm text-ev-text">
          <strong>How it works:</strong> When a user activates their account, they are auto-enrolled in all active campaigns. They must refer the required number of people within the time limit to unlock the reward. Once completed, they can claim the bonus.
        </p>
      </div>

      {/* Add Form */}
      {showAdd && (
        <motion.div className="ev-card p-5" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-sm font-bold text-ev-text mb-4">New Campaign</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ev-muted mb-1">Campaign Name</label>
              <input
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="e.g. DAY1, Oryndelux Bonus"
                className="ev-input w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-ev-muted mb-1">Required Referrals</label>
              <input
                type="number"
                value={addForm.required_referrals}
                onChange={(e) => setAddForm({ ...addForm, required_referrals: e.target.value })}
                placeholder="e.g. 13"
                className="ev-input w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-ev-muted mb-1">Reward Amount (Rs)</label>
              <input
                type="number"
                value={addForm.reward_amount}
                onChange={(e) => setAddForm({ ...addForm, reward_amount: e.target.value })}
                placeholder="e.g. 4000"
                className="ev-input w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-ev-muted mb-1">Time Limit (hours)</label>
              <input
                type="number"
                value={addForm.time_limit_hours}
                onChange={(e) => setAddForm({ ...addForm, time_limit_hours: e.target.value })}
                placeholder="e.g. 24"
                className="ev-input w-full px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="ev-btn-primary text-sm px-4 py-2">Create</button>
            <button onClick={() => setShowAdd(false)} className="ev-btn-secondary text-sm px-4 py-2">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <div className="ev-card p-10 text-center text-ev-muted">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No bonus campaigns yet</p>
          <p className="text-xs mt-1">Create one to motivate your users</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              className="ev-card p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {editingId === campaign.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="ev-input px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      value={editForm.required_referrals}
                      onChange={(e) => setEditForm({ ...editForm, required_referrals: e.target.value })}
                      className="ev-input px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      value={editForm.reward_amount}
                      onChange={(e) => setEditForm({ ...editForm, reward_amount: e.target.value })}
                      className="ev-input px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      value={editForm.time_limit_hours}
                      onChange={(e) => setEditForm({ ...editForm, time_limit_hours: e.target.value })}
                      className="ev-input px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(campaign.id)} className="ev-btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="ev-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${campaign.is_active ? 'bg-[#F59E0B]/10' : 'bg-ev-card-border'}`}>
                      <Trophy className={`w-5 h-5 ${campaign.is_active ? 'text-[#F59E0B]' : 'text-ev-muted'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-ev-text">{campaign.name}</h3>
                        <button
                          onClick={() => handleToggleActive(campaign)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            campaign.is_active
                              ? 'bg-[#10B981]/10 text-[#10B981]'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {campaign.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-ev-muted flex items-center gap-1">
                          <Users className="w-3 h-3" /> {campaign.required_referrals} referrals
                        </span>
                        <span className="text-[10px] text-[#10B981] font-semibold">
                          Rs {campaign.reward_amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-ev-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {campaign.time_limit_hours}h
                        </span>
                        {campaign._count && (
                          <span className="text-[10px] text-ev-blue flex items-center gap-1">
                            <Zap className="w-3 h-3" /> {campaign._count.user_campaigns} enrolled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(campaign.id);
                        setEditForm({
                          name: campaign.name,
                          required_referrals: campaign.required_referrals.toString(),
                          reward_amount: campaign.reward_amount.toString(),
                          time_limit_hours: campaign.time_limit_hours.toString(),
                        });
                      }}
                      className="text-ev-muted hover:text-ev-blue transition-colors p-1.5"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(campaign.id)}
                      className="text-ev-muted hover:text-red-500 transition-colors p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
