import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/settings';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;
  const { userId: adminId } = adminResult;

  try {
    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Support ticket not found' },
        { status: 404 }
      );
    }

    await db.supportReply.create({
      data: {
        ticket_id: id,
        sender_type: 'admin',
        message,
      },
    });

    // Set ticket status to 'Answered'
    await db.supportTicket.update({
      where: { id },
      data: { status: 'Answered' },
    });

    await createAuditLog(
      adminId,
      'REPLY_SUPPORT_TICKET',
      'SupportTicket',
      id,
      `Admin replied to support ticket "${ticket.subject}" for user ${ticket.user.username}`
    );

    return NextResponse.json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Reply support ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
