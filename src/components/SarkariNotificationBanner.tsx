import React from 'react';
import { SarkariItem } from '../data/sarkariData';

interface SarkariNotificationBannerProps {
  item: SarkariItem;
  className?: string;
  onApply?: () => void;
  onViewDetails?: () => void;
}

export default function SarkariNotificationBanner({
  item,
  className = '',
  onApply,
  onViewDetails
}: SarkariNotificationBannerProps) {
  const thumbnailUrl = item.thumbnailUrl || `/api/thumbnails/post/${item.id}.png`;

  const handleCtaClick = (e: React.MouseEvent) => {
    if (onApply) {
      e.stopPropagation();
      onApply();
      return;
    }
    if (onViewDetails) {
      e.stopPropagation();
      onViewDetails();
      return;
    }
    const summaryTable = document.getElementById('overview-section') || document.getElementById('summary-table');
    if (summaryTable) {
      summaryTable.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (item.officialLink) {
      window.open(item.officialLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={className}>
      <div
        id={`sarkari-thumbnail-card-${item.id}`}
        data-card-id={item.id}
        onClick={handleCtaClick}
        className="relative overflow-hidden rounded-xl border border-[#CBD5E1] bg-[#092556] shadow-xs cursor-pointer group"
        style={{ aspectRatio: '2048 / 677' }}
      >
        <img
          src={thumbnailUrl}
          alt={`${item.title} — CSC DOST Official Notification Banner`}
          loading="eager"
          className="w-full h-full object-contain block select-none transition-transform duration-200 group-hover:scale-[1.003]"
        />
      </div>
    </div>
  );
}
