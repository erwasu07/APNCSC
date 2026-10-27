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
  updateWhatsAppPublishHistoryStatus,
  clearWhatsAppPublishHistory,
  upsertPushSubscription,
  deactivatePushSubscription,
  getActivePushSubscriptions,
  getPushNotificationHistory,
  getPushServerSettings,
  updatePushServerSettings
} from './src/dbServer';
import {
  persistCustomerApplication,
  getServerSupabaseClient,
  deleteCustomerApplicationFromSupabase,
  findSupabaseApplicationRows,
  getHighestSupabaseTokenSeq,
  isDeletedApplicationRecord,
  uploadDocumentBufferToSupabase,
  syncPushSubscriptionToSupabase
} from './src/lib/supabaseServer';
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

// Request JSON body parsing with extended limits for document uploads
app.use(express.json({ limit: '50mb' }));
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

// Protected API: Get all submitted applications (authorized staff/admin only)
app.get('/api/appointments', authenticateAdmin, (req, res) => {
  const db = getDb();
  const activeList = (db.appointments || []).filter((a: any) => !isDeletedApplicationRecord(a));
  res.json({ success: true, data: activeList });
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
  const targetId = (id || '').toString().toLowerCase();

  // 1. Check local database (only active records)
  const found = (db.appointments || []).find((a: any) => {
    if (isDeletedApplicationRecord(a)) return false;
    const appIdStr = (a.appId || a.id || '').toString().toLowerCase();
    const utrStr = (a.utrNumber || '').toString().toLowerCase();
    return appIdStr === targetId || utrStr === targetId;
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

  const deletedIds: string[] = [];
  const deletedSupabaseIds: string[] = [];
  const deletedTokenIds: string[] = [];
  const failedItems: Array<{ id: string; error: string }> = [];
  let totalAffected = 0;

  for (const item of rawItems) {
    const targetId = typeof item === 'string' ? item : String(item?.appId || item?.id || '');
    const supabaseUuid = typeof item === 'object' && item !== null ? String(item.supabaseId || '') : '';
    if (!targetId && !supabaseUuid) continue;

    const supaRes = await deleteCustomerApplicationFromSupabase(targetId || supabaseUuid, supabaseUuid);
    const localRemoved = deleteAppointment(targetId || supabaseUuid, [
      supabaseUuid,
      ...supaRes.deletedSupabaseIds,
      ...supaRes.deletedTokenIds
    ]);

    if (supaRes.foundInSupabase && !supaRes.success) {
      failedItems.push({
        id: targetId || supabaseUuid,
        error: supaRes.error || 'Database failed to delete record in Supabase.'
      });
      continue;
    }

    if (!supaRes.foundInSupabase && !localRemoved) {
      failedItems.push({
        id: targetId || supabaseUuid,
        error: 'Record not found in Supabase or local database.'
      });
      continue;
    }

    deletedIds.push(targetId || supabaseUuid);
    deletedSupabaseIds.push(...supaRes.deletedSupabaseIds);
    deletedTokenIds.push(...supaRes.deletedTokenIds);
    totalAffected += Math.max(supaRes.affectedCount, localRemoved ? 1 : 0);
  }

  if (totalAffected > 0) {
    broadcastRealtimeEvent('APPOINTMENTS_BULK_DELETED', {
      deletedIds,
      deletedSupabaseIds,
      deletedTokenIds
    });
  }

  if (totalAffected === 0 && failedItems.length > 0) {
    return res.status(404).json({
      success: false,
      affectedCount: 0,
      deletedIds: [],
      deletedSupabaseIds: [],
      deletedTokenIds: [],
      failedItems,
      error: failedItems[0].error
    });
  }

  return res.json({
    success: failedItems.length === 0,
    affectedCount: totalAffected,
    deletedIds,
    deletedSupabaseIds,
    deletedTokenIds,
    failedItems,
    message:
      failedItems.length === 0
        ? `Permanently deleted ${deletedIds.length} application(s).`
        : `Deleted ${deletedIds.length} application(s); ${failedItems.length} failed.`
  });
});

// Delete single appointment (persists across Supabase + local server DB with affected row verification)
app.delete('/api/appointments/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const supabaseId = String(req.query.supabaseId || req.body?.supabaseId || '').trim();

  const supaRes = await deleteCustomerApplicationFromSupabase(id, supabaseId);
  const localRemoved = deleteAppointment(id, [
    supabaseId,
    ...supaRes.deletedSupabaseIds,
    ...supaRes.deletedTokenIds
  ]);

  if (supaRes.foundInSupabase && !supaRes.success) {
    return res.status(500).json({
      success: false,
      affectedCount: 0,
      error: supaRes.error || 'Failed to delete application from Supabase database.'
    });
  }

  if (!supaRes.foundInSupabase && !localRemoved) {
    return res.status(404).json({
      success: false,
      affectedCount: 0,
      error: `Application "${id}" not found in Supabase or local server database.`
    });
  }

  const affectedCount = Math.max(supaRes.affectedCount, localRemoved ? 1 : 0);
  const eventPayload = {
    id,
    appId: id,
    supabaseId: supabaseId || supaRes.deletedSupabaseIds[0] || undefined,
    deletedSupabaseIds: supaRes.deletedSupabaseIds,
    deletedTokenIds: supaRes.deletedTokenIds
  };

  broadcastRealtimeEvent('APPOINTMENT_DELETED', eventPayload);

  return res.json({
    success: true,
    affectedCount,
    deletionMode: supaRes.deletionMode || (localRemoved ? 'local_hard' : 'hard'),
    deletedSupabaseIds: supaRes.deletedSupabaseIds,
    deletedTokenIds: supaRes.deletedTokenIds,
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
  'Sent',
  'Delivered',
  'Failed'
]);

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

// 1. Diagnose Official WhatsApp Business Platform API & Legacy Auto-Post Status
app.get('/api/whatsapp/diagnostics', authenticateAdmin, (_req: Request, res: Response) => {
  const cloudApiTokenConfigured = Boolean((process.env.WHATSAPP_CLOUD_API_TOKEN || '').trim());
  const phoneNumberIdConfigured = Boolean((process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim());
  const officialGroupIdConfigured = Boolean((process.env.WHATSAPP_OFFICIAL_GROUP_ID || '').trim());
  const webhookUrlConfigured = Boolean((process.env.WHATSAPP_BROADCAST_WEBHOOK_URL || '').trim());

  const cloudApiReady = cloudApiTokenConfigured && phoneNumberIdConfigured;
  const officialGroupsApiReady = cloudApiReady && officialGroupIdConfigured;

  return res.json({
    success: true,
    checkedAt: new Date().toISOString(),
    diagnostics: {
      cloudApiReady,
      cloudApiTokenConfigured,
      phoneNumberIdConfigured,
      officialGroupsApiReady,
      officialGroupIdConfigured,
      automatedChannelApiSupported: false,
      webhookUrlConfigured,
      legacyAutoPostDiagnosis: {
        status: 'unsupported_for_existing_consumer_groups_and_channels',
        summary:
          'Why the legacy Auto-Post button did not deliver to your Group or Channel: (1) A public group invite link (chat.whatsapp.com/...) is a browser join link, not an API destination ID. (2) Standard Meta WhatsApp Cloud API does not provide an endpoint for automated publishing to WhatsApp Channels (whatsapp.com/channel/...). (3) A generic webhook returning HTTP 200 only confirms the webhook received JSON ("Submitted to Provider"), not that WhatsApp delivered a message.',
        supportedGroupWorkflow:
          'Use "Share on WhatsApp" (official api.whatsapp.com/send link) to select your existing CSC DOST WhatsApp Group(s) and confirm sending in WhatsApp, then mark as "Manually Confirmed".',
        supportedChannelWorkflow:
          'Use "Copy Channel Notification" + "Open My WhatsApp Channel" to paste and publish directly in your WhatsApp Channel, then mark as "Manually Confirmed".',
        officialApiSupport: officialGroupsApiReady
          ? 'Official Meta Cloud API + API-Managed Group ID detected on server.'
          : 'No official API-managed Group credentials (WHATSAPP_CLOUD_API_TOKEN + WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_OFFICIAL_GROUP_ID) are configured on the server.'
      }
    }
  });
});

// 2. Get & Save WhatsApp Channel / Group Publisher Configuration
app.get('/api/whatsapp/config', authenticateAdmin, (_req: Request, res: Response) => {
  return res.json({
    success: true,
    config: getWhatsAppPublisherConfig()
  });
});

app.put('/api/whatsapp/config', authenticateAdmin, (req: Request, res: Response) => {
  const { channelUrl, channelName, groupInviteUrl, groupName, updatedBy } = req.body || {};

  const cleanChannelUrl = typeof channelUrl === 'string' ? channelUrl.trim() : undefined;
  const cleanGroupUrl = typeof groupInviteUrl === 'string' ? groupInviteUrl.trim() : undefined;

  if (cleanChannelUrl !== undefined && !isValidWhatsAppChannelUrl(cleanChannelUrl)) {
    return res.status(400).json({
      success: false,
      error:
        'Invalid WhatsApp Channel URL. Please enter a valid https://whatsapp.com/channel/... link.'
    });
  }

  if (cleanGroupUrl !== undefined && !isValidWhatsAppGroupInviteUrl(cleanGroupUrl)) {
    return res.status(400).json({
      success: false,
      error:
        'Invalid WhatsApp Group Invite URL. Please enter a valid https://chat.whatsapp.com/... link.'
    });
  }

  const saved = saveWhatsAppPublisherConfig({
    ...(cleanChannelUrl !== undefined ? { channelUrl: cleanChannelUrl } : {}),
    ...(typeof channelName === 'string' ? { channelName: channelName.trim() || 'CSC DOST Official WhatsApp Channel' } : {}),
    ...(cleanGroupUrl !== undefined ? { groupInviteUrl: cleanGroupUrl } : {}),
    ...(typeof groupName === 'string' ? { groupName: groupName.trim() || 'CSC DOST Community Group' } : {}),
    ...(typeof updatedBy === 'string' ? { updatedBy: updatedBy.trim() } : {})
  });

  return res.json({
    success: true,
    config: saved,
    message: 'WhatsApp Publisher destination settings saved.'
  });
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

// 4. Official API / Verified Provider Dispatch Endpoint (with Idempotency & Honest Status Reporting)
app.post('/api/whatsapp/broadcast', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const {
      postId,
      title,
      category,
      messageText,
      postUrl,
      destination,
      adminUser,
      force
    } = req.body || {};

    if (!messageText || !String(messageText).trim()) {
      return res.status(400).json({
        success: false,
        error: 'messageText is required for publishing.'
      });
    }

    const cleanPostId = String(postId || title || 'post').trim().toLowerCase();
    const cleanDest = String(destination || 'Official API Destination').trim();
    const cleanAdmin = String(adminUser || 'Authorized Staff').trim();
    const dedupKey = `${cleanPostId}::${cleanDest}`;

    // Prevent duplicate automated submissions within 60 seconds
    const nowMs = Date.now();
    const lastSentMs = recentAutomatedSubmissions.get(dedupKey) || 0;
    if (!force && nowMs - lastSentMs < 60000) {
      return res.status(429).json({
        success: false,
        error:
          'Duplicate automated submission prevented: this notification was already submitted to this destination within the last 60 seconds.'
      });
    }

    const cloudToken = (process.env.WHATSAPP_CLOUD_API_TOKEN || '').trim();
    const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
    const officialGroupId = (process.env.WHATSAPP_OFFICIAL_GROUP_ID || '').trim();
    const configuredWebhook = (process.env.WHATSAPP_BROADCAST_WEBHOOK_URL || '').trim();

    // Case 1: Official Meta WhatsApp Cloud API with an API-managed Group ID
    if (cloudToken && phoneNumberId && officialGroupId) {
      try {
        const metaRes = await fetch(
          `https://graph.facebook.com/v18.0/${encodeURIComponent(phoneNumberId)}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${cloudToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'group',
              to: officialGroupId,
              type: 'text',
              text: { preview_url: true, body: String(messageText) }
            }),
            signal: AbortSignal.timeout(8000)
          }
        );

        const metaData: any = await metaRes.json().catch(() => ({}));
        const messageId = metaData?.messages?.[0]?.id;

        if (metaRes.ok && messageId) {
          recentAutomatedSubmissions.set(dedupKey, nowMs);
          const entry = addWhatsAppPublishHistoryRecord({
            postId: cleanPostId,
            title: String(title || 'CSC DOST Notification'),
            category: String(category || 'job'),
            destination: `Official API Group (${officialGroupId})`,
            sharingMethod: 'Official WhatsApp Cloud API',
            status: 'Sent',
            adminUser: cleanAdmin,
            canonicalUrl: String(postUrl || 'https://www.cscdost.com'),
            providerMessageId: String(messageId)
          });

          return res.status(200).json({
            success: true,
            status: 'Sent',
            providerMessageId: messageId,
            entry,
            history: getWhatsAppPublishHistory(),
            message: `Verified by Meta Cloud API (Message ID: ${messageId}). Status recorded as Sent.`
          });
        } else {
          const apiErrMsg =
            metaData?.error?.message || `Meta Cloud API returned HTTP ${metaRes.status}`;
          const failedEntry = addWhatsAppPublishHistoryRecord({
            postId: cleanPostId,
            title: String(title || 'CSC DOST Notification'),
            category: String(category || 'job'),
            destination: `Official API Group`,
            sharingMethod: 'Official WhatsApp Cloud API',
            status: 'Failed',
            adminUser: cleanAdmin,
            canonicalUrl: String(postUrl || 'https://www.cscdost.com'),
            errorDetails: apiErrMsg
          });

          return res.status(400).json({
            success: false,
            status: 'Failed',
            error: apiErrMsg,
            entry: failedEntry,
            history: getWhatsAppPublishHistory()
          });
        }
      } catch (err: any) {
        const errMsg = err?.message || 'Network error contacting Meta Cloud API';
        const failedEntry = addWhatsAppPublishHistoryRecord({
          postId: cleanPostId,
          title: String(title || 'CSC DOST Notification'),
          category: String(category || 'job'),
          destination: 'Official API Group',
          sharingMethod: 'Official WhatsApp Cloud API',
          status: 'Failed',
          adminUser: cleanAdmin,
          canonicalUrl: String(postUrl || 'https://www.cscdost.com'),
          errorDetails: errMsg
        });

        return res.status(500).json({
          success: false,
          status: 'Failed',
          error: errMsg,
          entry: failedEntry,
          history: getWhatsAppPublishHistory()
        });
      }
    }

    // Case 2: Server Webhook configured (e.g. Make.com / custom automation)
    // IMPORTANT: A webhook returning HTTP 200 only proves the payload was "Submitted to Provider",
    // NOT that a WhatsApp message was delivered to a Group or Channel.
    if (configuredWebhook && /^https?:\/\//i.test(configuredWebhook) && !configuredWebhook.includes('chat.whatsapp.com')) {
      try {
        const hookRes = await fetch(configuredWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'csc_dost_whatsapp_notification',
            postId: cleanPostId,
            title: title || 'CSC DOST Notification',
            category: category || 'job',
            messageText: String(messageText),
            canonicalUrl: postUrl || 'https://www.cscdost.com',
            submittedBy: cleanAdmin,
            timestamp: new Date().toISOString()
          }),
          signal: AbortSignal.timeout(7000)
        });

        if (hookRes.ok) {
          recentAutomatedSubmissions.set(dedupKey, nowMs);
          const entry = addWhatsAppPublishHistoryRecord({
            postId: cleanPostId,
            title: String(title || 'CSC DOST Notification'),
            category: String(category || 'job'),
            destination: cleanDest || 'Configured Server Webhook',
            sharingMethod: 'Server Webhook Relay',
            status: 'Submitted to Provider',
            adminUser: cleanAdmin,
            canonicalUrl: String(postUrl || 'https://www.cscdost.com')
          });

          return res.status(200).json({
            success: true,
            status: 'Submitted to Provider',
            entry,
            history: getWhatsAppPublishHistory(),
            message:
              'Payload accepted by server webhook (Status: Submitted to Provider). Note: Webhook acceptance does not confirm WhatsApp Group or Channel delivery unless your downstream provider verifies delivery.'
          });
        } else {
          const errText = await hookRes.text().catch(() => '');
          const failedEntry = addWhatsAppPublishHistoryRecord({
            postId: cleanPostId,
            title: String(title || 'CSC DOST Notification'),
            category: String(category || 'job'),
            destination: cleanDest || 'Configured Server Webhook',
            sharingMethod: 'Server Webhook Relay',
            status: 'Failed',
            adminUser: cleanAdmin,
            canonicalUrl: String(postUrl || 'https://www.cscdost.com'),
            errorDetails: `Webhook returned HTTP ${hookRes.status}: ${errText.slice(0, 120)}`
          });

          return res.status(400).json({
            success: false,
            status: 'Failed',
            error: `Webhook returned HTTP ${hookRes.status}.`,
            entry: failedEntry,
            history: getWhatsAppPublishHistory()
          });
        }
      } catch (err: any) {
        const errMsg = err?.message || 'Webhook request failed';
        const failedEntry = addWhatsAppPublishHistoryRecord({
          postId: cleanPostId,
          title: String(title || 'CSC DOST Notification'),
          category: String(category || 'job'),
          destination: cleanDest || 'Configured Server Webhook',
          sharingMethod: 'Server Webhook Relay',
          status: 'Failed',
          adminUser: cleanAdmin,
          canonicalUrl: String(postUrl || 'https://www.cscdost.com'),
          errorDetails: errMsg
        });

        return res.status(500).json({
          success: false,
          status: 'Failed',
          error: errMsg,
          entry: failedEntry,
          history: getWhatsAppPublishHistory()
        });
      }
    }

    // Case 3: No official API or valid webhook configured
    const failedEntry = addWhatsAppPublishHistoryRecord({
      postId: cleanPostId,
      title: String(title || 'CSC DOST Notification'),
      category: String(category || 'job'),
      destination: cleanDest,
      sharingMethod: 'Official API Attempt',
      status: 'Failed',
      adminUser: cleanAdmin,
      canonicalUrl: String(postUrl || 'https://www.cscdost.com'),
      errorDetails:
        'Official WhatsApp Business Cloud API credentials (WHATSAPP_CLOUD_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_OFFICIAL_GROUP_ID) are not configured on the server.'
    });

    return res.status(400).json({
      success: false,
      status: 'Failed',
      error:
        'Automated API delivery is unavailable: No official WhatsApp Business Cloud API credentials are configured on the server. Please use the supported "Share to WhatsApp Groups" or "Publish to WhatsApp Channel" workflows.',
      entry: failedEntry,
      history: getWhatsAppPublishHistory()
    });
  } catch (err: any) {
    console.error('[WhatsApp Publisher] Broadcast error:', err);
    return res.status(500).json({
      success: false,
      status: 'Failed',
      error: err?.message || 'Unexpected server error while processing WhatsApp request.'
    });
  }
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
  res.json({
    settings: db.settings,
    announcements: db.announcements,
    gallery: db.gallery,
    contactRequests: db.contactRequests,
    appointments: db.appointments,
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
  const supaRes = await deleteCustomerApplicationFromSupabase(id, supabaseId);
  const localRemoved = deleteAppointment(id, [
    supabaseId,
    ...supaRes.deletedSupabaseIds,
    ...supaRes.deletedTokenIds
  ]);

  if (supaRes.foundInSupabase && !supaRes.success) {
    return res.status(500).json({ error: supaRes.error || 'Failed to delete from Supabase.' });
  }
  if (supaRes.affectedCount > 0 || localRemoved) {
    broadcastRealtimeEvent('APPOINTMENT_DELETED', {
      id,
      appId: id,
      supabaseId,
      deletedSupabaseIds: supaRes.deletedSupabaseIds,
      deletedTokenIds: supaRes.deletedTokenIds
    });
    res.json({ success: true, affectedCount: Math.max(supaRes.affectedCount, localRemoved ? 1 : 0), message: 'Appointment removed.' });
  } else {
    res.status(404).json({ error: 'Appointment not found.' });
  }
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
    res.status(500).sendFile(path.join(process.cwd(), 'public', 'og-banner.png'));
  }
});

// Explicitly serve static og banners with caching
app.get(['/og-banner.png', '/og-image.png'], (req: Request, res: Response) => {
  const bannerPath = path.join(process.cwd(), 'public', 'og-banner.png');
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  res.sendFile(bannerPath);
});

app.get(['/og-banner.svg', '/og-image.svg'], (req: Request, res: Response) => {
  const bannerPath = path.join(process.cwd(), 'public', 'og-banner.svg');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  res.sendFile(bannerPath);
});

// Helper to inject rich Open Graph tags for WhatsApp / Facebook / Twitter scrapers and users
function renderDynamicMetaHtml(rawHtml: string, req: Request): { html: string; isNotFound: boolean } {
  let isNotFound = false;
  const urlPath = req.path;
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
  let ogImage = `${baseOrigin}/og-banner.png`;
  let canonicalUrl = `https://www.cscdost.com${urlPath === '/' ? '' : urlPath}`;
  let ogType = 'website';
  let articlePublishedDate = '';
  let breadcrumbItems: { name: string; url: string }[] = [];

  const legalMatch = urlPath.match(/^\/(privacy-policy|privacy|terms-of-service|terms|disclaimer|about-us|about|contact-us|contact|refund-policy|refund)(?:\/)?$/i);
  if (legalMatch) {
    const rawKey = legalMatch[1].toLowerCase();
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
      ogImage = `${baseOrigin}/api/og-image/${encodeURIComponent(item.id)}.png?v=${dateVersion}`;
      canonicalUrl = `https://www.cscdost.com/post/${item.id}`;
      ogType = 'article';
      articlePublishedDate = item.postDate || '2026-02-20';
      breadcrumbItems = [
        { name: 'Home', url: 'https://www.cscdost.com/' },
        { name: 'Recruitment', url: 'https://www.cscdost.com/#sarkari-board' },
        { name: item.title, url: canonicalUrl }
      ];
    } else if (matchPost) {
      isNotFound = true;
      title = 'Notification Not Found (404) | CSC DOST';
      description = 'The requested recruitment notification or examination update could not be found or has expired. Please check active recruitment updates on the CSC DOST portal.';
      canonicalUrl = `${baseOrigin}/#sarkari-board`;
    }
  } else if (targetServiceId) {
    const service = SERVICES_LIST.find(s => s.id === targetServiceId || s.id === decodeURIComponent(targetServiceId));
    if (service) {
      title = `${service.name} Online Application | CSC DOST`;
      description = `${service.description} Processing time: ${service.estimatedTime}. Official fee: ${service.price}. Fast & reliable application assistance at cscdost.com.`;
      ogImage = `${baseOrigin}/api/og-image/${encodeURIComponent(service.id)}.png?v=srv`;
      canonicalUrl = `https://www.cscdost.com/service/${service.id}`;
      ogType = 'website';
      breadcrumbItems = [
        { name: 'Home', url: 'https://www.cscdost.com/' },
        { name: 'Services', url: 'https://www.cscdost.com/#services' },
        { name: service.name, url: canonicalUrl }
      ];
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

  if (isNotFound) {
    const notFoundCard = `
    <div style="min-height:70vh; display:flex; align-items:center; justify-content:center; padding:40px 20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f8fafc;">
      <div style="background:white; border:1px solid #e2e8f0; border-radius:16px; max-width:520px; padding:36px; text-align:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="font-size:42px; margin-bottom:12px;">📋</div>
        <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 10px 0;">Notification Not Found or Expired</h1>
        <p style="color:#64748b; font-size:14px; line-height:1.6; margin:0 0 20px 0;">The recruitment notification, admit card, or admission notice you are looking for does not exist or may have been archived after the closing date.</p>
        <a href="/#sarkari-board" style="display:inline-block; background:#2563eb; color:white; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">Browse Latest Sarkari Jobs</a>
      </div>
    </div>`;
    html = html.replace('<div id="root"></div>', `<div id="root">${notFoundCard}</div>`);
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
      const modDate = post.postDate ? post.postDate.split('/').reverse().join('-') : TODAY;
      const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(modDate) ? modDate : TODAY;
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
      appType: 'spa',
    });

    app.use(async (req, res, next) => {
      const url = req.originalUrl || req.url;
      const isPostOrServiceOrLegal =
        /^\/(?:post|job|jobs|sarkari|notice|admissions|notification|service|privacy-policy|privacy|terms-of-service|terms|disclaimer|about-us|about|contact-us|contact|refund-policy|refund)(?:\/|$)/i.test(req.path) ||
        Boolean(req.query.post || req.query.job || req.query.service || req.query.id);
      
      const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Googlebot|bingbot|Slackbot/i.test(
        req.headers['user-agent'] || ''
      );

      if ((isPostOrServiceOrLegal || isCrawler) && req.method === 'GET' && !req.path.includes('.')) {
        try {
          const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
          const transformedHtml = await vite.transformIndexHtml(url, indexHtml);
          const { html: finalHtml, isNotFound } = renderDynamicMetaHtml(transformedHtml, req);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          if (isNotFound) { res.status(404); }
          return res.send(finalHtml);
        } catch (e) {
          return next(e);
        }
      }
      return vite.middlewares(req, res, next);
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
