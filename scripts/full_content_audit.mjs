#!/usr/bin/env node
/**
 * Full-Site Content Quality & AdSense Readiness Audit
 * Crawls every URL in /sitemap.xml against a live/local Express SSR server,
 * measures main-content-only word count, metadata, outbound official links,
 * Last Updated timestamps, FAQ/How-To presence, consecutive copied sentences,
 * and pairwise 5-word-shingle Jaccard near-duplicates.
 *
 * Outputs:
 *   /reports/content_audit.json
 *   /reports/content_audit.md
 */

import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3108').replace(/\/+$/, '');
const CONCURRENCY = Number(process.env.AUDIT_CONCURRENCY || 8);

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

  if (item.httpStatus >= 400 || item.httpStatus === 0 || item.httpStatus >= 300) {
    return { auditClass: 'D', reasons };
  }
  if (item.copiedRunLength > 2) {
    reasons.push(`${item.copiedRunLength} consecutive sentences match raw source (>2)`);
    return { auditClass: 'D', reasons };
  }
  if (item.highestJaccardScore >= 0.65 && item.nearDuplicateOf) {
    reasons.push(
      `Near-duplicate ${(item.highestJaccardScore * 100).toFixed(0)}% with ${item.nearDuplicateOf}`
    );
    return { auditClass: 'D', reasons };
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
  if (!item.hasFaqOrHowTo && (isPostRoute || cleanPath.startsWith('/scheme/') || cleanPath.startsWith('/service/'))) {
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
    (!isPostRoute || (item.hasOfficialLink && item.hasLastUpdated))
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
  console.log(`\nRunning Full-Site Content Quality Audit against ${BASE}...\n`);

  const smRes = await fetch(`${BASE}/sitemap.xml`);
  if (!smRes.ok) {
    throw new Error(`Failed to fetch ${BASE}/sitemap.xml: HTTP ${smRes.status}`);
  }
  const smXml = await smRes.text();
  const rawPaths = [...smXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    try {
      const u = new URL(m[1].trim());
      return u.pathname + u.search;
    } catch {
      return m[1].trim();
    }
  });
  const uniquePaths = Array.from(new Set(rawPaths));
  console.log(`Discovered ${uniquePaths.length} unique URLs in /sitemap.xml.`);

  // Optional: fetch stored posts to access any sourceExcerpt fields for copy detection
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

      return {
        path: urlPath,
        url: `https://www.cscdost.com${urlPath}`,
        httpStatus: res.status,
        title,
        metaDescription,
        robotsMeta,
        canonical,
        canonicalMismatch,
        h1Count,
        wordCount,
        hasOfficialLink,
        outboundOfficialLinks,
        hasLastUpdated,
        hasFaqOrHowTo,
        copiedRunLength,
        matchedSnippet,
        highestJaccardScore: 0,
        nearDuplicateOf: null,
        shingles: buildWordShingles(mainText, 5),
      };
    } catch (err) {
      return {
        path: urlPath,
        url: `https://www.cscdost.com${urlPath}`,
        httpStatus: 0,
        title: '',
        metaDescription: '',
        robotsMeta: '',
        canonical: '',
        canonicalMismatch: true,
        h1Count: 0,
        wordCount: 0,
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

  // Compute pairwise Jaccard near-duplicates
  const duplicatePairs = [];
  for (let i = 0; i < crawled.length; i++) {
    const a = crawled[i];
    if (a.httpStatus !== 200 || a.shingles.size < 15) continue;
    for (let j = i + 1; j < crawled.length; j++) {
      const b = crawled[j];
      if (b.httpStatus !== 200 || b.shingles.size < 15) continue;
      const sim = jaccardSimilarity(a.shingles, b.shingles);
      if (sim > a.highestJaccardScore) {
        a.highestJaccardScore = Number(sim.toFixed(4));
        if (sim >= 0.65) a.nearDuplicateOf = b.path;
      }
      if (sim > b.highestJaccardScore) {
        b.highestJaccardScore = Number(sim.toFixed(4));
        if (sim >= 0.65) b.nearDuplicateOf = a.path;
      }
      if (sim >= 0.65) {
        duplicatePairs.push({
          a: a.path,
          b: b.path,
          similarity: Number(sim.toFixed(4)),
        });
      }
    }
  }

  // Classify every page and strip internal shingle sets before serializing
  const pages = crawled.map(({ shingles: _shingles, ...item }) => {
    const { auditClass, reasons } = classifyPage(item);
    return {
      ...item,
      auditClass,
      reasons,
    };
  });

  const summary = { A: 0, B: 0, C: 0, D: 0 };
  for (const p of pages) {
    summary[p.auditClass] = (summary[p.auditClass] || 0) + 1;
  }

  const worstUrls = [...pages]
    .filter((p) => p.auditClass !== 'A')
    .sort((a, b) => {
      const sevDiff = CLASS_SEVERITY[a.auditClass] - CLASS_SEVERITY[b.auditClass];
      if (sevDiff !== 0) return sevDiff;
      return a.wordCount - b.wordCount;
    })
    .slice(0, 30);

  const reportObj = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    totalUrls: pages.length,
    summary,
    duplicatePairs,
    worstUrls: worstUrls.map((u) => ({
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
    `- **Total Sitemap URLs Crawled**: ${pages.length}`,
    '',
    '## Classification Summary',
    '',
    '| Class | Description | Count |',
    '|---|---|---|',
    `| **A** | Strong (>=400 main words, unique meta/title, 1 H1, official link + Last updated) | **${summary.A}** |`,
    `| **B** | Needs expansion (<400 words, missing FAQ/how-to, or minor signal gaps) | **${summary.B}** |`,
    `| **C** | Thin (<300 words or canonical issue on post route — candidate for enrichment or noindex) | **${summary.C}** |`,
    `| **D** | Broken status, excessive verbatim source copying, or >=65% Jaccard near-duplicate | **${summary.D}** |`,
    '',
    `## Near-Duplicate Pairs (Jaccard >= 0.65): ${duplicatePairs.length}`,
    '',
    ...(duplicatePairs.length === 0
      ? ['No near-duplicate pairs >= 65% similarity found across crawled sitemap URLs.']
      : duplicatePairs.slice(0, 50).map(
          (pair) => `- \`${pair.a}\` <-> \`${pair.b}\` (**${(pair.similarity * 100).toFixed(1)}%**)`
        )),
    '',
    '## 30 Worst URLs Requiring Priority Review',
    '',
    '| # | Class | Path | Status | Words | Official Link | Last Updated | Issues |',
    '|---|---|---|---|---|---|---|---|',
    ...(worstUrls.length === 0
      ? ['| - | A | All crawled URLs passed Class A! | 200 | - | - | - | - |']
      : worstUrls.map(
          (u, i) =>
            `| ${i + 1} | **${u.auditClass}** | \`${u.path}\` | ${u.httpStatus} | ${u.wordCount} | ${
              u.hasOfficialLink ? 'Yes' : 'No'
            } | ${u.hasLastUpdated ? 'Yes' : 'No'} | ${u.reasons.join('; ').replace(/\|/g, '/')} |`
        )),
    '',
    '## Full Non-Class-A Breakdown',
    '',
  ];

  const nonA = pages
    .filter((p) => p.auditClass !== 'A')
    .sort((a, b) => CLASS_SEVERITY[a.auditClass] - CLASS_SEVERITY[b.auditClass] || a.wordCount - b.wordCount);

  if (nonA.length === 0) {
    mdLines.push('All sitemap URLs meet Class A requirements.');
  } else {
    for (const p of nonA) {
      mdLines.push(
        `- **[${p.auditClass}]** \`${p.path}\` (${p.wordCount} words, HTTP ${p.httpStatus}) — ${p.reasons.join('; ')}`
      );
    }
  }

  fs.writeFileSync(mdPath, mdLines.join('\n') + '\n', 'utf-8');

  console.log('=== AUDIT TOTALS BY CLASS ===');
  console.log(`Total URLs: ${pages.length}`);
  console.log(`  Class A (Strong):          ${summary.A}`);
  console.log(`  Class B (Needs Expansion): ${summary.B}`);
  console.log(`  Class C (Thin / Noindex):  ${summary.C}`);
  console.log(`  Class D (Duplicate/Broken):${summary.D}`);
  console.log(`  Near-duplicate pairs:      ${duplicatePairs.length}`);
  console.log('\n=== 30 WORST URLS ===');
  if (worstUrls.length === 0) {
    console.log('None — all pages are Class A!');
  } else {
    worstUrls.forEach((u, idx) => {
      console.log(
        `${String(idx + 1).padStart(2, ' ')}. [Class ${u.auditClass}] ${u.path.padEnd(55)} | HTTP ${u.httpStatus} | ${String(u.wordCount).padStart(4)} words | ${u.reasons.join('; ')}`
      );
    });
  }
  console.log(`\nSaved reports to:\n  - ${jsonPath}\n  - ${mdPath}\n`);
}

main().catch((err) => {
  console.error('Full content audit failed:', err);
  process.exit(1);
});
