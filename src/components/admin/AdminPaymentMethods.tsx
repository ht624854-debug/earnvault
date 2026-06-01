'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useToastStore } from '@/lib/stores';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CreditCard,
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

interface PaymentMethod {
  id: string;
  name: string;
  account_title: string;
  account_number: string;
  instructions: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

const emptyForm = {
  name: '',
  account_title: '',
  account_number: '',
  instructions: '',
  icon: '',
  is_active: true,
  sort_order: '0',
};

export default function AdminPaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminPaymentMethods();
      setMethods(Array.isArray(res.paymentMethods) ? res.paymentMethods : []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load payment methods', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (method: PaymentMethod) => {
    setEditId(method.id);
    setForm({
      name: method.name || '',
      account_title: method.account_title || '',
      account_number: method.account_number || '',
      instructions: method.instructions || '',
      icon: method.icon || '',
      is_active: method.is_active !== false,
      sort_order: String(method.sort_order || 0),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.account_title || !form.account_number) {
      addToast('Name, account title, and account number are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        sort_order: parseInt(form.sort_order),
      };
      if (editId) {
        await api.updateAdminPaymentMethod(editId, data);
        addToast('Payment method updated', 'success');
      } else {
        await api.createAdminPaymentMethod(data);
        addToast('Payment method created', 'success');
      }
      setDialogOpen(false);
      loadMethods();
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
      await api.deleteAdminPaymentMethod(deleteId);
      addToast('Payment method deleted', 'success');
      setDeleteId(null);
      loadMethods();
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
          <h1 className="text-2xl font-bold text-ev-text">Payment Methods</h1>
          <p className="text-ev-muted text-sm mt-1">Manage deposit payment methods</p>
        </div>
        <button onClick={openCreateDialog} className="ev-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Method
        </button>
      </div>

      {/* List */}
      <div className="ev-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ev-blue" />
          </div>
        ) : methods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ev-muted">
            <CreditCard className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No payment methods found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ev-card-border">
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Icon</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Account Title</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Account Number</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Sort</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {methods.map((method) => (
                  <tr key={method.id} className="border-b border-ev-card-border hover:bg-ev-bg transition-colors">
                    <td className="py-3 px-4 text-lg">{method.icon || '💳'}</td>
                    <td className="py-3 px-4 text-ev-text font-medium">{method.name}</td>
                    <td className="py-3 px-4 text-ev-muted">{method.account_title}</td>
                    <td className="py-3 px-4 text-ev-muted font-mono text-xs">{method.account_number}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          method.is_active
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }
                      >
                        {method.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-ev-muted">{method.sort_order}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditDialog(method)}
                          className="p-1.5 rounded-lg hover:bg-ev-bg text-ev-muted hover:text-ev-blue transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(method.id)}
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
            <DialogTitle className="text-ev-text">{editId ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-ev-muted mb-1">Name *</label>
                <input
                  className="ev-input w-full px-4 py-2.5"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. JazzCash"
                />
              </div>
              <div>
                <label className="block text-sm text-ev-muted mb-1">Icon (Emoji)</label>
                <input
                  className="ev-input w-full px-4 py-2.5"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="💳"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-ev-muted mb-1">Account Title *</label>
              <input
                className="ev-input w-full px-4 py-2.5"
                value={form.account_title}
                onChange={(e) => setForm({ ...form, account_title: e.target.value })}
                placeholder="Account holder name"
              />
            </div>
            <div>
              <label className="block text-sm text-ev-muted mb-1">Account Number *</label>
              <input
                className="ev-input w-full px-4 py-2.5"
                value={form.account_number}
                onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                placeholder="03001234567"
              />
            </div>
            <div>
              <label className="block text-sm text-ev-muted mb-1">Instructions</label>
              <textarea
                className="ev-input w-full px-4 py-2.5 min-h-[60px]"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="Payment instructions for users"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-ev-muted mb-1">Sort Order</label>
                <input
                  type="number"
                  className="ev-input w-full px-4 py-2.5"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-ev-muted">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded accent-ev-blue"
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
        <DialogContent className="bg-ev-card border-ev-card-border">
          <DialogHeader>
            <DialogTitle className="text-ev-text">Delete Payment Method</DialogTitle>
          </DialogHeader>
          <p className="text-ev-muted text-sm">Are you sure you want to delete this payment method?</p>
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
