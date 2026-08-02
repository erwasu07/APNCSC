import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
 * Upload receipt file to Supabase Storage or generate a reliable long-lived URL.
 * Falls back gracefully to base64 Data URL if Supabase credentials or bucket are unconfigured.
 */
export async function uploadReceiptFileToSupabase(
  file: File,
  appId: string
): Promise<{ url: string; provider: 'supabase' | 'base64' }> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'file';
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `receipts/${appId}/${cleanFileName}`;

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
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ url: reader.result as string, provider: 'base64' });
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
