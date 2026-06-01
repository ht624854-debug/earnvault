'use client';

import { useEffect, useRef, useState } from 'react';
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
  Tag,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
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

// Parse "Title - Description" format from settings
function parseSettingField(value: string, defaultTitle: string, defaultDesc: string) {
  if (!value) return { title: defaultTitle, desc: defaultDesc };
  const parts = value.split(' - ');
  if (parts.length >= 2) {
    return { title: parts[0].trim(), desc: parts.slice(1).join(' - ').trim() };
  }
  return { title: value, desc: defaultDesc };
}

// Parse "Quote - Author" format from testimonial settings
function parseTestimonial(value: string) {
  if (!value) return null;
  const parts = value.split(' - ');
  if (parts.length >= 2) {
    return { text: parts[0].trim(), name: parts[parts.length - 1].trim() };
  }
  return { text: value, name: 'Member' };
}

const FAKE_TRANSACTIONS = [
  { name: 'Sara M.', action: 'earned', amount: 350, method: 'Task Reward', type: 'earn' },
  { name: 'Usman A.', action: 'withdrew', amount: 8000, method: 'JazzCash', type: 'withdraw' },
  { name: 'Fatima R.', action: 'earned', amount: 200, method: 'Referral Bonus', type: 'earn' },
  { name: 'Ahmed K.', action: 'withdrew', amount: 5200, method: 'Easypaisa', type: 'withdraw' },
  { name: 'Ayesha B.', action: 'earned', amount: 150, method: 'Daily Code', type: 'earn' },
  { name: 'Bilal S.', action: 'withdrew', amount: 6500, method: 'Easypaisa', type: 'withdraw' },
  { name: 'Zainab K.', action: 'earned', amount: 500, method: 'Task Reward', type: 'earn' },
  { name: 'Ali H.', action: 'withdrew', amount: 3100, method: 'Bank Transfer', type: 'withdraw' },
  { name: 'Maryam T.', action: 'earned', amount: 300, method: 'Referral Bonus', type: 'earn' },
  { name: 'Omar F.', action: 'withdrew', amount: 9500, method: 'SadaPay', type: 'withdraw' },
  { name: 'Iqra J.', action: 'earned', amount: 100, method: 'Daily Code', type: 'earn' },
  { name: 'Hassan N.', action: 'withdrew', amount: 4200, method: 'JazzCash', type: 'withdraw' },
  { name: 'Nida L.', action: 'earned', amount: 750, method: 'Task Reward', type: 'earn' },
  { name: 'Danish P.', action: 'withdrew', amount: 2800, method: 'Easypaisa', type: 'withdraw' },
  { name: 'Hira W.', action: 'earned', amount: 200, method: 'Referral Bonus', type: 'earn' },
  { name: 'Kamran V.', action: 'withdrew', amount: 11000, method: 'Bank Transfer', type: 'withdraw' },
  { name: 'Sana E.', action: 'earned', amount: 450, method: 'Task Reward', type: 'earn' },
  { name: 'Rizwan Q.', action: 'withdrew', amount: 5600, method: 'JazzCash', type: 'withdraw' },
  { name: 'Amna C.', action: 'earned', amount: 180, method: 'Daily Code', type: 'earn' },
  { name: 'Tahir G.', action: 'withdrew', amount: 7300, method: 'Easypaisa', type: 'withdraw' },
];

function LiveTransactionsFeed() {
  const [visibleItems, setVisibleItems] = useState(() =>
    Array.from({ length: 4 }, (_, i) => ({
      ...FAKE_TRANSACTIONS[i % FAKE_TRANSACTIONS.length],
      id: i,
    }))
  );

  useEffect(() => {
    let counter = 4;
    const interval = setInterval(() => {
      counter++;
      const nextIdx = (counter - 1) % FAKE_TRANSACTIONS.length;
      setVisibleItems((old) => [
        ...old.slice(1),
        { ...FAKE_TRANSACTIONS[nextIdx], id: counter },
      ]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-3 justify-center">
        <TrendingUp className="w-4 h-4 text-[#10B981]" />
        <p className="text-sm font-semibold text-[#10B981]">Live Transactions</p>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
        </span>
      </div>
      <div className="space-y-2 overflow-hidden" style={{ height: '160px' }}>
        {visibleItems.map((item) => (
          <motion.div
            key={item.id}
            className="flex items-center gap-3 bg-ev-card/80 backdrop-blur-sm border border-ev-card-border rounded-xl px-3 py-2.5"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'earn' ? 'bg-[#10B981]/10' : 'bg-ev-blue/10'}`}>
              {item.type === 'earn' ? (
                <ArrowDownRight className="w-4 h-4 text-[#10B981]" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-ev-blue" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ev-text truncate">
                <span className="font-semibold">{item.name}</span>{' '}
                <span className="text-ev-muted">{item.action}</span>
              </p>
              <p className="text-[10px] text-ev-muted">{item.method}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-xs font-bold ${item.type === 'earn' ? 'text-[#10B981]' : 'text-ev-blue'}`}>
                {item.type === 'earn' ? '+' : '-'}Rs {item.amount.toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

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

  const feature1 = parseSettingField(settings.why_choose_1, 'Task Based Earning', 'Complete simple tasks and earn real money instantly.');
  const feature2 = parseSettingField(settings.why_choose_2, 'Referral Rewards', 'Invite friends and earn commission on their activities.');
  const feature3 = parseSettingField(settings.why_choose_3, 'Secure Withdrawals', 'Withdraw your earnings safely to your bank account.');
  const feature4 = parseSettingField(settings.why_choose_4, 'Instant Activation', 'Get started in minutes with quick account activation.');

  const features = [
    { icon: Target, ...feature1 },
    { icon: Share2, ...feature2 },
    { icon: Lock, ...feature3 },
    { icon: Rocket, ...feature4 },
  ];

  const testimonials = [
    parseTestimonial(settings.testimonial_1),
    parseTestimonial(settings.testimonial_2),
    parseTestimonial(settings.testimonial_3),
  ].filter(Boolean) as { text: string; name: string }[];

  const socialLinks = [
    { icon: Phone, label: 'WhatsApp', url: settings.support_whatsapp || settings.social_whatsapp || '' },
    { icon: Instagram, label: 'Instagram', url: settings.social_instagram || '' },
    { icon: Youtube, label: 'YouTube', url: settings.social_youtube || '' },
    { icon: MessageCircle, label: 'Facebook', url: settings.social_facebook || '' },
  ].filter((s) => s.url);

  const paymentMethods = (settings.payment_methods_display || 'Easypaisa,JazzCash,SadaPay,NayaPay,Bank Transfer')
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);

  const offerEnabled = settings.offer_enabled === 'true';
  const offerDiscount = settings.offer_discount || '0';
  const offerTitle = settings.offer_title || '';
  const offerDescription = settings.offer_description || '';
  const activationFee = settings.activation_fee || '1500';
  const hasOffer = offerEnabled && offerDiscount && parseFloat(offerDiscount) > 0;
  const finalFee = hasOffer ? Math.max(0, parseFloat(activationFee) - parseFloat(offerDiscount)).toString() : activationFee;

  return (
    <div className="min-h-screen bg-ev-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ev-bg/80 backdrop-blur-xl border-b border-ev-card-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 ev-gradient-red rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-ev-text">{brandName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('login')}
              className="text-sm text-ev-muted hover:text-ev-text transition-colors px-3 py-2"
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

      {/* Offer Banner */}
      {hasOffer && (
        <div className="bg-gradient-to-r from-[#F59E0B]/10 via-[#F59E0B]/5 to-transparent border-b border-[#F59E0B]/20">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
            <span className="text-sm font-medium text-[#F59E0B]">
              {offerTitle || 'Special Offer!'} — Activate for just Rs. {finalFee}
            </span>
            <span className="bg-[#10B981]/10 text-[#10B981] text-xs font-medium px-2 py-0.5 rounded-full">
              Save Rs. {offerDiscount}
            </span>
            <Tag className="w-4 h-4 text-[#F59E0B]" />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ev-blue/5 to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-ev-blue/5 rounded-full blur-[120px]" />
        <motion.div
          className="relative max-w-6xl mx-auto px-4 pt-16 pb-12 text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 bg-ev-card border border-ev-card-border rounded-full px-4 py-1.5 text-sm text-ev-blue">
              <Zap className="w-3.5 h-3.5" />
              Start Earning Today
            </span>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-ev-text leading-tight mb-6"
          >
            {headline}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-ev-muted text-base sm:text-lg max-w-2xl mx-auto mb-8"
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

          {/* Live Transactions Feed - right in the hero section */}
          <motion.div variants={fadeInUp} className="mt-10">
            <LiveTransactionsFeed />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-ev-card-border">
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
              <stat.icon className="w-8 h-8 text-ev-blue mx-auto mb-3" />
              <p className="text-xl font-bold text-ev-text">{stat.value}</p>
              <p className="text-sm text-ev-muted">{stat.label}</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-ev-text mb-3">Why Choose {brandName}?</h2>
            <p className="text-ev-muted">Everything you need to start earning online</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="ev-card p-6 hover:border-ev-blue/30 transition-colors group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 ev-gradient-red rounded-xl flex items-center justify-center mb-4 transition-all">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-ev-text mb-2">{feature.title}</h3>
                <p className="text-sm text-ev-muted">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-ev-bg">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-ev-text mb-3">What Our Members Say</h2>
              <p className="text-ev-muted">Real stories from real earners</p>
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
                      <Star key={si} className="w-4 h-4 text-ev-blue fill-ev-blue" />
                    ))}
                  </div>
                  <p className="text-ev-muted text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 ev-gradient-red rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <span className="text-ev-text font-medium">{t.name}</span>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-ev-text mb-3">Supported Payment Methods</h2>
            <p className="text-ev-muted">Withdraw your earnings with ease</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {paymentMethods.map((name, i) => (
              <motion.div
                key={i}
                className="ev-card p-5 text-center hover:border-ev-blue/30 transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 ev-gradient-red rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-xs">
                  {name.charAt(0)}
                </div>
                <p className="text-ev-text font-medium text-sm">{name}</p>
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
              <h2 className="text-2xl sm:text-3xl font-bold text-ev-text mb-4">Ready to Start Earning?</h2>
              <p className="text-ev-muted mb-4 max-w-lg mx-auto">
                Join {brandName} today and start earning real money by completing simple tasks. Registration is free!
              </p>
              <div className="mb-8 flex items-center justify-center gap-2">
                <span className="text-ev-muted text-sm">Activation Fee:</span>
                {hasOffer ? (
                  <>
                    <span className="text-ev-muted line-through text-sm">Rs. {activationFee}</span>
                    <span className="text-[#10B981] font-bold text-lg">Rs. {finalFee}</span>
                    <span className="bg-[#10B981]/10 text-[#10B981] text-xs font-medium px-2 py-0.5 rounded-full">Save Rs. {offerDiscount}</span>
                  </>
                ) : (
                  <span className="text-ev-text font-bold text-lg">Rs. {activationFee}</span>
                )}
              </div>
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
      <footer className="border-t border-ev-card-border py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 ev-gradient-red rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-ev-text">{brandName}</span>
            </div>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-ev-card border border-ev-card-border rounded-lg flex items-center justify-center text-ev-muted hover:text-ev-blue hover:border-ev-blue/30 transition-all"
                    aria-label={s.label}
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
            <p className="text-sm text-ev-muted">
              &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
