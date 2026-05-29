'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useToastStore } from '@/lib/stores';
import {
  Save,
  Loader2,
  Settings,
  Palette,
  Layout,
  BarChart3,
  Star,
  MessageSquare,
  MessageCircle,
  DollarSign,
  Phone,
  Globe,
} from 'lucide-react';

interface SettingsSection {
  key: string;
  label: string;
  icon: React.ReactNode;
  fields: SettingsField[];
}

interface SettingsField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean';
  placeholder?: string;
}

const sections: SettingsSection[] = [
  {
    key: 'brand',
    label: 'Brand',
    icon: <Palette className="w-4 h-4" />,
    fields: [
      { key: 'brand_name', label: 'Brand Name', type: 'text', placeholder: 'EarnVault' },
      { key: 'logo_url', label: 'Logo URL', type: 'text', placeholder: '/logo.svg' },
    ],
  },
  {
    key: 'hero',
    label: 'Hero Section',
    icon: <Layout className="w-4 h-4" />,
    fields: [
      { key: 'hero_title', label: 'Hero Title', type: 'text', placeholder: 'Earn Money Online' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', placeholder: 'Start earning today...' },
      { key: 'register_button_text', label: 'Register Button Text', type: 'text', placeholder: 'Get Started' },
      { key: 'login_button_text', label: 'Login Button Text', type: 'text', placeholder: 'Sign In' },
    ],
  },
  {
    key: 'stats',
    label: 'Stats Section',
    icon: <BarChart3 className="w-4 h-4" />,
    fields: [
      { key: 'stat_active_members', label: 'Active Members Text', type: 'text' },
      { key: 'stat_support', label: 'Support Text', type: 'text' },
      { key: 'stat_withdrawals', label: 'Withdrawals Text', type: 'text' },
      { key: 'stat_security', label: 'Security Text', type: 'text' },
    ],
  },
  {
    key: 'why_choose',
    label: 'Why Choose',
    icon: <Star className="w-4 h-4" />,
    fields: [
      { key: 'why_choose_1', label: 'Reason 1', type: 'text' },
      { key: 'why_choose_2', label: 'Reason 2', type: 'text' },
      { key: 'why_choose_3', label: 'Reason 3', type: 'text' },
      { key: 'why_choose_4', label: 'Reason 4', type: 'text' },
    ],
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    icon: <MessageSquare className="w-4 h-4" />,
    fields: [
      { key: 'testimonial_1', label: 'Testimonial 1', type: 'textarea' },
      { key: 'testimonial_2', label: 'Testimonial 2', type: 'textarea' },
      { key: 'testimonial_3', label: 'Testimonial 3', type: 'textarea' },
    ],
  },
  {
    key: 'footer',
    label: 'Footer',
    icon: <Globe className="w-4 h-4" />,
    fields: [
      { key: 'footer_text', label: 'Footer Text', type: 'text' },
      { key: 'social_facebook', label: 'Facebook URL', type: 'text' },
      { key: 'social_twitter', label: 'Twitter URL', type: 'text' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'text' },
      { key: 'social_youtube', label: 'YouTube URL', type: 'text' },
    ],
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp Popup',
    icon: <MessageCircle className="w-4 h-4" />,
    fields: [
      { key: 'whatsapp_enabled', label: 'Enabled', type: 'boolean' },
      { key: 'whatsapp_title', label: 'Popup Title', type: 'text' },
      { key: 'whatsapp_description', label: 'Popup Description', type: 'textarea' },
      { key: 'whatsapp_link', label: 'WhatsApp Link', type: 'text' },
      { key: 'whatsapp_button_text', label: 'Button Text', type: 'text' },
    ],
  },
  {
    key: 'financial',
    label: 'Financial',
    icon: <DollarSign className="w-4 h-4" />,
    fields: [
      { key: 'activation_fee', label: 'Activation Fee', type: 'number', placeholder: '500' },
      { key: 'min_withdrawal', label: 'Minimum Withdrawal', type: 'number', placeholder: '200' },
      { key: 'referral_reward', label: 'Referral Reward', type: 'number', placeholder: '100' },
      { key: 'referral_reward_on_activation', label: 'Referral Reward on Activation', type: 'number', placeholder: '50' },
    ],
  },
  {
    key: 'other',
    label: 'Other',
    icon: <Phone className="w-4 h-4" />,
    fields: [
      { key: 'support_whatsapp', label: 'Support WhatsApp', type: 'text' },
      { key: 'download_link', label: 'Download Link', type: 'text' },
      { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'boolean' },
      { key: 'developer_credit', label: 'Developer Credit', type: 'text' },
      { key: 'payment_methods_display', label: 'Payment Methods Display', type: 'textarea' },
    ],
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminSettings();
      setSettings(res.settings || {});
    } catch (err: any) {
      addToast(err.message || 'Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateAdminSettings(settings);
      addToast('Settings saved successfully', 'success');
    } catch (err: any) {
      addToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#DC2626]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Settings</h1>
          <p className="text-[#737373] text-sm mt-1">Manage platform settings</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="ev-btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.key} className="ev-card p-6">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4 flex items-center gap-2">
              <span className="text-[#DC2626]">{section.icon}</span>
              {section.label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm text-[#A3A3A3] mb-1">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="ev-input w-full px-4 py-2.5 min-h-[60px]"
                      value={settings[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'boolean' ? (
                    <label className="flex items-center gap-3 py-2.5">
                      <div
                        className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
                          settings[field.key] === 'true' ? 'bg-[#DC2626]' : 'bg-[#262626]'
                        }`}
                        onClick={() => handleChange(field.key, settings[field.key] === 'true' ? 'false' : 'true')}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            settings[field.key] === 'true' ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                      <span className="text-sm text-[#A3A3A3]">
                        {settings[field.key] === 'true' ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      className="ev-input w-full px-4 py-2.5"
                      value={settings[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky save button on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#0A0A0A] border-t border-[#1F1F1F] z-20">
        <button onClick={handleSave} disabled={saving} className="ev-btn-primary w-full flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>
    </div>
  );
}
