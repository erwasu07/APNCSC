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

## Validation & Verification
- `tsc --noEmit`: 0 errors.
- `compile_applet`: Build succeeded cleanly.
- `SARKARI_DATA` Audit: 136 total records verified (13 open, 3 upcoming, 120 closed, 0 unknown).
- Port 3000 Dev Server: Serving HTTP 200 OK.
