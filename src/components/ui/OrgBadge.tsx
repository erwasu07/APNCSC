import React from 'react';
import type { SarkariItem } from '../../data/sarkariData';
import { computeSarkariStatus } from '../../utils/sarkariStatus';
import { buildThumbnailRenderData } from '../../utils/postThumbnailMeta';

export interface OrgBadgeProps {
  item: SarkariItem;
  size?: 'md' | 'lg';
  className?: string;
}

/**
 * Pure CSS Organisation Badge (72-96px square) with org accent colour, initials, and short label.
 * Built entirely in CSS (zero image files, zero official emblems).
 */
export function OrgBadge({ item, size = 'md', className = '' }: OrgBadgeProps) {
  const computed = computeSarkariStatus(item);
  const data = buildThumbnailRenderData(item);

  const initials = data.org.initials;
  const subLabel =
    data.org.orgShort.length <= 12 ? data.org.orgShort : initials;

  const sizeClasses =
    size === 'lg'
      ? 'w-24 h-24 rounded-2xl' // 96px
      : 'w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] rounded-2xl'; // 76px mobile / 88px desktop

  const initialsTextSize =
    initials.length >= 5
      ? 'text-base sm:text-lg tracking-tight'
      : initials.length === 4
      ? 'text-lg sm:text-xl tracking-tight'
      : 'text-xl sm:text-2xl tracking-tight';

  return (
    <div
      aria-label={`Organisation: ${data.org.orgShort}`}
      style={{
        backgroundColor: data.org.badgeBgHex,
        borderColor: data.org.accentHex,
        color: data.org.badgeTextHex,
      }}
      className={`${sizeClasses} relative overflow-hidden border-2 flex flex-col items-center justify-center text-center px-1.5 select-none shrink-0 shadow-2xs ${className}`}
    >
      {/* Top status colour accent strip */}
      <span
        aria-hidden="true"
        style={{ backgroundColor: data.statusStripeHex }}
        className="absolute inset-x-0 top-0 h-1.5"
      />

      <span className={`font-extrabold leading-none ${initialsTextSize}`}>
        {initials}
      </span>

      <span className="mt-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-85 leading-tight truncate max-w-full">
        {computed.computedStatus === 'closed' ? subLabel : subLabel}
      </span>
    </div>
  );
}

export default OrgBadge;
