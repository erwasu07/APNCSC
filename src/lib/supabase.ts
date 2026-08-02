import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UploadedDocument } from '../types';

// Lazily initialize Supabase client
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
    }
  }
  return null;
}

/**
 * Upload receipt or document file to Supabase Storage or generate a reliable long-lived URL.
 * Falls back gracefully to base64 Data URL if Supabase credentials or bucket are unconfigured.
 */
export async function uploadReceiptFileToSupabase(
  file: File | Blob,
  appId: string,
  customFileName?: string
): Promise<{ url: string; provider: 'supabase' | 'base64' }> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const fileName = customFileName || (file instanceof File ? file.name : 'document');
      const fileExt = fileName.includes('.') ? fileName.split('.').pop() : 'bin';
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `documents/${appId}/${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          return { url: publicData.publicUrl, provider: 'supabase' };
        }
      } else if (error) {
        console.warn('Supabase storage upload notice:', error.message);
      }
    } catch (err) {
      console.warn('Error during Supabase upload:', err);
    }
  }

  // Base64 Data URL Fallback guarantee
  return new Promise((resolve, reject) => {
    if (file instanceof File || file instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ url: reader.result as string, provider: 'base64' });
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    } else {
      resolve({ url: '', provider: 'base64' });
    }
  });
}

/**
 * Uploads an array of UploadedDocument files to Supabase Storage before saving application.
 * Replaces heavy base64 dataUrls with clean Supabase storage URLs so row payloads stay small and fast.
 */
export async function uploadMultipleDocumentsToSupabase(
  documents: UploadedDocument[],
  appId: string
): Promise<UploadedDocument[]> {
  const supabase = getSupabaseClient();

  return Promise.all(
    documents.map(async (docItem) => {
      // If docItem already has a HTTP/HTTPS URL or no rawFile/dataUrl, return as is
      if (docItem.dataUrl?.startsWith('http://') || docItem.dataUrl?.startsWith('https://')) {
        return docItem;
      }

      let fileToUpload: File | Blob | null = docItem.rawFile || null;

      // If rawFile is missing but dataUrl is base64, convert base64 dataUrl to Blob
      if (!fileToUpload && docItem.dataUrl && docItem.dataUrl.startsWith('data:')) {
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
          fileToUpload = new Blob([u8arr], { type: mime });
        } catch (e) {
          console.warn('Error converting dataUrl to Blob:', e);
        }
      }

      if (fileToUpload && supabase) {
        try {
          const res = await uploadReceiptFileToSupabase(fileToUpload, appId, docItem.name);
          if (res.url) {
            return {
              ...docItem,
              dataUrl: res.url, // Replace heavy base64 string with public Supabase URL
              url: res.url,
              rawFile: undefined
            };
          }
        } catch (err) {
          console.warn(`Failed to upload ${docItem.name} to Supabase:`, err);
        }
      }

      // If upload failed or Supabase client not present, return docItem clean without rawFile
      return {
        ...docItem,
        rawFile: undefined
      };
    })
  );
}
