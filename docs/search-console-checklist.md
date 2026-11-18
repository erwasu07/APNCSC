# Google Search Console Verification & Indexing Checklist (`https://www.cscdost.com`)

## 1. Domain Property & Sitemap Submission
1. Open **Google Search Console** → verify property **`https://www.cscdost.com`** (head meta tag already present in `index.html`).
2. Go to **Indexing → Sitemaps** and submit:
   - `https://www.cscdost.com/sitemap.xml`
3. Confirm status shows **Success** and matches the number of published, indexable URLs (no `/admin`, `/staff`, `/apply`, `/track`, draft guides, `noindex` posts, or duplicate redirects).
4. Verify **`https://www.cscdost.com/robots.txt`** loads cleanly and does not block `/api/og-image/`, `/api/thumbnails/`, `/post/`, `/service/`, `/scheme/`, `/tools/`, or CSS/JS `/assets/*`.
5. Verify **`https://www.cscdost.com/ads.txt`** returns HTTP `200` with `google.com, pub-3600904217061779, DIRECT, f08c47fec0942fa0`.

---

## 2. Live URL Inspection & Request Indexing
Run **URL Inspection → Test Live URL → Request Indexing** on:
- `https://www.cscdost.com/` (Homepage — verify SSR H1, non-government disclosure strip, and policy links are visible in **View Tested Page → HTML**)
- `https://www.cscdost.com/jobs`
- `https://www.cscdost.com/schemes`
- `https://www.cscdost.com/contact-us` (confirm `urnxtfd@gmail.com` appears in live HTML)
- `https://www.cscdost.com/refund-policy` (confirm service tiers and refund policy appear in live HTML)
- **5 representative post URLs** (one JKSSB, one SSC, one RRB, one Kashmir University / Cluster University, one IGNOU post)

### Expected Live Test Signals
- **HTTP Status:** `200 OK`
- **Canonical URL:** Exact clean path without query strings (e.g., `/jobs?tab=exams` has `<link rel="canonical" href="https://www.cscdost.com/jobs" />` and `<meta name="robots" content="noindex, follow" />`).
- **Response Headers (`curl -sI`):**
  - `Cache-Control: public, max-age=0, must-revalidate` on HTML pages
  - `Cache-Control: public, max-age=31536000, immutable` on `/assets/*.js` and `/assets/*.css`
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`

---

## 3. Troubleshooting Indexing Exclusions

### A. `"Crawled - currently not indexed"`
Usually indicates Googlebot fetched the page and considered it thin, repetitive, or near-duplicate:
1. Open the **CSC Console → Content Health** tab (`/jobs#staff`) and check whether the URL appears under **Class C (Thin / < 300 words)** or **Class D (Duplicate / Broken / Copied)**.
2. Click **Edit & Enrich** to expand original notification summaries, eligibility, selection steps, documents required, and FAQs until main-content word count reaches **400+ words** with **<= 2 consecutive sentences copied** from official PDFs.
3. If an advertisement is genuinely short or superseded:
   - Mark **`noindex, follow`** (or click **Bulk Noindex All Class C**) so thin stubs leave the sitemap while staying accessible to visitors.
   - If another URL covers the exact same notice, click **Merge with 301 Redirect** pointing to the stronger canonical post.
4. Confirm `"Last updated"` and official `.gov.in` / university link are present, then re-test in URL Inspection.

### B. `"Discovered - currently not indexed"`
Usually indicates crawl budget throttling or weak internal linking:
1. Verify the URL is not blocked by `robots.txt`, does not emit `noindex`, and returns HTTP `200` within `< 1s`.
2. Ensure important evergreen guides (`/scheme/*`) and active notices are linked from `/`, `/jobs`, `/education`, `/schemes`, and **Related notices** boxes on peer pages.
3. Confirm query-string filter URLs (`/jobs?tab=...`, `/jobs?org=...`) emit `noindex, follow` + clean canonical so Googlebot spends crawl budget on canonical pages rather than filter permutations.
4. Re-submit `/sitemap.xml` once after batch updates and request indexing only for top-priority updated URLs (avoid spamming Request Indexing on low-value expired pages).
