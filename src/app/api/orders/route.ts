import { NextRequest, NextResponse } from 'next/server';
import { requireUser, errorResponse, HttpError } from '@/lib/auth';
import { rateLimitOrNext } from '@/lib/rateLimit';
import { createOrderForUser, listUserOrders } from '@/lib/orders';
import { createOrderSchema } from '@/lib/validation';
import { createLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const logger = createLogger({ route: 'api/orders' });

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req, { logger });
    const limited = rateLimitOrNext(req, { scope: 'orders:list', limit: 120, windowMs: 60_000 }, logger);
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    const orders = await listUserOrders(user.uid, {
      limit: Number.isFinite(limit) ? limit : 50,
    });
    return NextResponse.json({ orders });
  } catch (err) {
    return errorResponse(err, logger);
  }
}

export async function POST(req: NextRequest) {
  const child = logger.child({ method: 'POST' });
  try {
    const user = await requireUser(req, { logger: child });
    const limited = rateLimitOrNext(
      req,
      { scope: 'orders:create', limit: 10, windowMs: 60_000 },
      child
    );
    if (limited) return limited;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new HttpError(400, 'Invalid JSON body');
    }

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const order = await createOrderForUser(user, parsed.data, child);
    return NextResponse.json(
      { success: true, orderId: order.id, orderNumber: order.orderNumber },
      { status: 201 }
    );
  } catch (err) {
    return errorResponse(err, child);
  }
}
