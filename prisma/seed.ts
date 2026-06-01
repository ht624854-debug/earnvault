import { db } from '../src/lib/db';
import { hashPassword, generateReferralCode } from '../src/lib/auth';

async function seed() {
  console.log('Seeding database...');

  // Create admin user
  const existingAdmin = await db.user.findUnique({ where: { username: 'admin' } });
  if (!existingAdmin) {
    const passwordHash = await hashPassword('admin123');
    await db.user.create({
      data: {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@earnvault.com',
        username: 'admin',
        mobile: '+923000000000',
        password_hash: passwordHash,
        referral_code: 'ADMIN001',
        package_status: 'Active',
        role: 'admin',
        status: 'active',
      },
    });
    console.log('Admin user created: admin / admin123');
  }

  // Default settings - keys MUST match AdminSettings.tsx and component usage
  const defaultSettings: Record<string, string> = {
    // Brand
    brand_name: 'EarnVault',
    logo_url: '',

    // Hero Section
    hero_title: 'Earn Real Rewards Daily',
    hero_subtitle: 'Complete simple tasks, refer friends, and withdraw your earnings instantly. The most trusted earning platform.',
    register_button_text: 'Register Now',
    login_button_text: 'Login',

    // Stats Section
    stat_active_members: '10,000+',
    stat_support: '24/7',
    stat_withdrawals: 'Fast',
    stat_security: 'Secure',

    // Why Choose
    why_choose_1: 'Task Based Earning - Complete daily tasks and earn real money.',
    why_choose_2: 'Referral Rewards - Share your link and earn commission.',
    why_choose_3: 'Secure Withdrawals - Withdraw to Easypaisa, JazzCash, or bank.',
    why_choose_4: 'Instant Activation - Activate and start earning within minutes.',

    // Testimonials
    testimonial_1: 'I earned Rs. 5000 in my first week! Best platform ever. - Ahmed',
    testimonial_2: 'Easy tasks, fast withdrawals. Highly recommended! - Sara',
    testimonial_3: 'The referral system is amazing. Passive income! - Ali',

    // Footer
    footer_text: 'EarnVault - Your Trusted Earning Platform',
    social_facebook: '',
    social_twitter: '',
    social_instagram: '',
    social_youtube: '',

    // WhatsApp Popup
    whatsapp_enabled: 'false',
    whatsapp_title: 'Need Help?',
    whatsapp_description: 'Chat with us on WhatsApp for instant support',
    whatsapp_link: '',
    whatsapp_button_text: 'Chat Now',

    // Financial
    activation_fee: '1500',
    min_withdrawal: '500',
    minimum_withdrawal: '500',
    referral_reward: '200',
    referral_reward_on_activation: '100',

    // Activation Offers
    offer_enabled: 'false',
    offer_title: '',
    offer_description: '',
    offer_discount: '0',

    // Other
    support_whatsapp: '',
    download_link: '',
    maintenance_mode: 'false',
    developer_credit: 'EarnVault',
    payment_methods_display: 'Easypaisa,JazzCash,SadaPay,NayaPay,Bank Transfer',
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    const existing = await db.setting.findUnique({ where: { setting_key: key } });
    if (!existing) {
      await db.setting.create({
        data: { setting_key: key, setting_value: value },
      });
    }
  }

  // Create default payment methods
  const methods = [
    { name: 'Easypaisa', account_title: 'EarnVault', account_number: '03001234567', instructions: 'Send payment to the given Easypaisa account and upload screenshot.', icon: '💸', sort_order: 1, is_active: true },
    { name: 'JazzCash', account_title: 'EarnVault', account_number: '03001234567', instructions: 'Send payment to the given JazzCash account and upload screenshot.', icon: '💰', sort_order: 2, is_active: true },
    { name: 'SadaPay', account_title: 'EarnVault', account_number: '03001234567', instructions: 'Send payment to the given SadaPay account and upload screenshot.', icon: '💳', sort_order: 3, is_active: true },
    { name: 'NayaPay', account_title: 'EarnVault', account_number: '03001234567', instructions: 'Send payment to the given NayaPay account and upload screenshot.', icon: '🏦', sort_order: 4, is_active: true },
    { name: 'Bank Transfer', account_title: 'EarnVault', account_number: 'IBAN PK00XXXX0000000000', instructions: 'Transfer to the given bank account and upload screenshot.', icon: '🏧', sort_order: 5, is_active: true },
  ];

  for (const method of methods) {
    const existing = await db.paymentMethod.findFirst({ where: { name: method.name } });
    if (!existing) {
      await db.paymentMethod.create({ data: method });
    }
  }

  // Create default referral reward tiers
  const defaultTiers = [
    { level: 1, reward_amount: 200 },
    { level: 2, reward_amount: 150 },
    { level: 3, reward_amount: 100 },
    { level: 4, reward_amount: 50 },
    { level: 5, reward_amount: 50 },
    { level: 6, reward_amount: 50 },
  ];

  for (const tier of defaultTiers) {
    const existing = await db.referralRewardTier.findUnique({ where: { level: tier.level } });
    if (!existing) {
      await db.referralRewardTier.create({ data: tier });
    }
  }

  console.log('Seed completed successfully!');
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());
