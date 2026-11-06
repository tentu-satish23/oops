import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { store } from '../services/store.js';

const router = express.Router();

// ── Razorpay Client: lazy-initialized on first request so env vars are loaded ─
let razorpay = null;
let _keyId     = null;
let _keySecret = null;
let _initialized = false;

function getRazorpay() {
  if (_initialized) return razorpay;
  _initialized = true;
  _keyId     = process.env.RAZORPAY_KEY_ID;
  _keySecret = process.env.RAZORPAY_KEY_SECRET;

  const isReal = _keyId && _keySecret
    && !_keyId.includes('demo') && !_keyId.includes('YourRazorpay')
    && !_keySecret.includes('demo');

  if (isReal) {
    try {
      razorpay = new Razorpay({ key_id: _keyId, key_secret: _keySecret });
      console.log(`✅ Razorpay LIVE initialized — Key: ${_keyId}`);
    } catch (err) {
      console.warn('⚠️  Razorpay init error:', err.message);
    }
  } else {
    console.log('ℹ️  Razorpay: using SIMULATION mode');
  }
  return razorpay;
}

// Helper: get userId from header first, then body
function resolveUserId(req) {
  return req.headers['x-user-id'] || req.body?.userId || 'usr_oracle_demo_01';
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. POST /api/payments/create-order  (₹5 INR = 500 paise)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/create-order', async (req, res) => {
  try {
    const userId   = resolveUserId(req);
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    // Guard: already purchased?
    if (store.hasPurchasedCourse(userId, courseId)) {
      return res.status(409).json({
        error: 'already_purchased',
        message: 'You already own this course. No duplicate payment needed.',
        alreadyPurchased: true
      });
    }

    // Amount is ALWAYS set server-side: ₹5 = 500 paise
    const amountInPaise = 500;
    const currency      = 'INR';

    const rzp = getRazorpay();
    if (rzp) {
      // ── Real Razorpay Order ────────────────────────────────────────────
      const order = await rzp.orders.create({
        amount: amountInPaise,
        currency,
        receipt: `oo_${courseId}_${Date.now()}`,
        notes: { courseId: String(courseId), userId }
      });

      // Store payment record (pending)
      store.createPaymentOrder({
        userId,
        courseId,
        razorpayOrderId: order.id,
        amount: 5.00,
        currency
      });

      return res.json({
        orderId: order.id,
        amount: amountInPaise,
        currency,
        keyId: _keyId,
        isSimulation: false
      });
    }

    // ── Simulation Mode ──────────────────────────────────────────────────
    const simOrderId = 'order_sim_' + Date.now();
    store.createPaymentOrder({
      userId,
      courseId,
      razorpayOrderId: simOrderId,
      amount: 5.00,
      currency
    });

    res.json({
      orderId: simOrderId,
      amount: amountInPaise,
      currency,
      keyId: 'rzp_test_simulation',
      isSimulation: true
    });

  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. POST /api/payments/verify
// ─────────────────────────────────────────────────────────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      isSimulation
    } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    // Simulation path
    if (isSimulation || (razorpay_order_id && razorpay_order_id.startsWith('order_sim_'))) {
      store.updatePaymentOrderStatus(razorpay_order_id, 'captured', razorpay_payment_id || 'pay_sim');
      store.addCoursePurchase({
        userId,
        courseId,
        amount: 5.00,
        razorpayPaymentId: razorpay_payment_id || 'pay_sim_' + Date.now(),
        razorpayOrderId: razorpay_order_id,
        isSimulation: true
      });
      return res.json({
        success: true,
        message: 'Payment verified (simulation mode). Course unlocked!',
        isPurchased: true
      });
    }

    // Real signature verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', _keySecret || process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    store.updatePaymentOrderStatus(razorpay_order_id, 'captured', razorpay_payment_id);
    store.addCoursePurchase({
      userId,
      courseId,
      amount: 5.00,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      isSimulation: false
    });

    res.json({
      success: true,
      message: 'Payment verified successfully. Course unlocked!',
      isPurchased: true
    });

  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /api/payments/status/:orderId
// ─────────────────────────────────────────────────────────────────────────────
router.get('/status/:orderId', (req, res) => {
  try {
    const record = store.getPaymentOrderByRzpId(req.params.orderId);
    if (!record) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({
      ...record,
      isPurchased: store.hasPurchasedCourse(record.userId, record.courseId)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. POST /api/payments/webhook  (Razorpay server-to-server events)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || _keySecret;

    // Verify webhook signature
    if (webhookSecret) {
      const receivedSignature = req.headers['x-razorpay-signature'];
      const payload           = req.body; // raw buffer
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      if (receivedSignature !== expectedSignature) {
        console.warn('⚠️  Webhook signature mismatch');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = JSON.parse(req.body.toString());
    console.log('📦 Razorpay Webhook event:', event.event);

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (payment) {
        const orderId   = payment.order_id;
        const paymentId = payment.id;
        const orderRec  = store.getPaymentOrderByRzpId(orderId);

        if (orderRec && orderRec.status !== 'captured') {
          store.updatePaymentOrderStatus(orderId, 'captured', paymentId);
          store.addCoursePurchase({
            userId:            orderRec.userId,
            courseId:          orderRec.courseId,
            amount:            5.00,
            razorpayPaymentId: paymentId,
            razorpayOrderId:   orderId,
            isSimulation:      false
          });
          console.log(`✅ Webhook: course ${orderRec.courseId} unlocked for user ${orderRec.userId}`);
        }
      }
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      if (payment) {
        store.updatePaymentOrderStatus(payment.order_id, 'failed', payment.id);
        console.log(`❌ Webhook: payment failed for order ${payment.order_id}`);
      }
    }

    res.json({ received: true });

  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
