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

  // 1. Strict File Size Validation (Max 15MB limit)
  const MAX_FILE_SIZE = 15 * 1024 * 1024;
  if (!fileBuffer || fileBuffer.length === 0) {
    return { url: '', success: false, error: 'Uploaded file is empty.' };
  }
  if (fileBuffer.length > MAX_FILE_SIZE) {
    return { url: '', success: false, error: 'File size exceeds maximum allowed limit of 15 MB.' };
  }

  // 2. Strict File Extension Validation
  const rawExt = (fileName.includes('.') ? fileName.split('.').pop() || '' : '').toLowerCase().trim();
  const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp']);
  if (!ALLOWED_EXTENSIONS.has(rawExt)) {
    return { url: '', success: false, error: 'Invalid file extension. Only PDF, JPG, PNG, and WEBP files are allowed.' };
  }

  // 3. Magic Number / File Signature Validation (prevents spoofed executables)
  const isPdf = fileBuffer.length >= 4 && fileBuffer[0] === 0x25 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x44 && fileBuffer[3] === 0x46; // %PDF
  const isJpg = fileBuffer.length >= 3 && fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8 && fileBuffer[2] === 0xFF; // JPEG
  const isPng = fileBuffer.length >= 8 && fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47; // PNG
  const isWebp = fileBuffer.length >= 12 && fileBuffer.toString('utf-8', 0, 4) === 'RIFF' && fileBuffer.toString('utf-8', 8, 12) === 'WEBP';

  if (!isPdf && !isJpg && !isPng && !isWebp) {
    return { url: '', success: false, error: 'Corrupt or unverified file signature. Upload rejected for security.' };
  }

  // Resolve verified MIME type
  const verifiedMime = isPdf ? 'application/pdf' : isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';

  try {
    // 4. Secure File Path & Name Sanitization (prevent path traversal / injection)
    const cleanAppId = appId.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const cleanBaseName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const uniqueFileName = `${Date.now()}_${cleanBaseName}.${rawExt}`;
    const storagePath = `${cleanAppId}/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: verifiedMime,
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
    console.error(`[SupabaseServer] Storage upload exception for ${fileName}:`, err?.message || String(err));
    return { url: '', success: false, error: err?.message || String(err) };
  }
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
 * Computes the highest CSC21251567XXX sequence number present in Supabase `public.applications`
 * (including soft-deleted rows) so token numbers are strictly monotonic and never reused.
 */
export async function getHighestSupabaseTokenSeq(): Promise<number> {
  const supabase = getServerSupabaseClient();
  if (!supabase) return 0;

  let maxSeq = 0;
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('token_id, payload')
      .order('created_at', { ascending: false })
      .limit(500);

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        const candidates = [
          row?.token_id,
          row?.payload?.appId,
          row?.payload?.token
        ];
        for (const c of candidates) {
          if (typeof c === 'string') {
            const match = c.match(/^CSC21251567(\d+)/i);
            if (match && match[1]) {
              const num = parseInt(match[1], 10);
              if (!isNaN(num) && num > maxSeq) {
                maxSeq = num;
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[SupabaseServer] Token sequence probe notice:', err);
  }
  return maxSeq;
}

/**
 * Safely locates matching rows in `public.applications` by UUID primary key `id`,
 * `token_id`, `payload.appId`, or synthesized `CSC-<8-char-uuid>` prefix without
 * ever passing a non-UUID string into a `.eq('id', ...)` filter.
 */
export async function findSupabaseApplicationRows(
  identifier: string,
  supabaseUuid?: string
): Promise<{ rows: any[]; error?: string }> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return { rows: [], error: 'Supabase client is not initialized.' };
  }

  const cleanId = (identifier || '').trim();
  const cleanUuid = (supabaseUuid || '').trim();
  const matchedMap = new Map<string, any>();

  try {
    // 1. Direct UUID primary key lookup if valid UUID provided
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
        return { rows: [], error: error.message };
      }
      (data || []).forEach((r: any) => {
        if (r && r.id) matchedMap.set(String(r.id), r);
      });
    }

    // 2. Direct token_id lookup if cleanId is non-empty
    if (cleanId) {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('token_id', cleanId);

      if (error && !error.message?.includes('column')) {
        return { rows: Array.from(matchedMap.values()), error: error.message };
      }
      (data || []).forEach((r: any) => {
        if (r && r.id) matchedMap.set(String(r.id), r);
      });
    }

    // 3. Fallback lookup for legacy rows where token_id is null (e.g., synthesized CSC-<8char> or payload.appId)
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

    return { rows: Array.from(matchedMap.values()) };
  } catch (err: any) {
    return { rows: Array.from(matchedMap.values()), error: err?.message || String(err) };
  }
}

/**
 * Deletes an application in Supabase `public.applications` by its actual UUID primary key `id`
 * (and/or `token_id`), confirming that at least 1 row was affected.
 * - First attempts physical hard DELETE (`DELETE FROM public.applications WHERE id = ...`).
 * - If RLS on `public.applications` blocks physical DELETE for the publishable role (0 rows affected),
 *   persists a verified tombstone (`status = 'Deleted'`, `payload.deleted = true`) on that exact primary key.
 */
export async function deleteCustomerApplicationFromSupabase(
  identifier: string,
  supabaseUuid?: string
): Promise<{
  success: boolean;
  foundInSupabase: boolean;
  affectedCount: number;
  deletionMode?: 'hard' | 'soft_tombstone' | 'already_deleted';
  deletedSupabaseIds: string[];
  deletedTokenIds: string[];
  error?: string;
}> {
  const supabase = getServerSupabaseClient();
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

  const lookup = await findSupabaseApplicationRows(identifier, supabaseUuid);
  if (lookup.error) {
    return {
      success: false,
      foundInSupabase: false,
      affectedCount: 0,
      deletedSupabaseIds: [],
      deletedTokenIds: [],
      error: lookup.error
    };
  }

  if (lookup.rows.length === 0) {
    return {
      success: true,
      foundInSupabase: false,
      affectedCount: 0,
      deletedSupabaseIds: [],
      deletedTokenIds: []
    };
  }

  const activeRows = lookup.rows.filter(r => !isDeletedApplicationRecord(r));
  if (activeRows.length === 0) {
    return {
      success: true,
      foundInSupabase: true,
      affectedCount: lookup.rows.length,
      deletionMode: 'already_deleted',
      deletedSupabaseIds: lookup.rows.map(r => String(r.id)),
      deletedTokenIds: lookup.rows.map(r => String(r.token_id || r.payload?.appId || identifier)).filter(Boolean)
    };
  }

  let totalAffected = 0;
  let modeUsed: 'hard' | 'soft_tombstone' = 'hard';
  const deletedSupabaseIds: string[] = [];
  const deletedTokenIds: string[] = [];
  const errors: string[] = [];

  for (const row of activeRows) {
    const primaryKeyUuid = String(row.id);
    const resolvedTok = String(row.token_id || row.payload?.appId || `CSC-${primaryKeyUuid.slice(0, 8)}`);

    // Step 1: Attempt physical hard DELETE by primary key `id`
    const { data: hardDeleted, error: hardErr } = await supabase
      .from('applications')
      .delete()
      .eq('id', primaryKeyUuid)
      .select('id, token_id');

    if (!hardErr && Array.isArray(hardDeleted) && hardDeleted.length > 0) {
      totalAffected += hardDeleted.length;
      deletedSupabaseIds.push(primaryKeyUuid);
      deletedTokenIds.push(resolvedTok);
      continue;
    }

    // Step 2: If physical DELETE matched 0 rows (due to missing RLS FOR DELETE policy on anon key),
    // persist deletion state on the exact row in Supabase so it never reappears on refetch/new submission.
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
      .eq('id', primaryKeyUuid)
      .select('id, token_id, status');

    if (!softErr && Array.isArray(softDeleted) && softDeleted.length > 0) {
      modeUsed = 'soft_tombstone';
      totalAffected += softDeleted.length;
      deletedSupabaseIds.push(primaryKeyUuid);
      deletedTokenIds.push(resolvedTok);
    } else {
      errors.push(
        softErr?.message ||
        hardErr?.message ||
        `Database operation affected 0 rows for primary key ${primaryKeyUuid}. Check RLS policies.`
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
      error: errors.join('; ') || 'Deletion failed: 0 rows were affected in Supabase.'
    };
  }

  return {
    success: true,
    foundInSupabase: true,
    affectedCount: totalAffected,
    deletionMode: modeUsed,
    deletedSupabaseIds,
    deletedTokenIds
  };
}

/**
 * Core application persistence engine for Supabase.
 * Guaranteed idempotent when an explicit idempotencyKey is provided, and never
 * resurrects a deleted record or collides with an existing token_id.
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

  let finalAppId = (
    input.appId ||
    input.idempotencyKey ||
    `CSC21251567${Math.floor(100 + Math.random() * 900)}`
  ).trim();

  // 1. Check if an application with this token_id already exists in Supabase
  try {
    const { data: existingRows } = await supabase
      .from('applications')
      .select('*')
      .eq('token_id', finalAppId)
      .limit(5);

    if (existingRows && existingRows.length > 0) {
      const activeExisting = existingRows.find(r => !isDeletedApplicationRecord(r));
      const hasExplicitIdempotency =
        Boolean(input.idempotencyKey) &&
        activeExisting &&
        String(activeExisting.full_name || '').trim().toLowerCase() === String(input.customerName || '').trim().toLowerCase() &&
        String(activeExisting.service_selected || '').trim().toLowerCase() === String(input.selectedService || '').trim().toLowerCase();

      if (hasExplicitIdempotency && activeExisting) {
        console.log(`[SupabaseServer] Idempotent hit: Application ${finalAppId} already persisted.`);
        return {
          success: true,
          appId: finalAppId,
          data: activeExisting
        };
      }

      // Token collision with an existing or previously deleted row!
      // Generate a strictly higher, unused token_id so we NEVER resurrect a deleted record or overwrite an existing one.
      const supaMaxSeq = await getHighestSupabaseTokenSeq();
      const nextSafeSeq = Math.max(supaMaxSeq + 1, Math.floor(1000 + Math.random() * 9000));
      finalAppId = `CSC21251567${String(nextSafeSeq).padStart(3, '0')}`;
      console.log(`[SupabaseServer] Resolved token collision; assigned fresh token_id: ${finalAppId}`);
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

/**
 * Syncs a Web Push Subscription record to Supabase table 'push_subscriptions'
 */
export async function syncPushSubscriptionToSupabase(record: any): Promise<{ success: boolean; error?: string }> {
  const supabase = getServerSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };

  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        id: record.id,
        endpoint: record.endpoint,
        p256dh: record.keys?.p256dh,
        auth: record.keys?.auth,
        device_type: record.deviceType || 'unknown',
        user_agent: record.userAgent,
        preferences: record.preferences,
        status: record.status || 'active',
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        last_delivery_at: record.lastDeliveryAt
      }, { onConflict: 'endpoint' });

    if (error) {
      // Table might not exist yet; log clear info without breaking
      console.warn('[SupabaseServer] push_subscriptions table sync notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('[SupabaseServer] push_subscriptions sync exception:', err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Syncs a Push Notification broadcast log to Supabase table 'push_notifications_log'
 */
export async function syncPushNotificationToSupabase(record: any): Promise<{ success: boolean; error?: string }> {
  const supabase = getServerSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };

  try {
    const { error } = await supabase
      .from('push_notifications_log')
      .insert({
        id: record.id,
        title: record.title,
        body: record.body,
        category: record.category,
        url: record.url,
        post_id: record.postId,
        stats: record.stats,
        sent_at: record.sentAt,
        sent_by: record.sentBy || 'Admin'
      });

    if (error) {
      console.warn('[SupabaseServer] push_notifications_log table sync notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

