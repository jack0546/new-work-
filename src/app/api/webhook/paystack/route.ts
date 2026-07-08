import { NextRequest, NextResponse } from 'next/server';
import { adminDb, runAdminTransaction } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { createLogger } from '@/lib/logger';
import { findOrderByReference } from '@/lib/orders';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API_URL = 'https://api.paystack.co';

const logger = createLogger({ route: 'api/webhook/paystack' });

function verifyPaystackSignature(body: string, signature: string | null): boolean {
  if (!signature || !PAYSTACK_SECRET_KEY) return false;
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex');
  return signature === expectedSignature;
}

function getFieldFromMetadata(metadata: any, variableName: string): string | null {
  if (!metadata?.custom_fields || !Array.isArray(metadata.custom_fields)) return null;
  const field = metadata.custom_fields.find(
    (f: any) => f.variable_name === variableName
  );
  return field?.value || null;
}

async function verifyPaymentWithPaystack(reference: string) {
  if (!PAYSTACK_SECRET_KEY) {
    logger.error('PAYSTACK_SECRET_KEY not configured');
    return { valid: false as const };
  }
  try {
    const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      logger.error('Paystack verification HTTP error', { status: response.status });
      return { valid: false as const };
    }
    const data = await response.json();
    if (data?.status && data?.data?.status === 'success') {
      return {
        valid: true as const,
        amount: data.data.amount,
        paidAt: data.data.paid_at,
        gatewayResponse: data.data.gateway_response,
      };
    }
    return { valid: false as const };
  } catch (error) {
    logger.capture(error, { phase: 'paystack-verify', reference });
    return { valid: false as const };
  }
}

/**
 * Recovery path: if a successful charge arrives but no order exists (e.g. the
 * pre-payment API call failed or a race), reconstruct a minimal order from the
 * verified webhook payload so revenue is never lost.
 */
async function recoverOrderFromWebhook(data: any) {
  const reference = data.reference;
  const userId = getFieldFromMetadata(data.metadata, 'user_id');
  const email = data.customer?.email || getFieldFromMetadata(data.metadata, 'customer_email') || '';
  const name = getFieldFromMetadata(data.metadata, 'customer_name') || 'Customer';
  const amountGhs = (data.amount || 0) / 100;

  const orderRef = adminDb.collection('orders').doc();
  const now = Timestamp.now();
  const orderDoc = {
    orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`,
    userId: userId || 'recovered',
    customer: { name, email, phone: '', address: '', region: '' },
    items: [],
    subtotal: amountGhs,
    shippingFee: 0,
    total: amountGhs,
    currency: 'GHS',
    paymentMethod: 'paystack',
    paymentReference: reference,
    paymentStatus: 'paid',
    orderStatus: 'processing',
    recovered: true,
    createdAt: now,
    updatedAt: now,
    paidAt: now,
  };

  const batch = adminDb.batch();
  batch.set(orderRef, orderDoc);
  if (userId) {
    batch.set(
      adminDb.collection('users').doc(userId).collection('orders').doc(orderRef.id),
      { ...orderDoc, id: orderRef.id }
    );
  }
  await batch.commit();
  logger.warn('Recovered order from webhook', { orderId: orderRef.id, userId });
  return orderRef.id;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-paystack-signature');
  const body = await request.text();

  if (!verifyPaystackSignature(body, signature)) {
    logger.warn('Invalid Paystack signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const event = payload.event;
  if (event !== 'charge.success' && event !== 'charge.failed') {
    return NextResponse.json({ received: true });
  }

  const data = payload.data;
  const { reference } = data;

  if (event === 'charge.failed') {
    if (!reference) return NextResponse.json({ received: true });

    const order = await findOrderByReference(reference);
    const userId =
      getFieldFromMetadata(data.metadata, 'user_id') || order?.data?.userId;
    if (!order || !userId) return NextResponse.json({ received: true });

    try {
      await adminDb.collection('orders').doc(order.id).update({
        paymentStatus: 'failed',
        orderStatus: 'cancelled',
        paystackFailedAt: Timestamp.now(),
      });
      await adminDb
        .collection('users')
        .doc(userId)
        .collection('orders')
        .doc(order.id)
        .update({
          paymentStatus: 'failed',
          orderStatus: 'cancelled',
          paystackFailedAt: Timestamp.now(),
        });
    } catch (error) {
      logger.capture(error, { phase: 'charge.failed', orderId: order.id });
    }
    return NextResponse.json({ received: true });
  }

  // charge.success
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
  }

  const order = await findOrderByReference(reference);
  if (!order) {
    // No pre-created order — recover from the verified webhook so we never
    // lose a successful payment.
    const verification = await verifyPaymentWithPaystack(reference);
    if (!verification.valid) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }
    await recoverOrderFromWebhook({ ...data, amount: verification.amount });
    return NextResponse.json({ received: true, recovered: true });
  }

  const orderData = order.data;

  // Idempotency: already processed.
  if (orderData.paymentStatus === 'paid') {
    return NextResponse.json({ received: true, message: 'Already processed' });
  }

  const verification = await verifyPaymentWithPaystack(reference);
  if (!verification.valid) {
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
  }

  try {
    const orderTotal = orderData.total ?? orderData.amount ?? 0;
    const expectedAmount = Math.round(orderTotal * 100);
    if (verification.amount !== expectedAmount) {
      logger.error('Amount mismatch', {
        reference,
        expected: expectedAmount,
        received: verification.amount,
      });
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    await runAdminTransaction(async (transaction) => {
      const orderRef = adminDb.collection('orders').doc(order.id);
      const orderSnapTx = await transaction.get(orderRef);
      if (!orderSnapTx.exists) throw new Error('Order not found');

      const orderTx = orderSnapTx.data()!;

      for (const item of orderTx.items || []) {
        if (!item.productId) continue;
        const productRef = adminDb.collection('products').doc(item.productId);
        const productSnap = await transaction.get(productRef);
        if (productSnap.exists) {
          const currentStock = productSnap.data()?.stock || 0;
          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.name}`);
          }
          transaction.update(productRef, { stock: currentStock - item.quantity });
        }
      }

      transaction.update(orderRef, {
        paymentStatus: 'paid',
        orderStatus: 'processing',
        paidAt: Timestamp.now(),
        paystackVerifiedAmount: verification.amount,
        paystackVerifiedAt: verification.paidAt,
        paystackGatewayResponse: verification.gatewayResponse,
      });

      transaction.update(
        adminDb
          .collection('users')
          .doc(orderTx.userId)
          .collection('orders')
          .doc(order.id),
        {
          paymentStatus: 'paid',
          orderStatus: 'processing',
          paidAt: Timestamp.now(),
        }
      );
    });

    logger.info('Order paid via webhook', { orderId: order.id, reference });
    return NextResponse.json({ received: true });
  } catch (error: any) {
    logger.capture(error, { phase: 'charge.success', orderId: order.id, reference });
    return NextResponse.json(
      { error: 'Processing error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
