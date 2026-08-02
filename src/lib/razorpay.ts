declare global {
  interface Window {
    Razorpay: any;
  }
}

// Dynamically load Razorpay checkout script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface RazorpayPaymentOptions {
  amount: number; // in Rupees (INR)
  appId: string;
  customerName: string;
  email?: string;
  phone: string;
  serviceName: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onError: (errorMessage: string) => void;
  onDismiss?: () => void;
}

export const processRazorpayPayment = async (options: RazorpayPaymentOptions) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    options.onError('Failed to load Razorpay payment SDK. Please check your internet connection and try again.');
    return;
  }

  try {
    // 1. Create order on server
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: options.amount,
        appId: options.appId,
        customerName: options.customerName,
        email: options.email,
        phone: options.phone,
        service: options.serviceName,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.order) {
      options.onError(data.error || 'Failed to initialize Razorpay payment order with server.');
      return;
    }

    const { order, keyId } = data;

    // 2. Open Razorpay Checkout Modal
    const razorpayConfig = {
      key: keyId || 'rzp_test_TKwuWkZNJrp68J',
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'CSC DOST Portal',
      description: `Payment for ${options.serviceName}`,
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=120&auto=format&fit=crop&q=80',
      order_id: order.id,
      handler: async function (response: any) {
        try {
          // 3. Verify signature on server
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appId: options.appId
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.success) {
            options.onSuccess(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );
          } else {
            options.onError(verifyData.error || 'Razorpay payment verification failed on server.');
          }
        } catch (err: any) {
          options.onError('Server error during Razorpay payment verification: ' + err.message);
        }
      },
      prefill: {
        name: options.customerName,
        email: options.email && options.email !== 'N/A' ? options.email : '',
        contact: options.phone
      },
      notes: {
        appId: options.appId,
        service: options.serviceName
      },
      theme: {
        color: '#00a86b' // CSC Portal Emerald Green Accent
      },
      modal: {
        ondismiss: function () {
          if (options.onDismiss) {
            options.onDismiss();
          }
        }
      }
    };

    const rzp = new window.Razorpay(razorpayConfig);
    rzp.on('payment.failed', function (response: any) {
      options.onError(response.error?.description || 'Razorpay payment transaction failed.');
    });

    rzp.open();
  } catch (err: any) {
    options.onError('Exception launching Razorpay payment gateway: ' + (err.message || err));
  }
};
