import { NextResponse } from 'next/server';
import { getAllSettings } from '@/lib/settings';

// Settings that should NOT be exposed publicly
const SENSITIVE_SETTINGS = new Set([
  'jwt_secret',
  'admin_password',
  'smtp_password',
  'api_key',
  'secret_key',
  'database_url',
]);

export async function GET() {
  try {
    const allSettings = await getAllSettings();

    // Filter out sensitive settings
    const publicSettings: Record<string, string> = {};
    for (const [key, value] of Object.entries(allSettings)) {
      if (!SENSITIVE_SETTINGS.has(key) && !key.includes('password') && !key.includes('secret')) {
        publicSettings[key] = value;
      }
    }

    return NextResponse.json({ settings: publicSettings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
