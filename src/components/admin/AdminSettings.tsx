'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useToastStore, useSettingsStore } from '@/lib/stores';
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
  Tag,
  Paintbrush,
  RotateCcw,
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
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'color';
  placeholder?: string;
  description?: string;
}

const defaultThemeColors: Record<string, string> = {
  theme_primary_color: '#2563EB',
  theme_bg_color: '#F0F7FF',
  theme_card_color: '#FFFFFF',
  theme_text_color: '#1E293B',
  theme_border_color: '#DBEAFE',
};

const sections: SettingsSection[] = [
  {
    key: 'brand',
    label: 'Brand',
    icon: <Palette className="w-4 h-4" />,
    fields: [
      { key: 'brand_name', label: 'Brand Name', type: 'text', placeholder: 'EarnVault', description: 'This changes the website name everywhere' },
      { key: 'logo_url', label: 'Logo URL', type: 'text', placeholder: '/logo.svg' },
    ],
  },
  {
    key: 'theme',
    label: 'Theme Colors',
    icon: <Paintbrush className="w-4 h-4" />,
    fields: [
      { key: 'theme_primary_color', label: 'Primary Color (Buttons, Links, Accents)', type: 'color', description: 'Main accent color used for buttons, links, and highlights' },
      { key: 'theme_bg_color', label: 'Background Color', type: 'color', description: 'Page background color' },
      { key: 'theme_card_color', label: 'Card Color', type: 'color', description: 'Card and dialog background color' },
      { key: 'theme_text_color', label: 'Text Color', type: 'color', description: 'Primary text color' },
      { key: 'theme_border_color', label: 'Border Color', type: 'color', description: 'Border and divider color' },
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
      { key: 'activation_fee', label: 'Activation Fee (Rs)', type: 'number', placeholder: '1500' },
      { key: 'min_withdrawal', label: 'Minimum Withdrawal (Rs)', type: 'number', placeholder: '200' },
      { key: 'referral_reward', label: 'Referral Reward (Rs)', type: 'number', placeholder: '100' },
      { key: 'referral_reward_on_activation', label: 'Enable Referral Reward on Activation', type: 'boolean' },
    ],
  },
  {
    key: 'offers',
    label: 'Activation Offers',
    icon: <Tag className="w-4 h-4" />,
    fields: [
      { key: 'offer_enabled', label: 'Enable Offer', type: 'boolean' },
      { key: 'offer_title', label: 'Offer Title', type: 'text', placeholder: 'e.g. 🎉 Eid Special Offer!' },
      { key: 'offer_description', label: 'Offer Description', type: 'textarea', placeholder: 'e.g. Limited time discount on activation fee!' },
      { key: 'offer_discount', label: 'Discount Amount (Rs)', type: 'number', placeholder: '500' },
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
  const { loadSettings: reloadGlobalSettings } = useSettingsStore();

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
      // Reload global settings so theme changes take effect immediately
      await reloadGlobalSettings();
      // Apply theme colors to CSS variables
      applyThemeColors(settings);
    } catch (err: any) {
      addToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const applyThemeColors = (s: Record<string, string>) => {
    const root = document.documentElement;
    if (s.theme_primary_color) {
      root.style.setProperty('--ev-primary', s.theme_primary_color);
      root.style.setProperty('--primary', s.theme_primary_color);
      root.style.setProperty('--ring', s.theme_primary_color);
      root.style.setProperty('--sidebar-primary', s.theme_primary_color);
      root.style.setProperty('--sidebar-ring', s.theme_primary_color);
    }
    if (s.theme_bg_color) {
      root.style.setProperty('--ev-bg', s.theme_bg_color);
      root.style.setProperty('--background', s.theme_bg_color);
    }
    if (s.theme_card_color) {
      root.style.setProperty('--ev-card', s.theme_card_color);
      root.style.setProperty('--card', s.theme_card_color);
      root.style.setProperty('--popover', s.theme_card_color);
    }
    if (s.theme_text_color) {
      root.style.setProperty('--ev-text', s.theme_text_color);
      root.style.setProperty('--foreground', s.theme_text_color);
      root.style.setProperty('--card-foreground', s.theme_text_color);
      root.style.setProperty('--popover-foreground', s.theme_text_color);
    }
    if (s.theme_border_color) {
      root.style.setProperty('--ev-card-border', s.theme_border_color);
      root.style.setProperty('--border', s.theme_border_color);
      root.style.setProperty('--sidebar-border', s.theme_border_color);
    }
  };

  const resetThemeColors = () => {
    setSettings((prev) => ({ ...prev, ...defaultThemeColors }));
    addToast('Theme colors reset to defaults. Click Save to apply.', 'success');
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-ev-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ev-text">Settings</h1>
          <p className="text-ev-muted text-sm mt-1">Manage platform settings</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="ev-btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.key} className="ev-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ev-text flex items-center gap-2">
                <span className="text-ev-blue">{section.icon}</span>
                {section.label}
              </h2>
              {section.key === 'theme' && (
                <button
                  onClick={resetThemeColors}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ev-muted bg-ev-bg border border-ev-card-border rounded-lg hover:bg-ev-card-border transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Default
                </button>
              )}
            </div>
            <div className={`grid gap-4 ${section.key === 'theme' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-ev-muted mb-1.5">{field.label}</label>
                  {field.description && (
                    <p className="text-xs text-[#94A3B8] mb-2">{field.description}</p>
                  )}
                  {field.type === 'color' ? (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="color"
                          value={settings[field.key] || '#2563EB'}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="w-12 h-10 rounded-lg border border-ev-card-border cursor-pointer appearance-none bg-transparent p-0.5"
                          style={{ WebkitAppearance: 'none' }}
                        />
                      </div>
                      <input
                        type="text"
                        value={settings[field.key] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleChange(field.key, val);
                        }}
                        placeholder="#2563EB"
                        className="ev-input flex-1 px-4 py-2.5 font-mono text-sm"
                      />
                      {settings[field.key] && (
                        <div
                          className="w-10 h-10 rounded-lg border border-ev-card-border shrink-0"
                          style={{ backgroundColor: settings[field.key] }}
                        />
                      )}
                    </div>
                  ) : field.type === 'textarea' ? (
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
                          settings[field.key] === 'true' ? 'bg-ev-blue' : 'bg-ev-card-border'
                        }`}
                        onClick={() => handleChange(field.key, settings[field.key] === 'true' ? 'false' : 'true')}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            settings[field.key] === 'true' ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                      <span className="text-sm text-ev-muted">
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

            {/* Theme Preview */}
            {section.key === 'theme' && (
              <div className="mt-6 pt-4 border-t border-ev-card-border">
                <p className="text-xs font-medium text-ev-muted mb-3">Preview</p>
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    backgroundColor: settings.theme_bg_color || '#F0F7FF',
                    borderColor: settings.theme_border_color || '#DBEAFE',
                  }}
                >
                  <div
                    className="rounded-lg p-4 mb-3 shadow-sm"
                    style={{ backgroundColor: settings.theme_card_color || '#FFFFFF' }}
                  >
                    <p className="text-sm font-semibold" style={{ color: settings.theme_text_color || '#1E293B' }}>
                      Card Title Text
                    </p>
                    <p className="text-xs mt-1" style={{ color: settings.theme_text_color ? settings.theme_text_color + '99' : '#1E293B99' }}>
                      This is how card text will look
                    </p>
                    <button
                      className="mt-3 text-white text-xs font-semibold rounded-lg px-4 py-2"
                      style={{ backgroundColor: settings.theme_primary_color || '#2563EB' }}
                    >
                      Primary Button
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="h-2 flex-1 rounded-full"
                      style={{ backgroundColor: settings.theme_primary_color || '#2563EB' }}
                    />
                    <div
                      className="h-2 flex-1 rounded-full opacity-50"
                      style={{ backgroundColor: settings.theme_primary_color || '#2563EB' }}
                    />
                    <div
                      className="h-2 flex-1 rounded-full opacity-25"
                      style={{ backgroundColor: settings.theme_primary_color || '#2563EB' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sticky save button on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-ev-bg border-t border-ev-card-border z-20">
        <button onClick={handleSave} disabled={saving} className="ev-btn-primary w-full flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>
    </div>
  );
}
