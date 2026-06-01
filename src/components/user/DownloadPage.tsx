'use client';

import { motion } from 'framer-motion';
import { Download, Rocket, Smartphone } from 'lucide-react';
import { useSettingsStore } from '@/lib/stores';

export default function DownloadPage() {
  const { settings } = useSettingsStore();
  const downloadLink = settings.download_link;
  const brandName = settings.brand_name || 'EarnVault';

  return (
    <div className="min-h-screen bg-ev-bg pb-24">
      {/* Header */}
      <div className="bg-ev-bg border-b border-ev-card-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-ev-text">Download App</h1>
          <p className="text-xs text-ev-muted mt-0.5">Get the {brandName} app</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {downloadLink ? (
          <motion.div
            className="ev-card p-8 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute inset-0 ev-gradient-red opacity-5" />
            <div className="relative z-10">
              <div className="w-16 h-16 ev-gradient-red rounded-2xl flex items-center justify-center mx-auto mb-6 ev-glow-red">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-ev-text mb-2">{brandName} App</h2>
              <p className="text-sm text-ev-muted mb-6">
                Download our app for the best experience
              </p>
              <a
                href={downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ev-btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5"
              >
                <Download className="w-5 h-5" /> Download Now
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="ev-card p-8 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-ev-bg rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-8 h-8 text-ev-muted" />
              </div>
              <h2 className="text-xl font-bold text-ev-text mb-2">Coming Soon</h2>
              <p className="text-sm text-ev-muted mb-6">
                Our mobile app is under development. Stay tuned!
              </p>

              {/* Animated dots */}
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-ev-blue rounded-full"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
