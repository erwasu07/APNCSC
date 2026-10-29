# PayU Hosted Checkout & Dual Payment System Implementation Plan

A production-grade, secure integration of **PayU India Hosted Checkout** for CSC DOST ([cscdost.com](https://www.cscdost.com)), offering transparent payment choices (**PayU Online** vs. **Pay Later / Pay at Centre**) across all citizen service checkouts, authoritative server-side pricing, cryptographic request/response verification, post-checkout tracking reconciliation, and staff payment management.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Credential Privacy & Security**:
> - `PAYU_MERCHANT_KEY`, `PAYU_MERCHANT_SALT`, `PAYU_ENV=test`, and `APP_BASE_URL` will be configured privately in Vercel environment variables.
> - The Salt is strictly server-side and will never be exposed to frontend code, browser responses, logs, Git, or `VITE_*` variables.
> - The integration remains in **Test Mode** until live production credentials are confirmed in Vercel.

- **Dual Payment Choices on All Services**:
  - **Online Payment**: PayU Hosted Checkout (Cards, Net Banking, UPI, Wallets) with server-computed fees and cryptographic hash generation.
  - **Pay Later / Pay at Centre**: Submit application immediately without upfront payment; payment is collected offline upon visiting the CSC centre or counter. For physical items (e.g. PVC Card prints), the offline option is clearly labeled *Pay at Centre / Cash on Delivery*.
- **Authoritative Price Enforcement**:
  - Prices are calculated strictly on the backend using the authorized service catalogue (`servicesData.ts`) and official notification fee schedules.
  - Client-submitted amounts are never trusted.
  - Transparent fee separation: Government/Official Department Fee vs. CSC DOST VLE Service Charge (default ₹70).
- **Post-Submission Flexibility**:
  - Any unpaid offline application or abandoned checkout can be paid online later directly through the Tracking Page (`/track` or modal) via PayU with one click.
- **Staff Operations & Auditability**:
  - Authorized staff can record physical cash collections with receipt numbers, staff username, and timestamps in an audit log.
  - Staff can trigger an on-demand "Recheck Payment" action that queries PayU's Verify Payment API (`verify_payment`) in real time.

---

### 1. Overview & Core Concept

- **What It Does**:
  Provides a seamless, trustworthy payment experience for citizens applying for government forms, certificates, job recruitments, university admissions, and PVC cards on CSC DOST. Citizens can choose between instant digital settlement through PayU India or paying offline upon counter visit.
- **Target Audience / Persona**:
  Citizens across Jammu & Kashmir and India applying for PAN cards, Aadhaar assistance, JKSSB/Army/RRB/SSC jobs, domicile certificates, and academic admissions, along with CSC VLE operators managing daily counter operations.
- **Key Value**:
  Eliminates drop-offs by providing offline flexibility while automating online payment collection, reconciliation, and official receipt generation without exposing merchant credentials.

---

### 2. User Experience & Visual Design

#### Key User Flows

```
[Citizen Selects Service / Form]
               │
               ▼
   [Step 1: Applicant Details]
               │
               ▼
   [Step 2: Upload Documents]
               │
               ▼
   [Step 3: Review & Payment Options]
      ├── Option A: Online Payment (PayU)
      │     - Shows Itemised Breakdown (Govt Fee + CSC Charge)
      │     - Application saved first with Token ID (CSC21251567xxx)
      │     - Redirects to PayU Hosted Checkout (secure.payu.in)
      │     - Returns to /track with verified digital receipt
      │
      └── Option B: Pay Later / Pay at Centre (or Cash on Delivery for PVC prints)
            - Application saved immediately
            - Tracking token generated with status: "Unpaid - Pay at Centre"
            - Instant receipt generated with "Pay Online Now" option anytime
```

#### Visual Identity & Layout
- **Design System**: Matches CSC DOST's clean government portal theme (Slate `#102A43`, Royal Blue `#2563EB`, Emerald Green `#16A34A`, Amber `#D97706`).
- **Payment Method Selection**: Clean interactive card tiles with radio controls, clear badges, and explanatory subtitles (no static pill slop).
- **Itemised Pricing Box**: Open labelled rows separating Official Department Fee, CSC DOST Service Charge, and Delivery Fee (if applicable).
- **Tracking & Receipt**: Distinct visual states for:
  - *Application Processing Status*: `Pending Review` / `In Progress` / `Completed` / `Action Required`
  - *Payment Method*: `PayU Online Gateway` vs `Pay at CSC Centre`
  - *Payment Status*: `Paid` (Green), `Unpaid - Pay at Centre` (Amber), `Pending Verification` (Blue), `Failed` (Red).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Pre-Checkout Application Registration**:
  - *Chosen Approach*: The customer's application and uploaded files are saved to Supabase and the server database with a unique token ID (`CSC21251567xxx`) *before* redirecting to PayU.
  - *Why*: If a citizen's internet drops, browser closes, or checkout is abandoned, their application and documents remain safe. They can resume and complete payment anytime via `/track`.
- **Decision 2: Standard PayU Pre-Built Hosted Checkout vs. Custom Embedded Elements**:
  - *Chosen Approach*: Official PayU Pre-Built Hosted Checkout redirect flow (`https://test.payu.in/_payment` or `https://secure.payu.in/_payment`).
  - *Why*: Meets PCI-DSS Level 1 compliance; no card numbers, CVVs, UPI PINs, or bank credentials ever touch CSC DOST servers.
- **Decision 3: Server-Side Cryptographic Hash & Verify Payment API**:
  - *Chosen Approach*: Hashes (`sha512`) are computed exclusively on the server using `PAYU_MERCHANT_SALT`. All callbacks are validated against both the response hash and PayU's `verify_payment` server API before marking an order as `Paid`.
  - *Why*: Eliminates client-side tampering, spoofed redirects, and fake URL query parameters.
- **Decision 4: Unpaid Offline Orders Can Pay Online Later**:
  - *Chosen Approach*: Citizen entering their token in `/track` sees an outstanding balance and an interactive "Pay Online with PayU" button that initiates checkout with the exact server-verified amount.

---

### 4. Technical Architecture & Data Strategy

#### System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CITIZEN BROWSER                                 │
│  ┌───────────────────────────────┐     ┌─────────────────────────────────┐  │
│  │  ApplyDedicatedPageView       │     │  TrackDedicatedPageView         │  │
│  │  (Step 3 Dual Payment Choice) │     │  (Payment Status & Pay Online)  │  │
│  └──────────────┬────────────────┘     └────────────────┬────────────────┘  │
└─────────────────┼───────────────────────────────────────┼───────────────────┘
                  │                                       │
                  │ POST /api/applications/submit         │ POST /api/payu/initiate
                  │ POST /api/payu/initiate               │
                  ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS / VERCEL SERVER                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ server.ts                                                             │  │
│  │  ├── /api/payu/config                                                 │  │
│  │  ├── /api/payu/initiate   ──> Calculate Price & Hash (server/payu.ts) │  │
│  │  ├── /api/payu/response   ──> Verify Hash & PayU Verify Payment API   │  │
│  │  ├── /api/payu/webhook    ──> S2S Notification Reconciliation          │  │
│  │  ├── /api/payu/recheck    ──> Staff on-demand gateway status query    │  │
│  │  └── /api/admin/record-offline-payment ──> Staff Cash Receipt Log     │  │
│  └──────────────────┬─────────────────────────────────┬──────────────────┘  │
└─────────────────────┼─────────────────────────────────┼─────────────────────┘
                      │                                 │
                      ▼                                 ▼
      ┌───────────────────────────────┐ ┌─────────────────────────────────────┐
      │     PAYU INDIA GATEWAY        │ │    SUPABASE & LOCAL DATABASE        │
      │  - Hosted Checkout Page       │ │  - public.applications              │
      │  - Verify API (command=2)     │ │  - public.payment_transactions      │
      │  - Server Webhooks            │ │  - Local data/db.json audit records │
      └───────────────────────────────┘ └─────────────────────────────────────┘
```

#### Database Schema Extensions
1. `public.applications`:
   - `payment_method`: `'online_payu' | 'pay_at_centre' | 'online_upi'`
   - `payment_status`: `'unpaid' | 'pending_verification' | 'paid' | 'failed' | 'cancelled' | 'not_required'`
   - `amount_due`: numeric
   - `amount_paid`: numeric
   - `gateway_txnid`: text
   - `payu_mihpayid`: text
   - `payu_bank_ref`: text
   - `paid_at`: timestamptz
   - `offline_receipt_no`: text
   - `offline_collected_by`: text
   - `offline_collected_at`: timestamptz
2. `public.payment_transactions`:
   - `txnid` (Unique merchant transaction ID, e.g. `PAYU_1740000000_A1B2C3`)
   - `token_id` (Application reference `CSC21251567xxx`)
   - `customer_name`, `customer_phone`, `customer_email`, `service_name`
   - `payment_method`, `total_amount`, `currency: 'INR'`, `status`
   - `payu_mihpayid`, `bank_ref_num`, `hash_verified`, `api_verified`
   - `request_payload`, `response_payload`, `verification_payload`
   - Timestamps & RLS policies for citizen read and staff audit.

---

### 5. Implementation Phases (Execution Steps)

1. **Step 1: Frontend Checkout Integration (`ApplyDedicatedPageView.tsx`)**
   - Implement interactive dual payment selector (PayU Online vs. Pay at Centre / Cash).
   - Display itemised breakdown: Govt Fee + CSC Assistance Fee + Delivery Fee.
   - For PayU Online: Save application, call `/api/payu/initiate`, auto-submit form to PayU Hosted Checkout.
   - For Pay at Centre: Save application with `payment_status: 'unpaid'`, render receipt with tracking link.
2. **Step 2: Tracking & Post-Submission Pay-Online (`TrackDedicatedPageView.tsx` & `TrackApplicationModal.tsx`)**
   - Display separated Payment Method and Payment Status badges.
   - Handle redirect callbacks: `?payment=success&txnid=...` (success banner) and `?payment=failed` (friendly retry banner).
   - Add "Pay Online with PayU" action for unpaid applications, allowing immediate checkout with server-calculated balance.
3. **Step 3: Admin & Staff Management Tools (`AdminDashboard.tsx`)**
   - Show Payment Method, Payment Status, Amount, and Gateway Txn ID in applications table & details drawer.
   - Add modal for authorized staff to record offline cash collections (Receipt #, Staff Name, Amount).
   - Add "Recheck Payment" button calling `/api/payu/recheck` to query PayU's Verify API.
   - Render complete payment ledger under Payments tab.
4. **Step 4: Environment & Documentation (`.env.example` & Final Report)**
   - Add server-only environment variable placeholders.
   - Provide exact PayU dashboard callback/webhook configuration URLs.
   - Provide test results and step-by-step test-to-live instructions.
5. **Step 5: Compilation & Verification**
   - Run `compile_applet` and `lint_applet` to verify clean build with zero TypeScript errors.
