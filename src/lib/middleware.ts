import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function authenticateRequest(request: NextRequest): { userId: string; role: string } | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(request: NextRequest): { userId: string; role: string } | NextResponse {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  return user;
}

export function requireAdmin(request: NextRequest): { userId: string; role: string } | NextResponse {
  const result = requireAuth(request);
  if (result instanceof NextResponse) return result;
  if (result.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return result;
}
