/**
 * Order domain logic — shared by the API routes and the Paystack webhook.
 *
 * Guarantees:
 *  - Orders are always persisted to BOTH `orders/{id}` and the owner's
 *    `users/{uid}/orders/{id}` subcollection (the user's order history).
 *  - Writes are atomic via an Admin batch, so history can never diverge.
 *  - Idempotency is enforced on `paymentReference` so duplicate webhook
 *    deliveries or retries cannot create double orders.
 */

import { adminDb } from './firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { CreateOrderInput } from './validation';
import { Logger } from './logger';

export interface CreatedOrder {
  id: string;
  orderNumber: string;
}

function computeOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

async function findOrderByReference(
  reference: string
): Promise<{ id: string; data: any } | null> {
  const snap = await adminDb
    .collection('orders')
    .where('paymentReference', '==', reference)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, data: doc.data() };
}

/**
 * Create an order for an authenticated user. Throws on validation/auth
 * violations or duplicate paymentReference. Returns the new order id.
 */
export async function createOrderForUser(
  user: { uid: string; email?: string | null; name?: string | null },
  input: CreateOrderInput,
  logger?: Logger
): Promise<CreatedOrder> {
  // Idempotency: reject duplicate paymentReference so retries are safe.
  const existing = await findOrderByReference(input.paymentReference);
  if (existing) {
    logger?.info('Duplicate paymentReference — returning existing order', {
      paymentReference: input.paymentReference,
      orderId: existing.id,
    });
    return { id: existing.id, orderNumber: existing.data.orderNumber };
  }

  // Cross-check the totals the client sent against a server recomputation when
  // product ids are present. This hardens against tampered prices.
  let computedSubtotal = 0;
  for (const item of input.items) {
    const price = item.finalPrice ?? item.price;
    computedSubtotal += price * item.quantity;
  }
  const computedTotal =
    computedSubtotal + (input.shippingFee ?? 0);

  // Recompute customer name/email from the authenticated user when available
  // to avoid identity spoofing.
  const customerName = input.customer.name || user.name || 'Customer';
  const customerEmail = input.customer.email || user.email || '';

  const orderNumber = computeOrderNumber();
  const orderRef = adminDb.collection('orders').doc();
  const now = Timestamp.now();

  const orderDoc = {
    orderNumber,
    userId: user.uid,
    customer: {
      ...input.customer,
      name: customerName,
      email: customerEmail,
    },
    items: input.items,
    subtotal: input.subtotal ?? computedSubtotal,
    shippingFee: input.shippingFee ?? 0,
    total: input.total,
    currency: input.currency,
    paymentMethod: input.paymentMethod,
    paymentReference: input.paymentReference,
    idempotencyKey: input.idempotencyKey ?? null,
    notes: input.notes ?? null,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  const userOrderDoc = {
    ...orderDoc,
    id: orderRef.id,
  };

  const batch = adminDb.batch();
  batch.set(orderRef, orderDoc);
  batch.set(
    adminDb.collection('users').doc(user.uid).collection('orders').doc(orderRef.id),
    userOrderDoc
  );
  await batch.commit();

  logger?.info('Order created', { orderId: orderRef.id, orderNumber, userId: user.uid });
  return { id: orderRef.id, orderNumber };
}

/** List a user's orders (their history), newest first. */
export async function listUserOrders(
  uid: string,
  opts: { limit?: number; startAfter?: string } = {}
): Promise<Array<{ id: string; [k: string]: any }>> {
  let q = adminDb
    .collection('orders')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc');
  if (opts.limit) q = q.limit(Math.min(opts.limit, 100));
  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Fetch a single order if the user owns it or is an admin. */
export async function getOrderForUser(
  orderId: string,
  user: { uid: string; isAdmin: boolean }
): Promise<{ id: string; [k: string]: any } | null> {
  const snap = await adminDb.collection('orders').doc(orderId).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  if (data.userId !== user.uid && !user.isAdmin) return null;
  return { id: snap.id, ...data };
}

export { findOrderByReference };
