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
}

// Ensure the directory and file exist
function initDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const defaultDb: DatabaseSchema = {
      settings: {
        cafeName: "CSC DOST",
        phone: "+91 70068 33767, +91 96821 32895",
        whatsapp: "+91 70068 33767",
        email: "www.khanday09@gmail.com",
        address: "Sangran Qazigund, Sangran Qazigund, Anantnag, Jammu and Kashmir 192221",
        officeHours: "Mon - Sat: 08:30 AM - 08:00 PM, Sun: 10:00 AM - 04:00 PM",
        googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.996452296068!2d77.21833441508272!3d28.630041982417724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd3637e19e75%3A0x6b7a544f84c4f9a7!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin",
        seoTitle: "CSC DOST",
        seoDescription: "CSC DOST (www.cscdost.com / www.cscdost.online) - Authorized CSC E-Governance and Digital Services Portal. Apply for PAN, Aadhaar updates, Ayushman Bharat card, Voter ID, and digital services.",
        seoKeywords: "cscdost, CSC DOST, cscdost.com, www.cscdost.com, cscdost.online, www.cscdost.online, cyber cafe, CSC center, PAN card application, Aadhaar update, online form filling, printing"
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
      views: 0
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf-8');
  }
}

export function getDb(): DatabaseSchema {
  initDb();
  try {
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.appointments) parsed.appointments = [];
    if (!parsed.contactRequests) parsed.contactRequests = [];
    if (!parsed.announcements) parsed.announcements = [];
    if (!parsed.gallery) parsed.gallery = [];
    return parsed;
  } catch (error) {
    console.error('Error reading database file, recreating it...', error);
    // If corrupt, reinitialize
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
    }
    initDb();
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content);
  }
}

export function saveDb(data: DatabaseSchema): void {
  initDb();
  // Atomic write
  const tempPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_PATH);
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

export function addAppointment(apt: Omit<Appointment, 'id' | 'status' | 'date'> & { id?: string; status?: string }): Appointment {
  const db = getDb();
  const existingIdx = db.appointments.findIndex(a => (apt.appId && a.appId === apt.appId) || (apt.id && a.id === apt.id));
  if (existingIdx !== -1) {
    db.appointments[existingIdx] = {
      ...db.appointments[existingIdx],
      ...apt,
      status: (apt.status as any) || db.appointments[existingIdx].status || 'pending'
    };
    saveDb(db);
    return db.appointments[existingIdx];
  } else {
    const newApt: Appointment = {
      ...apt,
      id: apt.id || `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: (apt.status as any) || 'pending',
      date: new Date().toISOString()
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
  const item = db.appointments.find(r => r.id === id || (r as any).appId === id);
  if (item) {
    item.status = status;
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
