'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Zap,
  Clock,
  Target,
  Share2,
  Lock,
  Rocket,
  MessageCircle,
  DollarSign,
  Star,
  ChevronRight,
  Instagram,
  Youtube,
  Send,
  Phone,
} from 'lucide-react';
import { useSettingsStore, useRouterStore, useAuthStore } from '@/lib/stores';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const { settings, loadSettings } = useSettingsStore();
  const { navigate } = useRouterStore();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    loadSettings();
    checkAuth();
  }, [loadSettings, checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('dashboard');
    }
  }, [isAuthenticated, navigate]);

  const brandName = settings.brand_name || 'EarnVault';
  const headline = settings.hero_title || 'Earn Real Rewards By Completing Simple Tasks';
  const subheadline = settings.hero_subtitle || 'Join thousands of members earning daily income through tasks, referrals, and rewards on our secure platform.';

  const stats = [
    { icon: Users, label: 'Active Members', value: settings.stat_active_members || '0' },
    { icon: Clock, label: '24/7 Support', value: settings.stat_support || '24/7' },
    { icon: Zap, label: 'Fast Withdrawals', value: settings.stat_withdrawals || 'Fast' },
    { icon: Shield, label: 'Secure Platform', value: settings.stat_security || 'Secure' },
  ];

  const features = [
    { icon: Target, title: settings.why_choose_1_title || 'Task Based Earning', desc: settings.why_choose_1_desc || 'Complete simple tasks and earn real money instantly.' },
    { icon: Share2, title: settings.why_choose_2_title || 'Referral Rewards', desc: settings.why_choose_2_desc || 'Invite friends and earn commission on their activities.' },
    { icon: Lock, title: settings.why_choose_3_title || 'Secure Withdrawals', desc: settings.why_choose_3_desc || 'Withdraw your earnings safely to your bank account.' },
    { icon: Rocket, title: settings.why_choose_4_title || 'Instant Activation', desc: settings.why_choose_4_desc || 'Get started in minutes with quick account activation.' },
  ];

  const testimonials = [
    { name: settings.testimonial_1_name || '', text: settings.testimonial_1_text || '' },
    { name: settings.testimonial_2_name || '', text: settings.testimonial_2_text || '' },
    { name: settings.testimonial_3_name || '', text: settings.testimonial_3_text || '' },
  ].filter((t) => t.name && t.text);

  const socialLinks = [
    { icon: Phone, label: 'WhatsApp', url: settings.social_whatsapp || '' },
    { icon: Send, label: 'Telegram', url: settings.social_telegram || '' },
    { icon: Instagram, label: 'Instagram', url: settings.social_instagram || '' },
    { icon: Youtube, label: 'YouTube', url: settings.social_youtube || '' },
    { icon: MessageCircle, label: 'Facebook', url: settings.social_facebook || '' },
  ].filter((s) => s.url);

  const paymentMethods = (settings.payment_methods_display || 'Easypaisa,JazzCash,SadaPay,NayaPay,Bank Transfer')
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#1F1F1F]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 ev-gradient-red rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#F5F5F5]">{brandName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('login')}
              className="text-sm text-[#737373] hover:text-[#F5F5F5] transition-colors px-3 py-2"
            >
              Login
            </button>
            <button
              onClick={() => navigate('register')}
              className="ev-btn-primary text-sm px-4 py-2"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#DC2626]/5 to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#DC2626]/5 rounded-full blur-[120px]" />
        <motion.div
          className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 bg-[#141414] border border-[#1F1F1F] rounded-full px-4 py-1.5 text-sm text-[#DC2626]">
              <Zap className="w-3.5 h-3.5" />
              Start Earning Today
            </span>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#F5F5F5] leading-tight mb-6"
          >
            {headline}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-[#737373] text-base sm:text-lg max-w-2xl mx-auto mb-10"
          >
            {subheadline}
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('register')}
              className="ev-btn-primary text-lg px-8 py-3.5 flex items-center justify-center gap-2"
            >
              Get Started Free <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('login')}
              className="ev-btn-secondary text-lg px-8 py-3.5"
            >
              Sign In
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-[#1F1F1F]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="ev-card p-5 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <stat.icon className="w-8 h-8 text-[#DC2626] mx-auto mb-3" />
              <p className="text-xl font-bold text-[#F5F5F5]">{stat.value}</p>
              <p className="text-sm text-[#737373]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-3">Why Choose {brandName}?</h2>
            <p className="text-[#737373]">Everything you need to start earning online</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="ev-card p-6 hover:border-[#DC2626]/30 transition-colors group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 ev-gradient-red rounded-xl flex items-center justify-center mb-4 transition-all">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#737373]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-[#0D0D0D]">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-3">What Our Members Say</h2>
              <p className="text-[#737373]">Real stories from real earners</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  className="ev-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} className="w-4 h-4 text-[#DC2626] fill-[#DC2626]" />
                    ))}
                  </div>
                  <p className="text-[#737373] text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 ev-gradient-red rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <span className="text-[#F5F5F5] font-medium">{t.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Payment Methods */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-3">Supported Payment Methods</h2>
            <p className="text-[#737373]">Withdraw your earnings with ease</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {paymentMethods.map((name, i) => (
              <motion.div
                key={i}
                className="ev-card p-5 text-center hover:border-[#DC2626]/30 transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 ev-gradient-red rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-xs">
                  {name.charAt(0)}
                </div>
                <p className="text-[#F5F5F5] font-medium text-sm">{name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            className="ev-card p-8 sm:p-12 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 ev-gradient-red opacity-5" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-4">Ready to Start Earning?</h2>
              <p className="text-[#737373] mb-8 max-w-lg mx-auto">
                Join {brandName} today and start earning real money by completing simple tasks. Registration is free!
              </p>
              <button
                onClick={() => navigate('register')}
                className="ev-btn-primary text-lg px-8 py-3.5 inline-flex items-center gap-2"
              >
                Create Free Account <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F1F1F] py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 ev-gradient-red rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-[#F5F5F5]">{brandName}</span>
            </div>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#141414] border border-[#1F1F1F] rounded-lg flex items-center justify-center text-[#737373] hover:text-[#DC2626] hover:border-[#DC2626]/30 transition-all"
                    aria-label={s.label}
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
            <p className="text-sm text-[#737373]">
              &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
