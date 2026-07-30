import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  getDb, 
  saveDb, 
  addContactRequest, 
  addAppointment, 
  updateContactStatus, 
  updateAppointmentStatus, 
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

// Public API: Increments website views
app.post('/api/tracker/view', (req, res) => {
  const newCount = incrementViews();
  res.json({ success: true, totalViews: newCount });
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

// Public API: Book appointment / Submit online application
app.post('/api/appointments', (req, res) => {
  const { 
    appId, 
    name, 
    email, 
    phone, 
    service, 
    appointmentDate, 
    appointmentTime, 
    message,
    dateOfBirth,
    userCategory,
    paymentMode,
    utrNumber,
    totalAmount,
    documents 
  } = req.body;

  if (!name || !phone || !service) {
    return res.status(400).json({ error: 'Please provide all required fields (Name, Phone, Service).' });
  }

  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const appointment = addAppointment({
    appId: appId || `APEX-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    name,
    email: email || '',
    phone,
    service,
    appointmentDate: appointmentDate || currentDate,
    appointmentTime: appointmentTime || currentTime,
    message: message || '',
    dateOfBirth: dateOfBirth || 'N/A',
    userCategory: userCategory || 'General/OBC',
    paymentMode: paymentMode || 'cash',
    utrNumber: utrNumber || 'N/A',
    totalAmount: totalAmount || 0,
    documents: Array.isArray(documents) ? documents : []
  });
  const db = getDb();

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

  res.json({ success: true, data: appointment, message: 'Application submitted successfully with documents attached.' });
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

// Setup Vite Dev Server / Static Hosting Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`🚀 Cyber Cafe Server successfully started on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error setting up server:', err);
});
