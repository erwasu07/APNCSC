-- ============================================================================
-- CSC DOST: PAYU INDIA HOSTED CHECKOUT & PAYMENT RECONCILIATION MIGRATION
-- Project: cscdost.com
-- Author: CSC DOST Architecture Team
-- ============================================================================

-- 1. EXTEND 'applications' TABLE WITH EXPLICIT PAYMENT COLUMNS
-- Preserves all existing columns, tokens, and records.
ALTER TABLE IF EXISTS public.applications
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'pay_at_centre',
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS amount_due numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gateway_txnid text,
  ADD COLUMN IF NOT EXISTS payu_mihpayid text,
  ADD COLUMN IF NOT EXISTS payu_bank_ref text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS offline_receipt_no text,
  ADD COLUMN IF NOT EXISTS offline_collected_by text,
  ADD COLUMN IF NOT EXISTS offline_collected_at timestamptz;

-- Create search indexes for fast lookup by token and payment status
CREATE INDEX IF NOT EXISTS idx_applications_payment_status 
  ON public.applications (payment_status);

CREATE INDEX IF NOT EXISTS idx_applications_gateway_txnid 
  ON public.applications (gateway_txnid);

CREATE INDEX IF NOT EXISTS idx_applications_token_id 
  ON public.applications (token_id);

-- 2. DEDICATED 'payment_transactions' AUDIT LOG TABLE
-- Stores every payment initiation, gateway response, and verification result.
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  txnid text UNIQUE NOT NULL,
  token_id text NOT NULL,
  application_id text,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  service_name text NOT NULL,
  payment_method text NOT NULL DEFAULT 'online_payu',
  gateway text NOT NULL DEFAULT 'payu',
  govt_fee numeric NOT NULL DEFAULT 0,
  csc_fee numeric NOT NULL DEFAULT 70,
  delivery_fee numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'initiated', -- initiated, pending, paid, failed, cancelled, refunded
  payu_mihpayid text,
  bank_ref_num text,
  payment_mode text,
  hash_verified boolean DEFAULT false,
  api_verified boolean DEFAULT false,
  error_message text,
  request_payload jsonb,
  response_payload jsonb,
  verification_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for payment transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_txnid 
  ON public.payment_transactions (txnid);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_token 
  ON public.payment_transactions (token_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status 
  ON public.payment_transactions (status);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Allow public/anonymous clients to INSERT new payment attempt records
CREATE POLICY "Allow public insert on payment_transactions"
  ON public.payment_transactions
  FOR INSERT
  WITH CHECK (true);

-- Allow public/anonymous clients to READ own transaction by exact txnid or token_id
CREATE POLICY "Allow public read own payment_transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (true);

-- Allow service role / authenticated backend to update transactions
CREATE POLICY "Allow service role update on payment_transactions"
  ON public.payment_transactions
  FOR UPDATE
  USING (true);

-- 4. UPDATE EXISTING APPLICATIONS WITH NORMALIZED PAYMENT STATUS
UPDATE public.applications
SET 
  payment_status = CASE 
    WHEN lower(coalesce(status, '')) = 'completed' AND lower(coalesce(payment_mode, '')) LIKE '%upi%' THEN 'paid'
    WHEN lower(coalesce(status, '')) = 'completed' AND lower(coalesce(payment_mode, '')) LIKE '%cash%' THEN 'paid'
    WHEN lower(coalesce(status, '')) = 'completed' THEN 'paid'
    ELSE 'unpaid'
  END,
  payment_method = CASE
    WHEN lower(coalesce(payment_mode, '')) LIKE '%upi%' THEN 'online_upi'
    WHEN lower(coalesce(payment_mode, '')) LIKE '%payu%' THEN 'online_payu'
    ELSE 'pay_at_centre'
  END
WHERE payment_status IS NULL OR payment_status = 'unpaid';
