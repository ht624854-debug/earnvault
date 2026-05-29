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

  // Default settings
  const defaultSettings: Record<string, string> = {
    brand_name: 'EarnVault',
    logo_url: '',
    hero_title: 'Earn Real Rewards Daily',
    hero_subtitle: 'Complete simple tasks, refer friends, and withdraw your earnings instantly. The most trusted earning platform.',
    register_button_text: 'Register Now',
    login_button_text: 'Login',
    stat_active_members: '0',
    stat_support: '24/7',
    stat_withdrawals: 'Fast',
    stat_security: 'Secure',
    why_choose_1_title: 'Task Based Earning',
    why_choose_1_desc: 'Complete daily tasks and earn real money. Simple math, surveys, and link visits.',
    why_choose_2_title: 'Referral Rewards',
    why_choose_2_desc: 'Share your referral link and earn commission when your referrals activate.',
    why_choose_3_title: 'Secure Withdrawals',
    why_choose_3_desc: 'Withdraw your earnings to Easypaisa, JazzCash, or bank account securely.',
    why_choose_4_title: 'Instant Activation',
    why_choose_4_desc: 'Activate your account quickly and start earning within minutes.',
    testimonial_1_name: '',
    testimonial_1_text: '',
    testimonial_2_name: '',
    testimonial_2_text: '',
    testimonial_3_name: '',
    testimonial_3_text: '',
    footer_text: 'EarnVault - Your Trusted Earning Platform',
    social_whatsapp: '',
    social_facebook: '',
    social_instagram: '',
    social_youtube: '',
    social_telegram: '',
    whatsapp_popup_enabled: 'false',
    whatsapp_popup_title: '',
    whatsapp_popup_desc: '',
    whatsapp_popup_link: '',
    whatsapp_popup_button: '',
    activation_fee: '1500',
    min_withdrawal: '500',
    referral_reward: '200',
    referral_reward_on_activation: 'true',
    support_whatsapp: '',
    maintenance_mode: 'false',
    developer_credit: 'EarnVault',
    download_link: '',
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
    { name: 'Easypaisa', account_title: 'EarnVault', account_number: '03001234567', instructions: 'Send payment to the given Easypaisa account and upload screenshot.', icon: '💸', sort_order: 1 },
    { name: 'JazzCash', account_title: 'EarnVault', account_number: '03001234567', instructions: 'Send payment to the given JazzCash account and upload screenshot.', icon: '💰', sort_order: 2 },
    { name: 'SadaPay', account_title: 'EarnVault', account_number: '03001234567', instructions: 'Send payment to the given SadaPay account and upload screenshot.', icon: '💳', sort_order: 3 },
    { name: 'NayaPay', account_title: 'EarnVault', account_number: '03001234567', instructions: 'Send payment to the given NayaPay account and upload screenshot.', icon: '🏦', sort_order: 4 },
    { name: 'Bank Transfer', account_title: 'EarnVault', account_number: 'IBAN PK00XXXX0000000000', instructions: 'Transfer to the given bank account and upload screenshot.', icon: '🏧', sort_order: 5 },
  ];

  for (const method of methods) {
    const existing = await db.paymentMethod.findFirst({ where: { name: method.name } });
    if (!existing) {
      await db.paymentMethod.create({ data: method });
    }
  }

  console.log('Seed completed successfully!');
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());
