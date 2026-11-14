import React from 'react';

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 space-y-3 animate-pulse ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 w-24 rounded-full bg-[var(--bg-subtle)]" />
        <div className="h-4 w-20 rounded bg-[var(--bg-subtle)]" />
      </div>
      <div className="h-5 w-11/12 rounded bg-[var(--bg-subtle)]" />
      <div className="h-4 w-2/3 rounded bg-[var(--bg-subtle)]" />
      <div className="flex gap-2 pt-1">
        <div className="h-6 w-20 rounded-md bg-[var(--bg-subtle)]" />
        <div className="h-6 w-24 rounded-md bg-[var(--bg-subtle)]" />
      </div>
    </div>
  );
}

export function ListSkeleton({
  count = 4,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function PostDetailSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5 sm:p-6 space-y-5 animate-pulse ${className}`}
    >
      <div className="space-y-2.5 border-b border-[var(--border-default)] pb-4">
        <div className="flex gap-2">
          <div className="h-6 w-24 rounded-full bg-[var(--bg-subtle)]" />
          <div className="h-6 w-32 rounded-full bg-[var(--bg-subtle)]" />
        </div>
        <div className="h-7 w-4/5 rounded bg-[var(--bg-subtle)]" />
        <div className="h-4 w-1/2 rounded bg-[var(--bg-subtle)]" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="h-16 rounded-xl bg-[var(--bg-subtle)]" />
        <div className="h-16 rounded-xl bg-[var(--bg-subtle)]" />
        <div className="h-16 rounded-xl bg-[var(--bg-subtle)] hidden sm:block" />
      </div>
      <div className="space-y-2.5">
        <div className="h-4 w-full rounded bg-[var(--bg-subtle)]" />
        <div className="h-4 w-5/6 rounded bg-[var(--bg-subtle)]" />
        <div className="h-4 w-3/4 rounded bg-[var(--bg-subtle)]" />
      </div>
    </div>
  );
}

export function HeroSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-[var(--bg-header)] rounded-2xl p-6 sm:p-8 space-y-4 animate-pulse ${className}`}
    >
      <div className="h-6 w-48 rounded-full bg-white/10" />
      <div className="h-8 w-3/4 rounded bg-white/15" />
      <div className="h-5 w-2/3 rounded bg-white/10" />
      <div className="h-12 w-full max-w-xl rounded-xl bg-white/15" />
    </div>
  );
}

export default CardSkeleton;
