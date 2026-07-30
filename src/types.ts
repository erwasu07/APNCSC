export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
}

export interface Appointment {
  id: string;
  appId?: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  appointmentDate: string;
  appointmentTime: string;
  message: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  date: string;
  dateOfBirth?: string;
  userCategory?: string;
  paymentMode?: string;
  utrNumber?: string;
  totalAmount?: number;
  documents?: UploadedDocument[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: string;
  active: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'interior' | 'banking' | 'printing' | 'services';
  url: string;
  description: string;
}

export interface WebsiteSettings {
  cafeName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  officeHours: string;
  googleMapsEmbed: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

export interface AnalyticsStats {
  views: number;
  contactRequestsCount: number;
  appointmentsCount: number;
  completedRequestsCount: number;
  serviceDistribution: Record<string, number>;
  monthlyTrends: Array<{ month: string; requests: number; appointments: number }>;
}
