import crypto from 'crypto';
import { SERVICES_LIST } from '../servicesData';
import { SARKARI_DATA } from '../data/sarkariData';

// Dynamic getters for environment variables (ensures runtime access in Vercel Serverless / Node)
export function getPayUMerchantKey(): string {
  return (
    process.env.PAYU_MERCHANT_KEY ||
    process.env.PAYU_KEY ||
    ''
  ).trim();
}

export function getPayUMerchantSalt(): string {
  return (
    process.env.PAYU_MERCHANT_SALT ||
    process.env.PAYU_SALT ||
    ''
  ).trim();
}

export function getPayUEnv(): string {
  return (process.env.PAYU_ENV || 'test').toLowerCase().trim();
}

export function getAppBaseUrl(): string {
  return (process.env.APP_BASE_URL || 'https://www.cscdost.com').replace(/\/+$/, '');
}

export function getPayUPaymentUrl(): string {
  const env = getPayUEnv();
  return env === 'production' || env === 'prod' || env === 'live'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';
}

export function getPayUVerifyUrl(): string {
  const env = getPayUEnv();
  return env === 'production' || env === 'prod' || env === 'live'
    ? 'https://info.payu.in/merchant/postservice?form=2'
    : 'https://test.payu.in/merchant/postservice?form=2';
}

// Export constants for backward compatibility
export const PAYU_MERCHANT_KEY = getPayUMerchantKey();
export const PAYU_MERCHANT_SALT = getPayUMerchantSalt();
export const PAYU_ENV = getPayUEnv();
export const APP_BASE_URL = getAppBaseUrl();
export const PAYU_PAYMENT_URL = getPayUPaymentUrl();
export const PAYU_VERIFY_URL = getPayUVerifyUrl();

/**
 * Returns true if PayU credentials are provided with non-placeholder values
 */
export function isPayUConfigured(): boolean {
  const key = getPayUMerchantKey();
  const salt = getPayUMerchantSalt();

  const isPlaceholder = (val: string) =>
    !val ||
    val.includes('<') ||
    val.includes('>') ||
    val.includes('placeholder') ||
    val === 'YOUR_KEY_HERE';

  return Boolean(key && salt && !isPlaceholder(key) && !isPlaceholder(salt));
}

export interface PayUInitiatePayload {
  appId: string;
  customerName: string;
  email?: string;
  phone: string;
  serviceName: string;
  userCategory?: string;
  amount?: number;
  deliveryOption?: 'digital' | 'centre_pickup' | 'speed_post';
}

export interface PayUInitiateResult {
  success: boolean;
  actionUrl: string;
  params: Record<string, string>;
  isMockTestMode?: boolean;
  orderSummary: {
    appId: string;
    customerName: string;
    serviceName: string;
    govtFee: number;
    cscFee: number;
    deliveryFee: number;
    totalAmount: number;
    amountFormatted: string;
  };
  error?: string;
}

/**
 * Server-Side Authoritative Price Calculator.
 * Computes exact fee from the service catalogue so client-submitted values are never trusted.
 */
export function calculateAuthoritativePrice(
  serviceNameOrId: string,
  userCategory?: string,
  deliveryOption?: string
): {
  govtFee: number;
  cscFee: number;
  deliveryFee: number;
  totalAmount: number;
  description: string;
} {
  const cleanTarget = (serviceNameOrId || '').toLowerCase().trim();

  let govtFee = 0;
  let cscFee = 70; // Standard CSC DOST service / e-mitra portal charge
  let deliveryFee = 0;

  if (deliveryOption === 'speed_post') {
    deliveryFee = 50; // Speed Post delivery for PVC print
  }

  // 1. Check services catalog
  const matchedService = SERVICES_LIST.find(
    (s) =>
      s.id.toLowerCase() === cleanTarget ||
      s.name.toLowerCase() === cleanTarget ||
      cleanTarget.includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(cleanTarget)
  );

  if (matchedService) {
    const priceStr = matchedService.price || '';
    // Parse fee strings like "₹107 (Govt Fee) + ₹70 (CSC Charge)" or "₹50 (Govt Fee) + ₹70 (CSC Charge)"
    const numMatches = priceStr.match(/₹\s*(\d+)/g);
    if (numMatches && numMatches.length > 0) {
      const parsedNums = numMatches.map((m) => parseInt(m.replace(/[^\d]/g, ''), 10)).filter((n) => !isNaN(n));
      if (parsedNums.length >= 2) {
        govtFee = parsedNums[0];
        cscFee = parsedNums[1];
      } else if (parsedNums.length === 1) {
        if (priceStr.toLowerCase().includes('govt')) {
          govtFee = parsedNums[0];
        } else {
          cscFee = parsedNums[0];
        }
      }
    }
    return {
      govtFee,
      cscFee,
      deliveryFee,
      totalAmount: Math.max(1, govtFee + cscFee + deliveryFee),
      description: matchedService.name
    };
  }

  // 2. Check Sarkari job listings
  const matchedJob = SARKARI_DATA.find(
    (item) =>
      item.id.toLowerCase() === cleanTarget ||
      item.title.toLowerCase() === cleanTarget ||
      cleanTarget.includes(item.title.toLowerCase())
  );

  if (matchedJob && matchedJob.fees) {
    const isReserved =
      userCategory &&
      (userCategory.toLowerCase().includes('sc') ||
        userCategory.toLowerCase().includes('st') ||
        userCategory.toLowerCase().includes('female'));

    const rawFee = isReserved ? matchedJob.fees.scSt : matchedJob.fees.genObc;
    const matchDigits = String(rawFee || '').match(/(\d+)/);
    if (matchDigits) {
      govtFee = parseInt(matchDigits[1], 10);
    }
    return {
      govtFee,
      cscFee: 70,
      deliveryFee,
      totalAmount: Math.max(1, govtFee + 70 + deliveryFee),
      description: matchedJob.title
    };
  }

  // 3. Fallback standard CSC consultation / application fee
  return {
    govtFee: 0,
    cscFee: 70,
    deliveryFee,
    totalAmount: Math.max(1, 70 + deliveryFee),
    description: serviceNameOrId || 'CSC DOST E-Governance Service'
  };
}

/**
 * Generates PayU Request Hash per official documentation:
 * sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function generatePayURequestHash(params: {
  key: string;
  txnid: string;
  amount: string; // Exactly 2 decimal places e.g. "177.00"
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  salt: string;
}): string {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = '',
    salt
  } = params;

  // PayU requires 11 pipe-separated parameters, then 5 empty parameters for udf6-udf10, then SALT.
  // formula: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;

  return crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();
}

/**
 * Validates PayU Response Hash per official documentation:
 * If additionalCharges:
 *   sha512(additionalCharges|SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 * Else:
 *   sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayUResponseHash(responseParams: Record<string, any>, salt: string): boolean {
  const {
    key = '',
    txnid = '',
    amount = '',
    productinfo = '',
    firstname = '',
    email = '',
    status = '',
    hash = '',
    additionalCharges,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = ''
  } = responseParams;

  if (!hash || !salt) {
    return false;
  }

  let hashSequence = '';
  if (additionalCharges && String(additionalCharges).trim().length > 0) {
    hashSequence = `${additionalCharges}|${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  } else {
    hashSequence = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  }

  const calculatedHash = crypto.createHash('sha512').update(hashSequence).digest('hex').toLowerCase();
  return calculatedHash === String(hash).toLowerCase().trim();
}

/**
 * Calls official PayU Verify Payment API to double-check and reconcile transaction status.
 * https://docs.payu.in/docs/verify-payment-api
 *
 * command: verify_payment
 * var1: txnid
 * hash: sha512(key|verify_payment|var1|SALT)
 */
export async function verifyPaymentWithPayU(txnid: string): Promise<{
  success: boolean;
  status: 'success' | 'failure' | 'pending' | 'not_found' | 'error';
  mihpayid?: string;
  bankRefNum?: string;
  amount?: number;
  mode?: string;
  message?: string;
  rawResponse?: any;
}> {
  const key = getPayUMerchantKey();
  const salt = getPayUMerchantSalt();
  const verifyUrl = getPayUVerifyUrl();

  if (!isPayUConfigured()) {
    // If running in development/test with placeholders, handle simulated test records
    if (txnid.startsWith('MOCK_') || txnid.startsWith('TEST_PAYU_')) {
      return {
        success: true,
        status: 'success',
        mihpayid: `PAYU_MOCK_${Date.now()}`,
        bankRefNum: `AXIS_${Date.now().toString().slice(-6)}`,
        amount: 70,
        mode: 'UPI',
        message: 'Mock verification completed (Test Mode)'
      };
    }

    return {
      success: false,
      status: 'error',
      message: 'PayU credentials are not configured in production environment.'
    };
  }

  try {
    const hashString = `${key}|verify_payment|${txnid}|${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();

    const bodyParams = new URLSearchParams();
    bodyParams.append('key', key);
    bodyParams.append('command', 'verify_payment');
    bodyParams.append('var1', txnid);
    bodyParams.append('hash', hash);

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    });

    if (!response.ok) {
      return {
        success: false,
        status: 'error',
        message: `PayU Verify API HTTP ${response.status}`
      };
    }

    const data: any = await response.json();

    if (data && data.status === 1 && data.transaction_details && data.transaction_details[txnid]) {
      const details = data.transaction_details[txnid];
      const txnStatus = String(details.status || '').toLowerCase();

      return {
        success: txnStatus === 'success',
        status: txnStatus === 'success' ? 'success' : txnStatus === 'pending' ? 'pending' : 'failure',
        mihpayid: details.mihpayid,
        bankRefNum: details.bank_ref_num,
        amount: Number(details.amt || details.transaction_amount || 0),
        mode: details.mode,
        message: details.error_Message || details.msg || 'Transaction verified with PayU gateway',
        rawResponse: details
      };
    }

    return {
      success: false,
      status: 'not_found',
      message: data.msg || 'Transaction details not found on PayU',
      rawResponse: data
    };
  } catch (err: any) {
    console.error('[PayU] verifyPaymentWithPayU exception:', err?.message || err);
    return {
      success: false,
      status: 'error',
      message: err?.message || 'Network error verifying payment with PayU'
    };
  }
}
