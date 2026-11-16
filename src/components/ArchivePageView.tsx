import React, { useMemo } from 'react';
import { Archive, ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { isPublishedSarkariItem, parseSarkariDateSortValue, type SarkariItem } from '../data/sarkariData';
import { resolvePostOrg } from '../data/sarkariMigration';
import { useSyncedSarkariPosts } from '../utils/postDataSync';
import { isOlderThan12Months } from '../utils/postLifecycle';
import { Breadcrumbs } from './ui/Breadcrumbs';
import { Card } from './ui/Card';

interface ArchivePageViewProps {
  onOpenPost: (item: SarkariItem) => void;
  onNavigateRoute: (path: string) => void;
  onBackHome: () => void;
}

export default function ArchivePageView({
  onOpenPost,
  onNavigateRoute,
  onBackHome,
}: ArchivePageViewProps) {
  const allPosts = useSyncedSarkariPosts();

  const archivedPosts = useMemo(() => {
    return allPosts
      .filter((p) => isPublishedSarkariItem(p) && isOlderThan12Months(p))
      .sort(
        (a, b) =>
          parseSarkariDateSortValue(b.postDate || b.documentDate) -
          parseSarkariDateSortValue(a.postDate || a.documentDate)
      );
  }, [allPosts]);

  return (
    <div className="max-w-[1180px] mx-auto w-full px-3 sm:px-4 lg:px-6 py-4 lg:py-6 space-y-5 text-start text-[var(--text-primary)]">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Notice Archive' },
        ]}
        onNavigate={() => onBackHome()}
        rightSlot={
          <button
            type="button"
            onClick={onBackHome}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Portal</span>
          </button>
        }
      />

      <Card className="p-5 sm:p-6 space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          <Archive className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
          <span>Historical Record · 12+ Months Old</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] m-0">
          Archived Recruitment &amp; Examination Notices
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed m-0 max-w-3xl">
          Notifications published more than 12 months ago are moved out of active CSC DOST feeds
          into this archive so job-seekers and students only browse current openings and active
          schedules on the homepage. Individual archived bulletins remain live for historical
          verification and carry a Closed notice banner.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <a
            href="/jobs"
            onClick={(e) => {
              e.preventDefault();
              onNavigateRoute('/jobs');
            }}
            className="min-h-[40px] inline-flex items-center px-3.5 py-1.5 rounded-xl bg-[#101A36] text-white text-xs sm:text-sm font-bold no-underline hover:bg-[#1E2B4F]"
          >
            Browse Active Jobs →
          </a>
          <a
            href="/education"
            onClick={(e) => {
              e.preventDefault();
              onNavigateRoute('/education');
            }}
            className="min-h-[40px] inline-flex items-center px-3.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs sm:text-sm font-semibold no-underline hover:border-[#2455E6]"
          >
            Active Education &amp; Admissions
          </a>
        </div>
      </Card>

      {archivedPosts.length === 0 ? (
        <Card className="p-6 text-center text-sm text-[var(--text-secondary)]">
          No notices currently exceed 12 months in the active archive.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archivedPosts.map((post) => {
            const orgName = post.org || resolvePostOrg(post);
            return (
              <Card key={post.id} className="p-4 sm:p-5 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      {orgName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      Closed · Archived
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] m-0 leading-snug">
                    <a
                      href={`/post/${post.id}`}
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                          e.preventDefault();
                          onOpenPost(post);
                        }
                      }}
                      className="text-inherit no-underline hover:underline"
                    >
                      {post.title}
                    </a>
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] m-0 line-clamp-2">
                    {post.shortInfo}
                  </p>
                </div>

                <div className="border-t border-[var(--border-default)] pt-3 flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    Posted: {post.postDate} · Closed: {post.lastDate || 'As notified'}
                  </span>
                  <a
                    href={`/post/${post.id}`}
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                        e.preventDefault();
                        onOpenPost(post);
                      }
                    }}
                    className="inline-flex items-center gap-1 font-bold text-[#1F9D6B] no-underline hover:underline"
                  >
                    Read Archive <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
