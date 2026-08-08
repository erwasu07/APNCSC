import PocketBase from 'pocketbase';
import { UploadedDocument } from '../types';

export function getPocketBaseUrl(): string {
  return (
    localStorage.getItem('cscdost_pocketbase_url') ||
    import.meta.env.VITE_POCKETBASE_URL ||
    process.env.VITE_POCKETBASE_URL ||
    'http://127.0.0.1:8090'
  );
}

export function setPocketBaseUrl(url: string) {
  if (url) {
    localStorage.setItem('cscdost_pocketbase_url', url);
  } else {
    localStorage.removeItem('cscdost_pocketbase_url');
  }
  pbInstance = null; // reset instance on URL change
}

let pbInstance: PocketBase | null = null;

export function getPocketBaseClient(): PocketBase | null {
  const url = getPocketBaseUrl();
  if (!url) return null;

  if (!pbInstance || pbInstance.baseUrl !== url) {
    try {
      pbInstance = new PocketBase(url);
    } catch (err) {
      console.warn('PocketBase client initialization warning:', err);
    }
  }
  return pbInstance;
}

/**
 * Saves an application form record directly to PocketBase 'applications' collection.
 * Uses standard multipart/form-data via FormData for guest submissions and file attachments.
 */
export async function saveApplicationToPocketBase(
  appId: string,
  payload: {
    applicantName: string;
    phoneNumber: string;
    emailAddress?: string;
    selectedService: string;
    userCategory?: string;
    paymentMode?: string;
    utrNumber?: string;
    totalAmount: number;
    status: string;
    submittedAt: string;
    documents?: UploadedDocument[];
    [key: string]: any;
  }
): Promise<{ success: boolean; record?: any; error?: string }> {
  const pb = getPocketBaseClient();
  if (!pb) {
    return { success: false, error: 'PocketBase client is not initialized.' };
  }

  try {
    const formData = new FormData();

    // Set core text fields expected by PocketBase applications collection
    formData.append('appId', appId);
    formData.append('applicantName', payload.applicantName || payload.customerName || 'N/A');
    formData.append('phoneNumber', payload.phoneNumber || 'N/A');
    formData.append('emailAddress', payload.emailAddress || 'N/A');
    formData.append('selectedService', payload.selectedService || 'General Service');
    formData.append('userCategory', payload.userCategory || 'General');
    formData.append('paymentMode', payload.paymentMode || 'Pending Payment');
    formData.append('utrNumber', payload.utrNumber || 'N/A');
    formData.append('totalAmount', String(payload.totalAmount || 0));
    formData.append('status', payload.status || 'Pending');
    formData.append('submittedAt', payload.submittedAt || new Date().toISOString());

    // Serialize full payload as JSON string for metadata persistence
    formData.append('payloadJson', JSON.stringify(payload));

    // Append file attachments if available
    if (payload.documents && Array.isArray(payload.documents)) {
      for (const docItem of payload.documents) {
        if (docItem.rawFile instanceof File || docItem.rawFile instanceof Blob) {
          formData.append('documents', docItem.rawFile, docItem.name || 'document.pdf');
        } else if (docItem.dataUrl && docItem.dataUrl.startsWith('data:')) {
          try {
            const arr = docItem.dataUrl.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : docItem.type || 'application/octet-stream';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });
            formData.append('documents', blob, docItem.name || 'document.bin');
          } catch (e) {
            console.warn('Error converting base64 dataUrl to file for PocketBase:', e);
          }
        }
      }
    }

    // Check if record already exists to determine create or update (upsert)
    let record: any = null;
    try {
      const existing = await pb.collection('applications').getFirstListItem(`appId="${appId}"`);
      if (existing) {
        record = await pb.collection('applications').update(existing.id, formData);
      }
    } catch {
      // Record not found, proceed to create
    }

    if (!record) {
      record = await pb.collection('applications').create(formData);
    }

    return { success: true, record };
  } catch (err: any) {
    console.warn('PocketBase save error:', err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetches all application records from PocketBase for the staff dashboard.
 */
export async function fetchApplicationsFromPocketBase(): Promise<any[]> {
  const pb = getPocketBaseClient();
  if (!pb) return [];

  try {
    const records = await pb.collection('applications').getFullList({
      sort: '-created'
    });
    return records;
  } catch (err) {
    console.warn('PocketBase fetch notice:', err);
    return [];
  }
}

/**
 * Updates application status in PocketBase.
 */
export async function updatePocketBaseApplicationStatus(
  appId: string,
  updates: { status?: string; utrNumber?: string; adminNotes?: string; [key: string]: any }
): Promise<boolean> {
  const pb = getPocketBaseClient();
  if (!pb) return false;

  try {
    const existing = await pb.collection('applications').getFirstListItem(`appId="${appId}"`);
    if (existing) {
      await pb.collection('applications').update(existing.id, updates);
      return true;
    }
  } catch (err) {
    console.warn('PocketBase status update error:', err);
  }
  return false;
}
