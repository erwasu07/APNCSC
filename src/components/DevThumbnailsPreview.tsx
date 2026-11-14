import React, { useMemo } from 'react';
import { ArrowLeft, ExternalLink, AlertTriangle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import type { SarkariItem } from '../data/sarkariData';
import { isPublishedSarkariItem } from '../data/sarkariData';
import { computeSarkariStatus } from '../utils/sarkariStatus';
import {
  buildThumbnailRenderData,
  getPostOgImageUrl,
  getPostListThumbnailUrl,
} from '../utils/postThumbnailMeta';
import { OrgBadge, StatusPill, Badge } from './ui';

export interface DevThumbnailsPreviewProps {
  posts: SarkariItem[];
  onOpenPost: (item: SarkariItem) => void;
  onBackHome: () => void;
}

const REQUIRED_SAMPLE_CASES: Array<{
  label: string;
  slug: string;
  description: string;
}> = [
  {
    label: '1. Application (J&K Bank, 1,033 posts)',
    slug: 'jk-bank-banking-associates-recruitment-2026',
    description: 'Number variant, J&K Bank accent, J&K domicile + qualification chips, Apply by date.',
  },
  {
    label: '2. JKSSB DV Notice',
    slug: 'jkssb-junior-assistant-dv-schedule-nov-2026',
    description: 'Date variant, JKSSB accent, blue Exam / DV stripe, J&K domicile chip.',
  },
  {
    label: '3. SSC Admit Card',
    slug: 'ssc-cgept-01-27-02-27-city-admit-card-nov-2026',
    description: 'Date variant, SSC / ICG accent, blue Exam / Admit stripe.',
  },
  {
    label: '4. JKSSB Result / Selection List',
    slug: 'jkssb-statistical-assistant-foreman-selection-lists-nov-2026',
    description: 'Title/Date variant, purple Result stripe, JKSSB accent, J&K domicile chip.',
  },
  {
    label: '5. SSC Answer Key (Active Objection Window)',
    slug: 'ssc-constable-gd-final-answer-key-marks-nov-2026',
    description: 'Amber Closing Soon stripe with "Objections till" date.',
  },
  {
    label: '6. Upcoming JKSSB JE Notice',
    slug: 'jkssb-advt-11-of-2026-je-civil-pwd',
    description: 'Number variant (458 Posts), teal Upcoming stripe, "Opens" date.',
  },
  {
    label: '7. Closed Army Post',
    slug: 'indian-army-tes-57-course-closing-today',
    description: 'Grey Closed stripe, "Applications closed" wording (never "Apply by").',
  },
  {
    label: '8. Cluster University Exam Form',
    slug: 'cus-integrated-bed-med-5th-sem-exam-form-nov-2026',
    description: 'Date variant (ignores "5th Sem" as post count), CUS accent, Closing Soon amber stripe.',
  },
];

export default function DevThumbnailsPreview({
  posts,
  onOpenPost,
  onBackHome,
}: DevThumbnailsPreviewProps) {
  const publishedPosts = useMemo(
    () => posts.filter(isPublishedSarkariItem),
    [posts]
  );

  const sampleEntries = useMemo(() => {
    return REQUIRED_SAMPLE_CASES.map((sample) => {
      const item = publishedPosts.find((p) => p.id === sample.slug) || null;
      const computed = item ? computeSarkariStatus(item) : null;
      const renderData = item ? buildThumbnailRenderData(item) : null;
      return { sample, item, computed, renderData };
    });
  }, [publishedPosts]);

  const thinPosts = useMemo(() => {
    return publishedPosts
      .map((item) => ({
        item,
        data: buildThumbnailRenderData(item),
      }))
      .filter((entry) => entry.data.thinReasons.length > 0);
  }, [publishedPosts]);

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-[#102A43] py-6 px-4 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-1 rounded-md">
              <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Dev Preview · NoIndex / NoFollow</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#102A43]">
              Dynamic OG &amp; Card Thumbnail Preview Matrix
            </h1>
            <p className="text-sm text-[#475569]">
              Comparing 1200×630 Social PNG, 600×315 List-Card WebP, and pure-CSS OrgBadge headers across all 8 required post types.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackHome}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 bg-[#101A36] hover:bg-[#1E2B4F] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shrink-0 self-start sm:self-center"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Portal</span>
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
            <div className="text-xs font-bold uppercase text-[#64748B]">Published Posts</div>
            <div className="text-2xl font-extrabold text-[#102A43] mt-1">{publishedPosts.length}</div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
            <div className="text-xs font-bold uppercase text-[#64748B]">Sample Matrix</div>
            <div className="text-2xl font-extrabold text-[#1F9D6B] mt-1">
              {sampleEntries.filter((s) => s.item !== null).length} / 8
            </div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
            <div className="text-xs font-bold uppercase text-[#64748B]">Thin-Data Posts</div>
            <div className="text-2xl font-extrabold text-[#D97706] mt-1">{thinPosts.length}</div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
            <div className="text-xs font-bold uppercase text-[#64748B]">Font Engine</div>
            <div className="text-base font-extrabold text-[#102A43] mt-1.5">Inter (Bundled SVG)</div>
          </div>
        </div>

        {/* 8 Required Sample Comparisons */}
        <section className="space-y-5" aria-label="Required 8 Thumbnail Samples">
          <h2 className="text-lg font-extrabold text-[#102A43]">
            Side-by-Side Sample Previews (8 Post Types)
          </h2>

          <div className="space-y-6">
            {sampleEntries.map(({ sample, item, computed, renderData }) => {
              if (!item || !computed || !renderData) {
                return (
                  <div
                    key={sample.slug}
                    className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-900"
                  >
                    <div className="font-bold">{sample.label}</div>
                    <p className="text-sm mt-1">
                      Slug <code>{sample.slug}</code> was not found in published SARKARI_DATA.
                    </p>
                  </div>
                );
              }

              const socialUrl = getPostOgImageUrl(item);
              const cardUrl = getPostListThumbnailUrl(item, 'webp');

              return (
                <article
                  key={sample.slug}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-[#102A43]">{sample.label}</span>
                        <Badge variant="neutral">Variant: {renderData.variant}</Badge>
                        <Badge variant="navy">Org: {renderData.org.orgShort}</Badge>
                        <Badge variant="neutral">v={renderData.versionHash}</Badge>
                      </div>
                      <p className="text-xs text-[#64748B]">{sample.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`/post/${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenPost(item);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] transition-colors no-underline"
                      >
                        <span>Open Post</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  {/* Metadata Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Column 1: CSS OrgBadge + StatusPill + Extracted Facts */}
                    <div className="lg:col-span-3 space-y-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                        At-a-Glance CSS Header
                      </div>
                      <div className="flex items-center gap-3">
                        <OrgBadge item={item} />
                        <div className="space-y-1.5 min-w-0">
                          <StatusPill
                            status={computed.computedStatus}
                            label={computed.badgeLabel}
                            size="sm"
                          />
                          <div className="text-xs font-bold text-[#102A43] truncate">
                            {renderData.keyHighlight}
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#E2E8F0] space-y-1 text-xs text-[#475569]">
                        <div>
                          <strong>Highlight:</strong> {renderData.keyHighlight}
                        </div>
                        {renderData.heroNumber && (
                          <div>
                            <strong>Hero Stat:</strong> {renderData.heroNumber} {renderData.heroNumberLabel}
                          </div>
                        )}
                        <div>
                          <strong>Chips:</strong>{' '}
                          {renderData.chips.length > 0 ? renderData.chips.join(' · ') : 'None (clean omission)'}
                        </div>
                        {renderData.thinReasons.length > 0 && (
                          <div className="text-[#B45309]">
                            <strong>Thin flags:</strong> {renderData.thinReasons.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: 1200x630 Social PNG */}
                    <div className="lg:col-span-5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                        <span>1200×630 Social PNG</span>
                        <a
                          href={socialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2563EB] hover:underline no-underline"
                        >
                          Open Full PNG
                        </a>
                      </div>
                      <div className="border border-[#CBD5E1] rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={socialUrl}
                          alt={`Social OG PNG preview for ${item.title}`}
                          width={1200}
                          height={630}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto block"
                        />
                      </div>
                    </div>

                    {/* Column 3: 600x315 Card WebP */}
                    <div className="lg:col-span-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                        <span>600×315 List-Card WebP</span>
                        <a
                          href={cardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2563EB] hover:underline no-underline"
                        >
                          Open Full WebP
                        </a>
                      </div>
                      <div className="border border-[#CBD5E1] rounded-xl overflow-hidden bg-slate-100 max-w-[340px]">
                        <img
                          src={cardUrl}
                          alt={`Card WebP preview for ${item.title}`}
                          width={600}
                          height={315}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto block"
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Thin-Data Review Section */}
        <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            {thinPosts.length > 0 ? (
              <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#1F9D6B] shrink-0" aria-hidden="true" />
            )}
            <div>
              <h2 className="text-lg font-extrabold text-[#102A43]">
                Posts Flagged With Thin Thumbnail Data ({thinPosts.length})
              </h2>
              <p className="text-xs text-[#64748B]">
                These posts still render clean images without placeholder chips, and are listed here for optional manual enrichment.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                  <th className="py-2.5 px-3 font-bold">Slug</th>
                  <th className="py-2.5 px-3 font-bold">Title</th>
                  <th className="py-2.5 px-3 font-bold">Variant</th>
                  <th className="py-2.5 px-3 font-bold">Key Highlight</th>
                  <th className="py-2.5 px-3 font-bold">Thin Data Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {thinPosts.map(({ item, data }) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2 px-3 font-mono text-[11px] text-[#2563EB] whitespace-nowrap">
                      <a
                        href={`/post/${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenPost(item);
                        }}
                        className="hover:underline"
                      >
                        {item.id}
                      </a>
                    </td>
                    <td className="py-2 px-3 font-semibold text-[#102A43] max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">{data.variant}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{data.keyHighlight}</td>
                    <td className="py-2 px-3 text-[#B45309]">{data.thinReasons.join('; ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
