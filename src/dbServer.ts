import fs from 'fs';
import path from 'path';
import { ContactRequest, Appointment, Announcement, GalleryItem, WebsiteSettings, AnalyticsStats } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

interface DatabaseSchema {
  settings: WebsiteSettings;
  announcements: Announcement[];
  gallery: GalleryItem[];
  contactRequests: ContactRequest[];
  appointments: Appointment[];
  views: number;
  lastIssuedTokenSeq?: number;
  customPosts?: any[];
  postThumbnails?: Record<string, { thumbnailUrl: string; supabaseUrl?: string; localUrl?: string; spec?: any; updatedAt: string }>;
  pushSubscriptions?: any[];
  pushNotifications?: any[];
  pushSettings?: { autoPublishPush: boolean; welcomePushEnabled: boolean };
  paymentTransactions?: any[];
}

const DEFAULT_DB: DatabaseSchema = {
  settings: {
    cafeName: "CSC DOST",
    phone: "+91 70068 33767, +91 96821 32895",
    whatsapp: "+91 70068 33767",
    email: "www.khanday09@gmail.com",
    address: "Sangran Qazigund, Sangran Qazigund, Anantnag, Jammu and Kashmir 192221",
    officeHours: "Mon - Sat: 08:30 AM - 08:00 PM, Sun: 10:00 AM - 04:00 PM",
    googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.996452296068!2d77.21833441508272!3d28.630041982417724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd3637e19e75%3A0x6b7a544f84c4f9a7!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin",
    seoTitle: "CSC DOST",
    seoDescription: "CSC DOST (www.cscdost.com) - Authorized CSC E-Governance and Digital Services Portal. Apply for PAN, Aadhaar updates, Ayushman Bharat card, Voter ID, and digital services.",
    seoKeywords: "cscdost, CSC DOST, cscdost.com, www.cscdost.com, cyber cafe, CSC center, PAN card application, Aadhaar update, online form filling, printing"
  },
  announcements: [
    {
      "id": "ann-1",
      "title": "New PM Kisan Samman Nidhi 17th Installment KYC Open",
      "content": "All farmers registered under PM Kisan are requested to complete their e-KYC at our center before the end of this month to receive their installment seamlessly. Please bring your Aadhaar and linked mobile phone.",
      "type": "warning",
      "date": "2026-07-10T10:00:00.000Z",
      "active": true
    }
  ],
  gallery: [],
  contactRequests: [],
  appointments: [],
  views: 0,
  customPosts: [],
  postThumbnails: {},
  pushSubscriptions: [],
  pushNotifications: [],
  pushSettings: { autoPublishPush: false, welcomePushEnabled: true },
  paymentTransactions: []
};

let memoryDb: DatabaseSchema | null = null;

// Ensure the directory and file exist safely
function initDb() {
  if (memoryDb) return;
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      memoryDb = JSON.parse(JSON.stringify(DEFAULT_DB));
    }
  } catch (err) {
    console.warn('initDb filesystem warning (falling back to memory):', err);
    if (!memoryDb) {
      memoryDb = JSON.parse(JSON.stringify(DEFAULT_DB));
    }
  }
}

export function getDb(): DatabaseSchema {
  initDb();
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.appointments) parsed.appointments = [];
      if (!parsed.contactRequests) parsed.contactRequests = [];
      if (!parsed.announcements) parsed.announcements = [];
      if (!parsed.gallery) parsed.gallery = [];
      if (!parsed.customPosts) parsed.customPosts = [];
      if (!parsed.postThumbnails) parsed.postThumbnails = {};
      if (!parsed.pushSubscriptions) parsed.pushSubscriptions = [];
      if (!parsed.pushNotifications) parsed.pushNotifications = [];
      if (!parsed.pushSettings) parsed.pushSettings = { autoPublishPush: false, welcomePushEnabled: true };
      if (!parsed.paymentTransactions) parsed.paymentTransactions = [];
      memoryDb = parsed;
      return parsed;
    }
  } catch (error) {
    console.warn('Error reading database file from disk, using memory fallback:', error);
  }
  if (!memoryDb) {
    memoryDb = JSON.parse(JSON.stringify(DEFAULT_DB));
  }
  return memoryDb;
}

export function saveDb(data: DatabaseSchema): void {
  memoryDb = data;
  try {
    initDb();
    const tempPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_PATH);
  } catch (err) {
    console.warn('Disk save warning (state safely saved in memory):', err);
  }
}

export function addContactRequest(req: Omit<ContactRequest, 'id' | 'status' | 'date'>): ContactRequest {
  const db = getDb();
  const newReq: ContactRequest = {
    ...req,
    id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'pending',
    date: new Date().toISOString()
  };
  db.contactRequests.unshift(newReq);
  saveDb(db);
  return newReq;
}

function extractTokenSeq(val: unknown): number {
  if (typeof val !== 'string') return 0;
  const match = val.match(/^CSC21251567(\d+)/i);
  if (match && match[1]) {
    const num = parseInt(match[1], 10);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

export function getNextMonotonicLocalSeq(externalHighestSeq = 0): number {
  const db = getDb();
  let maxSeq = Math.max(db.lastIssuedTokenSeq || 0, externalHighestSeq || 0);
  (db.appointments || []).forEach((a: any) => {
    const seq = Math.max(extractTokenSeq(a.appId), extractTokenSeq(a.id));
    if (seq > maxSeq) maxSeq = seq;
  });
  const nextSeq = maxSeq + 1;
  db.lastIssuedTokenSeq = nextSeq;
  saveDb(db);
  return nextSeq;
}

export function addAppointment(
  apt: Omit<Appointment, 'id' | 'status' | 'date'> & {
    id?: string;
    appId?: string;
    supabaseId?: string;
    status?: string;
    submittedAt?: string;
    createdAt?: string;
  }
): Appointment {
  const db = getDb();
  const targetAppId = apt.appId || apt.id;
  const seq = Math.max(extractTokenSeq(apt.appId), extractTokenSeq(apt.id));
  if (seq > (db.lastIssuedTokenSeq || 0)) {
    db.lastIssuedTokenSeq = seq;
  }

  const existingIdx = db.appointments.findIndex(a =>
    Boolean(
      targetAppId &&
      ((a as any).appId === targetAppId ||
        a.id === targetAppId ||
        (apt.supabaseId && (a as any).supabaseId === apt.supabaseId))
    )
  );
  if (existingIdx !== -1) {
    db.appointments[existingIdx] = {
      ...db.appointments[existingIdx],
      ...apt,
      appId: targetAppId || (db.appointments[existingIdx] as any).appId || db.appointments[existingIdx].id,
      id: db.appointments[existingIdx].id || targetAppId || `apt-${Date.now()}`,
      status: (apt.status as any) || db.appointments[existingIdx].status || 'pending'
    };
    saveDb(db);
    return db.appointments[existingIdx];
  } else {
    const finalId = apt.id || targetAppId || `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newApt: Appointment = {
      ...apt,
      appId: targetAppId || finalId,
      id: finalId,
      status: (apt.status as any) || 'pending',
      date: apt.submittedAt || apt.createdAt || new Date().toISOString()
    };
    db.appointments.unshift(newApt);
    saveDb(db);
    return newApt;
  }
}

export function updateContactStatus(id: string, status: ContactRequest['status']): boolean {
  const db = getDb();
  const item = db.contactRequests.find(r => r.id === id);
  if (item) {
    item.status = status;
    saveDb(db);
    return true;
  }
  return false;
}

export function updateAppointmentStatus(id: string, status: Appointment['status']): boolean {
  const db = getDb();
  const item = db.appointments.find(
    r => r.id === id || (r as any).appId === id || (r as any).supabaseId === id
  );
  if (item) {
    item.status = status;
    saveDb(db);
    return true;
  }
  return false;
}

export function updateAppointmentPayment(
  id: string,
  paymentUpdate: {
    paymentMethod?: string;
    paymentStatus?: string;
    amountPaid?: number;
    amountDue?: number;
    utrNumber?: string;
    gatewayTxnId?: string;
    paidAt?: string;
    offlineReceiptNo?: string;
    offlineCollectedBy?: string;
  }
): boolean {
  const db = getDb();
  const item = db.appointments.find(
    r => r.id === id || (r as any).appId === id || (r as any).supabaseId === id
  );
  if (item) {
    if (paymentUpdate.paymentMethod) (item as any).paymentMethod = paymentUpdate.paymentMethod;
    if (paymentUpdate.paymentStatus) (item as any).paymentStatus = paymentUpdate.paymentStatus;
    if (paymentUpdate.amountPaid !== undefined) (item as any).amountPaid = paymentUpdate.amountPaid;
    if (paymentUpdate.amountDue !== undefined) (item as any).amountDue = paymentUpdate.amountDue;
    if (paymentUpdate.utrNumber) (item as any).utrNumber = paymentUpdate.utrNumber;
    if (paymentUpdate.gatewayTxnId) (item as any).gatewayTxnId = paymentUpdate.gatewayTxnId;
    if (paymentUpdate.paidAt) (item as any).paidAt = paymentUpdate.paidAt;
    if (paymentUpdate.offlineReceiptNo) (item as any).offlineReceiptNo = paymentUpdate.offlineReceiptNo;
    if (paymentUpdate.offlineCollectedBy) (item as any).offlineCollectedBy = paymentUpdate.offlineCollectedBy;
    saveDb(db);
    return true;
  }
  return false;
}

export function upsertPaymentTransaction(txn: any): any {
  const db = getDb();
  if (!db.paymentTransactions) db.paymentTransactions = [];
  const idx = db.paymentTransactions.findIndex((t: any) => t.txnid === txn.txnid);
  const updatedTxn = {
    ...txn,
    updatedAt: new Date().toISOString()
  };
  if (idx !== -1) {
    db.paymentTransactions[idx] = { ...db.paymentTransactions[idx], ...updatedTxn };
  } else {
    db.paymentTransactions.unshift({
      ...updatedTxn,
      createdAt: updatedTxn.createdAt || new Date().toISOString()
    });
  }
  saveDb(db);
  return db.paymentTransactions.find((t: any) => t.txnid === txn.txnid);
}

export function getPaymentTransactionByTxnId(txnid: string): any | null {
  const db = getDb();
  if (!db.paymentTransactions) return null;
  return db.paymentTransactions.find((t: any) => t.txnid === txnid) || null;
}

export function getPaymentTransactions(): any[] {
  const db = getDb();
  return db.paymentTransactions || [];
}

export function deleteAppointment(id: string, extraIds: string[] = []): boolean {
  const db = getDb();
  const targets = new Set(
    [id, ...extraIds]
      .filter(Boolean)
      .map(s => String(s).trim().toLowerCase())
  );
  if (targets.size === 0) return false;

  // Record highest sequence before removing so deleted sequence numbers are never re-issued
  (db.appointments || []).forEach((a: any) => {
    const seq = Math.max(extractTokenSeq(a.appId), extractTokenSeq(a.id));
    if (seq > (db.lastIssuedTokenSeq || 0)) {
      db.lastIssuedTokenSeq = seq;
    }
  });

  const lengthBefore = db.appointments.length;
  db.appointments = db.appointments.filter((a: any) => {
    const aId = String(a.id || '').trim().toLowerCase();
    const aAppId = String(a.appId || '').trim().toLowerCase();
    const aSupaId = String(a.supabaseId || '').trim().toLowerCase();
    return !targets.has(aId) && !targets.has(aAppId) && (!aSupaId || !targets.has(aSupaId));
  });

  if (db.appointments.length !== lengthBefore) {
    saveDb(db);
    return true;
  }
  return false;
}

export function updateSettings(settings: WebsiteSettings): void {
  const db = getDb();
  db.settings = settings;
  saveDb(db);
}

export function addAnnouncement(ann: Omit<Announcement, 'id' | 'date'>): Announcement {
  const db = getDb();
  const newAnn: Announcement = {
    ...ann,
    id: `ann-${Date.now()}`,
    date: new Date().toISOString()
  };
  db.announcements.unshift(newAnn);
  saveDb(db);
  return newAnn;
}

export function updateAnnouncement(id: string, updated: Partial<Omit<Announcement, 'id' | 'date'>>): boolean {
  const db = getDb();
  const idx = db.announcements.findIndex(a => a.id === id);
  if (idx !== -1) {
    db.announcements[idx] = { ...db.announcements[idx], ...updated };
    saveDb(db);
    return true;
  }
  return false;
}

export function deleteAnnouncement(id: string): boolean {
  const db = getDb();
  const lengthBefore = db.announcements.length;
  db.announcements = db.announcements.filter(a => a.id !== id);
  if (db.announcements.length !== lengthBefore) {
    saveDb(db);
    return true;
  }
  return false;
}

export function addGalleryItem(item: Omit<GalleryItem, 'id'>): GalleryItem {
  const db = getDb();
  const newItem: GalleryItem = {
    ...item,
    id: `gal-${Date.now()}`
  };
  db.gallery.unshift(newItem);
  saveDb(db);
  return newItem;
}

export function deleteGalleryItem(id: string): boolean {
  const db = getDb();
  const lengthBefore = db.gallery.length;
  db.gallery = db.gallery.filter(g => g.id !== id);
  if (db.gallery.length !== lengthBefore) {
    saveDb(db);
    return true;
  }
  return false;
}

export function incrementViews(): number {
  const db = getDb();
  db.views = (db.views || 0) + 1;
  saveDb(db);
  return db.views;
}

export function getAnalytics(): AnalyticsStats {
  const db = getDb();
  
  const completedRequestsCount = db.contactRequests.filter(r => r.status === 'completed').length + db.appointments.filter(a => a.status === 'completed').length;
  
  // Distribute services
  const serviceDistribution: Record<string, number> = {};
  [...db.contactRequests, ...db.appointments].forEach(item => {
    serviceDistribution[item.service] = (serviceDistribution[item.service] || 0) + 1;
  });

  // Simple trends for visual charts
  const monthlyTrends = [
    { month: 'Jan', requests: 4, appointments: 2 },
    { month: 'Feb', requests: 7, appointments: 5 },
    { month: 'Mar', requests: 12, appointments: 8 },
    { month: 'Apr', requests: 18, appointments: 11 },
    { month: 'May', requests: 15, appointments: 14 },
    { month: 'Jun', requests: db.contactRequests.length, appointments: db.appointments.length }
  ];

  return {
    views: db.views,
    contactRequestsCount: db.contactRequests.length,
    appointmentsCount: db.appointments.length,
    completedRequestsCount,
    serviceDistribution,
    monthlyTrends
  };
}

export function savePostThumbnailRecord(
  postId: string,
  entry: { thumbnailUrl: string; supabaseUrl?: string; localUrl?: string; spec?: any }
) {
  const db = getDb();
  if (!db.postThumbnails) db.postThumbnails = {};
  const updatedAt = new Date().toISOString();
  db.postThumbnails[postId] = {
    ...entry,
    updatedAt,
  };
  if (Array.isArray(db.customPosts)) {
    const idx = db.customPosts.findIndex((p: any) => p && p.id === postId);
    if (idx !== -1) {
      db.customPosts[idx] = {
        ...db.customPosts[idx],
        thumbnailUrl: entry.thumbnailUrl,
        thumbnailSpec: entry.spec || db.customPosts[idx].thumbnailSpec,
      };
    }
  }
  saveDb(db);
  return db.postThumbnails[postId];
}

export function getPostThumbnailsMap(): Record<
  string,
  { thumbnailUrl: string; supabaseUrl?: string; localUrl?: string; spec?: any; updatedAt: string }
> {
  const db = getDb();
  return db.postThumbnails || {};
}

export function upsertCustomSarkariPost(post: any) {
  const db = getDb();
  if (!Array.isArray(db.customPosts)) db.customPosts = [];
  const idx = db.customPosts.findIndex((p: any) => p && p.id === post.id);
  if (idx !== -1) {
    db.customPosts[idx] = { ...db.customPosts[idx], ...post };
  } else {
    db.customPosts.unshift(post);
  }
  if (post.thumbnailUrl && post.id) {
    if (!db.postThumbnails) db.postThumbnails = {};
    db.postThumbnails[post.id] = {
      thumbnailUrl: post.thumbnailUrl,
      spec: post.thumbnailSpec,
      updatedAt: new Date().toISOString(),
    };
  }
  saveDb(db);
  return post;
}

export function getCustomSarkariPosts(): any[] {
  const db = getDb();
  return Array.isArray(db.customPosts) ? db.customPosts : [];
}

export type WhatsAppPublishStatus =
  | 'Prepared'
  | 'Opened in WhatsApp'
  | 'Manually Confirmed'
  | 'Submitted to Provider'
  | 'Sent'
  | 'Delivered'
  | 'Failed';

export interface WhatsAppPublishHistoryRecord {
  id: string;
  postId: string;
  title: string;
  category: string;
  destination: string;
  sharingMethod: string;
  dateTime: string;
  isoTimestamp: string;
  status: WhatsAppPublishStatus;
  adminUser: string;
  canonicalUrl: string;
  confirmedAt?: string;
  confirmedBy?: string;
  providerMessageId?: string;
  errorDetails?: string;
}

export interface WhatsAppPublisherConfig {
  channelUrl: string;
  channelName: string;
  groupInviteUrl: string;
  groupName: string;
  updatedAt?: string;
  updatedBy?: string;
}

const DEFAULT_WHATSAPP_CONFIG: WhatsAppPublisherConfig = {
  channelUrl: '',
  channelName: 'CSC DOST Official WhatsApp Channel',
  groupInviteUrl: 'https://chat.whatsapp.com/GqeYfcw1sdN0EQtGvVR1fI',
  groupName: 'CSC DOST Community Group',
};

export function getWhatsAppPublisherConfig(): WhatsAppPublisherConfig {
  const db = getDb() as any;
  return {
    ...DEFAULT_WHATSAPP_CONFIG,
    ...(db.whatsappPublisherConfig || {}),
  };
}

export function saveWhatsAppPublisherConfig(
  partial: Partial<WhatsAppPublisherConfig>
): WhatsAppPublisherConfig {
  const db = getDb() as any;
  const current = getWhatsAppPublisherConfig();
  const updated: WhatsAppPublisherConfig = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  db.whatsappPublisherConfig = updated;
  saveDb(db);
  return updated;
}

export function getWhatsAppPublishHistory(): WhatsAppPublishHistoryRecord[] {
  const db = getDb() as any;
  return Array.isArray(db.whatsappPublishHistory) ? db.whatsappPublishHistory : [];
}

export function addWhatsAppPublishHistoryRecord(
  record: Omit<WhatsAppPublishHistoryRecord, 'id' | 'dateTime' | 'isoTimestamp'> & {
    id?: string;
    dateTime?: string;
    isoTimestamp?: string;
  }
): WhatsAppPublishHistoryRecord {
  const db = getDb() as any;
  if (!Array.isArray(db.whatsappPublishHistory)) {
    db.whatsappPublishHistory = [];
  }
  const now = new Date();
  const datePart = now.toLocaleDateString('en-GB');
  const timePart = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const entry: WhatsAppPublishHistoryRecord = {
    id: record.id || `wapub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    postId: record.postId || '',
    title: record.title || 'CSC DOST Notification',
    category: record.category || 'job',
    destination: record.destination || 'WhatsApp Group',
    sharingMethod: record.sharingMethod || 'WhatsApp Share Link',
    dateTime: record.dateTime || `${datePart}, ${timePart}`,
    isoTimestamp: record.isoTimestamp || now.toISOString(),
    status: record.status,
    adminUser: record.adminUser || 'Authorized Staff',
    canonicalUrl: record.canonicalUrl || 'https://www.cscdost.com',
    confirmedAt: record.confirmedAt,
    confirmedBy: record.confirmedBy,
    providerMessageId: record.providerMessageId,
    errorDetails: record.errorDetails,
  };

  db.whatsappPublishHistory.unshift(entry);
  if (db.whatsappPublishHistory.length > 100) {
    db.whatsappPublishHistory = db.whatsappPublishHistory.slice(0, 100);
  }
  saveDb(db);
  return entry;
}

export function updateWhatsAppPublishHistoryStatus(
  id: string,
  status: WhatsAppPublishStatus,
  adminUser?: string,
  extra?: Partial<WhatsAppPublishHistoryRecord>
): WhatsAppPublishHistoryRecord | null {
  const db = getDb() as any;
  if (!Array.isArray(db.whatsappPublishHistory)) return null;
  const idx = db.whatsappPublishHistory.findIndex((item: any) => item && item.id === id);
  if (idx === -1) return null;

  const now = new Date();
  const datePart = now.toLocaleDateString('en-GB');
  const timePart = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  db.whatsappPublishHistory[idx] = {
    ...db.whatsappPublishHistory[idx],
    ...(extra || {}),
    status,
    confirmedAt:
      status === 'Manually Confirmed'
        ? `${datePart}, ${timePart}`
        : db.whatsappPublishHistory[idx].confirmedAt,
    confirmedBy:
      status === 'Manually Confirmed'
        ? adminUser || db.whatsappPublishHistory[idx].adminUser
        : db.whatsappPublishHistory[idx].confirmedBy,
  };
  saveDb(db);
  return db.whatsappPublishHistory[idx];
}

export function clearWhatsAppPublishHistory(): void {
  const db = getDb() as any;
  db.whatsappPublishHistory = [];
  saveDb(db);
}

export function deleteCustomSarkariPost(postId: string): boolean {
  const db = getDb();
  if (!Array.isArray(db.customPosts)) return false;
  const before = db.customPosts.length;
  db.customPosts = db.customPosts.filter((p: any) => p && p.id !== postId);
  if (db.customPosts.length !== before) {
    saveDb(db);
    return true;
  }
  return false;
}

// ============================================================
// WEB PUSH SUBSCRIPTIONS & NOTIFICATIONS
// ============================================================

export interface PushSubscriptionPreferences {
  jobs: boolean;
  schemes: boolean;
  exams: boolean;
  updates: boolean;
}

export interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceType: 'android' | 'ios' | 'desktop' | 'unknown';
  userAgent?: string;
  preferences: PushSubscriptionPreferences;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
  lastDeliveryAt?: string;
  failureCount: number;
}

export interface PushNotificationRecord {
  id: string;
  title: string;
  body: string;
  category: 'jobs' | 'schemes' | 'exams' | 'updates' | 'all';
  url: string;
  postId?: string;
  icon?: string;
  image?: string;
  sentAt: string;
  sentBy?: string;
  stats: {
    totalTargeted: number;
    accepted: number;
    failed: number;
    expiredCleaned: number;
  };
  isTest?: boolean;
}

export interface PushServerSettings {
  autoPublishPush: boolean;
  welcomePushEnabled: boolean;
}

export function upsertPushSubscription(payload: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  deviceType?: 'android' | 'ios' | 'desktop' | 'unknown';
  userAgent?: string;
  preferences?: Partial<PushSubscriptionPreferences>;
}): PushSubscriptionRecord {
  const db = getDb();
  if (!Array.isArray(db.pushSubscriptions)) db.pushSubscriptions = [];

  const nowIso = new Date().toISOString();
  const existingIdx = db.pushSubscriptions.findIndex(s => s && s.endpoint === payload.endpoint);

  const defaultPreferences: PushSubscriptionPreferences = {
    jobs: true,
    schemes: true,
    exams: true,
    updates: true,
    ...(payload.preferences || {})
  };

  if (existingIdx !== -1) {
    const existing = db.pushSubscriptions[existingIdx];
    const updated: PushSubscriptionRecord = {
      ...existing,
      keys: payload.keys || existing.keys,
      deviceType: payload.deviceType || existing.deviceType || 'unknown',
      userAgent: payload.userAgent || existing.userAgent,
      preferences: { ...existing.preferences, ...defaultPreferences },
      status: 'active',
      failureCount: 0,
      updatedAt: nowIso
    };
    db.pushSubscriptions[existingIdx] = updated;
    saveDb(db);
    return updated;
  }

  const newRecord: PushSubscriptionRecord = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    endpoint: payload.endpoint,
    keys: payload.keys,
    deviceType: payload.deviceType || 'unknown',
    userAgent: payload.userAgent,
    preferences: defaultPreferences,
    status: 'active',
    createdAt: nowIso,
    updatedAt: nowIso,
    failureCount: 0
  };

  db.pushSubscriptions.push(newRecord);
  saveDb(db);
  return newRecord;
}

export function deactivatePushSubscription(endpoint: string): boolean {
  const db = getDb();
  if (!Array.isArray(db.pushSubscriptions)) return false;
  const idx = db.pushSubscriptions.findIndex(s => s && s.endpoint === endpoint);
  if (idx !== -1) {
    db.pushSubscriptions[idx].status = 'inactive';
    db.pushSubscriptions[idx].updatedAt = new Date().toISOString();
    saveDb(db);
    return true;
  }
  return false;
}

export function getActivePushSubscriptions(category?: string): PushSubscriptionRecord[] {
  const db = getDb();
  if (!Array.isArray(db.pushSubscriptions)) return [];

  return db.pushSubscriptions.filter(sub => {
    if (!sub || sub.status !== 'active') return false;
    if (!category || category === 'all') return true;

    // Filter by subscriber's preference if specified
    const prefs = sub.preferences || { jobs: true, schemes: true, exams: true, updates: true };
    if (category === 'jobs' && prefs.jobs !== false) return true;
    if (category === 'schemes' && prefs.schemes !== false) return true;
    if (category === 'exams' && prefs.exams !== false) return true;
    if (category === 'updates' && prefs.updates !== false) return true;
    return false;
  });
}

export function markPushSubscriptionFailure(endpoint: string, isPermanentExpired: boolean): void {
  const db = getDb();
  if (!Array.isArray(db.pushSubscriptions)) return;
  const idx = db.pushSubscriptions.findIndex(s => s && s.endpoint === endpoint);
  if (idx !== -1) {
    if (isPermanentExpired) {
      db.pushSubscriptions[idx].status = 'expired';
    } else {
      db.pushSubscriptions[idx].failureCount = (db.pushSubscriptions[idx].failureCount || 0) + 1;
      if (db.pushSubscriptions[idx].failureCount >= 3) {
        db.pushSubscriptions[idx].status = 'expired';
      }
    }
    db.pushSubscriptions[idx].updatedAt = new Date().toISOString();
    saveDb(db);
  }
}

export function recordPushDeliverySuccess(endpoint: string): void {
  const db = getDb();
  if (!Array.isArray(db.pushSubscriptions)) return;
  const idx = db.pushSubscriptions.findIndex(s => s && s.endpoint === endpoint);
  if (idx !== -1) {
    db.pushSubscriptions[idx].lastDeliveryAt = new Date().toISOString();
    db.pushSubscriptions[idx].failureCount = 0;
    saveDb(db);
  }
}

export function addPushNotificationRecord(record: Omit<PushNotificationRecord, 'id' | 'sentAt'>): PushNotificationRecord {
  const db = getDb();
  if (!Array.isArray(db.pushNotifications)) db.pushNotifications = [];

  const entry: PushNotificationRecord = {
    ...record,
    id: `push_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sentAt: new Date().toISOString()
  };

  db.pushNotifications.unshift(entry);
  if (db.pushNotifications.length > 100) {
    db.pushNotifications = db.pushNotifications.slice(0, 100);
  }
  saveDb(db);
  return entry;
}

export function getPushNotificationHistory(): PushNotificationRecord[] {
  const db = getDb();
  return Array.isArray(db.pushNotifications) ? db.pushNotifications : [];
}

export function getPushServerSettings(): PushServerSettings {
  const db = getDb();
  return db.pushSettings || { autoPublishPush: false, welcomePushEnabled: true };
}

export function updatePushServerSettings(settings: Partial<PushServerSettings>): PushServerSettings {
  const db = getDb();
  db.pushSettings = {
    ...(db.pushSettings || { autoPublishPush: false, welcomePushEnabled: true }),
    ...settings
  };
  saveDb(db);
  return db.pushSettings;
}



