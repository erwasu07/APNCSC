/**
 * Getform.io & Formspree Integration Helper
 * Sends application form submissions directly to Getform / Formspree or custom form endpoints
 * supporting multipart/form-data and file attachments.
 */

export function getFormEndpoint(): string {
  return (
    localStorage.getItem('cscdost_getform_endpoint') ||
    import.meta.env.VITE_GETFORM_ENDPOINT ||
    process.env.VITE_GETFORM_ENDPOINT ||
    'https://getform.io/f/YOUR_UNIQUE_ENDPOINT'
  );
}

export function setFormEndpoint(url: string) {
  if (url) {
    localStorage.setItem('cscdost_getform_endpoint', url);
  } else {
    localStorage.removeItem('cscdost_getform_endpoint');
  }
}

export async function saveApplicationToFormEndpoint(
  appId: string,
  payload: {
    applicantName: string;
    phoneNumber: string;
    emailAddress?: string;
    selectedService: string;
    userCategory?: string;
    paymentMode?: string;
    utrNumber?: string;
    totalAmount?: number;
    status?: string;
    submittedAt?: string;
    documents?: any[];
    [key: string]: any;
  }
): Promise<{ success: boolean; error?: string }> {
  const endpoint = getFormEndpoint();
  if (!endpoint || endpoint.includes('YOUR_UNIQUE_ENDPOINT')) {
    console.info('Getform.io / Formspree endpoint not configured yet. Set endpoint in Admin Dashboard.');
    return { success: false, error: 'Form endpoint URL not set.' };
  }

  try {
    const formData = new FormData();

    formData.append('app_id', appId);
    formData.append('full_name', payload.applicantName || payload.customerName || 'N/A');
    formData.append('whatsapp_number', payload.phoneNumber || 'N/A');
    formData.append('email_address', payload.emailAddress || 'N/A');
    formData.append('service_selected', payload.selectedService || 'General Service');
    formData.append('user_category', payload.userCategory || 'General');
    formData.append('payment_mode', payload.paymentMode || 'Pending Payment');
    formData.append('utr_number', payload.utrNumber || 'N/A');
    formData.append('total_amount', String(payload.totalAmount || 0));
    formData.append('status', payload.status || 'Pending');
    formData.append('submitted_at', payload.submittedAt || new Date().toISOString());

    // Attach document files if present
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
            console.warn('Error converting base64 dataUrl for form endpoint:', e);
          }
        }
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errText = await response.text().catch(() => '');
      return { success: false, error: errText || `Server responded with status ${response.status}` };
    }
  } catch (err: any) {
    console.warn('Getform / Formspree submission warning:', err);
    return { success: false, error: err?.message || String(err) };
  }
}
