'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/lib/stores';

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-[#10B981]/10',
    border: 'border-[#10B981]/30',
    icon: 'text-[#10B981]',
  },
  error: {
    bg: 'bg-[#2563EB]/10',
    border: 'border-[#2563EB]/30',
    icon: 'text-[#2563EB]',
  },
  info: {
    bg: 'bg-[#3B82F6]/10',
    border: 'border-[#3B82F6]/30',
    icon: 'text-[#3B82F6]',
  },
};

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          const colors = colorMap[toast.type];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`pointer-events-auto ${colors.bg} border ${colors.border} backdrop-blur-xl rounded-xl p-4 flex items-start gap-3`}
            >
              <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
              <p className="text-sm text-[#1E293B] flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#94A3B8] hover:text-[#1E293B] transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
