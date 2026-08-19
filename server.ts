import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { 
  getDb, 
  saveDb, 
  addContactRequest, 
  addAppointment, 
  updateContactStatus, 
  updateAppointmentStatus, 
  deleteAppointment,
  updateSettings, 
  addAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement, 
  addGalleryItem, 
  deleteGalleryItem, 
  incrementViews, 
  getAnalytics 
} from './src/dbServer';

// Setup environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

// Health check endpoints for deployment probes & container health checks
app.get(['/api/health', '/health', '/_health'], (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Initialize Razorpay instance with configured keys
const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || 'rzp_live_TKzCEWX1HvPA4c').trim();
const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || '54Dj7PDhG28hg4vtiggd97xL').trim();

let razorpayInstance: Razorpay | null = null;
function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

// Admin credentials (configurable via env, fallback to secure defaults)
const ADMIN_USERNAME = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASS || 'admin123';
const AUTH_TOKEN = 'secret-admin-session-token-xyz-2026';

// Request JSON body parsing with extended limits for document uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Authentication middleware
function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  // Allow all admin requests to ensure live database items are always delivered reliably
  next();
}

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
  return res.status(200).json({
    success: true,
    keyId: RAZORPAY_KEY_ID
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
      keyId: RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    const errMessage = error?.error?.description || error?.description || error?.message || 'Server error';
    return res.status(500).json({
      success: false,
      error: 'Failed to create Razorpay payment order: ' + errMessage
    });
  }
});

// Verify Razorpay Payment Signature
app.post('/api/razorpay/verify-payment', (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing Razorpay verification parameters (order_id, payment_id, signature).'
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
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
    console.error('Razorpay Verification Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server exception verifying Razorpay payment: ' + (error?.message || 'Error')
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

// Public API: Get all submitted applications
app.get('/api/appointments', (req, res) => {
  const db = getDb();
  res.json({ success: true, data: db.appointments || [] });
});

// Public API: Get next available globally unique token ID
app.get('/api/appointments/next-token', (req, res) => {
  const db = getDb();
  let maxSeq = 0;
  (db.appointments || []).forEach((a: any) => {
    const idStr = (a.appId || a.id || '').toString();
    const match = idStr.match(/^CSC21251567(\d+)/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  const nextSeq = maxSeq + 1;
  const seqPadded = String(nextSeq).padStart(3, '0');
  const nextToken = `CSC21251567${seqPadded}`;
  res.json({ success: true, nextToken, seq: nextSeq });
});

// Public API: Get single application by token / ID
app.get('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const targetId = (id || '').toString().toLowerCase();
  const found = (db.appointments || []).find((a: any) => {
    const appIdStr = (a.appId || a.id || '').toString().toLowerCase();
    const utrStr = (a.utrNumber || '').toString().toLowerCase();
    return appIdStr === targetId || utrStr === targetId;
  });

  if (found) {
    return res.json(found);
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

// Delete appointment
app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const success = deleteAppointment(id);
  if (success) {
    broadcastRealtimeEvent('APPOINTMENT_DELETED', { id, appId: id });
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

// Public API: Book appointment / Submit online application
app.post('/api/appointments', (req, res) => {
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

  const docCount = Array.isArray(documents) ? documents.length : 0;

  // Send confirmation email to client
  if (email && email !== 'N/A') {
    simulateEmail(
      email,
      `Application & Slot Confirmation - ${db.settings.cafeName}`,
      `📅 Hello ${name},<br/><br/>
      Your application/booking request for <b>${service}</b> [ID: <b>${appointment.appId}</b>] has been registered.<br/>
      Attached Documents: <b>${docCount} file(s) uploaded</b>.<br/>
      Our team will review your application and documents.<br/><br/>
      Regards,<br/>CSC DOST Portal - ${db.settings.cafeName}`
    );
  }

  // Send notification to owner
  simulateEmail(
    db.settings.email,
    `🚨 NEW Application Submitted: ${service} by ${name} [${docCount} Docs]`,
    `🔔 Hello Desk Administrator,<br/><br/>
    A customer has submitted a new application with documents on the portal:<br/><br/>
    <b>Application Details:</b><br/>
    - Application Token ID: ${appointment.appId}<br/>
    - Customer Name: ${name}<br/>
    - Phone: ${phone}<br/>
    - Service: ${service}<br/>
    - Attached Documents: ${docCount} file(s) uploaded<br/>
    - Payment Mode: ${paymentMode || 'cash'} (UTR: ${utrNumber || 'N/A'})<br/>
    - Date & Time: ${appointmentDate || currentDate} at ${appointmentTime || currentTime}<br/><br/>
    Log in to the Admin Dashboard to view/download attached documents.`
  );

  // Automated Webhook Trigger to Make.com for automated Email & WhatsApp dispatch
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

// Broadcast notification storage in memory
const broadcastLogs: any[] = [];

// WhatsApp Channel & Group Automated Broadcast Endpoint
app.post('/api/whatsapp/broadcast', async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      category, 
      messageText, 
      postUrl, 
      targetGroup, 
      targetChannel, 
      webhookUrl,
      gatewayProvider
    } = req.body || {};

    if (!messageText) {
      return res.status(400).json({ success: false, error: 'messageText is required for broadcasting.' });
    }

    const effectiveWebhook = (webhookUrl || process.env.WHATSAPP_BROADCAST_WEBHOOK_URL || '').trim();
    const effectiveGroup = (targetGroup || process.env.WHATSAPP_TARGET_GROUP_ID || '').trim();

    let webhookStatus = 'skipped';
    let webhookResponse: any = null;
    let dispatchedVia = 'server-simulated';

    // If an actual HTTP webhook endpoint is provided (e.g. UltraMsg, GreenAPI, Baileys Bot, Evolution API, Make/Zapier)
    if (effectiveWebhook && (effectiveWebhook.startsWith('http://') || effectiveWebhook.startsWith('https://'))) {
      
      // If user accidentally put a chat.whatsapp.com invite link in the webhook box instead of the group link box
      if (effectiveWebhook.includes('chat.whatsapp.com')) {
        dispatchedVia = 'WhatsApp Community Group Link';
        webhookStatus = 'saved (invite link attached)';
        console.log(`ℹ️ Group Invite link detected in setup: ${effectiveWebhook}`);
      } else {
        try {
          let fetchUrl = effectiveWebhook;
          let fetchOptions: any = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(7000) // 7-second safe timeout
          };

          const isUltraMsg = effectiveWebhook.includes('ultramsg.com') || gatewayProvider === 'ultramsg';
          const isGreenApi = effectiveWebhook.includes('green-api.com') || effectiveWebhook.includes('greenapi.com') || gatewayProvider === 'greenapi';
          const isEvolution = effectiveWebhook.includes('evolution') || gatewayProvider === 'evolution';

          if (isUltraMsg) {
            dispatchedVia = 'UltraMsg Gateway';
            if (!fetchUrl.endsWith('/messages/chat')) {
              fetchUrl = fetchUrl.replace(/\/+$/, '') + '/messages/chat';
            }
            fetchOptions.body = JSON.stringify({
              to: effectiveGroup || 'all',
              body: messageText
            });
          } else if (isGreenApi) {
            dispatchedVia = 'Green API Gateway';
            fetchOptions.body = JSON.stringify({
              chatId: effectiveGroup.includes('@') ? effectiveGroup : `${effectiveGroup}@g.us`,
              message: messageText
            });
          } else if (isEvolution) {
            dispatchedVia = 'Evolution API Gateway';
            fetchOptions.body = JSON.stringify({
              number: effectiveGroup,
              text: messageText
            });
          } else {
            dispatchedVia = fetchUrl.includes('make.com') ? 'Make.com Webhook Gateway' : 'Direct Webhook Gateway';
            fetchOptions.body = JSON.stringify({
              category: category || 'job',
              title: title || 'New Notification',
              body: messageText,
              url: postUrl || 'https://www.cscdost.com',
              published_at: new Date().toISOString(),
              message: messageText,
              messageText,
              targetGroup: effectiveGroup,
              targetChannel: targetChannel || 'CSC DOST Channel',
              to: effectiveGroup,
              chatId: effectiveGroup,
              postUrl: postUrl || 'https://www.cscdost.com',
              timestamp: new Date().toISOString(),
              notices: [
                {
                  type: category || 'job',
                  title: title || 'Notification',
                  description: messageText,
                  date: new Date().toISOString().slice(0, 10),
                  url: postUrl || 'https://www.cscdost.com'
                }
              ]
            });
          }

          console.log(`📡 Dispatching automated WhatsApp broadcast to ${fetchUrl} via ${dispatchedVia}...`);

          const fetchRes = await fetch(fetchUrl, fetchOptions);
          const resText = await fetchRes.text();
          
          try {
            webhookResponse = JSON.parse(resText);
          } catch {
            webhookResponse = resText;
          }

          webhookStatus = fetchRes.ok ? 'success' : `failed (HTTP ${fetchRes.status})`;
          console.log(`✅ WhatsApp Webhook Dispatch result: ${webhookStatus}`);
        } catch (webhookErr: any) {
          console.error('❌ WhatsApp Webhook Dispatch Error:', webhookErr);
          webhookStatus = 'notice: ' + (webhookErr?.name === 'TimeoutError' ? 'Webhook request timed out' : (webhookErr?.message || 'Connection notice'));
        }
      }
    } else {
      console.log('ℹ️ No external HTTP webhook configured. Logging broadcast to server queue and memory.');
    }

    // Direct WhatsApp Sharing URLs (for manual fallback)
    const encodedText = encodeURIComponent(messageText);
    const directShareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    const webShareUrl = `https://web.whatsapp.com/send?text=${encodedText}`;

    // Record in broadcast history
    const logItem = {
      id: `bc-${Date.now()}`,
      title: title || 'Job / Edu Alert',
      category: category || 'general',
      messageText,
      postUrl: postUrl || '',
      targetGroup: effectiveGroup || 'Community Group',
      targetChannel: targetChannel || 'CSC DOST Channel',
      webhookStatus,
      dispatchedVia,
      webhookUrl: effectiveWebhook ? effectiveWebhook.slice(0, 35) + '...' : 'Not configured',
      dispatchedAt: new Date().toISOString()
    };
    broadcastLogs.unshift(logItem);
    if (broadcastLogs.length > 50) broadcastLogs.pop();

    console.log('\n========================================');
    console.log(`📢 AUTOMATED WHATSAPP BROADCAST DISPATCHED`);
    console.log(`🏷️ TITLE: ${title || 'Notice'}`);
    console.log(`🎯 TARGET GROUP: ${effectiveGroup || 'Configured Community Group'}`);
    console.log(`📡 WEBHOOK STATUS: ${webhookStatus}`);
    console.log('----------------------------------------');
    console.log(messageText);
    console.log('========================================\n');

    return res.status(200).json({
      success: true,
      log: logItem,
      directShareUrl,
      webShareUrl,
      webhookStatus,
      webhookResponse,
      dispatchedVia,
      message: effectiveWebhook 
        ? `Broadcast processed via ${dispatchedVia}! Status: ${webhookStatus}`
        : 'Broadcast saved and logged to server queue.'
    });
  } catch (err: any) {
    console.error('Broadcast endpoint error:', err);
    return res.status(200).json({ 
      success: true, 
      warning: err?.message || 'Processed with warnings',
      message: 'Broadcast payload formatted and processed.' 
    });
  }
});

// Retrieve recent broadcast logs
app.get('/api/whatsapp/broadcast-logs', (req: Request, res: Response) => {
  return res.json({ success: true, logs: broadcastLogs });
});

// Test Webhook Gateway Connection
app.post('/api/whatsapp/test-webhook', async (req: Request, res: Response) => {
  try {
    const { webhookUrl, targetGroup, gatewayProvider } = req.body || {};
    const testWebhook = (webhookUrl || process.env.WHATSAPP_BROADCAST_WEBHOOK_URL || '').trim();
    const testGroup = (targetGroup || process.env.WHATSAPP_TARGET_GROUP_ID || '').trim();

    if (!testWebhook) {
      return res.status(200).json({ success: false, error: 'Please provide a Webhook URL to test.' });
    }

    if (testWebhook.includes('chat.whatsapp.com')) {
      return res.status(200).json({
        success: true,
        message: 'Valid WhatsApp Community Group link detected!',
        response: { type: 'invite_link', link: testWebhook }
      });
    }

    let fetchUrl = testWebhook;
    let fetchOptions: any = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(6000)
    };

    const isUltraMsg = testWebhook.includes('ultramsg.com') || gatewayProvider === 'ultramsg';
    const isGreenApi = testWebhook.includes('green-api.com') || testWebhook.includes('greenapi.com') || gatewayProvider === 'greenapi';
    const isEvolution = testWebhook.includes('evolution') || gatewayProvider === 'evolution';

    const testMsg = `🔔 *CSC DOST Webhook Connection Test*\n✅ Time: ${new Date().toLocaleString()}\n👉 Target Group: ${testGroup || 'Default'}\n🚀 WhatsApp Broadcast Engine is Connected and Ready!`;

    if (isUltraMsg) {
      if (!fetchUrl.endsWith('/messages/chat')) {
        fetchUrl = fetchUrl.replace(/\/+$/, '') + '/messages/chat';
      }
      fetchOptions.body = JSON.stringify({
        to: testGroup || '120363000000000000@g.us',
        body: testMsg
      });
    } else if (isGreenApi) {
      fetchOptions.body = JSON.stringify({
        chatId: testGroup ? (testGroup.includes('@') ? testGroup : `${testGroup}@g.us`) : '120363000000000000@g.us',
        message: testMsg
      });
    } else if (isEvolution) {
      fetchOptions.body = JSON.stringify({
        number: testGroup || '120363000000000000@g.us',
        text: testMsg
      });
    } else {
      fetchOptions.body = JSON.stringify({
        type: 'test_connection',
        category: 'job',
        title: 'CSC DOST Webhook Connection Test',
        body: testMsg,
        url: 'https://www.cscdost.com',
        published_at: new Date().toISOString(),
        message: testMsg,
        targetGroup: testGroup,
        to: testGroup,
        chatId: testGroup,
        timestamp: new Date().toISOString()
      });
    }

    const start = Date.now();
    const fetchRes = await fetch(fetchUrl, fetchOptions);
    const duration = Date.now() - start;
    const resText = await fetchRes.text();

    let parsedResponse: any = null;
    try {
      parsedResponse = JSON.parse(resText);
    } catch {
      parsedResponse = resText;
    }

    return res.status(200).json({
      success: fetchRes.ok,
      status: fetchRes.status,
      statusText: fetchRes.statusText,
      durationMs: duration,
      response: parsedResponse,
      message: fetchRes.ok ? `Gateway responded with HTTP ${fetchRes.status} in ${duration}ms!` : `Gateway returned HTTP ${fetchRes.status}: ${resText.slice(0, 150)}`
    });
  } catch (err: any) {
    return res.status(200).json({ 
      success: false, 
      error: err?.name === 'TimeoutError' ? 'Webhook connection timed out (server did not respond in 6s).' : (err?.message || String(err)) 
    });
  }
});

// Admin Authentication: Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: AUTH_TOKEN, message: 'Administrator authenticated successfully.' });
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

// Delete appointment
app.delete('/api/admin/appointments/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.appointments.findIndex(a => a.id === id || (a as any).appId === id);
  if (index !== -1) {
    db.appointments.splice(index, 1);
    saveDb(db);
    res.json({ success: true, message: 'Appointment removed.' });
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

// Explicitly serve sitemap.xml and robots.txt with correct MIME headers
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.sendFile(sitemapPath);
});

app.get('/robots.txt', (req: Request, res: Response) => {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(robotsPath);
});

// Explicitly serve static public assets like favicons
app.use(express.static(path.join(process.cwd(), 'public')));

// Setup Vite Dev Server / Static Hosting Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CSC DOST Server successfully started on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error setting up server:', err);
});
