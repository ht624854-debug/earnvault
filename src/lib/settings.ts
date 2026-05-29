import { db } from './db';

const settingsCache: Record<string, string> = {};
let cacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function getSetting(key: string): Promise<string> {
  const now = Date.now();
  if (now - cacheTime > CACHE_TTL) {
    const settings = await db.setting.findMany();
    for (const s of settings) {
      settingsCache[s.setting_key] = s.setting_value;
    }
    cacheTime = now;
  }
  return settingsCache[key] || '';
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await db.setting.findMany();
  const result: Record<string, string> = {};
  for (const s of settings) {
    result[s.setting_key] = s.setting_value;
  }
  return result;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await db.setting.upsert({
    where: { setting_key: key },
    update: { setting_value: value },
    create: { setting_key: key, setting_value: value },
  });
  settingsCache[key] = value;
}

export async function createAuditLog(adminId: string, action: string, targetType?: string, targetId?: string, details?: string) {
  await db.auditLog.create({
    data: {
      admin_id: adminId,
      action,
      target_type: targetType || null,
      target_id: targetId || null,
      details: details || '',
    },
  });
}

export async function createTransaction(
  userId: string,
  type: string,
  amount: number,
  status: string = 'Completed',
  referenceType?: string,
  referenceId?: string,
  description?: string,
  adminNote?: string
) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const balanceBefore = user.main_balance;
  const balanceAfter = type === 'withdrawal' || type === 'admin_adjustment' 
    ? (amount < 0 ? balanceBefore + amount : balanceBefore + amount)
    : balanceBefore + amount;

  await db.user.update({
    where: { id: userId },
    data: { main_balance: balanceAfter },
  });

  return db.transaction.create({
    data: {
      user_id: userId,
      type,
      amount,
      status,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reference_type: referenceType || null,
      reference_id: referenceId || null,
      description: description || '',
      admin_note: adminNote || '',
    },
  });
}
