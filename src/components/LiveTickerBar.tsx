import React, { useMemo } from 'react';
import { SarkariItem, isPublishedSarkariItem } from '../data/sarkariData';
import { getDeduplicatedSarkariPosts } from '../data/sarkariMigration';
import { computeSarkariStatus } from '../utils/sarkariStatus';
import { sortByNewestPostDate } from '../utils/postDataSync';

interface LiveTickerBarProps {
  posts: SarkariItem[];
  onOpenPost: (item: SarkariItem) => void;
}

export default function LiveTickerBar({ posts, onOpenPost }: LiveTickerBarProps) {
  const tickerItems = useMemo(() => {
    const deduped = getDeduplicatedSarkariPosts(posts);
    return deduped
      .filter((item) => {
        if (!isPublishedSarkariItem(item) || item.isCancelled) return false;
        const st = computeSarkariStatus(item);
        return st.verificationStatus !== 'needs_verification';
      })
      .sort((a, b) => {
        const stA = computeSarkariStatus(a);
        const stB = computeSarkariStatus(b);
        if (stA.isUrgentUnder7Days !== stB.isUrgentUnder7Days) {
          return stA.isUrgentUnder7Days ? -1 : 1;
        }
        return sortByNewestPostDate(a, b);
      })
      .slice(0, 5);
  }, [posts]);

  if (tickerItems.length === 0) return null;

  const renderTrack = (prefix: string, ariaHidden?: boolean) => (
    <span className="inline-flex items-center" aria-hidden={ariaHidden}>
      {tickerItems.map((item, idx) => (
        <React.Fragment key={`${prefix}-${item.id}`}>
          <a
            href={`/post/${item.id}`}
            tabIndex={ariaHidden ? -1 : undefined}
            onClick={(e) => {
              e.preventDefault();
              onOpenPost(item);
            }}
            className="text-slate-100 hover:text-[#F59E0B] no-underline font-medium transition-colors whitespace-nowrap"
          >
            {item.title}
          </a>
          <span className="mx-2 text-slate-400 select-none" aria-hidden="true">
            ·
          </span>
          {idx === tickerItems.length - 1 && ariaHidden ? null : null}
        </React.Fragment>
      ))}
    </span>
  );

  return (
    <div
      role="region"
      aria-label="Live Latest Updates Ticker"
      className="w-full bg-[#101A36] text-slate-100 text-[12px] leading-tight border-b border-white/10 px-3 py-1.5 flex items-center gap-2 overflow-hidden"
    >
      <span className="bg-[#F59E0B] text-[#101A36] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-[5px] shrink-0 leading-none">
        LIVE
      </span>
      <div className="flex-1 overflow-hidden whitespace-nowrap relative">
        <div className="animate-marquee">
          {renderTrack('main')}
          {renderTrack('dup', true)}
        </div>
      </div>
    </div>
  );
}
