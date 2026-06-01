'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useToastStore } from '@/lib/stores';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ListChecks,
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

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  reward_amount: number;
  question: string;
  correct_answer: string;
  link_url: string;
  proof_required: boolean;
  daily_limit: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const taskTypes = ['math', 'question', 'link_visit', 'custom', 'proof_upload'];

const emptyForm = {
  title: '',
  description: '',
  type: 'question',
  reward_amount: '',
  question: '',
  correct_answer: '',
  link_url: '',
  proof_required: false,
  daily_limit: '1',
  is_active: true,
  sort_order: '0',
};

export default function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminTasks();
      setTasks(Array.isArray(res.tasks) ? res.tasks : []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditId(task.id);
    setForm({
      title: task.title || '',
      description: task.description || '',
      type: task.type || 'question',
      reward_amount: String(task.reward_amount || ''),
      question: task.question || '',
      correct_answer: task.correct_answer || '',
      link_url: task.link_url || '',
      proof_required: task.proof_required || false,
      daily_limit: String(task.daily_limit || 1),
      is_active: task.is_active !== false,
      sort_order: String(task.sort_order || 0),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.reward_amount) {
      addToast('Title and reward amount are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        reward_amount: parseFloat(form.reward_amount),
        daily_limit: parseInt(form.daily_limit),
        sort_order: parseInt(form.sort_order),
      };
      if (editId) {
        await api.updateAdminTask(editId, data);
        addToast('Task updated', 'success');
      } else {
        await api.createAdminTask(data);
        addToast('Task created', 'success');
      }
      setDialogOpen(false);
      loadTasks();
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
      await api.deleteAdminTask(deleteId);
      addToast('Task deleted', 'success');
      setDeleteId(null);
      loadTasks();
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
          <h1 className="text-2xl font-bold text-ev-text">Tasks</h1>
          <p className="text-ev-muted text-sm mt-1">Manage platform tasks and rewards</p>
        </div>
        <button onClick={openCreateDialog} className="ev-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="ev-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ev-blue" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ev-muted">
            <ListChecks className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No tasks found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ev-card-border">
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Title</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Reward</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Active</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Sort</th>
                  <th className="text-left py-3 px-4 text-ev-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-ev-card-border hover:bg-ev-bg transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-ev-text font-medium">{task.title}</p>
                      <p className="text-ev-muted text-xs truncate max-w-[200px]">{task.description}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">
                        {task.type?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-ev-text font-medium">Rs. {task.reward_amount}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          task.is_active
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }
                      >
                        {task.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-ev-muted">{task.sort_order}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditDialog(task)}
                          className="p-1.5 rounded-lg hover:bg-ev-bg text-ev-muted hover:text-ev-blue transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(task.id)}
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
        <DialogContent className="bg-ev-card border-ev-card-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-ev-text">{editId ? 'Edit Task' : 'Create Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-ev-muted mb-1">Title *</label>
                <input
                  className="ev-input w-full px-4 py-2.5"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm text-ev-muted mb-1">Type *</label>
                <select
                  className="ev-input w-full px-4 py-2.5"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {taskTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-ev-muted mb-1">Reward Amount *</label>
                <input
                  type="number"
                  className="ev-input w-full px-4 py-2.5"
                  value={form.reward_amount}
                  onChange={(e) => setForm({ ...form, reward_amount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-ev-muted mb-1">Daily Limit</label>
                <input
                  type="number"
                  className="ev-input w-full px-4 py-2.5"
                  value={form.daily_limit}
                  onChange={(e) => setForm({ ...form, daily_limit: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-ev-muted mb-1">Sort Order</label>
                <input
                  type="number"
                  className="ev-input w-full px-4 py-2.5"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4 pt-5">
                <label className="flex items-center gap-2 text-sm text-ev-muted">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded accent-ev-blue"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-ev-muted">
                  <input
                    type="checkbox"
                    checked={form.proof_required}
                    onChange={(e) => setForm({ ...form, proof_required: e.target.checked })}
                    className="w-4 h-4 rounded accent-ev-blue"
                  />
                  Proof Required
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm text-ev-muted mb-1">Description</label>
              <textarea
                className="ev-input w-full px-4 py-2.5 min-h-[60px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Task description"
              />
            </div>
            {(form.type === 'question' || form.type === 'math') && (
              <>
                <div>
                  <label className="block text-sm text-ev-muted mb-1">Question</label>
                  <input
                    className="ev-input w-full px-4 py-2.5"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    placeholder="Enter question"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ev-muted mb-1">Correct Answer</label>
                  <input
                    className="ev-input w-full px-4 py-2.5"
                    value={form.correct_answer}
                    onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}
                    placeholder="Enter correct answer"
                  />
                </div>
              </>
            )}
            {form.type === 'link_visit' && (
              <div>
                <label className="block text-sm text-ev-muted mb-1">Link URL</label>
                <input
                  className="ev-input w-full px-4 py-2.5"
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            )}
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
            <DialogTitle className="text-ev-text">Delete Task</DialogTitle>
          </DialogHeader>
          <p className="text-ev-muted text-sm">Are you sure you want to delete this task? This action cannot be undone.</p>
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
