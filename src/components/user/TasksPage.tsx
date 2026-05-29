'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Calculator,
  HelpCircle,
  Link2,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Inbox,
  Lock,
  ChevronRight,
  X,
  ImageIcon,
} from 'lucide-react';
import { useAuthStore, useRouterStore, useToastStore } from '@/lib/stores';
import { api } from '@/lib/api-client';

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
}

interface Submission {
  id: string;
  task_id: string;
  answer: string;
  proof_image: string;
  status: string;
  reward_amount: number;
  created_at: string;
  task: { title: string; type: string };
}

export default function TasksPage() {
  const { user } = useAuthStore();
  const { navigate } = useRouterStore();
  const { addToast } = useToastStore();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [answer, setAnswer] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<'available' | 'submissions'>('available');

  useEffect(() => {
    const load = async () => {
      try {
        const [tasksRes, subsRes] = await Promise.all([api.getTasks(), api.getTaskSubmissions()]);
        setTasks(tasksRes.tasks || tasksRes || []);
        setSubmissions(subsRes.submissions || subsRes || []);
      } catch {
        addToast('Failed to load tasks', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const taskTypeIcon = (type: string) => {
    switch (type) {
      case 'math':
        return Calculator;
      case 'question':
        return HelpCircle;
      case 'link_visit':
        return Link2;
      case 'proof_upload':
        return Upload;
      default:
        return FileText;
    }
  };

  const taskTypeLabel = (type: string) => {
    switch (type) {
      case 'math':
        return 'Math';
      case 'question':
        return 'Question';
      case 'link_visit':
        return 'Link Visit';
      case 'proof_upload':
        return 'Proof Upload';
      default:
        return 'Task';
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 text-[#10B981] text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[#DC2626] text-xs font-medium">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[#F59E0B] text-xs font-medium">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  const handleSubmit = async () => {
    if (!activeTask) return;

    if (activeTask.type !== 'link_visit' && !answer.trim() && !proofImage) {
      addToast('Please provide an answer or proof', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let proofUrl = '';
      if (proofImage) {
        const uploadRes = await api.uploadFile(proofImage);
        proofUrl = uploadRes.url;
      }

      await api.submitTask(activeTask.id, {
        answer: answer || undefined,
        proof_image: proofUrl || undefined,
      });

      addToast('Task submitted successfully!', 'success');
      setActiveTask(null);
      setAnswer('');
      setProofImage(null);
      setProofPreview('');

      const subsRes = await api.getTaskSubmissions();
      setSubmissions(subsRes.submissions || subsRes || []);
    } catch (err: any) {
      addToast(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isInactive = user?.package_status !== 'Active';

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
          <h1 className="text-lg font-bold text-[#F5F5F5]">Tasks</h1>
          <p className="text-xs text-[#737373] mt-0.5">Complete tasks and earn rewards</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Inactive Banner */}
        {isInactive && (
          <motion.div
            className="ev-card p-4 flex items-center gap-3 border-[#F59E0B]/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Lock className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[#F5F5F5]">Activate your account to start earning</p>
            </div>
            <button
              onClick={() => navigate('activation')}
              className="ev-btn-primary text-xs px-3 py-1.5 flex-shrink-0"
            >
              Activate
            </button>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-[#141414] border border-[#1F1F1F] rounded-lg p-1">
          <button
            onClick={() => setTab('available')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              tab === 'available' ? 'ev-gradient-red text-white' : 'text-[#737373] hover:text-[#F5F5F5]'
            }`}
          >
            Available Tasks
          </button>
          <button
            onClick={() => setTab('submissions')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              tab === 'submissions' ? 'ev-gradient-red text-white' : 'text-[#737373] hover:text-[#F5F5F5]'
            }`}
          >
            My Submissions
          </button>
        </div>

        {tab === 'available' && (
          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task, i) => {
                const Icon = taskTypeIcon(task.type);
                const existingSub = submissions.find(
                  (s) => s.task_id === task.id && s.status === 'Pending'
                );
                return (
                  <motion.div
                    key={task.id}
                    className="ev-card p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#DC2626]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#DC2626]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-[#F5F5F5] truncate">{task.title}</h3>
                          <span className="text-[10px] bg-[#1A1A1A] text-[#737373] px-2 py-0.5 rounded-full">
                            {taskTypeLabel(task.type)}
                          </span>
                        </div>
                        <p className="text-xs text-[#737373] line-clamp-2 mb-3">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#10B981]">Rs. {task.reward_amount}</span>
                          {existingSub ? (
                            <span className="text-xs text-[#F59E0B] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                if (isInactive) {
                                  navigate('activation');
                                  return;
                                }
                                setActiveTask(task);
                              }}
                              className="ev-btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                            >
                              Start <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-[#737373]">
                <Inbox className="w-12 h-12 mb-3" />
                <p className="text-sm">No tasks available right now</p>
                <p className="text-xs mt-1">Check back later for new tasks</p>
              </div>
            )}
          </div>
        )}

        {tab === 'submissions' && (
          <div className="space-y-3">
            {submissions.length > 0 ? (
              submissions.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  className="ev-card p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#F5F5F5] font-medium">{sub.task?.title || 'Task'}</p>
                      <p className="text-xs text-[#737373] mt-0.5">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#10B981]">Rs. {sub.reward_amount}</p>
                      <div className="mt-0.5">{statusBadge(sub.status)}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-[#737373]">
                <Inbox className="w-12 h-12 mb-3" />
                <p className="text-sm">No submissions yet</p>
                <p className="text-xs mt-1">Start a task to see your submissions here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Submission Modal */}
      <AnimatePresence>
        {activeTask && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveTask(null)}
          >
            <motion.div
              className="w-full max-w-md bg-[#141414] border border-[#1F1F1F] rounded-t-2xl sm:rounded-2xl p-5"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#F5F5F5]">{activeTask.title}</h3>
                <button onClick={() => setActiveTask(null)} className="text-[#737373] hover:text-[#F5F5F5]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-[#737373] mb-4">{activeTask.description}</p>

              {(activeTask.type === 'question' || activeTask.type === 'math') && activeTask.question && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#737373] mb-1.5">Question</label>
                  <div className="ev-card p-3 text-sm text-[#F5F5F5]">{activeTask.question}</div>
                </div>
              )}

              {activeTask.type === 'link_visit' && activeTask.link_url && (
                <div className="mb-4">
                  <a
                    href={activeTask.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ev-btn-secondary text-sm flex items-center justify-center gap-2 w-full"
                  >
                    <Link2 className="w-4 h-4" /> Visit Link
                  </a>
                </div>
              )}

              {(activeTask.type === 'question' || activeTask.type === 'math' || activeTask.type === 'link_visit' || activeTask.type === 'custom') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#737373] mb-1.5">Your Answer</label>
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    className="ev-input w-full px-4 py-2.5 text-sm"
                  />
                </div>
              )}

              {(activeTask.proof_required || activeTask.type === 'proof_upload') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#737373] mb-1.5">Upload Proof</label>
                  {proofPreview && (
                    <div className="relative mb-2">
                      <img
                        src={proofPreview}
                        alt="Proof preview"
                        className="w-full h-32 object-cover rounded-lg border border-[#1F1F1F]"
                      />
                      <button
                        onClick={() => {
                          setProofImage(null);
                          setProofPreview('');
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="ev-btn-secondary flex items-center justify-center gap-2 w-full py-2.5 cursor-pointer text-sm">
                    <ImageIcon className="w-4 h-4" /> Choose Image
                    <input type="file" accept="image/*" onChange={handleProofChange} className="hidden" />
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[#737373]">Reward:</span>
                <span className="text-sm font-bold text-[#10B981]">Rs. {activeTask.reward_amount}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="ev-btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Submit Task'
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
