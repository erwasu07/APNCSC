#!/usr/bin/env node
/**
 * Full-Site Content Quality & AdSense Readiness Audit
 *
 * Crawls every URL in /sitemap.xml PLUS all active /service/* and /services/cluster/* routes
 * from /api/audit/public-urls so that noindexed/incomplete service pages and hubs are audited
 * separately from indexable pages.
 *
 * Rules enforced:
 *  - Public hygiene: zero literal [VERIFY] or "Ask us" leaks in public HTML.
 *  - Incomplete /service/* (<11 fields or <400 words) and incomplete /services/cluster/* (<800 words or missing data)
 *    must carry <meta name="robots" content="noindex, follow"> and MUST be excluded from /sitemap.xml.
 *  - Indexable pages are tested for 50%+ pairwise 5-word-shingle overlap after stripping boilerplate chrome/footer/disclosures.
 *  - Outputs totalIndexablePages, totalNoindexedPages (noindex-because-incomplete vs other),
 *    indexable Class A/B/C/D counts, and 20 worst indexable URLs.
 */

import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3108').replace(/\/+$/, '');
const CONCURRENCY = Number(process.env.AUDIT_CONCURRENCY || 8);
const JACCARD_THRESHOLD = 0.50;

const CLASS_SEVERITY = { D: 0, C: 1, B: 2, A: 3 };

function decodeHtmlEntities(str) {
  return String(str || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&ndash;|&mdash;/gi, '-')
    .replace(/&rsquo;|&lsquo;/gi, "'")
    .replace(/&rdquo;|&ldquo;/gi, '"');
}

function extractTagAttr(html, regexList) {
  for (const re of regexList) {
    const m = html.match(re);
    if (m && m[1]) return decodeHtmlEntities(m[1]).trim();
  }
  return '';
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

function stripChromeForMainContent(rootHtml) {
  return String(rootHtml || '')
    .replace(/<header\b[^>]*class=["'][^"']*ssr-site-header[^"']*["'][^>]*>[\s\S]*?<\/header>/gi, ' ')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
}

function stripBoilerplateForShingles(rootHtml) {
  const withoutBlocks = stripChromeForMainContent(rootHtml)
    .replace(/<aside\b[\s\S]*?<\/aside>/gi, ' ')
    .replace(/<details\b[\s\S]*?<\/details>/gi, ' ');
  return htmlToPlainText(withoutBlocks)
    .replace(/CSC DOST[^.]*independent[^.]*\./gi, ' ')
    .replace(/Wasim Ahmad Khanday[^.]*\./gi, ' ')
    .replace(/Sangran Qazigund[^.]*\./gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function htmlToPlainText(html) {
  return decodeHtmlEntities(
    String(html || '')
      .replace(/<\/(p|div|li|h[1-6]|tr|section|article|br)>/gi, '. ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(text) {
  const cleaned = String(text || '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

function normalizeSentence(sentence) {
  return String(sentence || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  return clean
    .split(/(?<=[.!?।])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => countWords(s) >= 4);
}

function checkConsecutiveCopied(candidateText, sourceText, maxConsecutive = 2) {
  const srcNorm = splitSentences(sourceText || '').map(normalizeSentence);
  const candSentences = splitSentences(candidateText);
  if (srcNorm.length === 0 || candSentences.length === 0) {
    return { runLength: 0, matchedSnippet: '' };
  }
  const candNorm = candSentences.map(normalizeSentence);
  let longestRun = 0;
  let matchedSnippet = '';
  for (let i = 0; i < candNorm.length; i++) {
    for (let j = 0; j < srcNorm.length; j++) {
      let run = 0;
      while (
        i + run < candNorm.length &&
        j + run < srcNorm.length &&
        candNorm[i + run].length >= 24 &&
        candNorm[i + run] === srcNorm[j + run]
      ) {
        run++;
      }
      if (run > longestRun) {
        longestRun = run;
        if (run > maxConsecutive) {
          matchedSnippet = candSentences.slice(i, i + run).join(' ').slice(0, 160);
        }
      }
    }
  }
  return { runLength: longestRun, matchedSnippet };
}

function buildWordShingles(text, size = 5) {
  const words = String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  const shingles = new Set();
  if (words.length < size) {
    if (words.length > 0) shingles.add(words.join(' '));
    return shingles;
  }
  for (let i = 0; i <= words.length - size; i++) {
    shingles.add(words.slice(i, i + size).join(' '));
  }
  return shingles;
}

function jaccardSimilarity(a, b) {
  if (!a || !b || a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const item of small) {
    if (large.has(item)) inter++;
  }
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function detectOutboundOfficialLinks(html) {
  const links = new Set();
  const re = /href=["'](https?:\/\/[^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    try {
      const host = new URL(href).hostname.toLowerCase();
      if (host.includes('cscdost.com')) continue;
      if (
        host.endsWith('.gov.in') ||
        host.endsWith('.nic.in') ||
        host.endsWith('.ac.in') ||
        host.endsWith('.edu.in') ||
        host.includes('kashmiruniversity') ||
        host.includes('cusrinagar') ||
        host.includes('coeju.com') ||
        host.includes('ntaonline.in') ||
        host.includes('jkb.bank.in') ||
        host.includes('parikshasaarthi.in') ||
        host.includes('cdac.in') ||
        host.includes('ignou') ||
        host.includes('ibps') ||
        host.includes('jkbank') ||
        host.includes('samarth') ||
        host.includes('digilocker')
      ) {
        links.add(href);
      }
    } catch {}
  }
  return Array.from(links);
}

function classifyPage(item) {
  const reasons = [];
  const cleanPath = item.path || '/';
  const isPostRoute = /^\/(post|job|notice)\//i.test(cleanPath);
  const isServiceRoute = /^\/service\//i.test(cleanPath);
  const isClusterHubRoute = /^\/services\/cluster\//i.test(cleanPath);
  const isToolOrUtilityRoute =
    /^\/tools(\/|$)/i.test(cleanPath) ||
    cleanPath === '/calculators' ||
    cleanPath === '/archive';

  if (item.httpStatus !== 200) {
    reasons.push(`HTTP ${item.httpStatus} (expected 200)`);
  }
  if (item.canonicalMismatch) {
    reasons.push('Canonical URL does not match requested path');
  }
  if (!item.title || item.title.length < 10) {
    reasons.push('Missing or very short <title>');
  }
  if (!item.metaDescription || item.metaDescription.length < 30) {
    reasons.push('Missing or weak <meta name="description">');
  }
  if (item.h1Count !== 1) {
    reasons.push(`Expected 1 <h1>, found ${item.h1Count}`);
  }
  if (item.hasVerifyLeak) {
    reasons.push('Literal [VERIFY] string leaked in public HTML');
  }
  if (item.hasAskUsLeak) {
    reasons.push('Placeholder "Ask us" leaked in public HTML');
  }
  if (item.isNoindex && item.inSitemap) {
    reasons.push('Noindex page is improperly listed inside /sitemap.xml');
  }

  if (item.httpStatus >= 400 || item.httpStatus === 0 || item.httpStatus >= 300) {
    return { auditClass: 'D', reasons };
  }
  if (item.hasVerifyLeak || item.hasAskUsLeak) {
    return { auditClass: 'D', reasons };
  }
  if (item.isNoindex && item.inSitemap) {
    return { auditClass: 'D', reasons };
  }
  if (item.copiedRunLength > 2) {
    reasons.push(`${item.copiedRunLength} consecutive sentences match raw source (>2)`);
    return { auditClass: 'D', reasons };
  }
  if (!item.isNoindex && item.highestJaccardScore >= JACCARD_THRESHOLD && item.nearDuplicateOf) {
    reasons.push(
      `Near-duplicate ${(item.highestJaccardScore * 100).toFixed(0)}% overlap with ${item.nearDuplicateOf}`
    );
    return { auditClass: 'D', reasons };
  }

  // Explicitly handled noindex-because-incomplete routes (not indexable thin C!)
  if (item.isNoindex) {
    if (isServiceRoute || isClusterHubRoute) {
      reasons.push(
        `Held at noindex, follow & excluded from sitemap until verified data & min words complete (${item.wordCount} words)`
      );
    } else {
      reasons.push(`Explicit noindex (${item.wordCount} words)`);
    }
    return { auditClass: 'C', reasons };
  }

  if (isServiceRoute && item.wordCount < 400) {
    reasons.push(`Indexable /service/* under 400-word requirement (${item.wordCount} words)`);
    return { auditClass: 'C', reasons };
  }
  if (isClusterHubRoute && item.wordCount < 800) {
    reasons.push(`Indexable cluster hub under 800-word requirement (${item.wordCount} words)`);
    return { auditClass: 'C', reasons };
  }

  if (item.wordCount < 300) {
    reasons.push(`Thin main content (${item.wordCount} words < 300)`);
  } else if (item.wordCount < 400) {
    reasons.push(`Below 400-word target (${item.wordCount} words)`);
  }

  if (isPostRoute && !item.hasOfficialLink) {
    reasons.push('Missing outbound official .gov.in/.nic.in/university link');
  }
  if (isPostRoute && !item.hasLastUpdated) {
    reasons.push('Missing visible Last updated / Last Verified timestamp');
  }
  if (!item.hasFaqOrHowTo && (isPostRoute || cleanPath.startsWith('/scheme/') || isServiceRoute)) {
    reasons.push('Missing FAQ or step-by-step How-to section');
  }

  if (item.wordCount < 300) {
    return { auditClass: 'C', reasons };
  }
  if (item.canonicalMismatch && isPostRoute) {
    return { auditClass: 'C', reasons };
  }

  if (
    item.wordCount >= 400 &&
    item.h1Count === 1 &&
    Boolean(item.title) &&
    Boolean(item.metaDescription) &&
    (!isPostRoute || (item.hasOfficialLink && item.hasLastUpdated)) &&
    (!isClusterHubRoute || item.wordCount >= 800)
  ) {
    return {
      auditClass: 'A',
      reasons: reasons.length > 0 ? reasons : ['Meets all Class A quality thresholds'],
    };
  }

  if (isToolOrUtilityRoute && item.wordCount >= 320 && item.h1Count === 1) {
    return { auditClass: 'B', reasons };
  }

  return { auditClass: 'B', reasons };
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function runWorker() {
    while (true) {
      const idx = cursor++;
      if (idx >= items.length) return;
      results[idx] = await worker(items[idx], idx);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => runWorker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log(`\nRunning Full-Site Content Quality & Public Hygiene Audit against ${BASE}...\n`);

  const smRes = await fetch(`${BASE}/sitemap.xml`);
  if (!smRes.ok) {
    throw new Error(`Failed to fetch ${BASE}/sitemap.xml: HTTP ${smRes.status}`);
  }
  const smXml = await smRes.text();
  const sitemapPaths = [...smXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    try {
      const u = new URL(m[1].trim());
      return u.pathname + u.search;
    } catch {
      return m[1].trim();
    }
  });
  const inSitemapSet = new Set(sitemapPaths);

  // Also fetch non-sitemap active public /service/* and /services/cluster/* URLs
  const extraPaths = [];
  const incompleteMetaMap = new Map();
  try {
    const pubRes = await fetch(`${BASE}/api/audit/public-urls`);
    if (pubRes.ok) {
      const pubData = await pubRes.json();
      for (const s of pubData.serviceEntries || []) {
        if (s?.path) {
          extraPaths.push(s.path);
          incompleteMetaMap.set(s.path, s);
        }
      }
      for (const c of pubData.clusterEntries || []) {
        if (c?.path) {
          extraPaths.push(c.path);
          incompleteMetaMap.set(c.path, c);
        }
      }
    }
  } catch {}

  const uniquePaths = Array.from(new Set([...sitemapPaths, ...extraPaths]));
  console.log(
    `Discovered ${inSitemapSet.size} URL(s) in /sitemap.xml + ${
      uniquePaths.length - inSitemapSet.size
    } non-sitemap service/cluster URL(s) (${uniquePaths.length} total).`
  );

  // Fetch stored posts to access any sourceExcerpt fields for copy detection
  const sourceExcerptByPostId = new Map();
  try {
    const postsRes = await fetch(`${BASE}/api/sarkari-posts`);
    if (postsRes.ok) {
      const posts = await postsRes.json();
      if (Array.isArray(posts)) {
        for (const p of posts) {
          if (p?.id && p?.sourceExcerpt) {
            sourceExcerptByPostId.set(p.id, String(p.sourceExcerpt));
          }
        }
      }
    }
  } catch {}

  const crawled = await mapWithConcurrency(uniquePaths, CONCURRENCY, async (urlPath) => {
    const targetUrl = `${BASE}${urlPath}`;
    const inSitemap = inSitemapSet.has(urlPath);
    try {
      const res = await fetch(targetUrl, { redirect: 'manual' });
      const html = await res.text();
      const title = extractTagAttr(html, [/<title>([\s\S]*?)<\/title>/i]);
      const metaDescription = extractTagAttr(html, [
        /<meta\s+[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i,
        /<meta\s+[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i,
      ]);
      const robotsMeta = extractTagAttr(html, [
        /<meta\s+[^>]*name=["']robots["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i,
        /<meta\s+[^>]*content=["']([\s\S]*?)["'][^>]*name=["']robots["'][^>]*>/i,
      ]);
      const canonical = extractTagAttr(html, [
        /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i,
        /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i,
      ]);

      let canonicalPath = '';
      try {
        canonicalPath = canonical ? new URL(canonical).pathname + new URL(canonical).search : '';
      } catch {
        canonicalPath = canonical;
      }
      const canonicalMismatch = !canonical || canonicalPath !== urlPath;

      const rootHtml = extractRootHtml(html);
      const mainHtml = stripChromeForMainContent(rootHtml);
      const mainText = htmlToPlainText(mainHtml);
      const wordCount = countWords(mainText);
      const h1Count = (rootHtml.match(/<h1\b/gi) || []).length;

      const isNoindex = /noindex/i.test(robotsMeta || '');
      const hasVerifyLeak = /\[VERIFY\]/i.test(`${title} ${metaDescription} ${mainText}`);
      const hasAskUsLeak =
        (urlPath.startsWith('/service/') || urlPath.startsWith('/services/cluster/') || urlPath === '/services' || urlPath === '/schemes') &&
        /\bask us\b/i.test(`${metaDescription} ${mainText}`);

      const outboundOfficialLinks = detectOutboundOfficialLinks(mainHtml);
      const hasOfficialLink = outboundOfficialLinks.length > 0;
      const hasLastUpdated = /last\s+(updated|verified)/i.test(mainText);
      const hasFaqOrHowTo =
        /frequently asked questions|\bfaq\b|how to apply|step-by-step|steps to apply|applicant guide/i.test(
          mainText
        );

      let copiedRunLength = 0;
      let matchedSnippet = '';
      if (urlPath.startsWith('/post/')) {
        const postId = urlPath.slice('/post/'.length);
        const excerpt = sourceExcerptByPostId.get(postId);
        if (excerpt) {
          const check = checkConsecutiveCopied(mainText, excerpt, 2);
          copiedRunLength = check.runLength;
          matchedSnippet = check.matchedSnippet;
        }
      }

      const shingleText = stripBoilerplateForShingles(rootHtml);

      return {
        path: urlPath,
        url: `https://www.cscdost.com${urlPath}`,
        inSitemap,
        isNoindex,
        noindexCategory:
          isNoindex && (urlPath.startsWith('/service/') || urlPath.startsWith('/services/cluster/'))
            ? 'noindex-because-incomplete'
            : isNoindex
              ? 'other-noindex'
              : 'indexable',
        httpStatus: res.status,
        title,
        metaDescription,
        robotsMeta,
        canonical,
        canonicalMismatch,
        h1Count,
        wordCount,
        hasVerifyLeak,
        hasAskUsLeak,
        hasOfficialLink,
        outboundOfficialLinks,
        hasLastUpdated,
        hasFaqOrHowTo,
        copiedRunLength,
        matchedSnippet,
        highestJaccardScore: 0,
        nearDuplicateOf: null,
        shingles: buildWordShingles(shingleText, 5),
      };
    } catch (err) {
      return {
        path: urlPath,
        url: `https://www.cscdost.com${urlPath}`,
        inSitemap,
        isNoindex: false,
        noindexCategory: 'indexable',
        httpStatus: 0,
        title: '',
        metaDescription: '',
        robotsMeta: '',
        canonical: '',
        canonicalMismatch: true,
        h1Count: 0,
        wordCount: 0,
        hasVerifyLeak: false,
        hasAskUsLeak: false,
        hasOfficialLink: false,
        outboundOfficialLinks: [],
        hasLastUpdated: false,
        hasFaqOrHowTo: false,
        copiedRunLength: 0,
        matchedSnippet: '',
        highestJaccardScore: 0,
        nearDuplicateOf: null,
        shingles: new Set(),
        fetchError: err instanceof Error ? err.message : String(err),
      };
    }
  });

  // Compute pairwise Jaccard near-duplicates (50% threshold) across INDEXABLE pages
  const duplicatePairs = [];
  for (let i = 0; i < crawled.length; i++) {
    const a = crawled[i];
    if (a.isNoindex || a.httpStatus !== 200 || a.shingles.size < 15) continue;
    for (let j = i + 1; j < crawled.length; j++) {
      const b = crawled[j];
      if (b.isNoindex || b.httpStatus !== 200 || b.shingles.size < 15) continue;
      const sim = jaccardSimilarity(a.shingles, b.shingles);
      if (sim > a.highestJaccardScore) {
        a.highestJaccardScore = Number(sim.toFixed(4));
        if (sim >= JACCARD_THRESHOLD) a.nearDuplicateOf = b.path;
      }
      if (sim > b.highestJaccardScore) {
        b.highestJaccardScore = Number(sim.toFixed(4));
        if (sim >= JACCARD_THRESHOLD) b.nearDuplicateOf = a.path;
      }
      if (sim >= JACCARD_THRESHOLD) {
        duplicatePairs.push({
          a: a.path,
          b: b.path,
          similarity: Number(sim.toFixed(4)),
        });
      }
    }
  }

  const pages = crawled.map(({ shingles: _shingles, ...item }) => {
    const { auditClass, reasons } = classifyPage(item);
    return {
      ...item,
      auditClass,
      reasons,
    };
  });

  const indexablePages = pages.filter((p) => !p.isNoindex);
  const noindexedPages = pages.filter((p) => p.isNoindex);
  const noindexBecauseIncomplete = noindexedPages.filter(
    (p) => p.noindexCategory === 'noindex-because-incomplete'
  );
  const otherNoindexed = noindexedPages.filter(
    (p) => p.noindexCategory !== 'noindex-because-incomplete'
  );

  const indexableSummary = { A: 0, B: 0, C: 0, D: 0 };
  for (const p of indexablePages) {
    indexableSummary[p.auditClass] = (indexableSummary[p.auditClass] || 0) + 1;
  }

  const overallSummary = { A: 0, B: 0, C: 0, D: 0 };
  for (const p of pages) {
    overallSummary[p.auditClass] = (overallSummary[p.auditClass] || 0) + 1;
  }

  const verifyLeaks = pages.filter((p) => p.hasVerifyLeak || p.hasAskUsLeak);
  const sitemapNoindexViolations = noindexedPages.filter((p) => p.inSitemap);

  const worstIndexableUrls = [...indexablePages]
    .filter((p) => p.auditClass !== 'A')
    .sort((a, b) => {
      const sevDiff = CLASS_SEVERITY[a.auditClass] - CLASS_SEVERITY[b.auditClass];
      if (sevDiff !== 0) return sevDiff;
      return a.wordCount - b.wordCount;
    })
    .slice(0, 20);

  const reportObj = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    nearDuplicateThreshold: JACCARD_THRESHOLD,
    totalUrls: pages.length,
    totalIndexablePages: indexablePages.length,
    totalNoindexedPages: noindexedPages.length,
    noindexBecauseIncompleteCount: noindexBecauseIncomplete.length,
    otherNoindexedCount: otherNoindexed.length,
    verifyLeakCount: verifyLeaks.length,
    sitemapNoindexViolationCount: sitemapNoindexViolations.length,
    indexableSummary,
    summary: overallSummary,
    duplicatePairs,
    worstIndexableUrls: worstIndexableUrls.map((u) => ({
      path: u.path,
      auditClass: u.auditClass,
      httpStatus: u.httpStatus,
      wordCount: u.wordCount,
      hasOfficialLink: u.hasOfficialLink,
      hasLastUpdated: u.hasLastUpdated,
      highestJaccardScore: u.highestJaccardScore,
      nearDuplicateOf: u.nearDuplicateOf,
      reasons: u.reasons,
    })),
    pages,
  };

  const reportsDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const jsonPath = path.join(reportsDir, 'content_audit.json');
  const mdPath = path.join(reportsDir, 'content_audit.md');

  fs.writeFileSync(jsonPath, JSON.stringify(reportObj, null, 2), 'utf-8');

  const mdLines = [
    '# CSC DOST Full-Site Content Quality Audit',
    '',
    `- **Generated At**: ${reportObj.generatedAt}`,
    `- **Audited Origin**: ${BASE}`,
    `- **Total Pages Audited**: ${pages.length}`,
    `- **Total Indexable Pages (in /sitemap.xml & index, follow)**: ${indexablePages.length}`,
    `- **Total Noindexed Pages**: ${noindexedPages.length} (**${noindexBecauseIncomplete.length}** noindex-because-incomplete services/hubs, **${otherNoindexed.length}** other noindex)`,
    `- **Public [VERIFY] / "Ask us" Leaks**: ${verifyLeaks.length}`,
    `- **Noindex URLs improperly inside /sitemap.xml**: ${sitemapNoindexViolations.length}`,
    '',
    '## Indexable Pages by Class',
    '',
    '| Class | Description | Indexable Count |',
    '|---|---|---|',
    `| **A** | Strong (>=400 main words, unique meta/title, 1 H1, official link + Last updated) | **${indexableSummary.A}** |`,
    `| **B** | Needs expansion (300–399 words or minor signal gaps) | **${indexableSummary.B}** |`,
    `| **C** | Indexable Thin (<300 words, or <400w on service, or <800w on cluster hub) | **${indexableSummary.C}** |`,
    `| **D** | Broken HTTP, [VERIFY] leak, copied source, or >=50% boilerplate-free Jaccard overlap | **${indexableSummary.D}** |`,
    '',
    `## Near-Duplicate Indexable Pairs (Jaccard >= 0.50): ${duplicatePairs.length}`,
    '',
    ...(duplicatePairs.length === 0
      ? ['No near-duplicate indexable pairs >= 50% similarity found.']
      : duplicatePairs.slice(0, 50).map(
          (pair) => `- \`${pair.a}\` <-> \`${pair.b}\` (**${(pair.similarity * 100).toFixed(1)}%**)`
        )),
    '',
    '## 20 Worst Indexable URLs',
    '',
    '| # | Class | Path | Status | Words | Overlap | Issues |',
    '|---|---|---|---|---|---|---|',
    ...(worstIndexableUrls.length === 0
      ? ['| - | A | All indexable URLs are Class A! | 200 | - | - | - |']
      : worstIndexableUrls.map(
          (u, i) =>
            `| ${i + 1} | **${u.auditClass}** | \`${u.path}\` | ${u.httpStatus} | ${u.wordCount} | ${(
              (u.highestJaccardScore || 0) * 100
            ).toFixed(0)}% | ${u.reasons.join('; ').replace(/\|/g, '/')} |`
        )),
    '',
    '## Noindex-Because-Incomplete Summary',
    '',
    `- Services & Cluster Hubs automatically set to \`noindex, follow\` and excluded from \`/sitemap.xml\`: **${noindexBecauseIncomplete.length}**`,
  ];

  fs.writeFileSync(mdPath, mdLines.join('\n') + '\n', 'utf-8');

  console.log('=== INDEXABILITY & HYGIENE TOTALS ===');
  console.log(`Total Audited Pages:            ${pages.length}`);
  console.log(`  Total Indexable Pages:        ${indexablePages.length}`);
  console.log(`  Total Noindexed Pages:        ${noindexedPages.length}`);
  console.log(`    - noindex-because-incomplete: ${noindexBecauseIncomplete.length}`);
  console.log(`    - other noindex:              ${otherNoindexed.length}`);
  console.log(`  Public [VERIFY]/Ask us Leaks: ${verifyLeaks.length}`);
  console.log(`  Noindex-in-Sitemap Violations:${sitemapNoindexViolations.length}`);
  console.log('\n=== INDEXABLE PAGES BY CLASS ===');
  console.log(`  Indexable Class A: ${indexableSummary.A}`);
  console.log(`  Indexable Class B: ${indexableSummary.B}`);
  console.log(`  Indexable Class C: ${indexableSummary.C}`);
  console.log(`  Indexable Class D: ${indexableSummary.D}`);
  console.log(`  Near-duplicate pairs (>=50%): ${duplicatePairs.length}`);
  console.log('\n=== 20 WORST INDEXABLE URLS ===');
  if (worstIndexableUrls.length === 0) {
    console.log('None — all indexable pages are Class A!');
  } else {
    worstIndexableUrls.forEach((u, idx) => {
      console.log(
        `${String(idx + 1).padStart(2, ' ')}. [Class ${u.auditClass}] ${u.path.padEnd(55)} | HTTP ${u.httpStatus} | ${String(u.wordCount).padStart(4)}w | ${(u.highestJaccardScore * 100).toFixed(0)}% overlap | ${u.reasons.join('; ')}`
      );
    });
  }
  console.log(`\nSaved reports to:\n  - ${jsonPath}\n  - ${mdPath}\n`);
}

main().catch((err) => {
  console.error('Full content audit failed:', err);
  process.exit(1);
});
