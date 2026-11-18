#!/usr/bin/env node
/**
 * Automated Page Quality, SSR, Metadata, Security Header & Broken-Link Audit
 * Runs against local or preview Express SSR server (default: http://127.0.0.1:3000).
 */

const BASE = (process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');

function stripHtmlToText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#039;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRootHtml(fullHtml) {
  const startMatch = fullHtml.match(/<div\s+id=["']root["']\s*>/i);
  if (!startMatch) return '';
  const startIdx = startMatch.index + startMatch[0].length;
  const bodyEnd = fullHtml.search(/<\/body>/i);
  const scriptIdx = fullHtml.indexOf('<script', startIdx);
  const endIdx =
    scriptIdx !== -1 && (bodyEnd === -1 || scriptIdx < bodyEnd)
      ? scriptIdx
      : bodyEnd !== -1
      ? bodyEnd
      : fullHtml.length;
  return fullHtml.slice(startIdx, endIdx);
}

function countWords(text) {
  const clean = String(text || '').trim();
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}

async function discoverSampleRoutes() {
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) {
    throw new Error(`Failed to fetch /sitemap.xml: HTTP ${res.status}`);
  }
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    try {
      const u = new URL(m[1]);
      return u.pathname + u.search;
    } catch {
      return m[1];
    }
  });
  const firstPost = locs.find((l) => l.startsWith('/post/'));
  const secondPost = locs.find((l) => l.startsWith('/post/') && l !== firstPost);
  const firstService = locs.find((l) => l.startsWith('/service/'));
  const firstScheme = locs.find((l) => l.startsWith('/scheme/'));
  return {
    locs,
    samples: [firstPost, secondPost, firstService, firstScheme].filter(Boolean),
  };
}

async function main() {
  console.log(`\nRunning CSC DOST SSR & AdSense Readiness Audit against ${BASE}\n`);

  const { locs, samples } = await discoverSampleRoutes();
  console.log(`Sitemap URLs discovered: ${locs.length}`);

  const coreRoutes = [
    '/',
    '/jobs',
    '/education',
    '/education/ignou',
    '/schemes',
    '/services',
    '/tools',
    '/tools/image-compressor',
    '/tools/passport-photo-maker',
    '/calculators',
    '/deadlines',
    '/archive',
    '/about-us',
    '/contact-us',
    '/editorial-policy',
    '/privacy-policy',
    '/terms-of-service',
    '/disclaimer',
    '/refund-policy',
    ...samples,
  ];

  const seenTitles = new Map();
  const seenDescs = new Map();
  const discoveredInternalLinks = new Set();
  const failures = [];
  const warnings = [];

  for (const route of coreRoutes) {
    const res = await fetch(`${BASE}${route}`);
    const html = await res.text();

    if (res.status !== 200) {
      failures.push(`[STATUS] ${route} returned HTTP ${res.status} (expected 200)`);
      continue;
    }

    // Security headers check on root + first few pages
    for (const hdr of [
      'x-content-type-options',
      'x-frame-options',
      'referrer-policy',
      'permissions-policy',
    ]) {
      if (!res.headers.get(hdr)) {
        failures.push(`[HEADER] ${route} missing ${hdr}`);
      }
    }

    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    if (!title) {
      failures.push(`[TITLE] ${route} missing <title>`);
    } else if (seenTitles.has(title)) {
      failures.push(`[DUP TITLE] ${route} shares <title> with ${seenTitles.get(title)}: "${title}"`);
    } else {
      seenTitles.set(title, route);
    }

    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
    const desc = descMatch ? descMatch[1].trim() : '';
    if (!desc) {
      failures.push(`[META DESC] ${route} missing <meta name="description">`);
    } else if (seenDescs.has(desc)) {
      failures.push(`[DUP DESC] ${route} shares meta description with ${seenDescs.get(desc)}`);
    } else {
      seenDescs.set(desc, route);
    }

    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    if (!canonicalMatch || !canonicalMatch[1].startsWith('https://www.cscdost.com')) {
      failures.push(`[CANONICAL] ${route} invalid canonical: ${canonicalMatch?.[1] || 'none'}`);
    }

    if (/Please enable JavaScript/i.test(html)) {
      failures.push(`[NOSCRIPT] ${route} still contains "Please enable JavaScript"`);
    }

    if (/"@type"\s*:\s*"JobPosting"/i.test(html)) {
      failures.push(`[SCHEMA] ${route} still emits prohibited JobPosting JSON-LD`);
    }

    const rootHtml = extractRootHtml(html);
    const h1Count = (rootHtml.match(/<h1\b/gi) || []).length;
    if (h1Count !== 1) {
      failures.push(`[H1] ${route} expected 1 <h1> in SSR root, found ${h1Count}`);
    }

    const rootText = stripHtmlToText(rootHtml);
    const wordCount = countWords(rootText);
    const minWords =
      route === '/archive' || route === '/deadlines' ? 120 : 350;
    if (wordCount < minWords) {
      warnings.push(`[WORDS] ${route} has ${wordCount} words in SSR root (< ${minWords})`);
    }

    const hasDisclosure = /not an official government website|not a government website/i.test(rootText);
    if (!hasDisclosure) {
      failures.push(`[DISCLOSURE] ${route} missing non-government portal disclosure text`);
    }

    // Collect internal links from key hubs
    if (route === '/' || route === '/jobs' || route === '/education' || route === '/schemes') {
      for (const m of rootHtml.matchAll(/href="(\/[^"#?]*)/g)) {
        const href = m[1].trim();
        if (href && !href.startsWith('/api/')) {
          discoveredInternalLinks.add(href);
        }
      }
    }

    console.log(
      `PASS ${route.padEnd(42)} | HTTP ${res.status} | H1=${h1Count} | ${String(wordCount).padStart(4)} words | title=${title.length}ch`
    );
  }

  // Verify 404 handling for non-existent routes and unpublished drafts
  const notFoundChecks = ['/non-existent-page-404-check', '/scheme/jk-domicile-certificate-guide-draft'];
  for (const nfRoute of notFoundChecks) {
    const res = await fetch(`${BASE}${nfRoute}`);
    if (res.status !== 404) {
      failures.push(`[404 CHECK] ${nfRoute} returned HTTP ${res.status} (expected 404)`);
    } else {
      console.log(`PASS ${nfRoute.padEnd(42)} | HTTP 404 (properly hidden/not found)`);
    }
  }

  // Verify internal links from hubs don't 404/500 (bounded sample up to 60 unique paths)
  const linksToTest = [...discoveredInternalLinks].slice(0, 60);
  let brokenLinks = 0;
  for (const link of linksToTest) {
    const res = await fetch(`${BASE}${link}`, { redirect: 'manual' });
    if (res.status >= 400) {
      brokenLinks++;
      failures.push(`[BROKEN LINK] ${link} returned HTTP ${res.status}`);
    }
  }
  console.log(`\nChecked ${linksToTest.length} discovered internal links: ${brokenLinks} broken.`);

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const w of warnings) console.log(`  - ${w}`);
  }

  if (failures.length > 0) {
    console.error(`\nAudit FAILED (${failures.length} issues):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log('\nALL AUDIT CHECKS PASSED!\n');
}

main().catch((err) => {
  console.error('Audit script crashed:', err);
  process.exit(1);
});
