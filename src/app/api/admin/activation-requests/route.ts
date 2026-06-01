import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (status) {
      // Capitalize first letter to match database format (Pending, Approved, Rejected)
      where.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    const requests = await db.activationRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
            mobile: true,
            package_status: true,
          },
        },
        payment_method: {
          select: {
            id: true,
            name: true,
            account_title: true,
            account_number: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Flatten payment_method object to just the name string so frontend can render it
    const flatRequests = requests.map((req: any) => ({
      ...req,
      payment_method: typeof req.payment_method === 'object' ? req.payment_method?.name || '' : req.payment_method,
    }));

    return NextResponse.json({ requests: flatRequests });
  } catch (error) {
    console.error('Get activation requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
