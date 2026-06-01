'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, MessageCircle } from 'lucide-react';
import { useSettingsStore, useAuthStore, useRouterStore } from '@/lib/stores';

const DISMISSED_KEY = 'ev_whatsapp_popup_dismissed';

export default function WhatsAppPopup() {
  const { settings } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const { page } = useRouterStore();

  const [show, setShow] = useState(false);

  useEffect(() => {
    const enabled = settings.whatsapp_enabled === 'true' || settings.whatsapp_enabled === '1';
    if (!enabled) return;
    if (!isAuthenticated) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [settings, isAuthenticated]);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  const handleAction = () => {
    const url = settings.whatsapp_link || settings.social_whatsapp || '';
    if (url) {
      window.open(url, '_blank');
    }
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
        >
          <motion.div
            className="w-full max-w-sm bg-[#FFFFFF] border border-[#EFF6FF] rounded-2xl p-5 relative"
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-7 h-7 bg-[#F0F7FF] rounded-full flex items-center justify-center text-[#64748B] hover:text-[#1E293B] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7 text-[#25D366]" />
              </div>

              <h3 className="text-lg font-bold text-[#1E293B] mb-2">
                {settings.whatsapp_title || 'Join Our Community'}
              </h3>

              <p className="text-sm text-[#64748B] mb-5">
                {settings.whatsapp_description || 'Stay updated with the latest news and exclusive offers!'}
              </p>

              <button
                onClick={handleAction}
                className="ev-btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm mb-3"
              >
                <Phone className="w-4 h-4" /> {settings.whatsapp_button_text || 'Join Now'}
              </button>

              <button
                onClick={handleDismiss}
                className="text-sm text-[#94A3B8] hover:text-[#64748B] transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
