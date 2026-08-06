export const UPI_ID = '7006833767-2@okbizaxis';
export const MERCHANT_NAME = 'CSC DOST';

export interface UpiPayloadParams {
  upiId?: string;
  merchantName?: string;
  amount: number;
  appId: string;
  note?: string;
}

export const generateUpiUrl = ({
  upiId = UPI_ID,
  merchantName = MERCHANT_NAME,
  amount,
  appId,
  note
}: UpiPayloadParams): string => {
  const transactionNote = note || `CSC Token ${appId}`;
  const params = new URLSearchParams({
    pa: upiId,
    pn: merchantName,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: transactionNote
  });
  return `upi://pay?${params.toString()}`;
};

export const generateAppSpecificUpiUrl = (app: 'gpay' | 'phonepe' | 'paytm' | 'bhim', params: UpiPayloadParams): string => {
  const baseUpiUrl = generateUpiUrl(params);
  const upiQuery = baseUpiUrl.replace('upi://pay?', '');

  switch (app) {
    case 'gpay':
      return `gpay://upi/pay?${upiQuery}`;
    case 'phonepe':
      return `phonepe://upi/pay?${upiQuery}`;
    case 'paytm':
      return `paytmmp://cash_wallet?featuretype=sendmoney&${upiQuery}`;
    case 'bhim':
    default:
      return baseUpiUrl;
  }
};
