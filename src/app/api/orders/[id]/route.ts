import { NextRequest, NextResponse } from 'next/server';
import { requireUser, errorResponse } from '@/lib/auth';
import { rateLimitOrNext } from '@/lib/rateLimit';
import { getOrderForUser } from '@/lib/orders';
import { createLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const logger = createLogger({ route: 'api/orders/[id]' });

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser(req, { logger });
    const limited = rateLimitOrNext(req, { scope: 'orders:read', limit: 120, windowMs: 60_000 }, logger);
    if (limited) return limited;

    const order = await getOrderForUser(id, user);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (err) {
    return errorResponse(err, logger);
  }
}
