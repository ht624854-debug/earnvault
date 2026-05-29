import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { getAllSettings, updateSetting, createAuditLog } from '@/lib/settings';

export async function GET(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const settings = await getAllSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const body = await request.json();
    const updates: Record<string, string> = body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected object of { key: value } pairs' },
        { status: 400 }
      );
    }

    const changes: string[] = [];

    for (const [key, value] of Object.entries(updates)) {
      await updateSetting(key, String(value));
      changes.push(`${key}: ${value}`);
    }

    await createAuditLog(
      adminId,
      'UPDATE_SETTINGS',
      'Setting',
      undefined,
      `Updated settings: ${changes.join(', ')}`
    );

    const settings = await getAllSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
