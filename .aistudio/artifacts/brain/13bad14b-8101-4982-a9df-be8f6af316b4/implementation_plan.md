# CSC DOST Audit & Authoritative Status Engine Implementation Plan

## Overview
Comprehensive audit of existing recruitment, examination-form, and admission notices on **cscdost.com**, coupled with an authoritative, timezone-aware status calculation engine and strict intake of official circulars from the 6 target government and university portals.

---

## Completed Architecture & Audit Actions

### 1. Authoritative Asia/Kolkata Status Engine (`/src/utils/sarkariStatus.ts`)
- **IST Timezone Normalization**: All evaluations use `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'` to prevent device-clock bias.
- **Explicit Closing Times**: Accurately respects official closing times (e.g., `15:00 IST`, `17:00 IST`, `23:00 IST`). When unspecified, treats the closing date as inclusive through `23:59 IST` with an explicit informational note.
- **Multi-State Separation**:
  - **Verification Status**: `verified` vs. `needs_verification`.
  - **Application Status**: `open`, `closing_soon`, `closed`, `upcoming`, `cancelled`, `unknown`.
  - **Stage Machine**: `recruitment`, `admission`, `exam_form`, `correction`, `admit_card`, `examination`, `answer_key`, `result`, `scheme`.
- **Application Window Gate**: Non-application stages (`admit_card`, `answer_key`, `result`, `examination`) automatically yield `canApplyOnline: false` so users are directed to official links rather than assisted application filing.

### 2. Comprehensive Audit of Existing Records (`/src/data/sarkariData.ts`)
- **SSC CGL Correction**: Audited `job-ssc-cgl-2026` to its verified historical cycle:
  - **Title**: `SSC Combined Graduate Level Examination 2024 (CGL 2024) - 17,727 Posts [Applications Closed]`
  - **Advertisement No**: `Notice: Combined Graduate Level Examination 2024 (F.No. HQ-PPI03/11/2024-PP_1)`
  - **Opening & Closing**: `24/06/2024` to `27/07/2024` (23:00 IST).
  - **Fee Deadline**: `28/07/2024 (23:00 IST)` | **Correction Window**: `10/08/2024 to 11/08/2024 (23:00 IST)`.
  - **Status**: Computed as `closed` with `canApplyOnline: false`.
- **SSC CGL 2026 Tier-I City Slip (`ssc-cgl-2026-city-slip`)**: Updated to `stage: 'admit_card'` and `verificationStatus: 'verified'`.
- **RRB Calendar Notice (`rrb-ntpc-paramedical-2026`)**: Standardized with explicit calendar dates (`15/08/2026` to `31/08/2026`) and `stage: 'examination'`.
- **SSC JE Paper-I Admit Card (`ssc-je-paper-1-admit-card-2026`)**: Verified hall ticket release with `stage: 'admit_card'`.

### 3. New Authoritative Portal Notices Added
Strictly verified circulars ingested matching required categories:
1. **`jkssb-answer-key-theatre-tech-2026`** (`category: 'jkssb'`, `stage: 'answer_key'`): JKSSB Provisional Answer Key & Objection Notice for Junior Theatre Tech & Lab Technician OMR Exam (Objections open till 31/10/2026 17:00 IST).
2. **`ku-bed-special-center-notice-2026`** (`category: 'exam_forms'`, `stage: 'examination'`): University of Kashmir Examination Center Notice for B.Ed Special Education (CRC Bemina) 1st & 2nd Sem.
3. **`cus-fyugp-inter-univ-migration-2026`** (`category: 'cluster_univ'`, `stage: 'admission'`): Cluster University Srinagar Inter-University Migration Notice for FYUGP 7th & 8th Sem (Honours / Research).
4. **`army-tgc-145-course-2026`** (`category: 'army_jobs'`, `stage: 'recruitment'`): Indian Army 145th Technical Graduate Course (TGC-145) Online Recruitment Notice (Concluded 30/10/2026 at 15:00 IST).

### 4. Application Flow & Homepage Gate Enforcement
- **Homepage (`PortalHomepage.tsx`)**:
  - Filter `"active"` strictly checks `computed.applicationStatus === 'open'`, ensuring closed, upcoming, cancelled, or unverified recruitments do not crowd active listings.
  - Multi-state status badges render real-time state (`Open`, `Closing Soon (xd)`, `Upcoming`, `Cancelled`, `Closed`, `Needs Verification`).
- **Post Details Page (`SarkariDedicatedPageView.tsx`)**:
  - Concluded/closed posts present an authoritative banner with official closing time notes.
  - "Get Application Help" and "Apply Now" buttons are automatically suppressed for concluded cycles while direct official portal and notification PDF links remain fully accessible.
- **Application Page (`ApplyDedicatedPageView.tsx`)**:
  - The service select dropdown separates "Active Recruitment & Admission Notices" from "Concluded Notices (Applications Closed)".
  - Arriving at `/apply` with a concluded recruitment displays an alert warning and disables the Step 1 Continue button.

---

### 5. WhatsApp Cloud API Dispatch & Configuration Hub (`/src/components/WhatsAppBroadcaster.tsx`, `/server.ts`, `/src/dbServer.ts`)
- **Prominent "Configure WhatsApp" Button**: Positioned beside "Recheck Readiness" inside the automated dispatch section, accessible exclusively to authenticated admins.
- **Comprehensive Settings Drawer / Modal**:
  - **Connection Status**: Real server-to-Meta HTTP verification check (`POST /api/whatsapp/check-connection`), displaying live verified business name, display phone, quality rating, and code verification status. Never uses hardcoded or fake green badges.
  - **Server Secrets Checklist**: Displays configured vs. missing status for all 6 required environment variables (`WHATSAPP_CLOUD_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WABA_ID`, `META_GRAPH_API_VERSION`, `META_APP_SECRET`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`) without exposing sensitive secret values.
  - **Hosting Setup Instructions**: Detailed, step-by-step instructions for adding variables in the Vercel Project Dashboard (Settings > Environment Variables) and redeploying.
  - **Test Recipient Phone**: Normalized (`91` country code prefix), masked for safe UI preview (`+91 70068 ***67`), with a live "Send Live Test WhatsApp Notification" test button (`POST /api/whatsapp/test-send`).
  - **Destinations & API Group**: Configurable default destination and official API Group ID validation, with strict rejection of consumer invite links (`chat.whatsapp.com`).
  - **Templates**: Real template status query (`POST /api/whatsapp/refresh-template`) returning approved, pending, or rejected status from Meta Graph API.
- **Database Persistence with Env Fallbacks**: Non-secret configurations persist in `data/db.json` via `dbServer.ts` and are prioritized across all backend endpoints (`/api/whatsapp/readiness`, `/api/whatsapp/send`, test send).

---

---

### 6. Original CSC DOST Interface Restoration & SSC Examination Timetable Corrections
- **Root Cause Resolution**:
  - In `server.ts`, eliminated the unconditional injection of `substantiveBodyHtml` into `<div id="root">`, which had inadvertently supplanted the full client-side React SPA with simplified, static fallback cards.
  - Preserved a clean `<div id="root"></div>` for all standard routes (`/`, `/jobs`, `/education`, `/schemes`, `/services`, `/tools`, `/apply`, `/track`, `/post/:id`, `/service/:id`), while retaining rich `<head>` metadata (canonical links, OpenGraph, Twitter cards, and Schema.org JSON-LD). Fallback static HTML is now strictly restricted to 404 responses.
  - Restored full assisted application workflow (`/apply` via `ApplyDedicatedPageView`): 3-step form, service selection, personal details, document upload slots with file validation and compression, dynamic fee calculation, payment choices, and printable acknowledgment receipt.
- **SSC November 2026 Examination Schedule (`ssc-examination-schedule-cgept-dept-steno-cpo-nov-2026`)**:
  - Reclassified from recruitment application to `noticeType: 'date_sheet'` and `stage: 'date_sheet'`.
  - Replaced application deadlines with explicit examination dates (`17/11/2026 – 28/11/2026`): Coast Guard CGEPT (17–18 Nov 2026), Annual Departmental Typing & Steno Skill Test (20–21 Nov 2026), and Sub-Inspector in Delhi Police & CAPFs Paper-II (28 Nov 2026).
  - Omitted irrelevant vacancies, fee requirements, age criteria, and generic OTR application steps.
  - Formulated explicit, verified candidate action guidelines strictly based on Commission Notice `F. No. HQ-C1101/9/2026-C1/1` detailing target candidate groups (CGEPT candidates, Central Government departmental candidates, and Paper-I & PET/PST qualified Sub-Inspector candidates) and required actions (monitoring `ssc.gov.in`, checking city intimation slips, downloading e-Admit Cards, and mandatory exam-day entry protocols).

### 7. Blank Screen Resolution & Sandboxed Iframe Resilience (`/#privacy`)
- **Root Cause Analysis**:
  1. **Storage Access Denials in Sandboxed Iframes**: Direct, unguarded access to `window.localStorage` and `window.sessionStorage` in `supabase.ts`, `firebase.ts`, `getform.ts`, `ThemeContext.tsx`, `AdminDashboard.tsx`, `WhatsAppBroadcaster.tsx`, `NotificationPreferencesModal.tsx`, and `webPushClient.ts` threw uncaught `DOMException: Access is denied for this document` when previewed in cross-origin / restrictive iframe contexts.
  2. **Uncaught Error in `LegalPageView.tsx`**: Direct subscript access on `LEGAL_PAGE_CONFIG[pageType].title` caused an unhandled `TypeError` if `pageType` was not perfectly matched.
  3. **Hash and Query Routing Mismatch**: Routes like `/#privacy`, `/#/privacy`, and `?appParams=privacy` were not unified in `parseRoute`, preventing proper mounting of either the interactive Privacy Policy modal or the standalone Legal view.
  4. **Lack of React Error Boundary**: Absence of an Error Boundary in `main.tsx` meant any single render exception immediately collapsed the entire React tree into a blank white screen.
- **Architectural Fixes Applied**:
  - **`ErrorBoundary.tsx`**: Added an enterprise-grade error boundary in `src/components/ErrorBoundary.tsx` wrapping the application root in `src/main.tsx`. Provides user-facing diagnostics, a "Return to Portal Home" action, and an in-place "Reload Portal" recovery button.
  - **Storage Hardening**: Wrapped all `localStorage` and `sessionStorage` accesses in defensive try-catch wrappers (`getSafeLocal`, `setSafeLocal`, `getSafeSession`, `setSafeSession`) with safe fallbacks across the entire codebase.
  - **Environment Variable Protection**: Safely guarded `import.meta.env` and `process.env` in `src/lib/firebase.ts` with optional chaining and fallback configurations.
  - **Unified Route Parsing (`App.tsx`)**: Upgraded `parseRoute()` to flawlessly resolve:
    - Hash triggers on the homepage (`/#privacy`, `/#terms`, `/#disclaimer`, `/#about`, `/#contact`, `/#refund`) to open the interactive, accessible modal over the portal.
    - Path and hash-path routing (`/privacy-policy`, `/privacy`, `/#/privacy`, `?appParams=privacy`) to render `LegalPageView` seamlessly with portal Navbar and breadcrumbs.
  - **Resilient Fallback in `LegalPageView.tsx`**: Added default `safePageType = (pageType && LEGAL_PAGE_CONFIG[pageType]) ? pageType : 'privacy'` and guarded `window.scrollTo`.

## Validation & Verification
- `tsc --noEmit`: 0 errors.
- `lint_applet`: Passed with 0 errors.
- `compile_applet`: Production build succeeded cleanly.
- `npm run build`: Production client and server bundles built in 15.07s with zero errors.
- Headless SSR & Component Execution Tests:
  - `<ErrorBoundary><ThemeProvider><App /></ThemeProvider></ErrorBoundary>` rendered cleanly (39,518 chars).
  - `PrivacyPolicyModal` rendered cleanly (34,489 chars).
  - `LegalPageView` across all legal document types rendered cleanly with 0 errors.
  - `PortalHomepage` (198,780 chars) and `AdminDashboard` (4,076 chars) rendered cleanly.
- Live HTTP Endpoint Tests:
  - `GET /`: 200 OK with clean `<div id="root"></div>` and full metadata.
  - `GET /privacy-policy`: 200 OK with clean `<div id="root"></div>`.
  - `GET /apply`: 200 OK with clean `<div id="root"></div>`.
  - `GET /api/public-data`: 200 OK.
