import React, { useState, useMemo } from 'react';
import { SarkariItem } from '../data/sarkariData';
import {
  buildDeterministicThumbnailSpec,
  renderStandaloneMasterThumbnailSvg,
  ThumbnailSpec
} from '../utils/thumbnailSpecHelper';

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
  // Deterministic Thumbnail Specification for fallback SVG rendering
  const spec: ThumbnailSpec = useMemo(() => {
    return (
      (item as any).thumbnailSpec ||
      buildDeterministicThumbnailSpec({
        id: item.id,
        title: item.title,
        category: item.category,
        department: item.department,
        postType: item.postType,
        shortInfo: item.shortInfo,
        startDate: item.startDate,
        lastDate: item.lastDate,
        status: item.status
      })
    );
  }, [item]);

  // List of progressive image URL candidates
  const imageCandidates = useMemo(() => {
    const list: string[] = [];
    if (item.thumbnailUrl) {
      list.push(item.thumbnailUrl);
    }
    // High-speed static asset in /public/thumbnails/
    list.push(`/thumbnails/${item.id}.png`);
    // Dynamic server endpoint
    list.push(`/api/thumbnails/post/${item.id}.png`);
    // Vector SVG endpoint
    list.push(`/api/thumbnails/post/${item.id}.svg`);
    // Social preview endpoint
    list.push(`/api/og-image/${encodeURIComponent(item.id)}.png`);
    return Array.from(new Set(list));
  }, [item.id, item.thumbnailUrl]);

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [useInlineSvg, setUseInlineSvg] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentSrc = imageCandidates[candidateIndex] || '';

  const handleImageError = () => {
    if (candidateIndex + 1 < imageCandidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      // All remote image candidates failed: Switch to instant inline vector SVG fallback
      setUseInlineSvg(true);
    }
  };

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
    const summaryTable =
      document.getElementById('overview-section') ||
      document.getElementById('summary-table') ||
      document.getElementById('important-dates');
    if (summaryTable) {
      summaryTable.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (item.officialLink) {
      window.open(item.officialLink, '_blank', 'noopener,noreferrer');
    }
  };

  const standaloneSvgHtml = useMemo(() => {
    return renderStandaloneMasterThumbnailSvg(spec);
  }, [spec]);

  return (
    <div className={className}>
      <div
        id={`sarkari-thumbnail-card-${item.id}`}
        data-card-id={item.id}
        onClick={handleCtaClick}
        className="relative overflow-hidden rounded-xl border border-[#CBD5E1] shadow-xs cursor-pointer group bg-white w-full aspect-[1200/630]"
      >
        {useInlineSvg ? (
          // Inline Standalone SVG: Guaranteed 100% visual fidelity matching Master Reference
          <div
            className="w-full h-full select-none"
            dangerouslySetInnerHTML={{ __html: standaloneSvgHtml }}
          />
        ) : (
          <>
            {/* Soft skeleton placeholder while the high-res 2048x677 image is streaming */}
            {!isLoaded && (
              <div
                className="absolute inset-0 select-none pointer-events-none opacity-90"
                dangerouslySetInnerHTML={{ __html: standaloneSvgHtml }}
              />
            )}
            <img
              key={currentSrc}
              src={currentSrc}
              alt={`${item.title} — CSC DOST Official Notification Banner`}
              loading="eager"
              onLoad={() => setIsLoaded(true)}
              onError={handleImageError}
              className={`w-full h-full object-contain block select-none transition-transform duration-200 group-hover:scale-[1.003] ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}
      </div>
    </div>
  );
}
