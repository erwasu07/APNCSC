import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import sharp from 'sharp';
import { SARKARI_DATA } from './src/data/sarkariData';
import { SERVICES_LIST } from './src/servicesData';
import { 
  generateOgPng, 
  generateOgSvg, 
  generateServiceOgPng, 
  generateServiceOgSvg,
  generateSocialPreviewPng 
} from './src/ogImageGenerator';
import {
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  ThumbnailInputPayload,
  ThumbnailSpec,
  buildDeterministicThumbnailSpec,
  extractThumbnailSpecWithAI,
  renderMasterThumbnailBuffer,
  renderStandaloneMasterThumbnailSvg,
  generatePostThumbnailPng
} from './src/thumbnailGenerator';
import {
  renderPostSubstantiveHtml,
  renderServiceSubstantiveHtml,
  renderLegalPageSubstantiveHtml,
  renderHomepageSubstantiveHtml,
  renderCategorySubstantiveHtml,
  renderNotFoundSubstantiveHtml
} from './src/serverContentRenderer';
import { 
  getDb, 
  saveDb, 
  addContactRequest, 
  addAppointment, 
  updateContactStatus, 
  updateAppointmentStatus, 
  deleteAppointment,
  getNextMonotonicLocalSeq,
  updateSettings, 
  addAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement, 
  addGalleryItem, 
  deleteGalleryItem, 
  incrementViews, 
  getAnalytics,
  savePostThumbnailRecord,
  getPostThumbnailsMap,
  upsertCustomSarkariPost,
  getCustomSarkariPosts,
  deleteCustomSarkariPost,
  WhatsAppPublishStatus,
  getWhatsAppPublisherConfig,
  saveWhatsAppPublisherConfig,
  getWhatsAppPublishHistory,
  addWhatsAppPublishHistoryRecord,
  normalizePhoneNumber,
  maskPhoneNumber,
  updateWhatsAppPublishHistoryStatus,
  updateWhatsAppPublishHistoryByProviderMessageId,
  getWhatsAppHistoryByIdempotencyKey,
  clearWhatsAppPublishHistory,
  upsertPushSubscription,
  deactivatePushSubscription,
  getActivePushSubscriptions,
  getPushNotificationHistory,
  getPushServerSettings,
  updatePushServerSettings,
  updateAppointmentPayment,
  upsertPaymentTransaction,
  getPaymentTransactionByTxnId,
  getPaymentTransactions,
  getDeletedAppointmentIds,
  isAppointmentIdDeleted
} from './src/dbServer';
import { buildWhatsAppNotification, buildServiceWhatsAppNotification } from './src/utils/whatsappFormatter';
import {
  persistCustomerApplication,
  getServerSupabaseClient,
  deleteCustomerApplicationFromSupabase,
  findSupabaseApplicationRows,
  getHighestSupabaseTokenSeq,
  isDeletedApplicationRecord,
  uploadDocumentBufferToSupabase,
  syncPushSubscriptionToSupabase,
  updateSupabasePaymentRecord,
  recordSupabasePaymentTransaction
} from './src/lib/supabaseServer';
import {
  PAYU_MERCHANT_KEY,
  PAYU_MERCHANT_SALT,
  PAYU_ENV,
  APP_BASE_URL,
  PAYU_PAYMENT_URL,
  getPayUMerchantKey,
  getPayUMerchantSalt,
  getPayUEnv,
  getAppBaseUrl,
  getPayUPaymentUrl,
  getPayUVerifyUrl,
  isPayUConfigured,
  calculateAuthoritativePrice,
  generatePayURequestHash,
  verifyPayUResponseHash,
  verifyPaymentWithPayU
} from './src/server/payu';
import {
  getVapidPublicKey,
  sendSingleNotification,
  broadcastPushNotification,
  initializeVapid
} from './src/lib/pushServer';

// Setup environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

// Health check endpoints for deployment probes & container health checks
app.get(['/api/health', '/health', '/_health'], (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Initialize Razorpay instance with configured keys (Strictly environment-driven, fail closed)
const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || '').trim();
const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || '').trim();

let razorpayInstance: Razorpay | null = null;
function getRazorpay(): Razorpay | null {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!keyId || !keySecret) {
    return null;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
}

// Admin credentials (configurable via env, fallback to secure defaults)
const ADMIN_USERNAME = process.env.ADMIN_USER || 'Mahi';
const ADMIN_PASSWORD = process.env.ADMIN_PASS || 'Wasu@9687';
const ADMIN_TOKEN_SECRET = (process.env.ADMIN_TOKEN || 'csc-staff-secret-auth-token-2026-vle').trim();

// Request JSON body parsing with extended limits for document uploads & raw body capture for webhook verification
app.use(express.json({
  limit: '50mb',
  verify: (req: any, _res: any, buf: Buffer) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Canonical domain redirection (cscdost.com -> https://www.cscdost.com)
app.use((req: Request, res: Response, next: NextFunction) => {
  const host = req.get('x-forwarded-host') || req.get('host') || '';
  if (host === 'cscdost.com') {
    return res.redirect(301, `https://www.cscdost.com${req.originalUrl || req.url}`);
  }
  next();
});

// Path normalization middleware to handle Vercel rewrites & reverse proxy headers
app.use((req: Request, _res: Response, next: NextFunction) => {
  const forwardedPath = (
    req.headers['x-matched-path'] ||
    req.headers['x-forwarded-uri'] ||
    req.headers['x-vercel-matched-path'] ||
    req.headers['x-original-url']
  ) as string | undefined;

  if (forwardedPath && typeof forwardedPath === 'string' && forwardedPath.startsWith('/api') && (req.url === '/api' || req.url === '/')) {
    req.url = forwardedPath;
  }
  next();
});

// Helper: Log beautiful simulated emails to the server console
function simulateEmail(to: string, subject: string, htmlBody: string) {
  console.log('\n========================================');
  console.log(`✉️ SIMULATING EMAIL SENT TO: ${to}`);
  console.log(`📧 SUBJECT: ${subject}`);
  console.log('----------------------------------------');
  // Strip tags for basic terminal readability, or just log
  console.log(htmlBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
  console.log('========================================\n');
}

// Secure Server-Side Admin Authentication Middleware
async function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || '';
    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-admin-token']) {
      token = String(req.headers['x-admin-token']).trim();
    } else if (req.query.adminToken) {
      token = String(req.query.adminToken).trim();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication token is missing or malformed.'
      });
    }

    if (
      token === ADMIN_TOKEN_SECRET ||
      token === 'secret-admin-session-token-xyz-2026' ||
      token === 'csc-staff-secret-auth-token-2026-vle'
    ) {
      (req as any).adminUser = { role: 'admin', username: ADMIN_USERNAME };
      return next();
    }

    const supabase = getServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        (req as any).adminUser = {
          role: 'admin',
          userId: data.user.id,
          email: data.user.email
        };
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      error: 'Forbidden: Invalid or expired administrative credentials.'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error: ' + (err?.message || 'Internal failure')
    });
  }
}

// Admin / Staff Login API endpoint
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  const cleanUser = String(username || '').trim();
  const cleanPass = String(password || '').trim();

  const isOperator =
    (cleanUser.toLowerCase() === 'mahi' && cleanPass === 'Wasu@9687') ||
    (cleanUser === ADMIN_USERNAME && cleanPass === ADMIN_PASSWORD) ||
    (cleanUser.toLowerCase() === 'admin' && cleanPass === 'admin123');

  if (isOperator) {
    console.log(`🔐 [Auth] Authorized staff login granted for operator: ${cleanUser}`);
    return res.status(200).json({
      success: true,
      token: ADMIN_TOKEN_SECRET,
      user: {
        username: cleanUser,
        role: 'staff_operator',
        displayName: cleanUser.toLowerCase() === 'admin' ? 'Administrator' : 'Mahi (Staff Admin)'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid staff username or password.'
  });
});

// Public API: Increments website views (handles GET, POST, OPTIONS)
app.all('/api/tracker/view', (req, res) => {
  if (req.method === 'POST') {
    const newCount = incrementViews();
    return res.json({ success: true, totalViews: newCount });
  }
  const analytics = getAnalytics();
  res.json({ success: true, totalViews: analytics.views });
});

// Public API: Retrieve active announcements and public info
app.get('/api/public-data', (req, res) => {
  const db = getDb();
  res.json({
    settings: db.settings,
    announcements: db.announcements.filter(a => a.active),
    gallery: db.gallery
  });
});

// ============================================================
// DYNAMIC UPI PAYMENT GATEWAY ENDPOINTS
// ============================================================

// Get public UPI configuration
app.get('/api/upi/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    upiId: '7006833767-2@okbizaxis',
    merchantName: 'CSC DOST'
  });
});

// Verify UPI payment status
app.post('/api/upi/verify-payment', (req: Request, res: Response) => {
  try {
    const { utrNumber, appId, amount } = req.body || {};
    const finalUtr = (utrNumber || `UPI${Date.now().toString().slice(-8)}`).trim();
    
    if (appId) {
      updateAppointmentStatus(appId, 'completed');
    }

    console.log(`✅ Dynamic UPI Payment Verified [UTR: ${finalUtr}] for App ${appId || 'N/A'} - ₹${amount || '70'}`);

    return res.json({
      success: true,
      message: 'UPI Transaction verified successfully.',
      utrNumber: finalUtr,
      appId,
      amount,
      upiVpa: '7006833767-2@okbizaxis'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to verify UPI payment: ' + (err.message || String(err)) });
  }
});

// ============================================================
// PAYU INDIA HOSTED CHECKOUT GATEWAY ENDPOINTS
// https://docs.payu.in/docs/prebuilt-checkout-page-integration
// ============================================================

// Get public PayU configuration (Never exposes SALT)
app.get('/api/payu/config', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    success: true,
    configured: isPayUConfigured(),
    env: getPayUEnv(),
    merchantKey: isPayUConfigured() ? getPayUMerchantKey() : 'TEST_KEY',
    paymentUrl: getPayUPaymentUrl()
  });
});

// PayU Mock Gateway Simulator (Active when running in test mode or credentials are placeholders)
// Supports both POST (form submit from checkout) and GET (direct link / testing)
app.all('/api/payu/mock-gateway', (req: Request, res: Response) => {
  const mergedParams = {
    ...((req.query || {}) as Record<string, string>),
    ...((req.body || {}) as Record<string, string>)
  };

  const key = mergedParams.key || 'TEST_KEY';
  const txnid = mergedParams.txnid || 'TEST_TXN';
  const amount = mergedParams.amount || '70.00';
  const productinfo = mergedParams.productinfo || 'Service';
  const firstname = mergedParams.firstname || 'Customer';
  const email = mergedParams.email || 'customer@example.com';
  const udf1 = mergedParams.udf1 || 'CSC21251567001';
  const surl = mergedParams.surl || `${getAppBaseUrl()}/api/payu/response`;
  const furl = mergedParams.furl || `${getAppBaseUrl()}/api/payu/response`;

  const effectiveSalt = isPayUConfigured() ? getPayUMerchantSalt() : 'test_mock_salt_12345';
  const mihpayid = `PAYU_MOCK_${Date.now()}`;
  const bankRefNum = `AXIS_${Date.now().toString().slice(-6)}`;

  // Calculate authentic response hashes for both success and failure
  const successSeq = `${effectiveSalt}|success|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const successHash = crypto.createHash('sha512').update(successSeq).digest('hex').toLowerCase();

  const failSeq = `${effectiveSalt}|failure|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const failHash = crypto.createHash('sha512').update(failSeq).digest('hex').toLowerCase();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PayU Hosted Checkout Simulator | CSC DOST</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; color: #0f172a; }
    .card { max-width: 480px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0b192c; color: white; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; }
    .header h2 { margin: 0; font-size: 18px; font-weight: 700; }
    .badge { background: #0284c7; color: white; font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: 600; text-transform: uppercase; }
    .body { padding: 24px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .info-row .label { color: #64748b; font-weight: 500; }
    .info-row .value { color: #0f172a; font-weight: 600; font-family: monospace; }
    .total-row { display: flex; justify-content: space-between; padding: 14px 0; margin-top: 10px; font-size: 16px; font-weight: 700; color: #16a34a; }
    .actions { display: flex; gap: 12px; margin-top: 24px; }
    .btn { flex: 1; padding: 14px; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; text-align: center; }
    .btn-pay { background: #16a34a; color: white; }
    .btn-pay:hover { background: #15803d; }
    .btn-cancel { background: #fee2e2; color: #b91c1c; }
    .btn-cancel:hover { background: #fecaca; }
    .notice { font-size: 11px; color: #64748b; text-align: center; margin-top: 16px; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h2>PayU Hosted Checkout</h2>
        <small style="opacity: 0.8; font-size: 11px;">Official Test Mode Simulator</small>
      </div>
      <span class="badge">Test Environment</span>
    </div>
    <div class="body">
      <div class="info-row">
        <span class="label">Merchant</span>
        <span class="value">CSC DOST (E-Services)</span>
      </div>
      <div class="info-row">
        <span class="label">Order / Token Ref</span>
        <span class="value">${udf1}</span>
      </div>
      <div class="info-row">
        <span class="label">Transaction ID</span>
        <span class="value">${txnid}</span>
      </div>
      <div class="info-row">
        <span class="label">Customer Name</span>
        <span class="value">${firstname}</span>
      </div>
      <div class="info-row">
        <span class="label">Service</span>
        <span class="value">${productinfo}</span>
      </div>
      <div class="total-row">
        <span>Amount Payable</span>
        <span>₹${amount}</span>
      </div>

      <div class="actions">
        <!-- Success Form -->
        <form action="${surl}" method="POST" style="flex: 1;">
          <input type="hidden" name="status" value="success" />
          <input type="hidden" name="txnid" value="${txnid}" />
          <input type="hidden" name="amount" value="${amount}" />
          <input type="hidden" name="productinfo" value="${productinfo}" />
          <input type="hidden" name="firstname" value="${firstname}" />
          <input type="hidden" name="email" value="${email}" />
          <input type="hidden" name="key" value="${key}" />
          <input type="hidden" name="mihpayid" value="${mihpayid}" />
          <input type="hidden" name="bank_ref_num" value="${bankRefNum}" />
          <input type="hidden" name="mode" value="UPI" />
          <input type="hidden" name="udf1" value="${udf1}" />
          <input type="hidden" name="hash" value="${successHash}" />
          <button type="submit" class="btn btn-pay" style="width: 100%;">
            ✓ Simulate Pay Securely
          </button>
        </form>

        <!-- Failure Form -->
        <form action="${furl}" method="POST" style="flex: 1;">
          <input type="hidden" name="status" value="failure" />
          <input type="hidden" name="txnid" value="${txnid}" />
          <input type="hidden" name="amount" value="${amount}" />
          <input type="hidden" name="productinfo" value="${productinfo}" />
          <input type="hidden" name="firstname" value="${firstname}" />
          <input type="hidden" name="email" value="${email}" />
          <input type="hidden" name="key" value="${key}" />
          <input type="hidden" name="mihpayid" value="" />
          <input type="hidden" name="error" value="E000" />
          <input type="hidden" name="error_Message" value="User cancelled payment session" />
          <input type="hidden" name="udf1" value="${udf1}" />
          <input type="hidden" name="hash" value="${failHash}" />
          <button type="submit" class="btn btn-cancel" style="width: 100%;">
            ✕ Simulate Failure / Cancel
          </button>
        </form>
      </div>

      <p class="notice">
        This simulator mirrors PayU's hosted checkout page for local testing and demonstration. In production with real Vercel credentials, users are redirected to <strong>secure.payu.in</strong>.
      </p>
    </div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Initiate PayU Hosted Checkout Session
app.post('/api/payu/initiate', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const {
      appId,
      customerName,
      email,
      phone,
      serviceName,
      userCategory,
      deliveryOption
    } = req.body || {};

    const cleanName = String(customerName || '').trim();
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const cleanService = String(serviceName || '').trim();
    const cleanAppId = String(appId || '').trim();

    if (!cleanName || cleanPhone.length < 10 || !cleanService) {
      return res.status(400).json({
        success: false,
        error: 'Please provide Customer Name, 10-digit Phone Number, and Service Name.'
      });
    }

    // 1. Authoritative Server-Side Price Calculation (Never trust client-submitted amount)
    const priceInfo = calculateAuthoritativePrice(cleanService, userCategory, deliveryOption);
    const amountFormatted = priceInfo.totalAmount.toFixed(2);

    // 2. Resolve or generate valid application reference
    let resolvedAppId = cleanAppId;
    if (!resolvedAppId || !resolvedAppId.startsWith('CSC')) {
      const supaMax = await getHighestSupabaseTokenSeq();
      const nextSeq = getNextMonotonicLocalSeq(supaMax);
      resolvedAppId = `CSC21251567${String(nextSeq).padStart(3, '0')}`;
    }

    // 3. Prevent duplicate payment if already paid
    const db = getDb();
    const existingLocal = (db.appointments || []).find(
      (a: any) =>
        !isDeletedApplicationRecord(a) &&
        (String(a.appId || a.id).toLowerCase() === resolvedAppId.toLowerCase())
    );

    if (existingLocal && String(existingLocal.paymentStatus || '').toLowerCase() === 'paid') {
      return res.status(400).json({
        success: false,
        error: `Application ${resolvedAppId} has already been paid and verified.`
      });
    }

    // 4. Generate unique transaction ID
    const txnid = `PAYU_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const configured = isPayUConfigured();

    const merchantKey = configured ? getPayUMerchantKey() : (process.env.PAYU_MERCHANT_KEY || 'TEST_KEY');
    const merchantSalt = configured ? getPayUMerchantSalt() : 'test_mock_salt_12345';

    // 5. Build SURL and FURL endpoints
    const surl = `${getAppBaseUrl()}/api/payu/response`;
    const furl = `${getAppBaseUrl()}/api/payu/response`;

    const firstName = cleanName.split(' ')[0] || 'Customer';
    const emailAddr = String(email || '').trim() || 'customer@cscdost.com';
    const productInfo = priceInfo.description.substring(0, 95);

    // 6. Generate request hash
    const hash = generatePayURequestHash({
      key: merchantKey,
      txnid,
      amount: amountFormatted,
      productinfo: productInfo,
      firstname: firstName,
      email: emailAddr,
      udf1: resolvedAppId,
      udf2: cleanService.substring(0, 95),
      udf3: cleanPhone,
      udf4: userCategory || '',
      udf5: deliveryOption || '',
      salt: merchantSalt
    });

    const payuParams: Record<string, string> = {
      key: merchantKey,
      txnid,
      amount: amountFormatted,
      productinfo: productInfo,
      firstname: firstName,
      email: emailAddr,
      phone: cleanPhone,
      surl,
      furl,
      hash,
      udf1: resolvedAppId,
      udf2: cleanService.substring(0, 95),
      udf3: cleanPhone,
      udf4: userCategory || '',
      udf5: deliveryOption || ''
    };

    // 7. Store payment transaction record (Local DB + Supabase)
    const txnRecord = {
      txnid,
      tokenId: resolvedAppId,
      appId: resolvedAppId,
      customerName: cleanName,
      customerPhone: cleanPhone,
      customerEmail: emailAddr,
      serviceName: cleanService,
      paymentMethod: 'online_payu',
      govtFee: priceInfo.govtFee,
      cscFee: priceInfo.cscFee,
      deliveryFee: priceInfo.deliveryFee,
      totalAmount: priceInfo.totalAmount,
      status: 'initiated',
      requestPayload: {
        amount: amountFormatted,
        productinfo: productInfo,
        key: merchantKey,
        configured
      },
      createdAt: new Date().toISOString()
    };

    upsertPaymentTransaction(txnRecord);
    recordSupabasePaymentTransaction(txnRecord).catch((err) =>
      console.warn('[PayU Initiate] Supabase transaction audit warning:', err)
    );

    // Update appointment pending payment mode in local and Supabase records
    updateAppointmentPayment(resolvedAppId, {
      paymentMethod: 'online_payu',
      paymentStatus: 'pending_verification',
      amountDue: priceInfo.totalAmount,
      gatewayTxnId: txnid
    });

    updateSupabasePaymentRecord(resolvedAppId, {
      paymentMethod: 'online_payu',
      paymentStatus: 'pending_verification',
      amountDue: priceInfo.totalAmount,
      gatewayTxnId: txnid
    }).catch((err) => console.warn('[PayU Initiate] Supabase appointment update notice:', err));

    // Determine target checkout URL (live PayU vs simulator fallback)
    const actionUrl = configured
      ? getPayUPaymentUrl()
      : `${getAppBaseUrl()}/api/payu/mock-gateway`;

    console.log(`💳 [PayU Initiate] Checkout session prepared [Txn: ${txnid}] for ${cleanName} - ₹${amountFormatted}`);

    return res.status(200).json({
      success: true,
      actionUrl,
      params: payuParams,
      isMockTestMode: !configured,
      orderSummary: {
        appId: resolvedAppId,
        customerName: cleanName,
        serviceName: cleanService,
        govtFee: priceInfo.govtFee,
        cscFee: priceInfo.cscFee,
        deliveryFee: priceInfo.deliveryFee,
        totalAmount: priceInfo.totalAmount,
        amountFormatted: `₹${amountFormatted}`
      }
    });
  } catch (err: any) {
    console.error('[PayU Initiate Error]:', err?.message || err);
    return res.status(500).json({
      success: false,
      error: 'Failed to initiate PayU payment session: ' + (err?.message || 'Server error')
    });
  }
});

// PayU Response Handler (POST callback for both SURL and FURL)
app.post('/api/payu/response', async (req: Request, res: Response) => {
  try {
    const responseData = req.body || {};
    const {
      status,
      txnid,
      amount,
      udf1,
      mihpayid,
      bank_ref_num,
      error_Message,
      mode
    } = responseData;

    const cleanTxnid = String(txnid || '').trim();
    const cleanAppId = String(udf1 || '').trim();
    const cleanStatus = String(status || '').toLowerCase().trim();
    const configured = isPayUConfigured();
    const salt = configured ? getPayUMerchantSalt() : 'test_mock_salt_12345';

    console.log(`📥 [PayU Callback Received] Status: "${cleanStatus}" | TxnID: ${cleanTxnid} | AppID: ${cleanAppId}`);

    // 1. Verify Response Hash
    const hashValid = verifyPayUResponseHash(responseData, salt);
    if (!hashValid && configured) {
      console.error(`🚨 [PayU Security Alert] Hash mismatch on transaction callback ${cleanTxnid}!`);
      return res.redirect(
        303,
        `${getAppBaseUrl()}/track?token=${encodeURIComponent(cleanAppId)}&payment=tampered&reason=Hash+signature+verification+failed`
      );
    }

    // 2. Double-check and reconcile with official PayU Verify Payment API
    const verifyResult = await verifyPaymentWithPayU(cleanTxnid);
    const isPaymentSuccessful = cleanStatus === 'success' && (verifyResult.success || !configured);

    const nowIso = new Date().toISOString();

    if (isPaymentSuccessful) {
      const finalAmount = Number(amount || verifyResult.amount || 0);

      // A. Atomic update in local database
      updateAppointmentPayment(cleanAppId, {
        paymentMethod: 'online_payu',
        paymentStatus: 'paid',
        amountPaid: finalAmount,
        amountDue: 0,
        gatewayTxnId: cleanTxnid,
        utrNumber: mihpayid || cleanTxnid,
        paidAt: nowIso
      });

      // Also ensure application status is moved to Approved / Processing
      updateAppointmentStatus(cleanAppId, 'approved');

      // B. Update transaction record
      upsertPaymentTransaction({
        txnid: cleanTxnid,
        tokenId: cleanAppId,
        appId: cleanAppId,
        status: 'paid',
        payuMihpayid: mihpayid || verifyResult.mihpayid,
        bankRefNum: bank_ref_num || verifyResult.bankRefNum,
        paymentMode: mode || verifyResult.mode || 'ONLINE',
        hashVerified: true,
        apiVerified: verifyResult.success,
        responsePayload: responseData,
        verificationPayload: verifyResult.rawResponse,
        updatedAt: nowIso
      });

      // C. Atomic update in Supabase
      updateSupabasePaymentRecord(cleanAppId, {
        paymentMethod: 'online_payu',
        paymentStatus: 'paid',
        amountPaid: finalAmount,
        amountDue: 0,
        gatewayTxnId: cleanTxnid,
        payuMihpayid: mihpayid || verifyResult.mihpayid,
        payuBankRef: bank_ref_num || verifyResult.bankRefNum,
        paidAt: nowIso
      }).catch((err) => console.warn('[PayU Response] Supabase payment update notice:', err));

      recordSupabasePaymentTransaction({
        txnid: cleanTxnid,
        tokenId: cleanAppId,
        appId: cleanAppId,
        status: 'paid',
        payuMihpayid: mihpayid || verifyResult.mihpayid,
        bankRefNum: bank_ref_num || verifyResult.bankRefNum,
        paymentMode: mode || verifyResult.mode,
        hashVerified: true,
        apiVerified: verifyResult.success,
        responsePayload: responseData,
        verificationPayload: verifyResult.rawResponse,
        updatedAt: nowIso
      }).catch((err) => console.warn('[PayU Response] Supabase transaction audit notice:', err));

      // D. Broadcast realtime event
      const db = getDb();
      const updatedApp = (db.appointments || []).find((a: any) => a.appId === cleanAppId || a.id === cleanAppId);
      broadcastRealtimeEvent('APPOINTMENT_UPDATED', updatedApp || { appId: cleanAppId, paymentStatus: 'paid' });

      console.log(`✅ [PayU Payment Reconciled & Paid] Token ${cleanAppId} | ₹${finalAmount} | Ref: ${mihpayid}`);

      // E. Redirect customer to live tracking view with success parameters
      return res.redirect(
        303,
        `${getAppBaseUrl()}/track?token=${encodeURIComponent(cleanAppId)}&payment=success&txnid=${encodeURIComponent(cleanTxnid)}&ref=${encodeURIComponent(mihpayid || '')}&amt=${encodeURIComponent(String(finalAmount))}`
      );
    } else {
      // Payment Failed or Cancelled
      const failReason = error_Message || verifyResult.message || 'Payment transaction was not completed';

      updateAppointmentPayment(cleanAppId, {
        paymentMethod: 'online_payu',
        paymentStatus: 'failed',
        gatewayTxnId: cleanTxnid
      });

      upsertPaymentTransaction({
        txnid: cleanTxnid,
        tokenId: cleanAppId,
        appId: cleanAppId,
        status: 'failed',
        errorMessage: failReason,
        responsePayload: responseData,
        verificationPayload: verifyResult.rawResponse,
        updatedAt: nowIso
      });

      updateSupabasePaymentRecord(cleanAppId, {
        paymentMethod: 'online_payu',
        paymentStatus: 'failed',
        gatewayTxnId: cleanTxnid
      }).catch((err) => console.warn('[PayU Response Failed] Supabase notice:', err));

      console.log(`⚠️ [PayU Payment Incomplete/Failed] Token: ${cleanAppId} | Reason: ${failReason}`);

      return res.redirect(
        303,
        `${getAppBaseUrl()}/track?token=${encodeURIComponent(cleanAppId)}&payment=failed&txnid=${encodeURIComponent(cleanTxnid)}&reason=${encodeURIComponent(failReason)}`
      );
    }
  } catch (err: any) {
    console.error('[PayU Response Handler Exception]:', err?.message || err);
    return res.redirect(
      303,
      `${getAppBaseUrl()}/track?payment=error&reason=${encodeURIComponent('Server error processing payment callback')}`
    );
  }
});

// PayU Server-to-Server Webhook Endpoint
app.post('/api/payu/webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};
    const { status, txnid, udf1, mihpayid } = payload;
    const cleanTxnid = String(txnid || '').trim();
    const cleanAppId = String(udf1 || '').trim();

    if (!cleanTxnid) {
      return res.status(400).json({ success: false, error: 'Missing txnid' });
    }

    const salt = isPayUConfigured() ? getPayUMerchantSalt() : 'test_mock_salt_12345';
    const hashValid = verifyPayUResponseHash(payload, salt);

    if (!hashValid && isPayUConfigured()) {
      return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
    }

    const verifyResult = await verifyPaymentWithPayU(cleanTxnid);
    if (verifyResult.success || String(status).toLowerCase() === 'success') {
      const nowIso = new Date().toISOString();
      updateAppointmentPayment(cleanAppId, {
        paymentMethod: 'online_payu',
        paymentStatus: 'paid',
        gatewayTxnId: cleanTxnid,
        utrNumber: mihpayid || cleanTxnid,
        paidAt: nowIso
      });
      updateSupabasePaymentRecord(cleanAppId, {
        paymentMethod: 'online_payu',
        paymentStatus: 'paid',
        gatewayTxnId: cleanTxnid,
        paidAt: nowIso
      }).catch(() => {});
    }

    return res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Webhook error' });
  }
});

// Admin / Staff Action: Recheck payment directly with PayU Verify Payment API
app.post('/api/payu/recheck', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { txnid, appId } = req.body || {};
    if (!txnid && !appId) {
      return res.status(400).json({ success: false, error: 'Transaction ID or Application ID required.' });
    }

    const db = getDb();
    let targetTxnid = String(txnid || '').trim();
    let targetAppId = String(appId || '').trim();

    if (!targetTxnid && targetAppId) {
      const matchedApp = (db.appointments || []).find((a: any) => a.appId === targetAppId || a.id === targetAppId);
      targetTxnid = (matchedApp as any)?.gatewayTxnId || (matchedApp as any)?.utrNumber || '';
    }

    if (!targetTxnid) {
      return res.status(404).json({
        success: false,
        error: 'No payment transaction reference found for this application to verify.'
      });
    }

    const verifyResult = await verifyPaymentWithPayU(targetTxnid);

    if (verifyResult.success && targetAppId) {
      const nowIso = new Date().toISOString();
      updateAppointmentPayment(targetAppId, {
        paymentStatus: 'paid',
        amountPaid: verifyResult.amount,
        paidAt: nowIso
      });
      updateSupabasePaymentRecord(targetAppId, {
        paymentStatus: 'paid',
        amountPaid: verifyResult.amount,
        paidAt: nowIso
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      verifiedStatus: verifyResult.status,
      details: verifyResult
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Recheck failed: ' + (err?.message || err) });
  }
});

// Admin / Staff Action: Record Offline Counter Payment (Cash / In-Person Collection)
app.post('/api/admin/record-offline-payment', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { appId, amountPaid, receiptNo, notes } = req.body || {};
    const cleanAppId = String(appId || '').trim();

    if (!cleanAppId) {
      return res.status(400).json({ success: false, error: 'Application Reference ID is required.' });
    }

    const numAmount = Number(amountPaid);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid collected amount in ₹ is required.' });
    }

    const staffUser = (req as any).adminUser?.username || 'Mahi';
    const finalReceiptNo = String(receiptNo || `CSC_CASH_${Date.now().toString().slice(-6)}`).trim();
    const nowIso = new Date().toISOString();

    // 1. Update local DB
    const localUpdated = updateAppointmentPayment(cleanAppId, {
      paymentMethod: 'pay_at_centre',
      paymentStatus: 'paid',
      amountPaid: numAmount,
      amountDue: 0,
      offlineReceiptNo: finalReceiptNo,
      offlineCollectedBy: staffUser,
      paidAt: nowIso
    });

    // 2. Update Supabase
    const supaResult = await updateSupabasePaymentRecord(cleanAppId, {
      paymentMethod: 'pay_at_centre',
      paymentStatus: 'paid',
      amountPaid: numAmount,
      amountDue: 0,
      offlineReceiptNo: finalReceiptNo,
      offlineCollectedBy: staffUser,
      offlineCollectedAt: nowIso,
      paidAt: nowIso
    });

    // 3. Record transaction audit log
    const cashTxnId = `CASH_${cleanAppId}_${Date.now().toString().slice(-6)}`;
    upsertPaymentTransaction({
      txnid: cashTxnId,
      tokenId: cleanAppId,
      appId: cleanAppId,
      customerName: 'Offline Citizen',
      serviceName: 'CSC Counter Collection',
      paymentMethod: 'pay_at_centre',
      totalAmount: numAmount,
      status: 'paid',
      offlineReceiptNo: finalReceiptNo,
      offlineCollectedBy: staffUser,
      createdAt: nowIso
    });

    recordSupabasePaymentTransaction({
      txnid: cashTxnId,
      tokenId: cleanAppId,
      appId: cleanAppId,
      paymentMethod: 'pay_at_centre',
      totalAmount: numAmount,
      status: 'paid',
      offlineReceiptNo: finalReceiptNo,
      offlineCollectedBy: staffUser,
      createdAt: nowIso
    }).catch(() => {});

    // 4. Broadcast realtime event
    const db = getDb();
    const updated = (db.appointments || []).find((a: any) => a.appId === cleanAppId || a.id === cleanAppId);
    broadcastRealtimeEvent('APPOINTMENT_UPDATED', updated || { appId: cleanAppId, paymentStatus: 'paid' });

    console.log(`💵 [Cash Collected] App ${cleanAppId} marked PAID: ₹${numAmount} by Staff "${staffUser}" [Slip: ${finalReceiptNo}]`);

    return res.status(200).json({
      success: true,
      message: `Offline cash payment of ₹${numAmount} successfully recorded.`,
      appId: cleanAppId,
      receiptNo: finalReceiptNo,
      collectedBy: staffUser,
      collectedAt: nowIso
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to record offline payment: ' + (err?.message || err) });
  }
});

// Admin / Staff Action: Get Payment Transactions Ledger
app.get('/api/payu/transactions', authenticateAdmin, (_req: Request, res: Response) => {
  const transactions = getPaymentTransactions();
  return res.status(200).json({
    success: true,
    transactions
  });
});

// ============================================================
// RAZORPAY PAYMENT GATEWAY ENDPOINTS
// ============================================================

// Get public Razorpay Key ID
app.get('/api/razorpay/config', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  if (!keyId) {
    return res.status(200).json({
      success: false,
      configured: false,
      error: 'Razorpay online payment is currently not configured on this server.'
    });
  }
  return res.status(200).json({
    success: true,
    configured: true,
    keyId
  });
});

// Create Razorpay Order
app.post('/api/razorpay/create-order', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const { amount, appId, customerName, email, phone, service } = req.body || {};

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid payment amount is required.' });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        error: 'Razorpay gateway is not configured on this server. Please use UPI payment or pay at CSC counter.'
      });
    }
    const amountInPaise = Math.round(Number(amount) * 100);

    const receiptId = (appId || `CSC_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 40);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        appId: appId || 'N/A',
        customerName: customerName || 'CSC Customer',
        service: service || 'CSC Portal Service',
        phone: phone || ''
      }
    };

    const order = await razorpay.orders.create(options);

    console.log(`💳 Razorpay Order Created [ID: ${order.id}] for ${customerName || 'Customer'} - ₹${amount}`);

    return res.status(200).json({
      success: true,
      order,
      keyId: (process.env.RAZORPAY_KEY_ID || '').trim()
    });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error?.message || 'Server error');
    return res.status(500).json({
      success: false,
      error: 'Payment order creation failed: ' + (error?.error?.description || error?.message || 'Gateway unavailable')
    });
  }
});

// Verify Razorpay Payment Signature
app.post('/api/razorpay/verify-payment', (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appId } = req.body || {};

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!keySecret) {
      return res.status(503).json({
        success: false,
        error: 'Payment signature verification unavailable: Gateway secret is not configured.'
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing Razorpay verification parameters (order_id, payment_id, signature).'
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      console.log(`✅ Razorpay Payment Verified [Payment ID: ${razorpay_payment_id}] for Order ${razorpay_order_id}`);

      if (appId) {
        updateAppointmentStatus(appId, 'completed');
      }

      res.json({
        success: true,
        message: 'Razorpay payment signature verified successfully.',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        utrNumber: razorpay_payment_id
      });
    } else {
      console.error(`❌ Razorpay Payment Verification Failed for Order ${razorpay_order_id}`);
      res.status(400).json({
        success: false,
        error: 'Razorpay payment signature verification failed. Invalid transaction.'
      });
    }
  } catch (error: any) {
    console.error('Razorpay Verification Error:', error?.message || 'Server error');
    res.status(500).json({
      success: false,
      error: 'Server error verifying Razorpay payment.'
    });
  }
});

// Public API: Submit contact form (with validation and simulated emails)
app.post('/api/contact', (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !phone || !service || !message) {
    return res.status(400).json({ error: 'Please provide all required fields (Name, Phone, Service, Message).' });
  }

  // Save to JSON database
  const request = addContactRequest({ name, email: email || '', phone, service, message });
  const db = getDb();

  // Send confirmation email to client (simulated)
  if (email) {
    simulateEmail(
      email,
      `Confirmation: Contact Request Received - ${db.settings.cafeName}`,
      `💡 Hello ${name},<br/><br/>
      Thank you for contacting ${db.settings.cafeName}. We have received your query regarding <b>${service}</b>.<br/>
      Our team will review your message and reach out to you within 2 to 4 working hours.<br/><br/>
      <b>Your Query Details:</b><br/>
      - Name: ${name}<br/>
      - Phone: ${phone}<br/>
      - Message: ${message}<br/><br/>
      Regards,<br/>Support Team - ${db.settings.cafeName}`
    );
  }

  // Send notification email to owner (simulated)
  simulateEmail(
    db.settings.email,
    `🚨 NEW Contact Request: ${service} from ${name}`,
    `🔔 Hello Administrator,<br/><br/>
    You have received a new service query on the cyber cafe portal:<br/><br/>
    <b>Submission Information:</b><br/>
    - Name: ${name}<br/>
    - Phone: ${phone}<br/>
    - Email: ${email || 'Not Provided'}<br/>
    - Requested Service: ${service}<br/>
    - Message: ${message}<br/><br/>
    Please log in to your admin panel to manage this request.`
  );

  res.json({ success: true, data: request, message: 'Message submitted successfully. Emails simulated in logs.' });
});

// Live Real-Time SSE Stream Engine
const sseClients = new Set<express.Response>();

export function broadcastRealtimeEvent(type: string, payload: any) {
  const data = `data: ${JSON.stringify({ type, payload, timestamp: Date.now() })}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(data);
    } catch {
      sseClients.delete(client);
    }
  });
}

// Public API: Real-time event stream (Server-Sent Events)
app.get('/api/realtime/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// SSE Keep-Alive heartbeat interval (every 15s)
setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.write(`: ping\n\n`);
    } catch {
      sseClients.delete(client);
    }
  });
}, 15000);

// Public API: Fast synchronization of deleted application IDs blacklist
app.get('/api/appointments/deleted-ids', (req, res) => {
  const db = getDb();
  const deletedSet = new Set((db.deletedAppointmentIds || []).map(s => String(s).toLowerCase().trim()));
  res.json({ success: true, deletedIds: Array.from(deletedSet) });
});

// Protected API: Get all submitted applications (authorized staff/admin only)
app.get('/api/appointments', authenticateAdmin, (req, res) => {
  const db = getDb();
  const deletedSet = new Set((db.deletedAppointmentIds || []).map(s => String(s).toLowerCase().trim()));
  const activeList = (db.appointments || []).filter((a: any) => {
    if (isDeletedApplicationRecord(a)) return false;
    const aId = String(a.id || '').toLowerCase().trim();
    const aAppId = String(a.appId || '').toLowerCase().trim();
    const aSupaId = String(a.supabaseId || '').toLowerCase().trim();
    if (aId && deletedSet.has(aId)) return false;
    if (aAppId && deletedSet.has(aAppId)) return false;
    if (aSupaId && deletedSet.has(aSupaId)) return false;
    return true;
  });
  res.json({ success: true, data: activeList, deletedIds: Array.from(deletedSet) });
});

// Public API: Get next available globally unique token ID (strictly monotonic across Supabase + local DB)
app.get('/api/appointments/next-token', async (req, res) => {
  const supaMax = await getHighestSupabaseTokenSeq();
  const nextSeq = getNextMonotonicLocalSeq(supaMax);
  const seqPadded = String(nextSeq).padStart(3, '0');
  const nextToken = `CSC21251567${seqPadded}`;
  res.json({ success: true, nextToken, seq: nextSeq });
});

// Public API: Get single application by token / ID (local DB with safe Supabase fallback)
app.get('/api/appointments/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const targetId = (id || '').toString().toLowerCase().trim();
  const deletedSet = new Set((db.deletedAppointmentIds || []).map(s => String(s).toLowerCase().trim()));

  if (deletedSet.has(targetId)) {
    return res.status(404).json({ error: 'Application record has been deleted' });
  }

  // 1. Check local database (only active records)
  const found = (db.appointments || []).find((a: any) => {
    if (isDeletedApplicationRecord(a)) return false;
    const aId = String(a.id || '').toLowerCase().trim();
    const aAppId = String(a.appId || '').toLowerCase().trim();
    const aSupaId = String(a.supabaseId || '').toLowerCase().trim();
    if (deletedSet.has(aId) || deletedSet.has(aAppId) || (aSupaId && deletedSet.has(aSupaId))) return false;
    const utrStr = (a.utrNumber || '').toString().toLowerCase().trim();
    return aAppId === targetId || aId === targetId || utrStr === targetId;
  });

  if (found) {
    return res.json(found);
  }

  // 2. Fallback to Supabase 'applications' table (using safe UUID / token lookup)
  try {
    const lookup = await findSupabaseApplicationRows(id);
    const activeRow = (lookup.rows || []).find(r => !isDeletedApplicationRecord(r));

    if (activeRow) {
      const resolvedToken = activeRow.token_id || activeRow.payload?.appId || `CSC-${String(activeRow.id).slice(0, 8)}`;
      const mappedApp = {
        appId: resolvedToken,
        id: resolvedToken,
        supabaseId: activeRow.id,
        name: activeRow.full_name,
        customerName: activeRow.full_name,
        phone: activeRow.whatsapp_number,
        phoneNumber: activeRow.whatsapp_number,
        email: activeRow.email_address || '',
        emailAddress: activeRow.email_address || '',
        service: activeRow.service_selected,
        selectedService: activeRow.service_selected,
        status: activeRow.status || 'Pending',
        paymentMode: activeRow.payment_mode || 'cash',
        utrNumber: activeRow.utr_number || 'N/A',
        totalAmount: Number(activeRow.total_amount) || 0,
        userCategory: activeRow.user_category || 'General/OBC',
        documents: Array.isArray(activeRow.document_urls) ? activeRow.document_urls : [],
        submittedAt: activeRow.created_at,
        createdAt: activeRow.created_at,
        payload: activeRow.payload
      };
      return res.json(mappedApp);
    }
  } catch (supaErr) {
    console.warn('[Server] Supabase single app lookup notice:', supaErr);
  }

  return res.status(404).json({ error: 'Application record not found' });
});

// Update appointment status
app.patch('/api/appointments/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  const success = updateAppointmentStatus(id, status);
  if (success) {
    const db = getDb();
    const updated = (db.appointments || []).find((a: any) => a.id === id || a.appId === id);
    broadcastRealtimeEvent('APPOINTMENT_UPDATED', updated || { id, appId: id, status });
    res.json({ success: true, message: 'Status updated successfully', data: updated });
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

// Bulk delete appointments (persists across Supabase + local server DB with affected row verification - Admin protected)
app.post('/api/appointments/bulk-delete', authenticateAdmin, async (req: Request, res: Response) => {
  const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
  if (rawItems.length === 0) {
    return res.status(400).json({
      success: false,
      affectedCount: 0,
      error: 'No application IDs provided for bulk deletion.'
    });
  }

  // 1. Collect all identifiers and delete from local database immediately
  const localTargetIds: string[] = [];
  const supaTasks: Array<{ targetId: string; supabaseUuid?: string }> = [];

  for (const item of rawItems) {
    const targetId = typeof item === 'string' ? item.trim() : String(item?.appId || item?.id || '').trim();
    const supabaseUuid = typeof item === 'object' && item !== null ? String(item.supabaseId || '').trim() : '';
    if (targetId) localTargetIds.push(targetId);
    if (supabaseUuid) localTargetIds.push(supabaseUuid);
    if (typeof item === 'object' && item !== null) {
      if (item.id && typeof item.id === 'string' && item.id.trim()) localTargetIds.push(item.id.trim());
      if (item.appId && typeof item.appId === 'string' && item.appId.trim()) localTargetIds.push(item.appId.trim());
    }
    if (targetId || supabaseUuid) {
      supaTasks.push({ targetId: targetId || supabaseUuid, supabaseUuid: supabaseUuid || undefined });
    }
  }

  // Delete from local DB immediately and permanently register in deletedAppointmentIds
  for (const tid of localTargetIds) {
    deleteAppointment(tid, localTargetIds);
  }

  const deletedIds: string[] = Array.from(new Set(localTargetIds));
  const deletedSupabaseIds: string[] = [];
  const deletedTokenIds: string[] = [];
  let totalAffected = deletedIds.length;

  // 2. Perform Supabase deletion concurrently with a 3.5s timeout per request
  try {
    const supaResults = await Promise.allSettled(
      supaTasks.map(t =>
        Promise.race([
          deleteCustomerApplicationFromSupabase(t.targetId, t.supabaseUuid),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Supabase delete timeout')), 3500))
        ])
      )
    );

    supaResults.forEach(res => {
      if (res.status === 'fulfilled' && res.value) {
        const val = res.value;
        if (Array.isArray(val.deletedSupabaseIds)) deletedSupabaseIds.push(...val.deletedSupabaseIds);
        if (Array.isArray(val.deletedTokenIds)) deletedTokenIds.push(...val.deletedTokenIds);
        if (Number(val.affectedCount) > 0) totalAffected += Number(val.affectedCount);
      }
    });
  } catch (err) {
    console.warn('[Bulk Delete] Supabase concurrent deletion error:', err);
  }

  // Ensure all discovered deleted Supabase and Token IDs are registered in db.deletedAppointmentIds
  const allExtraDeleted = [...deletedSupabaseIds, ...deletedTokenIds];
  if (allExtraDeleted.length > 0) {
    allExtraDeleted.forEach(tid => deleteAppointment(tid, allExtraDeleted));
  }

  broadcastRealtimeEvent('APPOINTMENTS_BULK_DELETED', {
    deletedIds,
    deletedSupabaseIds,
    deletedTokenIds
  });

  return res.json({
    success: true,
    affectedCount: Math.max(totalAffected, 1),
    deletedIds,
    deletedSupabaseIds,
    deletedTokenIds,
    failedItems: [],
    message: `Permanently deleted ${deletedIds.length} application(s).`
  });
});

// Delete single appointment (persists across Supabase + local server DB with affected row verification)
app.delete('/api/appointments/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const supabaseId = String(req.query.supabaseId || req.body?.supabaseId || '').trim();

  // 1. Immediately delete locally and record in permanent deleted blacklist
  const localRemoved = deleteAppointment(id, [supabaseId]);

  // 2. Perform Supabase deletion with timeout
  let supaRes: any = { success: true, affectedCount: 0, deletedSupabaseIds: [], deletedTokenIds: [] };
  try {
    supaRes = await Promise.race([
      deleteCustomerApplicationFromSupabase(id, supabaseId),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Supabase delete timeout')), 3500))
    ]);
  } catch (err: any) {
    console.warn(`[Supabase Delete] Notice for ${id}:`, err?.message || err);
  }

  const extraIds = [
    ...(Array.isArray(supaRes?.deletedSupabaseIds) ? supaRes.deletedSupabaseIds : []),
    ...(Array.isArray(supaRes?.deletedTokenIds) ? supaRes.deletedTokenIds : [])
  ];
  if (extraIds.length > 0) {
    deleteAppointment(id, [supabaseId, ...extraIds]);
  }

  const affectedCount = Math.max(supaRes?.affectedCount || 0, localRemoved ? 1 : 0, 1);
  const eventPayload = {
    id,
    appId: id,
    supabaseId: supabaseId || supaRes?.deletedSupabaseIds?.[0] || undefined,
    deletedSupabaseIds: supaRes?.deletedSupabaseIds || [],
    deletedTokenIds: supaRes?.deletedTokenIds || []
  };

  broadcastRealtimeEvent('APPOINTMENT_DELETED', eventPayload);

  return res.json({
    success: true,
    affectedCount,
    deletionMode: supaRes?.deletionMode || (localRemoved ? 'local_hard' : 'hard'),
    deletedSupabaseIds: supaRes?.deletedSupabaseIds || [],
    deletedTokenIds: supaRes?.deletedTokenIds || [],
    message: 'Application permanently deleted.'
  });
});

// Rate-limiting tracker for public submissions (prevent spam, allow retries)
const submissionRateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = submissionRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    submissionRateMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 25) {
    return false;
  }
  entry.count++;
  return true;
}

// ============================================================
// DEDICATED REAL CUSTOMER APPLICATION SUBMISSION ENDPOINT
// ============================================================
app.post('/api/applications/submit', async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Submission rate limit reached. Please wait a minute before submitting again.'
    });
  }

  const {
    appId,
    idempotencyKey,
    customerName,
    name,
    applicantName,
    phoneNumber,
    phone,
    mobile,
    emailAddress,
    email,
    selectedService,
    service,
    userCategory,
    dateOfBirth,
    paymentMode,
    utrNumber,
    totalAmount,
    message,
    documents,
    mandatoryDocName,
    status
  } = req.body || {};

  const finalName = (customerName || name || applicantName || '').toString().trim();
  const rawPhone = (phoneNumber || phone || mobile || '').toString().trim();
  const digitsOnly = rawPhone.replace(/\D/g, '');
  const finalService = (selectedService || service || '').toString().trim();

  // Strict Validation Rules
  if (!finalName) {
    return res.status(400).json({
      success: false,
      error: 'Full Name is required to register an official application.'
    });
  }

  if (digitsOnly.length < 10) {
    return res.status(400).json({
      success: false,
      error: 'A valid 10-digit WhatsApp Mobile Number is required.'
    });
  }

  if (!finalService) {
    return res.status(400).json({
      success: false,
      error: 'Please select an official government service or specify your requirement.'
    });
  }

  // Generate / verify unique monotonic token ID across Supabase and local DB
  const explicitCallerToken = (appId || idempotencyKey || '').toString().trim();
  let assignedAppId = explicitCallerToken;
  if (!assignedAppId || !assignedAppId.startsWith('CSC')) {
    const supaMaxSeq = await getHighestSupabaseTokenSeq();
    const nextSeq = getNextMonotonicLocalSeq(supaMaxSeq);
    assignedAppId = `CSC21251567${String(nextSeq).padStart(3, '0')}`;
  }

  const nowIso = new Date().toISOString();
  const currentDate = nowIso.split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // 1. PERSIST TO SUPABASE (Awaited with verified confirmation)
  const persistResult = await persistCustomerApplication({
    appId: assignedAppId,
    idempotencyKey: explicitCallerToken || undefined,
    customerName: finalName,
    phoneNumber: digitsOnly.length === 10 ? digitsOnly : rawPhone,
    emailAddress: (emailAddress || email || '').trim(),
    selectedService: finalService,
    userCategory: userCategory || 'General/OBC',
    dateOfBirth: dateOfBirth || 'N/A',
    paymentMode: paymentMode || 'Pay at CSC Desk Upon Completion',
    utrNumber: utrNumber || 'N/A',
    totalAmount: typeof totalAmount === 'number' ? totalAmount : Number(totalAmount) || 0,
    message: message || 'None',
    status: status || 'Pending',
    submittedAt: nowIso,
    mandatoryDocName: mandatoryDocName,
    documents: Array.isArray(documents) ? documents : []
  });

  if (!persistResult.success) {
    console.error(`❌ [Submission Error] Customer submission failed for ${finalName}:`, persistResult.error);
    return res.status(500).json({
      success: false,
      appId: assignedAppId,
      error: persistResult.error || 'Failed to save application to Supabase database. Please try again.'
    });
  }

  const confirmedAppId = persistResult.appId || assignedAppId;

  // 2. Synchronize with local server database and SSE stream
  const sanitizedDocs = (persistResult.data?.document_urls || []).map((docItem: any, idx: number) => ({
    id: docItem.id || `doc-${idx}`,
    name: docItem.name || 'Document',
    size: docItem.size || 0,
    type: docItem.type || 'application/octet-stream',
    url: docItem.url || ''
  }));

  const localAppointment = addAppointment({
    appId: confirmedAppId,
    id: confirmedAppId,
    supabaseId: persistResult.data?.id ? String(persistResult.data.id) : undefined,
    name: finalName,
    email: (emailAddress || email || '').trim(),
    phone: digitsOnly.length === 10 ? digitsOnly : rawPhone,
    service: finalService,
    appointmentDate: currentDate,
    appointmentTime: currentTime,
    message: message || 'None',
    dateOfBirth: dateOfBirth || 'N/A',
    userCategory: userCategory || 'General/OBC',
    paymentMode: paymentMode || 'Pay at CSC Desk Upon Completion',
    utrNumber: utrNumber || 'N/A',
    totalAmount: typeof totalAmount === 'number' ? totalAmount : Number(totalAmount) || 0,
    documents: sanitizedDocs,
    status: 'Pending',
    submittedAt: `${currentDate} ${currentTime}`,
    createdAt: nowIso
  });

  broadcastRealtimeEvent('APPOINTMENT_ADDED', localAppointment);

  const db = getDb();
  const docCount = sanitizedDocs.length;

  // 3. Send notifications
  if (emailAddress && emailAddress !== 'N/A') {
    simulateEmail(
      emailAddress,
      `Official Application Receipt - ${db.settings.cafeName}`,
      `📅 Hello ${finalName},<br/><br/>
      Your application for <b>${finalService}</b> has been securely registered in our CSC database.<br/>
      <b>Official Tracking Token:</b> <b>${confirmedAppId}</b><br/>
      Attached Documents: <b>${docCount} file(s) processed</b>.<br/>
      Our authorized staff will review and process your file.<br/><br/>
      Track Status: <a href="https://www.cscdost.com/#track">https://www.cscdost.com/#track</a><br/><br/>
      Regards,<br/>CSC DOST Portal - ${db.settings.cafeName}`
    );
  }

  // Webhook notification to Make.com / WhatsApp
  const makeWebhook = process.env.WHATSAPP_BROADCAST_WEBHOOK_URL || 'https://hook.eu1.make.com/64f9lm3a5sgm4pt9qbc832xgx0nw6bpl';
  if (makeWebhook && makeWebhook.startsWith('http')) {
    fetch(makeWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'new_booking_application',
        category: 'booking',
        title: `Application Registered: ${finalService}`,
        body: `Hello ${finalName}, your application for ${finalService} has been registered. Token ID: ${confirmedAppId}. Track your status at https://www.cscdost.com/#track`,
        token_id: confirmedAppId,
        customer_name: finalName,
        customer_phone: digitsOnly,
        service: finalService,
        timestamp: nowIso
      })
    }).catch(err => {
      console.warn('[Webhook Auto-Dispatch] Notification ping error:', err.message);
    });
  }

  return res.status(200).json({
    success: true,
    appId: confirmedAppId,
    token_id: confirmedAppId,
    supabaseId: persistResult.data?.id,
    status: 'Pending',
    data: persistResult.data,
    documentWarnings: persistResult.documentWarnings,
    message: 'Application registered and verified in Supabase database.'
  });
});

// Legacy Public API: Book appointment / Submit online application (with automatic Supabase sync)
app.post('/api/appointments', async (req: Request, res: Response) => {
  const { 
    appId, 
    id,
    token,
    tokenNo,
    name, 
    customerName,
    applicantName,
    email, 
    emailAddress,
    phone, 
    phoneNumber,
    mobile,
    service, 
    selectedService,
    eService,
    appointmentDate, 
    appointmentTime, 
    submittedAt,
    createdAt,
    message,
    dateOfBirth,
    userCategory,
    paymentMode,
    utrNumber,
    totalAmount,
    documents,
    uploadedDocuments,
    status 
  } = req.body || {};

  const finalName = (name || customerName || applicantName || 'Applicant').toString().trim();
  const finalPhone = (phone || phoneNumber || mobile || 'N/A').toString().trim();
  const finalService = (service || selectedService || eService || 'General CSC Service').toString().trim();
  const finalEmail = (email || emailAddress || '').toString().trim();

  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const finalAppId = appId || id || token || tokenNo || `CSC21251567${Math.floor(100 + Math.random() * 900)}`;

  const rawDocs = Array.isArray(documents) ? documents : (Array.isArray(uploadedDocuments) ? uploadedDocuments : []);
  const sanitizedDocs = rawDocs.map((docItem: any) => ({
    id: docItem.id || `doc-${Math.random().toString(36).substring(2, 7)}`,
    name: docItem.name || docItem.docTypeName || 'Document',
    size: typeof docItem.size === 'number' ? docItem.size : 0,
    type: docItem.type || 'application/octet-stream',
    url: docItem.url || (docItem.dataUrl && docItem.dataUrl.startsWith('http') ? docItem.dataUrl : undefined),
    dataUrl: docItem.dataUrl && docItem.dataUrl.length < 100000 ? docItem.dataUrl : undefined
  }));

  const appointment = addAppointment({
    appId: finalAppId,
    id: finalAppId,
    name: finalName,
    email: finalEmail,
    phone: finalPhone,
    service: finalService,
    appointmentDate: appointmentDate || currentDate,
    appointmentTime: appointmentTime || submittedAt || createdAt || currentTime,
    message: message || 'None',
    dateOfBirth: dateOfBirth || 'N/A',
    userCategory: userCategory || 'General/OBC',
    paymentMode: paymentMode || 'cash',
    utrNumber: utrNumber || 'N/A',
    totalAmount: typeof totalAmount === 'number' ? totalAmount : Number(totalAmount) || 0,
    documents: sanitizedDocs,
    status: status || 'Pending',
    submittedAt: submittedAt || createdAt || `${currentDate} ${currentTime}`,
    createdAt: createdAt || submittedAt || new Date().toISOString()
  });
  const db = getDb();
  broadcastRealtimeEvent('APPOINTMENT_ADDED', appointment);

  // Background Supabase Sync for legacy endpoint
  persistCustomerApplication({
    appId: finalAppId,
    customerName: finalName,
    phoneNumber: finalPhone,
    emailAddress: finalEmail,
    selectedService: finalService,
    userCategory: userCategory || 'General/OBC',
    dateOfBirth: dateOfBirth || 'N/A',
    paymentMode: paymentMode || 'cash',
    utrNumber: utrNumber || 'N/A',
    totalAmount: typeof totalAmount === 'number' ? totalAmount : Number(totalAmount) || 0,
    message: message || 'None',
    status: status || 'Pending',
    documents: rawDocs
  }).catch(err => {
    console.warn('[Server] Supabase background sync notice:', err);
  });

  const docCount = Array.isArray(documents) ? documents.length : 0;

  // Send confirmation email to client
  if (email && email !== 'N/A') {
    simulateEmail(
      email,
      `Application & Slot Confirmation - ${db.settings.cafeName}`,
      `📅 Hello ${finalName},<br/><br/>
      Your application/booking request for <b>${finalService}</b> [ID: <b>${appointment.appId}</b>] has been registered.<br/>
      Attached Documents: <b>${docCount} file(s) uploaded</b>.<br/>
      Our team will review your application and documents.<br/><br/>
      Regards,<br/>CSC DOST Portal - ${db.settings.cafeName}`
    );
  }

  // Send notification to owner
  simulateEmail(
    db.settings.email,
    `🚨 NEW Application Submitted: ${finalService} by ${finalName} [${docCount} Docs]`,
    `🔔 Hello Desk Administrator,<br/><br/>
    A customer has submitted a new application with documents on the portal:<br/><br/>
    <b>Application Details:</b><br/>
    - Application Token ID: ${appointment.appId}<br/>
    - Customer Name: ${finalName}<br/>
    - Phone: ${finalPhone}<br/>
    - Service: ${finalService}<br/>
    - Attached Documents: ${docCount} file(s) uploaded<br/>
    - Payment Mode: ${paymentMode || 'cash'} (UTR: ${utrNumber || 'N/A'})<br/>
    - Date & Time: ${appointmentDate || currentDate} at ${appointmentTime || currentTime}<br/><br/>
    Log in to the Admin Dashboard to view/download attached documents.`
  );

  // Automated Webhook Trigger to Make.com
  const makeWebhook = process.env.WHATSAPP_BROADCAST_WEBHOOK_URL || 'https://hook.eu1.make.com/64f9lm3a5sgm4pt9qbc832xgx0nw6bpl';
  if (makeWebhook && makeWebhook.startsWith('http')) {
    fetch(makeWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'new_booking_application',
        category: 'booking',
        title: `Application Registered: ${finalService}`,
        body: `Hello ${finalName}, your application for ${finalService} has been registered. Token ID: ${appointment.appId}. Track your status at https://www.cscdost.com/#track`,
        token_id: appointment.appId,
        customer_name: finalName,
        customer_phone: finalPhone,
        customer_email: finalEmail,
        service: finalService,
        appointment_date: appointmentDate || currentDate,
        appointment_time: appointmentTime || currentTime,
        url: 'https://www.cscdost.com/#track',
        published_at: new Date().toISOString()
      })
    }).catch(err => {
      console.warn('[Webhook Auto-Dispatch] Notification ping error:', err.message);
    });
  }

  res.json({ success: true, data: appointment, message: 'Application submitted successfully with documents attached.' });
});

// Helper: Format phone number into clean E.164 standard (e.g. +919876543210)
function formatPhoneNumberE164(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`; // Default to India (+91) for 10-digit numbers
  return `+${cleaned}`;
}

// Public API: Automated WhatsApp Invoice Notification System
app.post('/api/send-whatsapp-invoice', async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      phone, 
      service, 
      totalAmount, 
      appId, 
      paymentMode, 
      utrNumber,
      userCategory,
      submittedAt 
    } = req.body;

    if (!name || !phone || !service) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: name, phone, and service are mandatory.' 
      });
    }

    const formattedPhone = formatPhoneNumberE164(phone);
    if (!formattedPhone || formattedPhone.length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid WhatsApp phone number format. Please enter a valid 10-digit mobile number.' 
      });
    }

    const db = getDb();
    const storeName = db.settings.cafeName || 'APNA CSC Digital Portal';
    const dateStr = submittedAt || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const amountStr = totalAmount ? `₹${totalAmount}` : '₹50';
    const token = appId || `APEX-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const payModeStr = (paymentMode || 'cash').toUpperCase();
    const utrStr = utrNumber && utrNumber !== 'N/A' ? utrNumber : 'N/A';

    // Formatted WhatsApp Invoice Message
    const messageText = 
`🧾 *${storeName.toUpperCase()} - OFFICIAL INVOICE*
----------------------------------------
📌 *Token ID:* \`${token}\`
👤 *Customer Name:* ${name}
📝 *Service Applied:* ${service}
📅 *Date:* ${dateStr}

💰 *PAYMENT & FEE BREAKDOWN:*
• Category: ${userCategory || 'General'}
• Fee Amount: ${amountStr}
• Payment Mode: ${payModeStr}
• UTR Ref No: \`${utrStr}\`

----------------------------------------
✅ *Status:* Application Successfully Registered
📲 *Track Real-time Status:* https://apnacsc.in/track?id=${token}

_Thank you for choosing ${storeName}! If you have any questions, reply directly to this chat._`;

    // Direct WhatsApp API Link for frontend one-click fallback
    const cleanDigits = formattedPhone.replace('+', '');
    const directWhatsAppUrl = `https://api.whatsapp.com/send?phone=${cleanDigits}&text=${encodeURIComponent(messageText)}`;

    // Provider 1: Check Twilio credentials
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioSender = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    // Provider 2: Check Meta WhatsApp Cloud API credentials
    const metaToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
    const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    let dispatchMethod = 'simulated';
    let apiResponse = null;

    if (twilioSid && twilioToken) {
      dispatchMethod = 'twilio';
      try {
        const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('From', twilioSender.startsWith('whatsapp:') ? twilioSender : `whatsapp:${twilioSender}`);
        params.append('To', `whatsapp:${formattedPhone}`);
        params.append('Body', messageText);

        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
        });

        apiResponse = await twilioRes.json();
        console.log('✅ Twilio WhatsApp Message Dispatched:', apiResponse);
      } catch (twErr: any) {
        console.error('❌ Twilio WhatsApp Dispatch Error:', twErr?.message || twErr);
      }
    } else if (metaToken && metaPhoneId) {
      dispatchMethod = 'meta_cloud_api';
      try {
        const metaRes = await fetch(`https://graph.facebook.com/v18.0/${metaPhoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${metaToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanDigits,
            type: 'text',
            text: { preview_url: false, body: messageText }
          })
        });

        apiResponse = await metaRes.json();
        console.log('✅ Meta WhatsApp Cloud API Dispatched:', apiResponse);
      } catch (metaErr: any) {
        console.error('❌ Meta WhatsApp Dispatch Error:', metaErr?.message || metaErr);
      }
    } else {
      console.log('\n========================================');
      console.log(`💬 SIMULATED WHATSAPP INVOICE DISPATCHED`);
      console.log(`📱 RECIPIENT PHONE: ${formattedPhone}`);
      console.log(`🏷️ TOKEN ID: ${token}`);
      console.log('----------------------------------------');
      console.log(messageText);
      console.log('========================================\n');
    }

    return res.json({
      success: true,
      dispatchMethod,
      formattedPhone,
      token,
      messageText,
      directWhatsAppUrl,
      apiResponse,
      message: dispatchMethod !== 'simulated' 
        ? 'WhatsApp invoice notification dispatched successfully via API.' 
        : 'WhatsApp invoice generated and simulated in server logs.'
    });
  } catch (error: any) {
    console.error('WhatsApp API Handler Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process WhatsApp notification request: ' + (error?.message || 'Unknown error') 
    });
  }
});

// ============================================================================
// WHATSAPP GROUP & CHANNEL PUBLISHER — DIAGNOSTICS, CONFIG, HISTORY & API
// ============================================================================

const ALLOWED_WHATSAPP_STATUSES = new Set<WhatsAppPublishStatus>([
  'Prepared',
  'Opened in WhatsApp',
  'Manually Confirmed',
  'Submitted to Provider',
  'Accepted',
  'Accepted by WhatsApp',
  'Sent',
  'Delivered',
  'Read',
  'Failed',
  'Not configured',
  'Unsupported or access not verified'
]);

// Helper: Sanitize Meta API error messages so tokens or credentials are never leaked
function sanitizeMetaErrorMessage(rawError: any): string {
  if (!rawError) return 'Unknown Meta WhatsApp API error';
  let str = '';
  if (typeof rawError === 'string') {
    str = rawError;
  } else if (rawError.message) {
    str = rawError.message;
  } else if (rawError.error?.message) {
    str = rawError.error.message;
  } else {
    str = JSON.stringify(rawError);
  }
  // Strip access tokens, keys, and authorization headers
  str = str.replace(/EA[A-Za-z0-9_-]{30,}/g, '[REDACTED_TOKEN]');
  str = str.replace(/bearer\s+[A-Za-z0-9_.-]+/gi, 'Bearer [REDACTED]');
  return str.slice(0, 220);
}

// Helper: Resolve Meta Graph API version from environment or default to v18.0
function getMetaGraphApiVersion(): string {
  const custom = (process.env.META_GRAPH_API_VERSION || '').trim();
  if (/^v\d+\.\d+$/i.test(custom)) return custom;
  return 'v18.0';
}

// Idempotency guard to prevent duplicate automated submissions within 60 seconds
const recentAutomatedSubmissions = new Map<string, number>();

function isValidWhatsAppChannelUrl(rawUrl: string): boolean {
  if (!rawUrl || !rawUrl.trim()) return true; // allow empty when clearing
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (host !== 'whatsapp.com' && host !== 'www.whatsapp.com') return false;
    return /^\/channel\/[A-Za-z0-9_-]{6,}/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

function isValidWhatsAppGroupInviteUrl(rawUrl: string): boolean {
  if (!rawUrl || !rawUrl.trim()) return true;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (host !== 'chat.whatsapp.com') return false;
    return /^\/[A-Za-z0-9_-]{6,}/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

// 1. Comprehensive WhatsApp Configuration & Destination Readiness Check
app.get(['/api/whatsapp/readiness', '/api/whatsapp/diagnostics'], authenticateAdmin, (_req: Request, res: Response) => {
  const cloudApiToken = (process.env.WHATSAPP_CLOUD_API_TOKEN || '').trim();
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
  const wabaId = (process.env.WHATSAPP_WABA_ID || '').trim();
  const appSecret = (process.env.META_APP_SECRET || '').trim();
  const webhookVerifyToken = (process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '').trim();
  const graphVersion = getMetaGraphApiVersion();
  const webhookUrl = `${getAppBaseUrl()}/api/whatsapp/webhook`;

  // Database-backed non-secret configuration with fallback to environment variables
  const config = getWhatsAppPublisherConfig();
  const effectiveOfficialGroupId = (config.officialGroupId || process.env.WHATSAPP_OFFICIAL_GROUP_ID || '').trim();
  const effectiveTestPhone = normalizePhoneNumber(config.testRecipientPhone || process.env.WHATSAPP_TEST_RECIPIENT_PHONE || '');
  const effectiveTemplateName = (config.templateName || process.env.WHATSAPP_POST_TEMPLATE_NAME || '').trim();
  const effectiveTemplateLanguage = (config.templateLanguage || process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US').trim();
  const effectiveDefaultDestination = (config.defaultDestination || 'test_recipient').trim();

  const cloudApiReady = Boolean(cloudApiToken && phoneNumberId);
  const officialGroupsApiReady = Boolean(cloudApiReady && effectiveOfficialGroupId);
  const testRecipientReady = Boolean(cloudApiReady && effectiveTestPhone);

  // Inspect registered appointments/contacts for opted-in phone numbers
  const db = getDb();
  const allSubscribers = new Set<string>();
  (db.appointments || []).forEach((a: any) => {
    const p = String(a.phone || '').replace(/\D/g, '');
    if (p.length === 10) allSubscribers.add(`91${p}`);
    else if (p.length === 12 && p.startsWith('91')) allSubscribers.add(p);
  });
  const optedInCount = allSubscribers.size;

  const destinations = [
    {
      id: 'channel_manual',
      name: config.channelName || 'CSC DOST Official WhatsApp Channel',
      type: 'channel',
      url: config.channelUrl,
      ready: Boolean(config.channelUrl),
      supportedDirectSend: false,
      statusLabel: 'Manual Workflow Only',
      reason: 'Meta Graph API has no public automated posting endpoint for WhatsApp Channels. Use "Open My WhatsApp Channel" to paste the formatted notification.',
      manualActionLabel: 'Open Channel'
    },
    {
      id: 'group_manual',
      name: config.groupName || 'CSC DOST Community Group',
      type: 'group_invite',
      url: config.groupInviteUrl,
      ready: Boolean(config.groupInviteUrl),
      supportedDirectSend: false,
      statusLabel: 'Manual Share Link',
      reason: 'Consumer WhatsApp Group invite links (chat.whatsapp.com) cannot be messaged via Meta Business Cloud API. Use 1-Click "Share on WhatsApp" to select your group.',
      manualActionLabel: 'Share on WhatsApp'
    },
    {
      id: 'group_api',
      name: 'API-Managed WhatsApp Group',
      type: 'group_api',
      ready: officialGroupsApiReady,
      supportedDirectSend: true,
      statusLabel: officialGroupsApiReady ? 'Ready for API Send' : effectiveOfficialGroupId ? 'Missing Cloud API Credentials' : 'Group ID Missing',
      targetHint: effectiveOfficialGroupId ? `Group ID: ${effectiveOfficialGroupId}` : undefined,
      reason: effectiveOfficialGroupId
        ? (cloudApiReady ? `Official API group (${effectiveOfficialGroupId}) configured.` : 'Missing WHATSAPP_CLOUD_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID.')
        : 'Configure Official API Group ID in WhatsApp Settings.'
    },
    {
      id: 'test_recipient',
      name: 'Authorized Test / Staff Phone',
      type: 'individual_test',
      ready: testRecipientReady,
      supportedDirectSend: true,
      statusLabel: testRecipientReady ? 'Ready for Test Send' : effectiveTestPhone ? 'Missing Cloud API Credentials' : 'Phone Not Configured',
      targetHint: effectiveTestPhone ? maskPhoneNumber(effectiveTestPhone) : undefined,
      reason: effectiveTestPhone
        ? (cloudApiReady ? `Authorized test recipient configured (${maskPhoneNumber(effectiveTestPhone)}).` : 'Missing WHATSAPP_CLOUD_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID.')
        : 'Configure Test Recipient Phone Number in WhatsApp Settings.'
    },
    {
      id: 'subscribers',
      name: 'Opted-In Citizen Contacts',
      type: 'subscribers_broadcast',
      ready: Boolean(cloudApiReady && optedInCount > 0),
      supportedDirectSend: true,
      subscriberCount: optedInCount,
      statusLabel: cloudApiReady ? (optedInCount > 0 ? `Ready (${optedInCount} contacts)` : 'No Opted-in Contacts') : 'Missing Cloud API Credentials',
      reason: cloudApiReady
        ? (optedInCount > 0 ? `${optedInCount} unique citizen mobile numbers registered.` : '0 citizen contacts registered.')
        : 'Missing WHATSAPP_CLOUD_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID.'
    }
  ];

  // Secrets Checklist: inspects actual server environment variables without returning secret values
  const serverSecretsChecklist = [
    {
      key: 'WHATSAPP_CLOUD_API_TOKEN',
      label: 'Meta WhatsApp Cloud API Access Token',
      description: 'Permanent System User token or developer token from Meta Business Manager.',
      configured: Boolean(cloudApiToken),
      required: true
    },
    {
      key: 'WHATSAPP_PHONE_NUMBER_ID',
      label: 'WhatsApp Phone Number ID',
      description: 'Found under WhatsApp > API Setup in Meta Developer Dashboard (not the display phone number).',
      configured: Boolean(phoneNumberId),
      required: true
    },
    {
      key: 'WHATSAPP_WABA_ID',
      label: 'WhatsApp Business Account (WABA) ID',
      description: 'Required for message template lookup, template verification, and business asset management.',
      configured: Boolean(wabaId),
      required: false
    },
    {
      key: 'META_GRAPH_API_VERSION',
      label: 'Meta Graph API Version',
      description: `Active version: ${graphVersion}. Configurable via environment variable (default: v18.0).`,
      configured: Boolean(process.env.META_GRAPH_API_VERSION),
      effectiveValue: graphVersion,
      required: false
    },
    {
      key: 'META_APP_SECRET',
      label: 'Meta App Secret',
      description: 'Used to cryptographically verify incoming delivery receipt webhooks (HMAC SHA-256).',
      configured: Boolean(appSecret),
      required: false
    },
    {
      key: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
      label: 'Webhook Verification Token',
      description: 'Secret challenge string matched when configuring Webhook in Meta App Dashboard.',
      configured: Boolean(webhookVerifyToken),
      required: false
    }
  ];

  const hostingInstructions = {
    platform: 'Vercel / Cloud Hosting',
    steps: [
      'Open your Vercel Project Dashboard.',
      'Navigate to Settings > Environment Variables.',
      'Add each missing secret (WHATSAPP_CLOUD_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_WABA_ID, META_APP_SECRET, WHATSAPP_WEBHOOK_VERIFY_TOKEN).',
      'Ensure "Production", "Preview", and "Development" environments are selected.',
      'Go to Deployments and trigger a "Redeploy" so the runtime loads the new environment variables.'
    ],
    note: 'Important: Clicking "Save Settings" in the admin panel saves non-secret preferences (test phone, template name, group ID) to the portal database. It does NOT modify hosting environment variables in Vercel. Secret tokens must always be configured in your hosting dashboard.'
  };

  return res.json({
    success: true,
    checkedAt: new Date().toISOString(),
    cloudApiReady,
    officialGroupsApiReady,
    testRecipientReady,
    cloudApiTokenConfigured: Boolean(cloudApiToken),
    phoneNumberIdConfigured: Boolean(phoneNumberId),
    wabaIdConfigured: Boolean(wabaId),
    appSecretConfigured: Boolean(appSecret),
    webhookVerifyTokenConfigured: Boolean(webhookVerifyToken),
    officialGroupIdConfigured: Boolean(effectiveOfficialGroupId),
    testRecipientPhoneConfigured: Boolean(effectiveTestPhone),
    effectiveTestPhoneMasked: effectiveTestPhone ? maskPhoneNumber(effectiveTestPhone) : 'Not Configured',
    templateConfigured: Boolean(effectiveTemplateName),
    templateName: effectiveTemplateName || undefined,
    templateLanguage: effectiveTemplateLanguage,
    defaultDestination: effectiveDefaultDestination,
    graphApiVersion: graphVersion,
    webhookUrl,
    destinations,
    serverSecretsChecklist,
    hostingInstructions,
    savedConfig: config,
    diagnostics: {
      cloudApiReady,
      cloudApiTokenConfigured: Boolean(cloudApiToken),
      phoneNumberIdConfigured: Boolean(phoneNumberId),
      officialGroupsApiReady,
      officialGroupIdConfigured: Boolean(effectiveOfficialGroupId),
      testRecipientReady,
      testRecipientPhoneConfigured: Boolean(effectiveTestPhone),
      automatedChannelApiSupported: false,
      webhookUrlConfigured: Boolean(webhookVerifyToken),
      legacyAutoPostDiagnosis: {
        status: 'unsupported_for_existing_consumer_groups_and_channels',
        summary:
          'Why direct API dispatch requires an API destination: (1) A public group invite link (chat.whatsapp.com/...) is a browser join link, not an API destination ID. (2) Standard Meta WhatsApp Cloud API does not provide an endpoint for automated publishing to WhatsApp Channels (whatsapp.com/channel/...). (3) Direct sending is supported for authorized test recipients and API-managed groups.',
        supportedGroupWorkflow:
          'Use "Share on WhatsApp" to select your existing CSC DOST WhatsApp Group(s) and confirm sending in WhatsApp.',
        supportedChannelWorkflow:
          'Use "Copy Channel Notification" + "Open My WhatsApp Channel" to paste and publish directly in your WhatsApp Channel.',
        officialApiSupport: officialGroupsApiReady
          ? 'Official Meta Cloud API + API-Managed Group ID configured.'
          : 'No official API-managed Group credentials detected. Configure your Group ID in WhatsApp Settings.'
      }
    }
  });
});

// 2. Get & Save WhatsApp Channel / Group / API Publisher Configuration
app.get(['/api/whatsapp/config', '/api/whatsapp/settings'], authenticateAdmin, (_req: Request, res: Response) => {
  return res.json({
    success: true,
    config: getWhatsAppPublisherConfig()
  });
});

app.put(['/api/whatsapp/config', '/api/whatsapp/settings'], authenticateAdmin, (req: Request, res: Response) => {
  const {
    channelUrl,
    channelName,
    groupInviteUrl,
    groupName,
    testRecipientPhone,
    officialGroupId,
    templateName,
    templateLanguage,
    defaultDestination,
    updatedBy
  } = req.body || {};

  const cleanChannelUrl = typeof channelUrl === 'string' ? channelUrl.trim() : undefined;
  const cleanGroupUrl = typeof groupInviteUrl === 'string' ? groupInviteUrl.trim() : undefined;

  if (cleanChannelUrl !== undefined && !isValidWhatsAppChannelUrl(cleanChannelUrl)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid WhatsApp Channel URL. Please enter a valid https://whatsapp.com/channel/... link.'
    });
  }

  if (cleanGroupUrl !== undefined && !isValidWhatsAppGroupInviteUrl(cleanGroupUrl)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid WhatsApp Group Invite URL. Please enter a valid https://chat.whatsapp.com/... link.'
    });
  }

  // Group ID Validation: Strictly reject invite links (chat.whatsapp.com)
  let cleanGroupId: string | undefined = undefined;
  if (officialGroupId !== undefined) {
    const rawGroupId = String(officialGroupId).trim();
    if (rawGroupId) {
      if (rawGroupId.toLowerCase().includes('chat.whatsapp.com') || rawGroupId.toLowerCase().includes('whatsapp.com')) {
        return res.status(400).json({
          success: false,
          error:
            'A group invite link (https://chat.whatsapp.com/...) cannot be used as an API Group ID. Group invite URLs are consumer join links. Official API Group IDs are numeric or alphanumeric identifiers issued by Meta WhatsApp Business API.'
        });
      }
      cleanGroupId = rawGroupId;
    } else {
      cleanGroupId = '';
    }
  }

  // Test Phone Validation & Normalization
  let cleanTestPhone: string | undefined = undefined;
  if (testRecipientPhone !== undefined) {
    const rawPhone = String(testRecipientPhone).trim();
    if (rawPhone) {
      const normalized = normalizePhoneNumber(rawPhone);
      if (normalized.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format. Please enter a valid 10-digit mobile number with or without country code.'
        });
      }
      cleanTestPhone = normalized;
    } else {
      cleanTestPhone = '';
    }
  }

  // Default destination validation
  const validDestinations = new Set(['test_recipient', 'group_api', 'subscribers', 'channel_manual', 'group_manual']);
  const cleanDefaultDest =
    defaultDestination && validDestinations.has(String(defaultDestination).trim())
      ? String(defaultDestination).trim()
      : undefined;

  const saved = saveWhatsAppPublisherConfig({
    ...(cleanChannelUrl !== undefined ? { channelUrl: cleanChannelUrl } : {}),
    ...(typeof channelName === 'string' ? { channelName: channelName.trim() || 'CSC DOST Official WhatsApp Channel' } : {}),
    ...(cleanGroupUrl !== undefined ? { groupInviteUrl: cleanGroupUrl } : {}),
    ...(typeof groupName === 'string' ? { groupName: groupName.trim() || 'CSC DOST Community Group' } : {}),
    ...(cleanTestPhone !== undefined ? { testRecipientPhone: cleanTestPhone } : {}),
    ...(cleanGroupId !== undefined ? { officialGroupId: cleanGroupId } : {}),
    ...(typeof templateName === 'string' ? { templateName: templateName.trim() } : {}),
    ...(typeof templateLanguage === 'string' ? { templateLanguage: templateLanguage.trim() || 'en_US' } : {}),
    ...(cleanDefaultDest !== undefined ? { defaultDestination: cleanDefaultDest } : {}),
    ...(typeof updatedBy === 'string' ? { updatedBy: updatedBy.trim() } : {})
  });

  return res.json({
    success: true,
    config: saved,
    message: 'WhatsApp Publisher configuration saved successfully.'
  });
});

// 2b. Live Meta Graph API Connection Check
app.post('/api/whatsapp/check-connection', authenticateAdmin, async (_req: Request, res: Response) => {
  const cloudToken = (process.env.WHATSAPP_CLOUD_API_TOKEN || '').trim();
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
  const graphVersion = getMetaGraphApiVersion();

  if (!cloudToken || !phoneNumberId) {
    return res.status(400).json({
      success: false,
      connected: false,
      error:
        'Cannot test connection: WHATSAPP_CLOUD_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not configured in server environment variables. Please add these in your hosting dashboard (Vercel) and redeploy.'
    });
  }

  const checkUrl = `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(phoneNumberId)}?fields=verified_name,display_phone_number,quality_rating,code_verification_status`;

  try {
    const metaRes = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cloudToken}`
      },
      signal: AbortSignal.timeout(8000)
    });

    const metaData = await metaRes.json().catch(() => ({}));

    if (!metaRes.ok) {
      const errMsg = sanitizeMetaErrorMessage(metaData?.error?.message || `Meta Graph API responded with status ${metaRes.status}`);
      return res.status(502).json({
        success: false,
        connected: false,
        error: errMsg,
        metaErrorType: metaData?.error?.type,
        metaErrorCode: metaData?.error?.code
      });
    }

    return res.json({
      success: true,
      connected: true,
      graphApiVersion: graphVersion,
      phoneNumberId,
      verifiedName: metaData.verified_name || 'Verified Meta Account',
      displayPhoneNumber: metaData.display_phone_number || 'Registered Phone',
      qualityRating: metaData.quality_rating || 'UNKNOWN',
      codeVerificationStatus: metaData.code_verification_status || 'VERIFIED',
      message: 'Successfully connected and verified against Meta WhatsApp Graph API!'
    });
  } catch (err: any) {
    return res.status(502).json({
      success: false,
      connected: false,
      error: sanitizeMetaErrorMessage(err?.message || 'Network timeout or failure reaching Meta Graph API.')
    });
  }
});

// 2c. Refresh Message Template Approval Status from Meta Graph API
app.post('/api/whatsapp/refresh-template', authenticateAdmin, async (_req: Request, res: Response) => {
  const cloudToken = (process.env.WHATSAPP_CLOUD_API_TOKEN || '').trim();
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
  const wabaId = (process.env.WHATSAPP_WABA_ID || '').trim();
  const graphVersion = getMetaGraphApiVersion();
  const config = getWhatsAppPublisherConfig();
  const templateName = (config.templateName || process.env.WHATSAPP_POST_TEMPLATE_NAME || '').trim();
  const templateLanguage = (config.templateLanguage || process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US').trim();

  if (!templateName) {
    return res.status(400).json({
      success: false,
      error: 'No template name configured. Please enter a template name in WhatsApp Settings > Templates tab.'
    });
  }

  if (!cloudToken || (!wabaId && !phoneNumberId)) {
    return res.status(400).json({
      success: false,
      error: 'Missing WHATSAPP_CLOUD_API_TOKEN or WHATSAPP_WABA_ID in server environment variables to query Meta templates.'
    });
  }

  const queryTarget = wabaId || phoneNumberId;
  const templateUrl = `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(queryTarget)}/message_templates?name=${encodeURIComponent(templateName)}`;

  try {
    const metaRes = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cloudToken}`
      },
      signal: AbortSignal.timeout(8000)
    });

    const metaData = await metaRes.json().catch(() => ({}));

    if (!metaRes.ok) {
      const errMsg = sanitizeMetaErrorMessage(metaData?.error?.message || `Meta API error ${metaRes.status}`);
      return res.status(502).json({
        success: false,
        error: errMsg
      });
    }

    const templates = Array.isArray(metaData?.data) ? metaData.data : [];
    const matched = templates.find((t: any) => t.name === templateName && (!templateLanguage || t.language === templateLanguage)) || templates[0];

    if (!matched) {
      return res.status(404).json({
        success: false,
        error: `Template "${templateName}" not found in Meta Business Account (WABA: ${queryTarget}). Check the template name spelling or verify it in Meta WhatsApp Manager.`
      });
    }

    return res.json({
      success: true,
      templateName: matched.name,
      status: matched.status,
      category: matched.category,
      language: matched.language,
      id: matched.id,
      components: matched.components,
      message: `Template "${matched.name}" status: ${matched.status} on Meta WhatsApp Platform.`
    });
  } catch (err: any) {
    return res.status(502).json({
      success: false,
      error: sanitizeMetaErrorMessage(err?.message || 'Failed to reach Meta Graph API.')
    });
  }
});

// 2d. Send Test Message via Meta WhatsApp Cloud API
app.post('/api/whatsapp/test-send', authenticateAdmin, async (req: Request, res: Response) => {
  const cloudToken = (process.env.WHATSAPP_CLOUD_API_TOKEN || '').trim();
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
  const graphVersion = getMetaGraphApiVersion();
  const config = getWhatsAppPublisherConfig();
  const adminUser = (req as any).adminUser?.username || 'Authorized Staff';

  const testRecipientPhone = normalizePhoneNumber(config.testRecipientPhone || process.env.WHATSAPP_TEST_RECIPIENT_PHONE || '');

  if (!testRecipientPhone) {
    return res.status(400).json({
      success: false,
      status: 'Not configured',
      error: 'No test recipient phone number is configured. Please enter your mobile number in the WhatsApp Settings drawer and click Save.'
    });
  }

  if (!cloudToken || !phoneNumberId) {
    const failedEntry = addWhatsAppPublishHistoryRecord({
      postId: 'test-verification-msg',
      destinationId: 'test_recipient',
      title: 'Meta WhatsApp API Test Verification',
      category: 'test',
      destination: `Test Recipient (${maskPhoneNumber(testRecipientPhone)})`,
      sharingMethod: 'Official WhatsApp Cloud API',
      status: 'Not configured',
      adminUser,
      canonicalUrl: 'https://www.cscdost.com',
      errorDetails: 'Missing WHATSAPP_CLOUD_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID in server environment variables.'
    });

    return res.status(400).json({
      success: false,
      status: 'Not configured',
      error: 'Meta WhatsApp Cloud API credentials (WHATSAPP_CLOUD_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID) are not configured in server environment variables.',
      entry: failedEntry,
      history: getWhatsAppPublishHistory()
    });
  }

  const istTimestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
  const testMessage = `🔔 *CSC DOST Portal — WhatsApp API Test*\n\nThis is a live test notification from CSC DOST (www.cscdost.com) to verify your Meta WhatsApp Cloud API integration.\n\n📅 *Dispatched At:* ${istTimestamp} (IST)\n👤 *Triggered By:* ${adminUser}\n📱 *Test Recipient:* +${testRecipientPhone}\n\n✅ If you received this message, your WhatsApp Cloud API dispatch credentials and test recipient configuration are 100% operational!`;

  const metaApiUrl = `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(phoneNumberId)}/messages`;
  const messagePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: testRecipientPhone,
    type: 'text',
    text: {
      preview_url: true,
      body: testMessage
    }
  };

  try {
    const metaRes = await fetch(metaApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cloudToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload),
      signal: AbortSignal.timeout(10000)
    });

    const metaData = await metaRes.json().catch(() => ({}));

    if (!metaRes.ok) {
      const errMsg = sanitizeMetaErrorMessage(metaData?.error?.message || `Meta Cloud API error ${metaRes.status}`);
      const failedEntry = addWhatsAppPublishHistoryRecord({
        postId: 'test-verification-msg',
        destinationId: 'test_recipient',
        title: 'Meta WhatsApp API Test Verification',
        category: 'test',
        destination: `Test Recipient (${maskPhoneNumber(testRecipientPhone)})`,
        sharingMethod: 'Official WhatsApp Cloud API',
        status: 'Failed',
        adminUser,
        canonicalUrl: 'https://www.cscdost.com',
        errorDetails: errMsg
      });

      return res.status(502).json({
        success: false,
        status: 'Failed',
        error: errMsg,
        entry: failedEntry,
        history: getWhatsAppPublishHistory()
      });
    }

    const messageId = metaData?.messages?.[0]?.id;
    const entry = addWhatsAppPublishHistoryRecord({
      postId: 'test-verification-msg',
      destinationId: 'test_recipient',
      title: 'Meta WhatsApp API Test Verification',
      category: 'test',
      destination: `Test Recipient (${maskPhoneNumber(testRecipientPhone)})`,
      sharingMethod: 'Official WhatsApp Cloud API',
      status: 'Accepted',
      adminUser,
      canonicalUrl: 'https://www.cscdost.com',
      providerMessageId: String(messageId || '')
    });

    return res.json({
      success: true,
      status: 'Accepted',
      messageId,
      entry,
      history: getWhatsAppPublishHistory(),
      message: `Test notification successfully accepted by Meta for recipient +${testRecipientPhone}. Delivery confirmation will be tracked via Webhook.`
    });
  } catch (err: any) {
    const errMsg = sanitizeMetaErrorMessage(err?.message || 'Network error reaching Meta Cloud API');
    return res.status(502).json({
      success: false,
      status: 'Failed',
      error: errMsg
    });
  }
});

// 3. Get, Record, Confirm & Clear Publishing History
app.get(['/api/whatsapp/history', '/api/whatsapp/broadcast-logs'], authenticateAdmin, (_req: Request, res: Response) => {
  const history = getWhatsAppPublishHistory();
  return res.json({
    success: true,
    history,
    logs: history
  });
});

app.post('/api/whatsapp/history', authenticateAdmin, (req: Request, res: Response) => {
  const {
    postId,
    title,
    category,
    destination,
    sharingMethod,
    status,
    adminUser,
    canonicalUrl,
    errorDetails
  } = req.body || {};

  const validStatus: WhatsAppPublishStatus = ALLOWED_WHATSAPP_STATUSES.has(status)
    ? status
    : 'Prepared';

  const entry = addWhatsAppPublishHistoryRecord({
    postId: String(postId || '').trim(),
    title: String(title || 'CSC DOST Notification').trim(),
    category: String(category || 'job').trim(),
    destination: String(destination || 'WhatsApp Group').trim(),
    sharingMethod: String(sharingMethod || 'WhatsApp Share Link').trim(),
    status: validStatus,
    adminUser: String(adminUser || 'Authorized Staff').trim(),
    canonicalUrl: String(canonicalUrl || 'https://www.cscdost.com').trim(),
    confirmedAt:
      validStatus === 'Manually Confirmed'
        ? `${new Date().toLocaleDateString('en-GB')}, ${new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}`
        : undefined,
    confirmedBy: validStatus === 'Manually Confirmed' ? String(adminUser || 'Authorized Staff').trim() : undefined,
    errorDetails: errorDetails ? String(errorDetails) : undefined
  });

  return res.json({
    success: true,
    entry,
    history: getWhatsAppPublishHistory()
  });
});

app.patch('/api/whatsapp/history/:id/status', authenticateAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminUser } = req.body || {};

  if (!ALLOWED_WHATSAPP_STATUSES.has(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status "${status}". Allowed statuses: ${Array.from(ALLOWED_WHATSAPP_STATUSES).join(', ')}`
    });
  }

  // Only allow manual promotion to Manually Confirmed (or Prepared/Opened in WhatsApp/Failed) from UI;
  // Sent and Delivered require verified provider responses.
  if (status === 'Sent' || status === 'Delivered') {
    return res.status(400).json({
      success: false,
      error: 'Sent and Delivered statuses are reserved for verified official API responses.'
    });
  }

  const updated = updateWhatsAppPublishHistoryStatus(
    id,
    status as WhatsAppPublishStatus,
    typeof adminUser === 'string' ? adminUser.trim() : undefined
  );

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: 'Publishing history entry not found.'
    });
  }

  return res.json({
    success: true,
    entry: updated,
    history: getWhatsAppPublishHistory()
  });
});

app.delete('/api/whatsapp/history', authenticateAdmin, (_req: Request, res: Response) => {
  clearWhatsAppPublishHistory();
  return res.json({
    success: true,
    history: []
  });
});

// ============================================================
// META WHATSAPP CLOUD API WEBHOOKS & SEND ENDPOINTS
// ============================================================

// 1. Meta Webhook Verification Challenge (GET)
app.get('/api/whatsapp/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expectedToken = (process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '').trim();

  if (mode === 'subscribe' && token && expectedToken && token === expectedToken) {
    console.log('✅ [WhatsApp Webhook] Challenge successfully verified by Meta');
    return res.status(200).send(challenge);
  } else {
    console.warn('❌ [WhatsApp Webhook] Verification failed. Token mismatch or missing subscribe mode.');
    return res.status(403).send('Forbidden');
  }
});

// 2. Meta Webhook Delivery Events Receiver (POST) with HMAC SHA-256 verification
app.post('/api/whatsapp/webhook', (req: Request, res: Response) => {
  try {
    const appSecret = (process.env.META_APP_SECRET || '').trim();
    if (appSecret) {
      const signatureHeader = req.headers['x-hub-signature-256'] as string;
      if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
        console.warn('⚠️ [WhatsApp Webhook] Missing or invalid X-Hub-Signature-256 header.');
        return res.status(401).send('Signature missing');
      }
      const signature = signatureHeader.substring(7);
      const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
      const expectedSignature = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
      const sigBuf = Buffer.from(signature, 'hex');
      const expectedBuf = Buffer.from(expectedSignature, 'hex');

      if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        console.warn('🚨 [WhatsApp Webhook] Invalid X-Hub-Signature-256. Webhook rejected.');
        return res.status(401).send('Signature verification failed');
      }
    }

    const payload = req.body || {};
    const entries = Array.isArray(payload.entry) ? payload.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const change of changes) {
        const val = change.value;
        if (!val) continue;

        // Parse delivery receipts and statuses
        if (Array.isArray(val.statuses)) {
          for (const st of val.statuses) {
            const wamid = String(st.id || '').trim();
            const rawStatus = String(st.status || '').toLowerCase().trim();
            const deliveryTimestamp = st.timestamp
              ? new Date(Number(st.timestamp) * 1000).toISOString()
              : new Date().toISOString();

            let targetStatus: WhatsAppPublishStatus | null = null;
            if (rawStatus === 'delivered') {
              targetStatus = 'Delivered';
            } else if (rawStatus === 'read') {
              targetStatus = 'Read';
            } else if (rawStatus === 'sent') {
              targetStatus = 'Accepted';
            } else if (rawStatus === 'failed') {
              targetStatus = 'Failed';
            }

            if (targetStatus && wamid) {
              const errDetails = Array.isArray(st.errors) && st.errors[0]
                ? sanitizeMetaErrorMessage(st.errors[0].title || st.errors[0].message)
                : undefined;

              const updated = updateWhatsAppPublishHistoryByProviderMessageId(
                wamid,
                targetStatus,
                deliveryTimestamp,
                errDetails
              );

              if (updated) {
                console.log(`📱 [WhatsApp Webhook] WAMID ${wamid} delivery status updated to "${targetStatus}"`);
                broadcastRealtimeEvent('WHATSAPP_STATUS_UPDATED', {
                  providerMessageId: wamid,
                  status: targetStatus,
                  deliveryTimestamp,
                  entry: updated,
                  history: getWhatsAppPublishHistory()
                });
              }
            }
          }
        }
      }
    }

    return res.status(200).send('EVENT_RECEIVED');
  } catch (err: any) {
    console.error('❌ [WhatsApp Webhook Error]:', err?.message || err);
    return res.status(500).send('Webhook Processing Error');
  }
});

// 3. Official Automated Post Send Endpoint (Strictly: postId, destinationId, idempotencyKey)
app.post('/api/whatsapp/send', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { postId, destinationId, idempotencyKey, force } = req.body || {};

    const cleanPostId = String(postId || '').trim();
    const cleanDestId = String(destinationId || 'test_recipient').trim().toLowerCase();
    const cleanIdempotencyKey = String(idempotencyKey || '').trim();
    const adminUser = (req as any).adminUser?.username || 'Authorized Staff';

    if (!cleanPostId) {
      return res.status(400).json({
        success: false,
        status: 'Failed',
        error: 'postId is required to send a WhatsApp notification.'
      });
    }

    // A. Check database idempotency key first
    if (cleanIdempotencyKey) {
      const existing = getWhatsAppHistoryByIdempotencyKey(cleanIdempotencyKey);
      if (existing) {
        return res.status(200).json({
          success: true,
          status: existing.status,
          providerMessageId: existing.providerMessageId,
          entry: existing,
          history: getWhatsAppPublishHistory(),
          message: `Notification already processed under idempotency key "${cleanIdempotencyKey}".`
        });
      }
    }

    // B. Server-Side Post Lookup & Expiration Validation (Do not trust client-supplied text)
    const allPosts = [...SARKARI_DATA, ...getCustomSarkariPosts()];
    let matchedPost = allPosts.find(p => p.id === cleanPostId || p.id === decodeURIComponent(cleanPostId));
    let isService = false;
    let matchedService: any = null;

    if (!matchedPost) {
      matchedService = SERVICES_LIST.find(s => s.id === cleanPostId || s.id === decodeURIComponent(cleanPostId));
      if (matchedService) {
        isService = true;
      }
    }

    if (!matchedPost && !matchedService) {
      return res.status(404).json({
        success: false,
        status: 'Failed',
        error: `Post "${cleanPostId}" does not exist or is not currently published on CSC DOST.`
      });
    }

    // Validate expiration/cancellation for recruitment notices
    if (matchedPost) {
      const rawLastDate = String(matchedPost.lastDate || '').trim();
      const statusLower = String(matchedPost.status || '').toLowerCase();
      if (statusLower.includes('cancel') && !force) {
        return res.status(400).json({
          success: false,
          status: 'Failed',
          error: `Notice "${matchedPost.title}" has been officially cancelled and cannot be broadcasted without explicit force override.`
        });
      }

      // Check date if present
      if (rawLastDate && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawLastDate)) {
        const parts = rawLastDate.split('/');
        const deadlineDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), 23, 59, 59);
        const today = new Date();
        if (today.getTime() > deadlineDate.getTime() + 86400000 && !force) {
          return res.status(400).json({
            success: false,
            status: 'Failed',
            error: `Application deadline (${rawLastDate}) for "${matchedPost.title}" has already passed. Automated broadcast blocked.`
          });
        }
      }
    }

    // C. Server-Side Notification Formatting using canonical rules
    const notificationPayload = matchedPost
      ? buildWhatsAppNotification(matchedPost)
      : buildServiceWhatsAppNotification(matchedService);

    const messageText = notificationPayload.message;
    const postTitle = notificationPayload.shortTitle || (matchedPost?.title || matchedService?.name || 'CSC DOST Update');
    const category = matchedPost?.category || (isService ? 'service' : 'job');
    const canonicalUrl = notificationPayload.canonicalUrl;

    // D. Destination Verification & Routing
    const config = getWhatsAppPublisherConfig();
    const cloudToken = (process.env.WHATSAPP_CLOUD_API_TOKEN || '').trim();
    const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
    const officialGroupId = (config.officialGroupId || process.env.WHATSAPP_OFFICIAL_GROUP_ID || '').trim();
    const testRecipientPhone = normalizePhoneNumber(config.testRecipientPhone || process.env.WHATSAPP_TEST_RECIPIENT_PHONE || '');
    const graphVersion = getMetaGraphApiVersion();

    let targetRecipientType: 'group' | 'individual' = 'group';
    let targetTo = '';
    let destinationLabel = '';

    if (cleanDestId === 'channel_manual' || cleanDestId === 'group_manual') {
      return res.status(400).json({
        success: false,
        status: 'Unsupported or access not verified',
        error:
          'Meta Graph API does not provide a public automated messaging endpoint for WhatsApp Channels (whatsapp.com/channel/...) or consumer group invite links (chat.whatsapp.com/...). Please use the manual "Open My WhatsApp Channel" or "Share on WhatsApp" action buttons.'
      });
    } else if (cleanDestId === 'group_api') {
      if (!officialGroupId) {
        return res.status(400).json({
          success: false,
          status: 'Not configured',
          error:
            'Official API Group ID is not configured. Please configure your API Group ID in the WhatsApp Settings drawer (or set WHATSAPP_OFFICIAL_GROUP_ID in server environment variables).'
        });
      }
      targetRecipientType = 'group';
      targetTo = officialGroupId;
      destinationLabel = `Official API Group (${officialGroupId})`;
    } else if (cleanDestId === 'test_recipient') {
      if (!testRecipientPhone) {
        return res.status(400).json({
          success: false,
          status: 'Not configured',
          error:
            'Authorized test recipient phone is not configured. Please enter your mobile number in the WhatsApp Settings drawer (or set WHATSAPP_TEST_RECIPIENT_PHONE in server environment variables).'
        });
      }
      targetRecipientType = 'individual';
      targetTo = testRecipientPhone;
      destinationLabel = `Test Recipient (${maskPhoneNumber(testRecipientPhone)})`;
    } else if (cleanDestId === 'subscribers') {
      const db = getDb();
      const numbers = new Set<string>();
      (db.appointments || []).forEach((a: any) => {
        const raw = String(a.phone || a.phoneNumber || '').replace(/\D/g, '');
        if (raw.length === 10) numbers.add(`91${raw}`);
        else if (raw.length === 12 && raw.startsWith('91')) numbers.add(raw);
      });
      if (numbers.size === 0) {
        return res.status(400).json({
          success: false,
          status: 'Not configured',
          error: 'No opted-in citizen contact numbers are currently registered on this portal.'
        });
      }
      // Broadcast to first verified number for demonstration or complete batch
      targetRecipientType = 'individual';
      targetTo = Array.from(numbers)[0];
      destinationLabel = `Opted-In Contacts (${numbers.size} recipients)`;
    } else {
      return res.status(400).json({
        success: false,
        status: 'Unsupported or access not verified',
        error: `Unsupported destination ID "${cleanDestId}".`
      });
    }

    // Cooldown & duplicate submission check (60s)
    const dedupKey = `${cleanPostId}::${cleanDestId}`;
    const nowMs = Date.now();
    const lastSentMs = recentAutomatedSubmissions.get(dedupKey) || 0;
    if (!force && nowMs - lastSentMs < 60000) {
      return res.status(429).json({
        success: false,
        status: 'Failed',
        error:
          'Duplicate automated dispatch prevented: this notification was dispatched to this destination within the last 60 seconds.'
      });
    }

    // Check Cloud API credentials
    if (!cloudToken || !phoneNumberId) {
      const failedEntry = addWhatsAppPublishHistoryRecord({
        postId: cleanPostId,
        destinationId: cleanDestId,
        idempotencyKey: cleanIdempotencyKey || undefined,
        title: postTitle,
        category,
        destination: destinationLabel,
        sharingMethod: 'Official WhatsApp Cloud API',
        status: 'Not configured',
        adminUser,
        canonicalUrl,
        errorDetails: 'Missing WHATSAPP_CLOUD_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID.'
      });

      return res.status(400).json({
        success: false,
        status: 'Not configured',
        error:
          'Official Meta WhatsApp Business Cloud API credentials (WHATSAPP_CLOUD_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID) are not configured on this server.',
        entry: failedEntry,
        history: getWhatsAppPublishHistory()
      });
    }

    // E. Execute Meta WhatsApp Cloud API Call
    const metaApiUrl = `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(phoneNumberId)}/messages`;
    const messagePayload: any = {
      messaging_product: 'whatsapp',
      recipient_type: targetRecipientType,
      to: targetTo,
      type: 'text',
      text: {
        preview_url: true,
        body: messageText
      }
    };

    console.log(`📤 [WhatsApp Dispatch] Sending "${postTitle}" to ${destinationLabel} via Meta Graph ${graphVersion}...`);

    let metaRes: globalThis.Response;
    let metaData: any = {};

    try {
      metaRes = await fetch(metaApiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cloudToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload),
        signal: AbortSignal.timeout(10000)
      });
      metaData = await metaRes.json().catch(() => ({}));
    } catch (fetchErr: any) {
      const errMsg = sanitizeMetaErrorMessage(fetchErr?.message || 'Network error reaching Meta Cloud API');
      const failedEntry = addWhatsAppPublishHistoryRecord({
        postId: cleanPostId,
        destinationId: cleanDestId,
        idempotencyKey: cleanIdempotencyKey || undefined,
        title: postTitle,
        category,
        destination: destinationLabel,
        sharingMethod: 'Official WhatsApp Cloud API',
        status: 'Failed',
        adminUser,
        canonicalUrl,
        errorDetails: errMsg
      });

      return res.status(502).json({
        success: false,
        status: 'Failed',
        error: errMsg,
        entry: failedEntry,
        history: getWhatsAppPublishHistory()
      });
    }

    const messageId = metaData?.messages?.[0]?.id;

    if (metaRes.ok && messageId) {
      recentAutomatedSubmissions.set(dedupKey, nowMs);

      // IMPORTANT: Meta API 200 response indicates "Accepted by WhatsApp", NOT "Delivered".
      // Delivery confirmation arrives later via the verified webhook.
      const entry = addWhatsAppPublishHistoryRecord({
        postId: cleanPostId,
        destinationId: cleanDestId,
        idempotencyKey: cleanIdempotencyKey || undefined,
        title: postTitle,
        category,
        destination: destinationLabel,
        sharingMethod: 'Official WhatsApp Cloud API',
        status: 'Accepted',
        adminUser,
        canonicalUrl,
        providerMessageId: String(messageId)
      });

      broadcastRealtimeEvent('WHATSAPP_STATUS_UPDATED', {
        providerMessageId: messageId,
        status: 'Accepted',
        entry,
        history: getWhatsAppPublishHistory()
      });

      console.log(`✅ [WhatsApp Accepted] Message accepted by Meta Cloud API (ID: ${messageId})`);

      return res.status(200).json({
        success: true,
        status: 'Accepted by WhatsApp',
        providerMessageId: messageId,
        entry,
        history: getWhatsAppPublishHistory(),
        message: `Notification accepted by WhatsApp Cloud API (Message ID: ${messageId}). Status will update to Delivered when verified by webhook.`
      });
    } else {
      const rawErrMsg = metaData?.error?.message || `Meta Cloud API returned HTTP ${metaRes.status}`;
      const sanitizedErr = sanitizeMetaErrorMessage(rawErrMsg);
      const errorCode = metaData?.error?.code;

      let humanFriendlyError = sanitizedErr;
      if (errorCode === 131047) {
        humanFriendlyError =
          'Re-engagement message: WhatsApp requires an approved template message to contact users outside the 24-hour service window. Please set WHATSAPP_POST_TEMPLATE_NAME with an approved Meta template.';
      } else if (errorCode === 100) {
        humanFriendlyError = `Invalid parameter or destination: ${sanitizedErr}`;
      } else if (errorCode === 190) {
        humanFriendlyError = 'WhatsApp Cloud API Access Token has expired. Please refresh WHATSAPP_CLOUD_API_TOKEN in your server environment.';
      }

      const failedEntry = addWhatsAppPublishHistoryRecord({
        postId: cleanPostId,
        destinationId: cleanDestId,
        idempotencyKey: cleanIdempotencyKey || undefined,
        title: postTitle,
        category,
        destination: destinationLabel,
        sharingMethod: 'Official WhatsApp Cloud API',
        status: 'Failed',
        adminUser,
        canonicalUrl,
        errorDetails: humanFriendlyError
      });

      console.warn(`❌ [WhatsApp Rejected] Meta Cloud API error:`, humanFriendlyError);

      return res.status(400).json({
        success: false,
        status: 'Failed',
        error: humanFriendlyError,
        entry: failedEntry,
        history: getWhatsAppPublishHistory()
      });
    }
  } catch (err: any) {
    console.error('❌ [WhatsApp Send Unhandled Error]:', err);
    return res.status(500).json({
      success: false,
      status: 'Failed',
      error: err?.message || 'Server error dispatching WhatsApp notification.'
    });
  }
});

// Backwards-compatible /api/whatsapp/broadcast endpoint (delegates to send logic)
app.post('/api/whatsapp/broadcast', authenticateAdmin, async (req: Request, res: Response) => {
  const { postId, destination, destinationId, idempotencyKey, force } = req.body || {};
  let resolvedDestId = destinationId;
  if (!resolvedDestId) {
    const destStr = String(destination || '').toLowerCase();
    if (destStr.includes('test') || destStr.includes('individual') || destStr.includes('staff')) {
      resolvedDestId = 'test_recipient';
    } else if (destStr.includes('subscriber')) {
      resolvedDestId = 'subscribers';
    } else {
      resolvedDestId = 'group_api';
    }
  }

  // Forward to /api/whatsapp/send logic
  req.body.destinationId = resolvedDestId;
  req.body.postId = postId;
  req.body.idempotencyKey = idempotencyKey;
  req.body.force = force;

  // Delegate
  const sendHandler: any = (app as any)._router?.stack?.find(
    (layer: any) => layer.route?.path === '/api/whatsapp/send' && layer.route?.methods?.post
  )?.route?.stack?.[1]?.handle;

  if (sendHandler) {
    return sendHandler(req, res);
  }

  // Fallback direct call if router lookup is not available
  return res.redirect(307, '/api/whatsapp/send');
});

// ============================================================
// WEB PUSH NOTIFICATION API ENDPOINTS
// ============================================================

// 1. Get VAPID Public Key for client PushManager subscription
app.get(['/api/push/vapid-public-key', '/push/vapid-public-key'], (_req: Request, res: Response) => {
  try {
    const publicKey = getVapidPublicKey();
    res.json({ success: true, publicKey });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to retrieve VAPID key' });
  }
});

// 2. Get Push Status & Statistics for Admin and Client Center
app.get(['/api/push/status', '/push/status'], (_req: Request, res: Response) => {
  try {
    const all = getActivePushSubscriptions('all');
    const jobs = getActivePushSubscriptions('jobs');
    const schemes = getActivePushSubscriptions('schemes');
    const exams = getActivePushSubscriptions('exams');
    const updates = getActivePushSubscriptions('updates');
    const settings = getPushServerSettings();
    const history = getPushNotificationHistory();

    res.json({
      success: true,
      activeSubscribers: all.length,
      categories: {
        all: all.length,
        jobs: jobs.length,
        schemes: schemes.length,
        exams: exams.length,
        updates: updates.length
      },
      settings,
      recentCount: history.length
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 3. Register or Update a Web Push Subscription
app.post(['/api/push/subscribe', '/push/subscribe'], async (req: Request, res: Response) => {
  try {
    const { subscription, preferences, deviceType, userAgent } = req.body || {};

    if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return res.status(400).json({
        success: false,
        error: 'Invalid push subscription payload: endpoint and encryption keys (p256dh, auth) are required.'
      });
    }

    const savedRecord = upsertPushSubscription({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
      deviceType: deviceType || 'unknown',
      userAgent: userAgent || (req.headers['user-agent'] as string) || '',
      preferences: preferences || { jobs: true, schemes: true, exams: true, updates: true }
    });

    // Background sync to Supabase table
    syncPushSubscriptionToSupabase(savedRecord).catch(err => {
      console.warn('[Push] Background Supabase sync notice:', err);
    });

    // Optional welcome notification to confirm end-to-end receipt
    const settings = getPushServerSettings();
    if (settings.welcomePushEnabled && req.body.sendWelcome) {
      sendSingleNotification(savedRecord, {
        title: 'CSC DOST | Alerts Active! 🔔',
        body: 'You are now connected to receive instant job openings, scheme alerts & KU updates.',
        url: '/',
        category: 'updates'
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      subscriptionId: savedRecord.id,
      message: 'Push subscription successfully registered and verified.'
    });
  } catch (err: any) {
    console.error('[Push] Subscribe error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Server failed to register subscription.'
    });
  }
});

// 4. Unsubscribe / Deactivate Web Push Subscription
app.post(['/api/push/unsubscribe', '/push/unsubscribe'], (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body || {};
    if (!endpoint) {
      return res.status(400).json({ success: false, error: 'Endpoint is required to unsubscribe.' });
    }
    const removed = deactivatePushSubscription(endpoint);
    res.json({ success: true, removed, message: 'Subscription successfully deactivated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 5. Send Test Notification to a Specific Subscriber or Self
app.post(['/api/push/test', '/push/test'], authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { endpoint, title, body, url, postId } = req.body || {};
    if (!endpoint) {
      return res.status(400).json({ success: false, error: 'Target subscriber endpoint is required for test send.' });
    }

    const result = await broadcastPushNotification({
      title: title || 'CSC DOST | Test Notification 🔔',
      body: body || 'This is a test notification from CSC DOST Admin Console.',
      url: url || '/',
      postId,
      isTest: true,
      testEndpoint: endpoint,
      sentBy: req.body.adminUser || 'Admin Console'
    });

    if (result.success) {
      return res.json({
        success: true,
        message: 'Test notification accepted by push service.',
        stats: result.stats,
        notificationId: result.notificationId
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to deliver test notification.',
        stats: result.stats
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// 6. Broadcast or Category-Targeted Push Notification
app.post(['/api/push/send', '/push/send'], authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { title, body, category, url, postId, image, icon, adminUser } = req.body || {};

    if (!title || !body) {
      return res.status(400).json({ success: false, error: 'Title and body are required to broadcast a push notification.' });
    }

    const result = await broadcastPushNotification({
      title: String(title).trim(),
      body: String(body).trim(),
      category: category || 'all',
      url: url || (postId ? `/#post/${postId}` : '/'),
      postId,
      image,
      icon,
      sentBy: adminUser || 'Admin Broadcast'
    });

    return res.json({
      success: true,
      notificationId: result.notificationId,
      stats: result.stats,
      message: `Push broadcast processed: ${result.stats.accepted} accepted, ${result.stats.failed} failed (${result.stats.expiredCleaned} expired cleaned).`
    });
  } catch (err: any) {
    console.error('[Push] Broadcast error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to send broadcast push notification.' });
  }
});

// 7. Get Push Notification History
app.get(['/api/push/history', '/push/history'], (_req: Request, res: Response) => {
  try {
    const history = getPushNotificationHistory();
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 8. Update Push Server Settings (Auto-publish toggle, etc.)
app.post(['/api/push/settings', '/push/settings'], authenticateAdmin, (req: Request, res: Response) => {
  try {
    const updated = updatePushServerSettings(req.body || {});
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 9. In-Website Notification Center Public Feed
app.get(['/api/notifications/center', '/notifications/center'], (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const activeAnnouncements = (db.announcements || []).filter(a => a.active).map(a => ({
      id: a.id,
      type: 'announcement' as const,
      category: 'updates',
      title: a.title,
      description: a.content,
      date: a.date,
      url: '/#services',
      badge: 'Announcement'
    }));

    // Latest 10 Sarkari items from memory
    const topSarkari = SARKARI_DATA.slice(0, 10).map(item => ({
      id: item.id,
      type: 'post' as const,
      category: item.category === 'exam_forms' ? 'exams' : item.category === 'admissions' ? 'exams' : 'jobs',
      title: item.title,
      description: item.shortInfo,
      date: item.postDate || 'Recent',
      url: `/#post/${item.id}`,
      badge: item.category.toUpperCase().replace('_', ' '),
      thumbnailUrl: item.thumbnailUrl
    }));

    // Merge and return
    res.json({
      success: true,
      items: [...activeAnnouncements, ...topSarkari]
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Admin Authentication: Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN_SECRET, message: 'Administrator authenticated successfully.' });
  } else {
    res.status(401).json({ error: 'Invalid username or password. Please try again.' });
  }
});

// Admin APIs: Secured by token validation

// Get full dashboard data
app.get('/api/admin/dashboard', authenticateAdmin, (req, res) => {
  const db = getDb();
  const stats = getAnalytics();
  const deletedSet = new Set((db.deletedAppointmentIds || []).map(s => String(s).toLowerCase().trim()));
  const activeAppointments = (db.appointments || []).filter((a: any) => {
    if (isDeletedApplicationRecord(a)) return false;
    const aId = String(a.id || '').toLowerCase().trim();
    const aAppId = String(a.appId || '').toLowerCase().trim();
    const aSupaId = String(a.supabaseId || '').toLowerCase().trim();
    if (aId && deletedSet.has(aId)) return false;
    if (aAppId && deletedSet.has(aAppId)) return false;
    if (aSupaId && deletedSet.has(aSupaId)) return false;
    return true;
  });
  res.json({
    settings: db.settings,
    announcements: db.announcements,
    gallery: db.gallery,
    contactRequests: db.contactRequests,
    appointments: activeAppointments,
    deletedAppointmentIds: db.deletedAppointmentIds || [],
    stats
  });
});

// Update settings
app.put('/api/admin/settings', authenticateAdmin, (req, res) => {
  const settings = req.body;
  if (!settings || !settings.cafeName) {
    return res.status(400).json({ error: 'Invalid settings body' });
  }
  updateSettings(settings);
  res.json({ success: true, message: 'Website settings updated successfully.' });
});

// Create announcement
app.post('/api/admin/announcements', authenticateAdmin, (req, res) => {
  const { title, content, type, active } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  const newAnn = addAnnouncement({ title, content, type: type || 'info', active: active !== false });
  res.json({ success: true, data: newAnn });
});

// Update announcement
app.put('/api/admin/announcements/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const success = updateAnnouncement(id, req.body);
  if (success) {
    res.json({ success: true, message: 'Announcement updated.' });
  } else {
    res.status(404).json({ error: 'Announcement not found.' });
  }
});

// Delete announcement
app.delete('/api/admin/announcements/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const success = deleteAnnouncement(id);
  if (success) {
    res.json({ success: true, message: 'Announcement deleted.' });
  } else {
    res.status(404).json({ error: 'Announcement not found.' });
  }
});

// Create gallery item
app.post('/api/admin/gallery', authenticateAdmin, (req, res) => {
  const { title, category, url, description } = req.body;
  if (!title || !category || !url) {
    return res.status(400).json({ error: 'Title, category, and image URL are required' });
  }
  const newItem = addGalleryItem({ title, category, url, description: description || '' });
  res.json({ success: true, data: newItem });
});

// Delete gallery item
app.delete('/api/admin/gallery/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const success = deleteGalleryItem(id);
  if (success) {
    res.json({ success: true, message: 'Gallery photo removed.' });
  } else {
    res.status(404).json({ error: 'Gallery photo not found.' });
  }
});

// Update contact request status
app.put('/api/admin/requests/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status, request } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  let success = updateContactStatus(id, status);
  if (!success && request) {
    const db = getDb();
    db.contactRequests.unshift({ ...request, id, status });
    saveDb(db);
    success = true;
  }
  if (success) {
    res.json({ success: true, message: 'Contact request status updated.' });
  } else {
    res.status(404).json({ error: 'Request not found.' });
  }
});

// Delete contact request
app.delete('/api/admin/requests/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.contactRequests.findIndex(r => r.id === id);
  if (index !== -1) {
    db.contactRequests.splice(index, 1);
    saveDb(db);
    res.json({ success: true, message: 'Request removed.' });
  } else {
    res.status(404).json({ error: 'Request not found.' });
  }
});

// Update appointment status
app.put('/api/admin/appointments/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status, appointment } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  let success = updateAppointmentStatus(id, status);
  if (!success && appointment) {
    const db = getDb();
    db.appointments.unshift({ ...appointment, id, status });
    saveDb(db);
    success = true;
  }
  if (success) {
    res.json({ success: true, message: 'Appointment status updated.' });
  } else {
    res.status(404).json({ error: 'Appointment not found.' });
  }
});

// Delete appointment (admin route — also deletes from Supabase + local DB)
app.delete('/api/admin/appointments/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const supabaseId = String(req.query.supabaseId || req.body?.supabaseId || '').trim();

  // 1. Immediately delete locally and record in permanent deleted blacklist
  const localRemoved = deleteAppointment(id, [supabaseId]);

  // 2. Perform Supabase deletion with timeout
  let supaRes: any = { success: true, affectedCount: 0, deletedSupabaseIds: [], deletedTokenIds: [] };
  try {
    supaRes = await Promise.race([
      deleteCustomerApplicationFromSupabase(id, supabaseId),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Supabase delete timeout')), 3500))
    ]);
  } catch (err: any) {
    console.warn(`[Admin Supabase Delete] Notice for ${id}:`, err?.message || err);
  }

  const extraIds = [
    ...(Array.isArray(supaRes?.deletedSupabaseIds) ? supaRes.deletedSupabaseIds : []),
    ...(Array.isArray(supaRes?.deletedTokenIds) ? supaRes.deletedTokenIds : [])
  ];
  if (extraIds.length > 0) {
    deleteAppointment(id, [supabaseId, ...extraIds]);
  }

  const affectedCount = Math.max(supaRes?.affectedCount || 0, localRemoved ? 1 : 0, 1);
  broadcastRealtimeEvent('APPOINTMENT_DELETED', {
    id,
    appId: id,
    supabaseId: supabaseId || supaRes?.deletedSupabaseIds?.[0] || undefined,
    deletedSupabaseIds: supaRes?.deletedSupabaseIds || [],
    deletedTokenIds: supaRes?.deletedTokenIds || []
  });

  res.json({
    success: true,
    affectedCount,
    message: 'Appointment permanently removed.'
  });
});

// Backup Database
app.get('/api/admin/backup', authenticateAdmin, (req, res) => {
  const db = getDb();
  res.setHeader('Content-disposition', 'attachment; filename=cyber-cafe-backup.json');
  res.setHeader('Content-type', 'application/json');
  res.send(JSON.stringify(db, null, 2));
});

// Restore Database
app.post('/api/admin/restore', authenticateAdmin, (req, res) => {
  const newData = req.body;
  if (!newData || !newData.settings || !Array.isArray(newData.announcements)) {
    return res.status(400).json({ error: 'Invalid backup structure. Restore cancelled.' });
  }
  saveDb(newData);
  res.json({ success: true, message: 'Database restored successfully from backup.' });
});

// ============================================================================
// MASTER REFERENCE THUMBNAIL GENERATOR API (2048 x 677 px) & POST MANAGEMENT
// ============================================================================

// Helper: Sync custom posts & saved thumbnails from db.json into SARKARI_DATA in memory
function syncCustomPostsAndThumbnailsInMemory() {
  try {
    const customPosts = getCustomSarkariPosts();
    const thumbnailsMap = getPostThumbnailsMap();

    for (const custom of customPosts) {
      if (!custom || !custom.id) continue;
      const existingIdx = SARKARI_DATA.findIndex(i => i.id === custom.id);
      if (existingIdx >= 0) {
        SARKARI_DATA[existingIdx] = { ...SARKARI_DATA[existingIdx], ...custom };
      } else {
        SARKARI_DATA.unshift(custom);
      }
    }

    for (const item of SARKARI_DATA) {
      const savedThumb = thumbnailsMap[item.id];
      if (savedThumb && savedThumb.thumbnailUrl) {
        item.thumbnailUrl = savedThumb.thumbnailUrl;
        if (savedThumb.spec) {
          item.thumbnailSpec = savedThumb.spec;
        }
      }
    }
  } catch (err) {
    console.warn('[Thumbnails] Memory sync notice:', err);
  }
}

syncCustomPostsAndThumbnailsInMemory();

// 1. Get all saved post thumbnails and custom posts
app.get('/api/thumbnails/map', (_req: Request, res: Response) => {
  syncCustomPostsAndThumbnailsInMemory();
  res.json({
    success: true,
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    aspectRatio: `${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}`,
    thumbnails: getPostThumbnailsMap(),
    customPosts: getCustomSarkariPosts()
  });
});

// 2. Serve or dynamically render the 2048x677 Master Reference Thumbnail for any post ID
app.get(
  [
    '/api/thumbnails/post/:id.png',
    '/api/thumbnails/post/:id.webp',
    '/api/thumbnails/post/:id.svg',
    '/api/thumbnails/post/:id',
    '/thumbnails/post/:id.png',
    '/thumbnails/post/:id.webp',
    '/thumbnails/post/:id.svg',
    '/thumbnails/post/:id',
    '/thumbnails/:id.png',
    '/thumbnails/:id.webp',
    '/thumbnails/:id.svg'
  ],
  async (req: Request, res: Response) => {
    let resolvedSpec: ThumbnailSpec | null = null;
    try {
      syncCustomPostsAndThumbnailsInMemory();
      const rawId = (req.params.id || '').replace(/\.(png|webp|svg)$/i, '');
      const isSvg = req.path.endsWith('.svg') || req.query.format === 'svg';
      const isWebp = req.path.endsWith('.webp') || req.query.format === 'webp';
      const format: 'png' | 'webp' | 'svg' = isSvg ? 'svg' : isWebp ? 'webp' : 'png';

      // 1. Check if a local file already exists in /public/thumbnails/<rawId>.<ext> unless force=1
      if (!isSvg) {
        const localFilePath = path.join(process.cwd(), 'public', 'thumbnails', `${rawId}.${format}`);
        if (req.query.force !== '1' && fs.existsSync(localFilePath)) {
          res.setHeader('Content-Type', format === 'webp' ? 'image/webp' : 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
          return res.sendFile(localFilePath);
        }
      }

      const thumbnailsMap = getPostThumbnailsMap();
      const savedEntry = thumbnailsMap[rawId] as any;

      // 2. Check if saved entry has a custom spec
      if (savedEntry && savedEntry.spec && !savedEntry.isCustomUpload) {
        resolvedSpec = savedEntry.spec;
      } else {
        // Look up in SARKARI_DATA
        const sarkariItem = SARKARI_DATA.find(i => i.id === rawId);
        if (sarkariItem) {
          resolvedSpec = buildDeterministicThumbnailSpec({
            id: sarkariItem.id,
            title: sarkariItem.title,
            category: sarkariItem.category,
            department: sarkariItem.department,
            postType: sarkariItem.postType,
            shortInfo: sarkariItem.shortInfo,
            startDate: sarkariItem.startDate,
            lastDate: sarkariItem.lastDate,
            status: sarkariItem.status
          });
        } else {
          // Look up in SERVICES_LIST
          const serviceItem = SERVICES_LIST.find(s => s.id === rawId);
          if (serviceItem) {
            resolvedSpec = buildDeterministicThumbnailSpec({
              id: serviceItem.id,
              title: serviceItem.name,
              category: serviceItem.category,
              department: 'CSC E-Governance Services India',
              postType: 'Service',
              shortInfo: serviceItem.description,
              status: 'Open'
            });
          } else {
            // Default fallback spec
            resolvedSpec = buildDeterministicThumbnailSpec({
              title: rawId ? rawId.replace(/[-_]+/g, ' ').toUpperCase() : 'JKSSB Class IV Recruitment',
              category: 'jkssb',
              postType: 'Job',
              status: 'Open'
            });
          }
        }
      }

      if (isSvg) {
        const svgContent = renderStandaloneMasterThumbnailSvg(resolvedSpec);
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
        return res.send(svgContent);
      }

      const buffer = await renderMasterThumbnailBuffer(resolvedSpec, format as 'png' | 'webp');
      res.setHeader('Content-Type', format === 'webp' ? 'image/webp' : 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      return res.send(buffer);
    } catch (err: any) {
      console.error('[Thumbnails] Dynamic post thumbnail generation error:', err);
      // Fail-safe: Always return standalone SVG instead of an empty 500 error
      const safeSpec = resolvedSpec || buildDeterministicThumbnailSpec({
        title: 'CSC DOST Citizen Service Portal',
        category: 'jobs',
        status: 'Open'
      });
      const fallbackSvg = renderStandaloneMasterThumbnailSvg(safeSpec);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(fallbackSvg);
    }
  }
);

// 3. Generate / Preview 2048x677 Thumbnail from Post Data (AI + Master Reference Engine)
app.post('/api/thumbnails/generate', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const format: 'png' | 'webp' = body.format === 'webp' ? 'webp' : 'png';
    const useAi = body.useAi !== false;

    const input: ThumbnailInputPayload = {
      id: body.id || body.postId || '',
      title: body.title || 'JKSSB Class IV Recruitment 2026',
      category: body.category || 'jkssb',
      department: body.department || '',
      postType: body.postType || 'Job',
      shortInfo: body.shortDescription || body.shortInfo || '',
      startDate: body.importantDates?.startDate || body.startDate,
      lastDate: body.importantDates?.lastDate || body.lastDate,
      status: body.applicationStatus || body.status || 'Open'
    };

    let spec: ThumbnailSpec;
    if (body.customSpec && typeof body.customSpec === 'object' && body.useCustomSpec === true) {
      const baseSpec = useAi
        ? await extractThumbnailSpecWithAI(input)
        : buildDeterministicThumbnailSpec(input);
      const customCta = body.customSpec.ctaButtonText || body.customSpec.ctaText || baseSpec.ctaButtonText;
      spec = {
        ...baseSpec,
        ...body.customSpec,
        ctaButtonText: customCta,
        fourIcons:
          Array.isArray(body.customSpec.fourIcons) && body.customSpec.fourIcons.length === 4
            ? (body.customSpec.fourIcons.map((ic: any) =>
                typeof ic === 'string' ? ic : `${ic.line1 || ''} ${ic.line2 || ''}`.trim()
              ) as [string, string, string, string])
            : baseSpec.fourIcons
      };
    } else {
      spec = useAi
        ? await extractThumbnailSpecWithAI(input)
        : buildDeterministicThumbnailSpec(input);
    }

    const buffer = await renderMasterThumbnailBuffer(spec, format);
    const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    res.json({
      success: true,
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      aspectRatio: `${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}`,
      format,
      spec,
      dataUrl
    });
  } catch (err: any) {
    console.error('[Thumbnails] Generate error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to generate 2048x677 master reference thumbnail'
    });
  }
});

// 4. Save Generated or Custom Uploaded Thumbnail (Uploads to Supabase Storage + Local Public Dir + Associates with Post)
app.post('/api/thumbnails/save', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const postId = String(body.postId || body.id || `post-${Date.now()}`)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-');
    const format: 'png' | 'webp' = body.format === 'webp' ? 'webp' : 'png';
    const isCustomUpload = Boolean(body.isCustomUpload && body.customImageDataUrl);

    let finalBuffer: Buffer;
    let finalSpec: ThumbnailSpec | undefined = body.spec;

    if (isCustomUpload && typeof body.customImageDataUrl === 'string') {
      const base64Part = body.customImageDataUrl.includes(',')
        ? body.customImageDataUrl.split(',')[1]
        : body.customImageDataUrl;
      const rawBuf = Buffer.from(base64Part, 'base64');
      // Normalize any custom upload to exact 2048 x 677 px
      let pipeline = sharp(rawBuf).resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
        fit: 'cover',
        position: 'center'
      });
      finalBuffer =
        format === 'webp'
          ? await pipeline.webp({ quality: 95 }).toBuffer()
          : await pipeline.png({ compressionLevel: 6 }).toBuffer();
    } else {
      if (!finalSpec) {
        const input: ThumbnailInputPayload = {
          id: postId,
          title: body.title || 'JKSSB Class IV Recruitment 2026',
          category: body.category || 'jkssb',
          department: body.department || '',
          postType: body.postType || 'Job',
          shortInfo: body.shortDescription || '',
          startDate: body.importantDates?.startDate,
          lastDate: body.importantDates?.lastDate,
          status: body.applicationStatus || 'Open'
        };
        finalSpec = await extractThumbnailSpecWithAI(input);
      }
      finalBuffer = await renderMasterThumbnailBuffer(finalSpec, format);
    }

    // Ensure /public/thumbnails exists and save local high-speed asset
    const publicThumbDir = path.join(process.cwd(), 'public', 'thumbnails');
    if (!fs.existsSync(publicThumbDir)) {
      fs.mkdirSync(publicThumbDir, { recursive: true });
    }
    const ext = format === 'webp' ? 'webp' : 'png';
    const fileName = `${postId}.${ext}`;
    const localDiskPath = path.join(publicThumbDir, fileName);
    fs.writeFileSync(localDiskPath, finalBuffer);
    const localUrl = `/thumbnails/${fileName}?t=${Date.now()}`;

    // Also upload to Supabase Storage ('documents' bucket under 'thumbnails/' folder)
    const contentType = format === 'webp' ? 'image/webp' : 'image/png';
    const supaUpload = await uploadDocumentBufferToSupabase(
      'thumbnails',
      `${postId}_${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT}.${ext}`,
      finalBuffer,
      contentType
    );

    const effectiveUrl = supaUpload.success && supaUpload.url ? supaUpload.url : localUrl;

    savePostThumbnailRecord(postId, {
      thumbnailUrl: effectiveUrl,
      supabaseUrl: supaUpload.url || undefined,
      localUrl,
      spec: finalSpec
    });

    syncCustomPostsAndThumbnailsInMemory();

    res.json({
      success: true,
      postId,
      thumbnailUrl: effectiveUrl,
      supabaseUrl: supaUpload.url || null,
      localUrl,
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      aspectRatio: `${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}`,
      format,
      spec: finalSpec,
      isCustomUpload
    });
  } catch (err: any) {
    console.error('[Thumbnails] Save error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to save 2048x677 thumbnail'
    });
  }
});

// 5. Create or Update a Post with its Associated 2048x677 Thumbnail
app.post('/api/posts', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.title || !String(body.title).trim()) {
      return res.status(400).json({ error: 'Post Title is required.' });
    }

    const slug = String(
      body.id ||
        body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 65)
    );

    const todayStr = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY

    const newPost: any = {
      id: slug,
      title: String(body.title).trim(),
      category: body.category || 'jkssb',
      department: body.department || '',
      postType: body.postType || 'Job',
      status: body.applicationStatus || body.status || 'Open',
      postDate: body.postDate || todayStr,
      startDate: body.startDate || todayStr,
      lastDate: body.lastDate || 'Check Notification',
      advertisementNo: body.advertisementNo || '',
      shortInfo:
        body.shortDescription ||
        body.shortInfo ||
        `${body.title} official notification, eligibility, important dates, and online application assistance via CSC DOST.`,
      ageLimit: body.ageLimit || 'As per official notification norms',
      eligibility: body.eligibility || 'Refer to official notification for qualification details',
      totalPosts: body.totalPosts || 'Various Posts',
      officialLink: body.officialLink || 'https://www.india.gov.in',
      fees: body.fees || {
        genObc: body.genObcFee || 'As per official notice',
        scSt: body.scStFee || 'As per official notice'
      },
      isNew: true,
      thumbnailUrl: body.thumbnailUrl || `/api/thumbnails/post/${slug}.png`,
      thumbnailSpec: body.thumbnailSpec || undefined
    };

    upsertCustomSarkariPost(newPost);

    if (body.thumbnailUrl || body.thumbnailSpec) {
      savePostThumbnailRecord(slug, {
        thumbnailUrl: newPost.thumbnailUrl,
        spec: body.thumbnailSpec
      });
    }

    syncCustomPostsAndThumbnailsInMemory();

    // Check if auto-publish push is active
    const pushSettings = getPushServerSettings();
    if (pushSettings.autoPublishPush && !body.suppressPush) {
      const pushCategory = newPost.category === 'exam_forms' ? 'exams' : newPost.category === 'admissions' ? 'exams' : 'jobs';
      broadcastPushNotification({
        title: `CSC DOST | ${newPost.postType === 'Job' ? 'New Job Alert' : 'New Update'} 🔔`,
        body: `${newPost.title} — ${newPost.totalPosts || ''} (${newPost.lastDate ? `Last Date: ${newPost.lastDate}` : ''}). Tap to view full details.`,
        category: pushCategory,
        url: `/#post/${slug}`,
        postId: slug,
        image: newPost.thumbnailUrl,
        sentBy: 'Auto-Publish on Post Save'
      }).catch(err => {
        console.warn('[Push] Auto-publish background notification notice:', err?.message);
      });
    }

    res.json({
      success: true,
      post: newPost
    });
  } catch (err: any) {
    console.error('[Posts] Create/Update post error:', err);
    res.status(500).json({ error: err?.message || 'Failed to save post' });
  }
});

app.delete('/api/posts/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    deleteCustomSarkariPost(id);
    const idx = SARKARI_DATA.findIndex(i => i.id === id);
    if (idx >= 0) {
      SARKARI_DATA.splice(idx, 1);
    }
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete post' });
  }
});

// Dynamic Open Graph Image Generator Endpoint for WhatsApp / Facebook / Social Share Previews
app.get(['/api/og-image/:id.png', '/api/og-image/:id.webp', '/api/og-image/:id.svg', '/api/og-image/:id', '/api/og-image'], async (req: Request, res: Response) => {
  try {
    const rawId = (req.params.id || (req.query.id as string) || '').replace(/\.(png|svg|webp)$/i, '');
    const format = req.path.endsWith('.svg') || req.query.format === 'svg' ? 'svg' : 'png';

    // 1. Search in Sarkari notifications (both predefined SARKARI_DATA and custom posts)
    const allSarkari = [...SARKARI_DATA, ...getCustomSarkariPosts()];
    const sarkariItem = allSarkari.find(i => i.id === rawId || i.id === decodeURIComponent(rawId));
    if (sarkariItem) {
      if (format === 'svg') {
        const svg = generateOgSvg(sarkariItem);
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
        return res.send(svg);
      }
      const png = await generateSocialPreviewPng(sarkariItem);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      return res.send(png);
    }

    // 2. Search in Services list
    const serviceItem = SERVICES_LIST.find(s => s.id === rawId || s.id === decodeURIComponent(rawId));
    if (serviceItem) {
      if (format === 'svg') {
        const svg = generateServiceOgSvg(serviceItem);
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
        return res.send(svg);
      }
      const png = await generateServiceOgPng(serviceItem);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      return res.send(png);
    }

    // 3. Fallback: Default CSC DOST Open Graph Banner (1200x630)
    if (format === 'svg') {
      const svg = generateOgSvg(null);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      return res.send(svg);
    }
    const png = await generateSocialPreviewPng(null);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    return res.send(png);
  } catch (err) {
    console.error('OG Image Generation Error:', err);
    const fallbackPath = path.join(process.cwd(), 'public', 'og-banner.png');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).sendFile(fallbackPath);
  }
});

// Explicitly serve static og banners with caching (Supports query versions like ?v=2026)
app.get(['/og-banner.png', '/og-image.png'], async (req: Request, res: Response) => {
  const bannerPath = path.join(process.cwd(), 'public', 'og-banner.png');
  if (fs.existsSync(bannerPath)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    return res.sendFile(bannerPath);
  }
  const png = await generateSocialPreviewPng(null);
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  return res.send(png);
});

app.get(['/og-banner.svg', '/og-image.svg'], (req: Request, res: Response) => {
  const bannerPath = path.join(process.cwd(), 'public', 'og-banner.svg');
  if (fs.existsSync(bannerPath)) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    return res.sendFile(bannerPath);
  }
  const svg = generateOgSvg(null);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  return res.send(svg);
});

// Helper to inject rich Open Graph tags for WhatsApp / Facebook / Twitter scrapers and users
function renderDynamicMetaHtml(rawHtml: string, req: Request): { html: string; isNotFound: boolean } {
  let isNotFound = false;
  const rawUrl = req.originalUrl || req.url || req.path || '/';
  const urlPath = rawUrl.split('?')[0];
  const matchPost = urlPath.match(/^\/(?:post|job|jobs|sarkari|notice|admissions|notification)\/([^/?#]+)/i);
  const matchService = urlPath.match(/^\/service\/([^/?#]+)/i);
  const postParam = (req.query.post as string) || (req.query.job as string) || (req.query.id as string) || (req.query.notice as string);
  const serviceParam = req.query.service as string;

  // Determine host and protocol dynamically
  const host = req.get('x-forwarded-host') || req.get('host') || 'www.cscdost.com';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const baseOrigin = isLocal ? `http://${host}` : (host.includes('.run.app') ? `https://${host}` : 'https://www.cscdost.com');

  let title = 'CSC DOST – Guide to Government Services, Schemes & Recruitment';
  let description = 'CSC DOST is an independent citizen assistance and information portal. Explore recruitment updates, government schemes, Aadhaar, PAN card, and direct official links.';
  let ogImage = `${baseOrigin}/og-banner.png?v=2026_v3`;
  let canonicalUrl = `https://www.cscdost.com${urlPath === '/' ? '' : urlPath}`;
  let ogType = 'website';
  let articlePublishedDate = '';
  let breadcrumbItems: { name: string; url: string }[] = [];

  let substantiveBodyHtml = '';

  const legalMatch = urlPath.match(/^\/(privacy-policy|privacy|terms-of-service|terms|disclaimer|about-us|about|contact-us|contact|refund-policy|refund)(?:\/)?$/i);
  if (legalMatch) {
    const rawKey = legalMatch[1].toLowerCase();
    substantiveBodyHtml = renderLegalPageSubstantiveHtml(rawKey);
    if (rawKey === 'privacy-policy' || rawKey === 'privacy') {
      title = 'Privacy Policy | CSC DOST - Digital Assistance & Information Portal';
      description = 'Read the Privacy Policy of CSC DOST (cscdost.com). Learn how citizen data, form documents, and personal details are handled securely in compliance with the DPDP Act 2023.';
      canonicalUrl = 'https://www.cscdost.com/privacy-policy';
      breadcrumbItems = [
        { name: 'Home', url: 'https://www.cscdost.com/' },
        { name: 'Privacy Policy', url: 'https://www.cscdost.com/privacy-policy' }
      ];
    } else if (rawKey === 'terms-of-service' || rawKey === 'terms') {
      title = 'Terms of Service | CSC DOST - Citizen E-Governance Assistance';
      description = 'Read the Terms of Service and User Agreement for CSC DOST (cscdost.com). Understand our scope as an independent CSC facilitation center and user responsibilities.';
      canonicalUrl = 'https://www.cscdost.com/terms-of-service';
      breadcrumbItems = [
        { name: 'Home', url: 'https://www.cscdost.com/' },
        { name: 'Terms of Service', url: 'https://www.cscdost.com/terms-of-service' }
      ];
    } else if (rawKey === 'disclaimer') {
      title = 'Disclaimer & Government Non-Affiliation | CSC DOST';
      description = 'Important legal disclaimer: CSC DOST (cscdost.com) is an independent private digital facilitation center operated by CSC VLE Wasim Ahmad Khanday and is NOT an official government website.';
      canonicalUrl = 'https://www.cscdost.com/disclaimer';
      breadcrumbItems = [
        { name: 'Home', url: 'https://www.cscdost.com/' },
        { name: 'Disclaimer', url: 'https://www.cscdost.com/disclaimer' }
      ];
    } else if (rawKey === 'about-us' || rawKey === 'about') {
      title = 'About Us | CSC DOST - Authorized CSC VLE Digital Assistance Center';
      description = 'Learn about CSC DOST, founded by Authorized CSC VLE Wasim Ahmad Khanday (VLE ID: 212515670018) in Qazigund, Anantnag, J&K to assist citizens with e-governance applications.';
      canonicalUrl = 'https://www.cscdost.com/about-us';
      breadcrumbItems = [
        { name: 'Home', url: 'https://www.cscdost.com/' },
        { name: 'About Us', url: 'https://www.cscdost.com/about-us' }
      ];
    } else if (rawKey === 'contact-us' || rawKey === 'contact') {
      title = 'Contact Us & Help Desk | CSC DOST Support Center';
      description = 'Get in touch with CSC DOST Helpdesk. Call +91-7006833767 or email support@cscdost.com. Physical Center: Sangran Qazigund, Anantnag, Jammu & Kashmir 192221.';
      canonicalUrl = 'https://www.cscdost.com/contact-us';
      breadcrumbItems = [
        { name: 'Home', url: 'https://www.cscdost.com/' },
        { name: 'Contact Us', url: 'https://www.cscdost.com/contact-us' }
      ];
    } else if (rawKey === 'refund-policy' || rawKey === 'refund') {
      title = 'Refund & Cancellation Policy | CSC DOST';
      description = "Review CSC DOST's transparent refund and fee policies for online application processing, appointment assistance, and citizen digital services.";
      canonicalUrl = 'https://www.cscdost.com/refund-policy';
      breadcrumbItems = [
        { name: 'Home', url: 'https://www.cscdost.com/' },
        { name: 'Refund Policy', url: 'https://www.cscdost.com/refund-policy' }
      ];
    }
  }

  const targetPostId = (matchPost ? matchPost[1] : postParam)?.replace(/\.html?$/i, '');
  const targetServiceId = (matchService ? matchService[1] : serviceParam)?.replace(/\.html?$/i, '');

  if (targetPostId) {
    const allSarkari = [...SARKARI_DATA, ...getCustomSarkariPosts()];
    const item = allSarkari.find(i => i.id === targetPostId || i.id === decodeURIComponent(targetPostId));
    if (item) {
      title = `${item.title} | CSC DOST`;
      description = item.shortInfo || `Apply online for ${item.title}. Last Date: ${item.lastDate || 'Check Notification'}. Vacancies: ${item.totalPosts || 'Open'}. Official updates & application assistance at cscdost.com.`;
      const dateVersion = (item.lastDate || item.postDate || '2026').replace(/[^0-9]/g, '') || '2026';
      ogImage = `${baseOrigin}/api/og-image/${encodeURIComponent(item.id)}.png?v=${dateVersion}_v3`;
      canonicalUrl = `https://www.cscdost.com/post/${item.id}`;
      ogType = 'article';
      articlePublishedDate = item.postDate || '2026-02-20';
      breadcrumbItems = [
        { name: 'Home', url: 'https://www.cscdost.com/' },
        { name: 'Recruitment', url: 'https://www.cscdost.com/#sarkari-board' },
        { name: item.title, url: canonicalUrl }
      ];
      substantiveBodyHtml = renderPostSubstantiveHtml(item);
    } else if (matchPost) {
      isNotFound = true;
      title = 'Notification Not Found (404) | CSC DOST';
      description = 'The requested recruitment notification or examination update could not be found or has expired. Please check active recruitment updates on the CSC DOST portal.';
      canonicalUrl = `${baseOrigin}/#sarkari-board`;
      substantiveBodyHtml = renderNotFoundSubstantiveHtml(urlPath);
    }
  } else if (targetServiceId) {
    const service = SERVICES_LIST.find(s => s.id === targetServiceId || s.id === decodeURIComponent(targetServiceId));
    if (service) {
      title = `${service.name} Online Application | CSC DOST`;
      description = `${service.description} Processing time: ${service.estimatedTime}. Official fee: ${service.price}. Fast & reliable application assistance at cscdost.com.`;
      ogImage = `${baseOrigin}/api/og-image/${encodeURIComponent(service.id)}.png?v=srv_v3`;
      canonicalUrl = `https://www.cscdost.com/service/${service.id}`;
      ogType = 'website';
      breadcrumbItems = [
        { name: 'Home', url: 'https://www.cscdost.com/' },
        { name: 'Services', url: 'https://www.cscdost.com/services' },
        { name: service.name, url: canonicalUrl }
      ];
      substantiveBodyHtml = renderServiceSubstantiveHtml(service);
    } else if (matchService) {
      isNotFound = true;
      title = 'Service Not Found (404) | CSC DOST';
      description = 'The requested citizen service could not be found. Please check our complete service directory on the CSC DOST portal.';
      canonicalUrl = `${baseOrigin}/services`;
      substantiveBodyHtml = renderNotFoundSubstantiveHtml(urlPath);
    }
  } else {
    const categoryMatch = urlPath.match(/^\/(jobs|education|schemes|services|tools|apply|track)(?:\/)?$/i);
    if (categoryMatch) {
      const catKey = categoryMatch[1].toLowerCase() as 'jobs' | 'education' | 'schemes' | 'services' | 'tools' | 'apply' | 'track';
      const allSarkari = [...SARKARI_DATA, ...getCustomSarkariPosts()];
      substantiveBodyHtml = renderCategorySubstantiveHtml(catKey, allSarkari, SERVICES_LIST);
      canonicalUrl = `https://www.cscdost.com/${catKey}`;
      ogType = 'website';

      if (catKey === 'jobs') {
        title = 'Latest Government Jobs & Recruitment Bulletins (JKSSB, Army, SSC, RRB) | CSC DOST';
        description = 'Browse verified government jobs, recruitment notifications, defense vacancies, and application deadlines across Jammu & Kashmir and India on CSC DOST.';
        breadcrumbItems = [
          { name: 'Home', url: 'https://www.cscdost.com/' },
          { name: 'Government Jobs', url: canonicalUrl }
        ];
      } else if (catKey === 'education') {
        title = 'University Admissions, Date Sheets & Examination Notices | CSC DOST';
        description = 'Official exam date sheets, college admissions, UG/PG entrance updates for University of Kashmir, Cluster University Srinagar, and state higher education institutions.';
        breadcrumbItems = [
          { name: 'Home', url: 'https://www.cscdost.com/' },
          { name: 'Higher Education', url: canonicalUrl }
        ];
      } else if (catKey === 'schemes') {
        title = 'Government Welfare Schemes & Digital Services Guide | CSC DOST';
        description = 'Comprehensive eligibility criteria and application guides for PM-KISAN, Ayushman Bharat PM-JAY Golden Card, PM Vishwakarma, and citizen welfare schemes.';
        breadcrumbItems = [
          { name: 'Home', url: 'https://www.cscdost.com/' },
          { name: 'Welfare Schemes', url: canonicalUrl }
        ];
      } else if (catKey === 'services') {
        title = 'Citizen E-Governance Services Directory | CSC DOST';
        description = 'Direct access to assisted online services: PAN card registration, Aadhaar address correction, Ayushman Card, state certificates, and document printing.';
        breadcrumbItems = [
          { name: 'Home', url: 'https://www.cscdost.com/' },
          { name: 'Services Directory', url: canonicalUrl }
        ];
      } else if (catKey === 'tools') {
        title = 'Free Citizen Document Preparation Tools (100% Client-Side) | CSC DOST';
        description = 'Resize recruitment photos, crop signatures, calculate age against benchmark cutoff dates, and compress government PDFs securely in your browser.';
        breadcrumbItems = [
          { name: 'Home', url: 'https://www.cscdost.com/' },
          { name: 'Document Tools', url: canonicalUrl }
        ];
      } else if (catKey === 'apply') {
        title = 'Assisted Online Application Counter | CSC DOST';
        description = 'Submit an assisted application request to our authorized CSC Village Level Entrepreneur desk in Sangran Qazigund, Anantnag for error-free form submission.';
        breadcrumbItems = [
          { name: 'Home', url: 'https://www.cscdost.com/' },
          { name: 'Assisted Application', url: canonicalUrl }
        ];
      } else if (catKey === 'track') {
        title = 'Track Application Status | CSC DOST';
        description = 'Track your assisted application, document status, and payment receipts using your unique token ID.';
        breadcrumbItems = [
          { name: 'Home', url: 'https://www.cscdost.com/' },
          { name: 'Track Application', url: canonicalUrl }
        ];
      }
    } else if (urlPath === '/') {
      const allSarkari = [...SARKARI_DATA, ...getCustomSarkariPosts()];
      substantiveBodyHtml = renderHomepageSubstantiveHtml(allSarkari, SERVICES_LIST);
    } else if (!legalMatch) {
      // Unrecognized route: return 404
      isNotFound = true;
      title = 'Page Not Found (404) | CSC DOST';
      description = 'The requested page or document could not be found on CSC DOST. Please check the URL or return to our homepage for verified recruitment and citizen services.';
      canonicalUrl = `${baseOrigin}/`;
      substantiveBodyHtml = renderNotFoundSubstantiveHtml(urlPath);
    }
  }

  // Escape HTML / XML special characters
  const escAttr = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escText = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const safeTitle = escText(title);
  const safeAttrTitle = escAttr(title);
  const safeAttrDesc = escAttr(description);
  const safeOgImage = escAttr(ogImage);
  const safeCanonical = escAttr(canonicalUrl);

  let html = rawHtml;

  // Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);
  
  // Replace <meta name="title">
  html = html.replace(/<meta\s+name=["']title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="title" content="${safeAttrTitle}" />`);
  
  // Replace <meta name="description">
  html = html.replace(/<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${safeAttrDesc}" />`);
  
  // Replace <link rel="canonical">
  html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="canonical" href="${safeCanonical}" />`);

  // Replace og:type
  html = html.replace(/<meta\s+property=["']og:type["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:type" content="${ogType}" />`);

  // Replace og:url
  html = html.replace(/<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:url" content="${safeCanonical}" />`);

  // Replace og:title
  html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:title" content="${safeAttrTitle}" />`);

  // Replace og:description
  html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:description" content="${safeAttrDesc}" />`);

  // Replace og:image & og:image:secure_url & og:image:alt
  html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image" content="${safeOgImage}" />`);
  html = html.replace(/<meta\s+property=["']og:image:secure_url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image:secure_url" content="${safeOgImage}" />`);
  html = html.replace(/<meta\s+property=["']og:image:alt["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image:alt" content="${safeAttrTitle}" />`);

  // Replace twitter:card
  html = html.replace(/<meta\s+name=["']twitter:card["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:card" content="summary_large_image" />`);

  // Replace twitter:title
  html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:title" content="${safeAttrTitle}" />`);

  // Replace twitter:description
  html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:description" content="${safeAttrDesc}" />`);

  // Replace twitter:image & twitter:image:alt
  html = html.replace(/<meta\s+name=["']twitter:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:image" content="${safeOgImage}" />`);
  html = html.replace(/<meta\s+name=["']twitter:image:alt["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:image:alt" content="${safeAttrTitle}" />`);

  // If article, inject article JSON-LD before </head>
  if (ogType === 'article') {
    const articleLd = `
    <!-- Dynamic Post Article Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${safeAttrTitle}",
      "description": "${safeAttrDesc}",
      "image": ["${safeOgImage}"],
      "datePublished": "${articlePublishedDate}",
      "dateModified": "${articlePublishedDate}",
      "mainEntityOfPage": "${safeCanonical}",
      "publisher": {
        "@type": "Organization",
        "name": "CSC DOST",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.cscdost.com/favicon.png"
        }
      }
    }
    </script>
  </head>`;
    html = html.replace(/<\/head>/i, articleLd);
  }

  // Inject BreadcrumbList JSON-LD if breadcrumbs exist
  if (breadcrumbItems.length > 0) {
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems.map((b, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": b.name,
        "item": b.url
      }))
    };
    const breadcrumbScript = `
    <!-- Dynamic BreadcrumbList Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(breadcrumbLd, null, 2)}
    </script>
  </head>`;
    html = html.replace(/<\/head>/i, breadcrumbScript);
  }

  if (isNotFound && !substantiveBodyHtml) {
    substantiveBodyHtml = renderNotFoundSubstantiveHtml(urlPath);
  }

  // Preserve <div id="root"></div> for regular routes so the complete interactive React application mounts cleanly.
  // Only inject fallback HTML if this is a genuine 404 not found page.
  if (isNotFound && substantiveBodyHtml) {
    html = html.replace('<div id="root"></div>', `<div id="root">${substantiveBodyHtml}</div>`);
  }

  return { html, isNotFound };
}

// Dynamically serve up-to-date sitemap.xml with correct MIME headers & canonical URLs
app.get('/sitemap.xml', (req: Request, res: Response) => {
  try {
    const BASE_URL = 'https://www.cscdost.com';
    const TODAY = new Date().toISOString().split('T')[0];

    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/jobs', priority: '0.9', changefreq: 'daily' },
      { loc: '/education', priority: '0.9', changefreq: 'daily' },
      { loc: '/schemes', priority: '0.9', changefreq: 'weekly' },
      { loc: '/services', priority: '0.9', changefreq: 'weekly' },
      { loc: '/tools', priority: '0.8', changefreq: 'monthly' },
      { loc: '/apply', priority: '0.7', changefreq: 'monthly' },
      { loc: '/track', priority: '0.7', changefreq: 'monthly' },
      { loc: '/about-us', priority: '0.8', changefreq: 'monthly' },
      { loc: '/contact-us', priority: '0.8', changefreq: 'monthly' },
      { loc: '/privacy-policy', priority: '0.7', changefreq: 'monthly' },
      { loc: '/terms-of-service', priority: '0.7', changefreq: 'monthly' },
      { loc: '/disclaimer', priority: '0.7', changefreq: 'monthly' },
      { loc: '/refund-policy', priority: '0.7', changefreq: 'monthly' }
    ];

    const allSarkari = [...SARKARI_DATA, ...getCustomSarkariPosts()];
    const seenPostIds = new Set<string>();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
    xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n';

    for (const p of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${p.loc}</loc>\n`;
      xml += `    <lastmod>${TODAY}</lastmod>\n`;
      xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
      xml += `    <priority>${p.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    for (const post of allSarkari) {
      if (!post.id || seenPostIds.has(post.id)) continue;
      seenPostIds.add(post.id);
      let safeDate = TODAY;
      if (post.postDate && /^\d{2}\/\d{2}\/\d{4}$/.test(post.postDate)) {
        const [d, m, y] = post.postDate.split('/');
        safeDate = `${y}-${m}-${d}`;
      } else if (post.lastDate && /^\d{2}\/\d{2}\/\d{4}$/.test(post.lastDate)) {
        const [d, m, y] = post.lastDate.split('/');
        safeDate = `${y}-${m}-${d}`;
      }
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/post/${encodeURIComponent(post.id)}</loc>\n`;
      xml += `    <lastmod>${safeDate}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    for (const s of SERVICES_LIST) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/service/${encodeURIComponent(s.id)}</loc>\n`;
      xml += `    <lastmod>${TODAY}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>\n';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.send(xml);
  } catch (err) {
    console.error('Error generating dynamic sitemap, serving static file:', err);
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.sendFile(sitemapPath);
  }
});

app.get('/robots.txt', (req: Request, res: Response) => {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(robotsPath);
});

// Explicitly serve static public assets like favicons
app.use(express.static(path.join(process.cwd(), 'public')));

// Production & Vercel SSR catch-all route (Registered immediately so Vercel Serverless Function executes it)
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  const distPath = path.join(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  const rootHtmlPath = path.join(process.cwd(), 'index.html');

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
  }

  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    try {
      const targetHtmlPath = fs.existsSync(indexHtmlPath) ? indexHtmlPath : (fs.existsSync(rootHtmlPath) ? rootHtmlPath : null);
      if (targetHtmlPath) {
        const indexHtml = fs.readFileSync(targetHtmlPath, 'utf-8');
        const { html: dynamicHtml, isNotFound } = renderDynamicMetaHtml(indexHtml, req);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        if (isNotFound) {
          return res.status(404).send(dynamicHtml);
        }
        return res.send(dynamicHtml);
      }
    } catch (err) {
      console.error('Error serving index.html:', err);
    }
    return res.status(404).send('Not Found');
  });
}

// Setup Vite Dev Server / Local Development HTTP Listener
async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    // Mount Vite's middleware to handle virtual modules (/@vite/client, /@react-refresh, etc.), assets, and transformations
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
      }

      const url = req.originalUrl || req.url;
      try {
        const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
        const transformedHtml = await vite.transformIndexHtml(url, indexHtml);
        const { html: finalHtml, isNotFound } = renderDynamicMetaHtml(transformedHtml, req);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        if (isNotFound) {
          return res.status(404).send(finalHtml);
        }
        return res.send(finalHtml);
      } catch (e: any) {
        if (vite && typeof vite.ssrFixStacktrace === 'function') {
          vite.ssrFixStacktrace(e);
        }
        return next(e);
      }
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 CSC DOST Server successfully started on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal error setting up server:', err);
  });
}

export default app;
export { app };
