import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UploadedDocument } from '../types';

// Default Supabase project credentials (can be overridden via environment variables)
const DEFAULT_SUPABASE_URL = 'https://yvxqyczeavhfwxxjxwgl.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_8ROBFY1Du5rZWcmKVIngJg_9GIIxdBp';

// Lazily initialize Supabase client
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    DEFAULT_SUPABASE_URL;

  const supabaseAnonKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    DEFAULT_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabaseInstance = createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
    }
  }
  return null;
}

/**
 * Upload receipt or document file directly to Supabase Storage bucket ('documents').
 * Generates permanent public URL. Falls back to Base64 only if Supabase is completely unreachable.
 */
export async function uploadReceiptFileToSupabase(
  file: File | Blob,
  appId: string,
  customFileName?: string
): Promise<{ url: string; provider: 'supabase' | 'base64'; error?: string }> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const fileName = customFileName || (file instanceof File ? file.name : 'document');
      const fileExt = fileName.includes('.') ? fileName.split('.').pop() : 'bin';
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${appId}/${cleanFileName}`;

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
        return {
          url: await convertBlobToBase64(file),
          provider: 'base64',
          error: error.message
        };
      }
    } catch (err: any) {
      console.warn('Error during Supabase upload:', err);
      return {
        url: await convertBlobToBase64(file),
        provider: 'base64',
        error: err?.message || String(err)
      };
    }
  }

  // Base64 Data URL Fallback
  return {
    url: await convertBlobToBase64(file),
    provider: 'base64',
    error: supabase ? undefined : 'Supabase client not initialized'
  };
}

function convertBlobToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve) => {
    if (file instanceof File || file instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    } else {
      resolve('');
    }
  });
}

/**
 * Uploads an array of UploadedDocument files to Supabase Storage before saving application.
 * Replaces heavy base64 dataUrls with clean Supabase storage public URLs.
 */
export async function uploadMultipleDocumentsToSupabase(
  documents: UploadedDocument[],
  appId: string
): Promise<UploadedDocument[]> {
  const supabase = getSupabaseClient();

  return Promise.all(
    documents.map(async (docItem) => {
      // If docItem already has a remote HTTP/HTTPS URL, return as is
      if (docItem.url?.startsWith('http://') || docItem.url?.startsWith('https://')) {
        return docItem;
      }
      if (docItem.dataUrl?.startsWith('http://') || docItem.dataUrl?.startsWith('https://')) {
        return { ...docItem, url: docItem.dataUrl };
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
          if (res.url && res.provider === 'supabase') {
            return {
              ...docItem,
              url: res.url,
              dataUrl: res.url,
              rawFile: undefined
            };
          }
        } catch (err) {
          console.warn(`Failed to upload ${docItem.name} to Supabase:`, err);
        }
      }

      return {
        ...docItem,
        rawFile: undefined
      };
    })
  );
}

export interface ApplicationSubmissionPayload {
  appId: string;
  customerName: string;
  phoneNumber: string;
  emailAddress?: string;
  selectedService: string;
  userCategory?: string;
  paymentMode?: string;
  utrNumber?: string;
  totalAmount?: number;
  status?: string;
  dateOfBirth?: string;
  message?: string;
  documents?: UploadedDocument[];
  mandatoryDocName?: string;
  submittedAt?: string;
}

/**
 * Inserts or syncs application into Supabase 'applications' table.
 * Supports both full-schema tables (with token_id, status, total_amount, etc.)
 * and base-schema tables (with full_name, whatsapp_number, service_selected, document_urls)
 * so it NEVER fails regardless of whether user has executed the schema upgrade SQL yet.
 */
export async function submitApplicationToSupabase(
  appData: ApplicationSubmissionPayload,
  documents: UploadedDocument[]
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  warning?: string;
  insertedSchema?: 'full' | 'base';
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase client is not initialized. Please verify VITE_SUPABASE_URL and key.'
    };
  }

  // 1. Ensure files are uploaded to Supabase Storage
  let processedDocs = documents;
  try {
    processedDocs = await uploadMultipleDocumentsToSupabase(documents, appData.appId);
  } catch (upErr: any) {
    console.warn('Document storage upload notice:', upErr);
  }

  // Format document list for JSONB column (ensure no bloated base64 is stored in DB JSONB)
  const docUrlsOrObjects = processedDocs.map((docItem, idx) => ({
    id: docItem.id || `doc-${idx}`,
    name: docItem.name || 'Document',
    url: (docItem.url && docItem.url.startsWith('http'))
      ? docItem.url
      : (docItem.dataUrl && docItem.dataUrl.startsWith('http'))
      ? docItem.dataUrl
      : '',
    size: docItem.size || 0,
    type: docItem.type || 'application/octet-stream',
    tokenId: appData.appId,
    status: appData.status || 'Pending',
    userCategory: appData.userCategory || 'General/OBC',
    paymentMode: appData.paymentMode || 'cash',
    totalAmount: appData.totalAmount || 0
  }));

  const nowIso = new Date().toISOString();

  // Attempt 1: Full schema insert
  const fullPayload = {
    token_id: appData.appId,
    full_name: appData.customerName,
    whatsapp_number: appData.phoneNumber,
    email_address: appData.emailAddress && appData.emailAddress !== 'N/A' ? appData.emailAddress : null,
    service_selected: appData.selectedService,
    user_category: appData.userCategory || 'General/OBC',
    payment_mode: appData.paymentMode || 'cash',
    utr_number: appData.utrNumber || 'N/A',
    total_amount: Number(appData.totalAmount) || 0,
    status: appData.status || 'Pending',
    document_urls: docUrlsOrObjects,
    payload: {
      appId: appData.appId,
      token: appData.appId,
      customerName: appData.customerName,
      phoneNumber: appData.phoneNumber,
      emailAddress: appData.emailAddress,
      selectedService: appData.selectedService,
      dateOfBirth: appData.dateOfBirth,
      userCategory: appData.userCategory,
      paymentMode: appData.paymentMode,
      utrNumber: appData.utrNumber,
      totalAmount: appData.totalAmount,
      status: appData.status || 'Pending',
      submittedAt: appData.submittedAt || nowIso,
      documents: docUrlsOrObjects,
      mandatoryDocName: appData.mandatoryDocName
    }
  };

  try {
    const { data, error } = await supabase
      .from('applications')
      .insert([fullPayload])
      .select();

    if (!error && data && data.length > 0) {
      return { success: true, data: data[0], insertedSchema: 'full' };
    }

    // If error indicates a missing column (e.g. PGRST204), fallback to base schema
    const isColumnMissing =
      error &&
      (error.code === 'PGRST204' ||
        error.message?.includes('column') ||
        error.message?.includes('schema cache'));

    if (isColumnMissing) {
      console.info('Supabase table uses base schema. Inserting into base columns...');

      const basePayload = {
        full_name: appData.customerName,
        whatsapp_number: appData.phoneNumber,
        email_address: appData.emailAddress && appData.emailAddress !== 'N/A' ? appData.emailAddress : null,
        service_selected: appData.selectedService,
        document_urls: docUrlsOrObjects
      };

      const { data: baseData, error: baseError } = await supabase
        .from('applications')
        .insert([basePayload])
        .select();

      if (!baseError && baseData && baseData.length > 0) {
        return {
          success: true,
          data: baseData[0],
          insertedSchema: 'base',
          warning: 'Inserted into base schema. Run the SQL setup script to enable full schema columns.'
        };
      }

      if (baseError) {
        return { success: false, error: baseError.message };
      }
    }

    if (error) {
      return { success: false, error: error.message };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }

  return { success: false, error: 'Unknown submission error' };
}

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuidString(val: unknown): boolean {
  return typeof val === 'string' && UUID_REGEX.test(val.trim());
}

export function isDeletedApplicationRecord(row: any): boolean {
  if (!row || typeof row !== 'object') return false;
  const topStatus = String(row.status || '').trim().toLowerCase();
  if (topStatus === 'deleted') return true;
  if (row.deleted === true || Boolean(row.deletedAt) || Boolean(row.deleted_at)) return true;
  const payload = row.payload;
  if (payload && typeof payload === 'object') {
    if (payload.deleted === true || Boolean(payload.deletedAt) || Boolean(payload.deleted_at)) return true;
    if (String(payload.status || '').trim().toLowerCase() === 'deleted') return true;
  }
  return false;
}

/**
 * Fetch all active submitted applications directly from Supabase, sorted by created_at DESC.
 * Consistently filters out any soft-deleted / tombstoned records.
 */
export async function fetchSupabaseApplications(): Promise<{
  data: any[];
  error?: string;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: [], error: 'Supabase client is not initialized.' };
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    const activeRows = (data || []).filter((row: any) => !isDeletedApplicationRecord(row));
    return { data: activeRows };
  } catch (err: any) {
    return { data: [], error: err?.message || String(err) };
  }
}

/**
 * Updates application status in Supabase table safely using primary key `id` (UUID) or `token_id`,
 * never passing a non-UUID string into a UUID column filter.
 */
export async function updateSupabaseApplicationStatus(
  appId: string,
  newStatus: string,
  supabaseUuid?: string
): Promise<{ success: boolean; affectedCount?: number; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };

  const cleanId = (appId || '').trim();
  const cleanUuid = (supabaseUuid || '').trim();

  try {
    const uuidTarget = isUuidString(cleanUuid)
      ? cleanUuid
      : isUuidString(cleanId)
      ? cleanId
      : '';

    if (uuidTarget) {
      const { data, error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', uuidTarget)
        .select('id, token_id, status');

      if (!error && Array.isArray(data) && data.length > 0) {
        return { success: true, affectedCount: data.length };
      }
      if (error) {
        console.warn('Supabase status update by id notice:', error.message);
      }
    }

    if (cleanId) {
      const { data, error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('token_id', cleanId)
        .select('id, token_id, status');

      if (!error && Array.isArray(data) && data.length > 0) {
        return { success: true, affectedCount: data.length };
      }
      if (error) {
        console.warn('Supabase status update by token_id notice:', error.message);
        return { success: false, error: error.message };
      }
    }

    return { success: true, affectedCount: 0 };
  } catch (e: any) {
    return { success: false, error: e?.message || String(e) };
  }
}

/**
 * Deletes an application in Supabase by its primary key `id` (UUID) and/or `token_id`,
 * confirming that the database operation affected at least one record.
 * - First attempts physical DELETE (`DELETE FROM public.applications WHERE id = ...`).
 * - If RLS on `public.applications` blocks physical DELETE for the publishable role (0 rows affected),
 *   persists a verified tombstone (`status = 'Deleted'`, `payload.deleted = true`) on that exact primary key.
 */
export async function deleteSupabaseApplication(
  appId: string,
  supabaseUuid?: string
): Promise<{
  success: boolean;
  foundInSupabase: boolean;
  affectedCount: number;
  deletedSupabaseIds: string[];
  deletedTokenIds: string[];
  error?: string;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      foundInSupabase: false,
      affectedCount: 0,
      deletedSupabaseIds: [],
      deletedTokenIds: [],
      error: 'Supabase client is not initialized.'
    };
  }

  const cleanId = (appId || '').trim();
  const cleanUuid = (supabaseUuid || '').trim();
  const matchedMap = new Map<string, any>();

  try {
    const uuidCandidate = isUuidString(cleanUuid)
      ? cleanUuid
      : isUuidString(cleanId)
      ? cleanId
      : '';

    if (uuidCandidate) {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', uuidCandidate);
      if (error) {
        return {
          success: false,
          foundInSupabase: false,
          affectedCount: 0,
          deletedSupabaseIds: [],
          deletedTokenIds: [],
          error: error.message
        };
      }
      (data || []).forEach((r: any) => {
        if (r && r.id) matchedMap.set(String(r.id), r);
      });
    }

    if (cleanId) {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('token_id', cleanId);
      if (!error && Array.isArray(data)) {
        data.forEach((r: any) => {
          if (r && r.id) matchedMap.set(String(r.id), r);
        });
      }
    }

    // Fallback for legacy rows with token_id: null (where UI synthesized CSC-<8-char-uuid>)
    if (matchedMap.size === 0 && cleanId) {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);

      if (!error && Array.isArray(data)) {
        const lowerClean = cleanId.toLowerCase();
        for (const r of data) {
          if (!r || !r.id) continue;
          const rowUuid = String(r.id);
          const synthToken = `CSC-${rowUuid.slice(0, 8)}`.toLowerCase();
          const payloadAppId = String(r.payload?.appId || r.payload?.token || '').toLowerCase();
          const tokenCol = String(r.token_id || '').toLowerCase();

          if (
            rowUuid.toLowerCase() === lowerClean ||
            tokenCol === lowerClean ||
            payloadAppId === lowerClean ||
            synthToken === lowerClean
          ) {
            matchedMap.set(rowUuid, r);
          }
        }
      }
    }

    const rows = Array.from(matchedMap.values());
    if (rows.length === 0) {
      return {
        success: true,
        foundInSupabase: false,
        affectedCount: 0,
        deletedSupabaseIds: [],
        deletedTokenIds: []
      };
    }

    const activeRows = rows.filter(r => !isDeletedApplicationRecord(r));
    if (activeRows.length === 0) {
      return {
        success: true,
        foundInSupabase: true,
        affectedCount: rows.length,
        deletedSupabaseIds: rows.map(r => String(r.id)),
        deletedTokenIds: rows.map(r => String(r.token_id || r.payload?.appId || cleanId)).filter(Boolean)
      };
    }

    let totalAffected = 0;
    const deletedSupabaseIds: string[] = [];
    const deletedTokenIds: string[] = [];
    const errors: string[] = [];

    for (const row of activeRows) {
      const pkUuid = String(row.id);
      const resolvedTok = String(row.token_id || row.payload?.appId || `CSC-${pkUuid.slice(0, 8)}`);

      const { data: hardDeleted, error: hardErr } = await supabase
        .from('applications')
        .delete()
        .eq('id', pkUuid)
        .select('id, token_id');

      if (!hardErr && Array.isArray(hardDeleted) && hardDeleted.length > 0) {
        totalAffected += hardDeleted.length;
        deletedSupabaseIds.push(pkUuid);
        deletedTokenIds.push(resolvedTok);
        continue;
      }

      const deletedAtIso = new Date().toISOString();
      const existingPayload = row.payload && typeof row.payload === 'object' ? row.payload : {};

      const { data: softDeleted, error: softErr } = await supabase
        .from('applications')
        .update({
          status: 'Deleted',
          payload: {
            ...existingPayload,
            appId: existingPayload.appId || resolvedTok,
            status: 'Deleted',
            deleted: true,
            deletedAt: deletedAtIso
          }
        })
        .eq('id', pkUuid)
        .select('id, token_id, status');

      if (!softErr && Array.isArray(softDeleted) && softDeleted.length > 0) {
        totalAffected += softDeleted.length;
        deletedSupabaseIds.push(pkUuid);
        deletedTokenIds.push(resolvedTok);
      } else {
        errors.push(
          softErr?.message ||
          hardErr?.message ||
          `Database deletion affected 0 rows for ${pkUuid}.`
        );
      }
    }

    if (totalAffected === 0) {
      return {
        success: false,
        foundInSupabase: true,
        affectedCount: 0,
        deletedSupabaseIds: [],
        deletedTokenIds: [],
        error: errors.join('; ') || 'Deletion failed: 0 rows affected in Supabase.'
      };
    }

    return {
      success: true,
      foundInSupabase: true,
      affectedCount: totalAffected,
      deletedSupabaseIds,
      deletedTokenIds
    };
  } catch (err: any) {
    return {
      success: false,
      foundInSupabase: false,
      affectedCount: 0,
      deletedSupabaseIds: [],
      deletedTokenIds: [],
      error: err?.message || String(err)
    };
  }
}

/**
 * Comprehensive live diagnostic test for Supabase connection, table permissions, and storage buckets.
 */
export async function testSupabaseLiveConnection(): Promise<{
  overallStatus: 'connected' | 'partially_configured' | 'error';
  supabaseUrl: string;
  tableAccess: { success: boolean; message: string; rowsCount?: number };
  columnsStatus: { fullSchema: boolean; message: string; missingColumns?: string[] };
  storageAccess: { success: boolean; message: string; publicUrl?: string };
  rawErrors: string[];
}> {
  const supabase = getSupabaseClient();
  const rawErrors: string[] = [];

  const supabaseUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    DEFAULT_SUPABASE_URL;

  if (!supabase) {
    return {
      overallStatus: 'error',
      supabaseUrl,
      tableAccess: { success: false, message: 'Supabase client failed to initialize' },
      columnsStatus: { fullSchema: false, message: 'Unchecked due to client error' },
      storageAccess: { success: false, message: 'Unchecked due to client error' },
      rawErrors: ['Supabase client initialization failed']
    };
  }

  // 1. Test Table SELECT Access (RLS check)
  let tableSuccess = false;
  let tableMessage = '';
  let rowsCount = 0;

  try {
    const { data, error } = await supabase
      .from('applications')
      .select('id, created_at, full_name, whatsapp_number, service_selected')
      .limit(5);

    if (error) {
      tableSuccess = false;
      tableMessage = `Table error: ${error.message} (Code: ${error.code || 'N/A'})`;
      rawErrors.push(tableMessage);
    } else {
      tableSuccess = true;
      rowsCount = (data || []).length;
      tableMessage = `Connected! Table "public.applications" is live and readable (${rowsCount} recent row(s) inspected).`;
    }
  } catch (tErr: any) {
    tableSuccess = false;
    tableMessage = `Network error querying table: ${tErr?.message || String(tErr)}`;
    rawErrors.push(tableMessage);
  }

  // 2. Test Table Schema Columns (Check if full schema or base schema)
  let fullSchema = false;
  let columnsMessage = '';
  const missingCols: string[] = [];

  try {
    const { error: probeError } = await supabase
      .from('applications')
      .select('token_id, status, total_amount, payment_mode, user_category, payload')
      .limit(1);

    if (probeError) {
      fullSchema = false;
      columnsMessage =
        'Base schema active (full_name, whatsapp_number, email_address, service_selected, document_urls). Run the SQL setup script to add token_id, status, and payment columns.';
    } else {
      fullSchema = true;
      columnsMessage = 'Full schema active with token_id, status, payment_mode, and rich metadata columns.';
    }
  } catch (cErr: any) {
    fullSchema = false;
    columnsMessage = 'Schema probe notice: using base schema compatibility.';
  }

  // 3. Test Storage Bucket 'documents' (Upload & Read probe)
  let storageSuccess = false;
  let storageMessage = '';
  let testPublicUrl = '';

  try {
    const probePath = `diagnostics/healthcheck_${Date.now()}.txt`;
    const probeBlob = new Blob(['CSC DOST Supabase Live Diagnostic Probe - ' + new Date().toISOString()], {
      type: 'text/plain'
    });

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('documents')
      .upload(probePath, probeBlob, { upsert: true });

    if (uploadErr) {
      storageSuccess = false;
      storageMessage = `Bucket error: ${uploadErr.message}`;
      rawErrors.push(`Storage upload error: ${uploadErr.message}`);
    } else {
      const { data: publicData } = supabase.storage
        .from('documents')
        .getPublicUrl(probePath);

      testPublicUrl = publicData?.publicUrl || '';
      storageSuccess = true;
      storageMessage = `Storage bucket "documents" is live and writable. Public URL generated successfully.`;
    }
  } catch (sErr: any) {
    storageSuccess = false;
    storageMessage = `Storage connection error: ${sErr?.message || String(sErr)}`;
    rawErrors.push(storageMessage);
  }

  let overallStatus: 'connected' | 'partially_configured' | 'error' = 'connected';
  if (!tableSuccess && !storageSuccess) {
    overallStatus = 'error';
  } else if (!tableSuccess || !storageSuccess || !fullSchema) {
    overallStatus = 'partially_configured';
  }

  return {
    overallStatus,
    supabaseUrl,
    tableAccess: { success: tableSuccess, message: tableMessage, rowsCount },
    columnsStatus: { fullSchema, message: columnsMessage, missingColumns: missingCols },
    storageAccess: { success: storageSuccess, message: storageMessage, publicUrl: testPublicUrl },
    rawErrors
  };
}
