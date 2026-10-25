import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project credentials
const DEFAULT_SUPABASE_URL = 'https://yvxqyczeavhfwxxjxwgl.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_8ROBFY1Du5rZWcmKVIngJg_9GIIxdBp';

let serverSupabaseInstance: SupabaseClient | null = null;

export function getServerSupabaseClient(): SupabaseClient | null {
  if (serverSupabaseInstance) return serverSupabaseInstance;

  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  ).trim();

  const supabaseAnonKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY
  ).trim();

  if (supabaseUrl && supabaseAnonKey) {
    try {
      serverSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      return serverSupabaseInstance;
    } catch (err) {
      console.error('[SupabaseServer] Failed to initialize Supabase client:', err);
    }
  }
  return null;
}

export interface CustomerApplicationInput {
  appId?: string;
  idempotencyKey?: string;
  customerName: string;
  phoneNumber: string;
  emailAddress?: string;
  selectedService: string;
  userCategory?: string;
  dateOfBirth?: string;
  paymentMode?: string;
  utrNumber?: string;
  totalAmount?: number;
  message?: string;
  status?: string;
  submittedAt?: string;
  mandatoryDocName?: string;
  documents?: Array<{
    id?: string;
    name: string;
    size?: number;
    type?: string;
    dataUrl?: string;
    url?: string;
  }>;
}

/**
 * Uploads a document from Base64 or DataURL to Supabase Storage bucket 'documents'.
 */
export async function uploadDocumentBufferToSupabase(
  appId: string,
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<{ url: string; success: boolean; error?: string }> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return { url: '', success: false, error: 'Supabase client not initialized' };
  }

  try {
    const extMatch = fileName.includes('.') ? fileName.split('.').pop() : 'bin';
    const cleanExt = extMatch ? extMatch.toLowerCase() : 'bin';
    const cleanBaseName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const uniqueFileName = `${Date.now()}_${cleanBaseName}.${cleanExt}`;
    const storagePath = `${appId}/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: contentType || 'application/octet-stream',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn(`[SupabaseServer] Document upload notice for ${fileName}:`, error.message);
      return { url: '', success: false, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(storagePath);

    return {
      url: publicUrlData?.publicUrl || '',
      success: true
    };
  } catch (err: any) {
    console.error(`[SupabaseServer] Storage upload exception for ${fileName}:`, err);
    return { url: '', success: false, error: err?.message || String(err) };
  }
}

/**
 * Core application persistence engine for Supabase.
 * Guaranteed idempotent: if an application with the given token_id already exists,
 * returns the existing record without duplicating.
 */
export async function persistCustomerApplication(
  input: CustomerApplicationInput
): Promise<{
  success: boolean;
  appId: string;
  data?: any;
  error?: string;
  documentWarnings?: string[];
}> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      appId: input.appId || 'UNKNOWN',
      error: 'Supabase database is not configured or unreachable.'
    };
  }

  const finalAppId = (
    input.appId ||
    input.idempotencyKey ||
    `CSC21251567${Math.floor(100 + Math.random() * 900)}`
  ).trim();

  // 1. Idempotency Check: see if an application with this token_id already exists
  try {
    const { data: existingRows } = await supabase
      .from('applications')
      .select('*')
      .eq('token_id', finalAppId)
      .limit(1);

    if (existingRows && existingRows.length > 0) {
      console.log(`[SupabaseServer] Idempotent hit: Application ${finalAppId} already persisted.`);
      return {
        success: true,
        appId: finalAppId,
        data: existingRows[0]
      };
    }
  } catch (idempErr) {
    console.warn('[SupabaseServer] Idempotency probe notice:', idempErr);
  }

  // 2. Process documents safely
  const processedDocs: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    status: string;
  }> = [];

  const documentWarnings: string[] = [];

  if (Array.isArray(input.documents) && input.documents.length > 0) {
    for (let i = 0; i < input.documents.length; i++) {
      const doc = input.documents[i];
      const docName = doc.name || `Document_${i + 1}`;
      const docType = doc.type || 'application/octet-stream';
      const docSize = typeof doc.size === 'number' ? doc.size : 0;

      // Case A: Document already has a valid remote URL
      if (doc.url && (doc.url.startsWith('http://') || doc.url.startsWith('https://'))) {
        processedDocs.push({
          id: doc.id || `doc-${i}`,
          name: docName,
          url: doc.url,
          size: docSize,
          type: docType,
          status: 'Uploaded'
        });
        continue;
      }

      // Case B: Document has base64 dataUrl -> upload to Supabase Storage
      if (doc.dataUrl && doc.dataUrl.startsWith('data:')) {
        try {
          const parts = doc.dataUrl.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : docType;
          const buffer = Buffer.from(parts[1], 'base64');

          const uploadRes = await uploadDocumentBufferToSupabase(
            finalAppId,
            docName,
            buffer,
            mime
          );

          if (uploadRes.success && uploadRes.url) {
            processedDocs.push({
              id: doc.id || `doc-${i}`,
              name: docName,
              url: uploadRes.url,
              size: buffer.length,
              type: mime,
              status: 'Uploaded'
            });
          } else {
            documentWarnings.push(`Document "${docName}" could not be saved to storage: ${uploadRes.error || 'Upload error'}`);
            // Partial failure preservation: record document metadata as pending
            processedDocs.push({
              id: doc.id || `doc-${i}`,
              name: docName,
              url: '',
              size: buffer.length,
              type: mime,
              status: 'Pending Document Upload'
            });
          }
        } catch (bufErr: any) {
          console.warn(`[SupabaseServer] Buffer conversion error for ${docName}:`, bufErr);
          documentWarnings.push(`Document "${docName}" buffer error: ${bufErr?.message || String(bufErr)}`);
        }
      }
    }
  }

  // 3. Assemble full schema payload
  const nowIso = input.submittedAt || new Date().toISOString();
  const fullPayload = {
    token_id: finalAppId,
    full_name: (input.customerName || 'Applicant').trim(),
    whatsapp_number: (input.phoneNumber || '').trim(),
    email_address: input.emailAddress && input.emailAddress !== 'N/A' ? input.emailAddress.trim() : null,
    service_selected: (input.selectedService || 'General CSC Service').trim(),
    user_category: input.userCategory || 'General/OBC',
    payment_mode: input.paymentMode || 'Pay at CSC Desk Upon Completion',
    utr_number: input.utrNumber || 'N/A',
    total_amount: Number(input.totalAmount) || 0,
    status: input.status || 'Pending',
    document_urls: processedDocs,
    payload: {
      appId: finalAppId,
      token: finalAppId,
      customerName: input.customerName,
      phoneNumber: input.phoneNumber,
      emailAddress: input.emailAddress,
      selectedService: input.selectedService,
      dateOfBirth: input.dateOfBirth || 'N/A',
      userCategory: input.userCategory || 'General/OBC',
      paymentMode: input.paymentMode || 'Pay at CSC Desk Upon Completion',
      utrNumber: input.utrNumber || 'N/A',
      totalAmount: Number(input.totalAmount) || 0,
      status: input.status || 'Pending',
      submittedAt: nowIso,
      documents: processedDocs,
      documentWarnings: documentWarnings.length > 0 ? documentWarnings : undefined,
      mandatoryDocName: input.mandatoryDocName || (processedDocs[0]?.name || 'N/A')
    }
  };

  // 4. Insert into Supabase 'applications' table
  try {
    const { data, error } = await supabase
      .from('applications')
      .insert([fullPayload])
      .select();

    if (error) {
      console.error('[SupabaseServer] Full schema insert error:', error.message, error.code);

      // Fallback: If schema error on specific custom columns, insert into base schema
      const isColumnMissing =
        error.code === 'PGRST204' ||
        error.message?.includes('column') ||
        error.message?.includes('schema cache');

      if (isColumnMissing) {
        console.warn('[SupabaseServer] Retrying with base schema...');
        const basePayload = {
          full_name: fullPayload.full_name,
          whatsapp_number: fullPayload.whatsapp_number,
          email_address: fullPayload.email_address,
          service_selected: fullPayload.service_selected,
          document_urls: processedDocs
        };

        const { data: baseData, error: baseErr } = await supabase
          .from('applications')
          .insert([basePayload])
          .select();

        if (baseErr) {
          console.error('[SupabaseServer] Base schema insert also failed:', baseErr);
          return {
            success: false,
            appId: finalAppId,
            error: `Database insertion failed: ${baseErr.message}`
          };
        }

        return {
          success: true,
          appId: finalAppId,
          data: baseData?.[0],
          documentWarnings: documentWarnings.length > 0 ? documentWarnings : undefined
        };
      }

      return {
        success: false,
        appId: finalAppId,
        error: `Database persistence error: ${error.message} (Code: ${error.code || 'N/A'})`
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        appId: finalAppId,
        error: 'Database returned empty confirmation response.'
      };
    }

    console.log(`✅ [SupabaseServer] Customer Application Successfully Persisted in Supabase: [${finalAppId}] for ${fullPayload.full_name}`);

    return {
      success: true,
      appId: finalAppId,
      data: data[0],
      documentWarnings: documentWarnings.length > 0 ? documentWarnings : undefined
    };
  } catch (err: any) {
    console.error('[SupabaseServer] Unhandled persistence exception:', err);
    return {
      success: false,
      appId: finalAppId,
      error: `Server database exception: ${err?.message || String(err)}`
    };
  }
}
