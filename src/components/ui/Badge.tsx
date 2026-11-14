import React from 'react';

export type BadgeVariant = 'navy' | 'amber' | 'green' | 'urgent' | 'neutral' | 'chip';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  navy: 'bg-[#101A36] text-white border border-[#101A36]',
  amber: 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]',
  green: 'bg-[#ECFDF5] text-[#146C48] border border-[#A7F3D0]',
  urgent: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
  neutral: 'bg-[#F6F8FC] text-[#475569] border border-[#DCE3EE]',
  chip: 'bg-white/10 text-[#F5A623] border border-[#F5A623]/40',
};

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold leading-snug whitespace-nowrap ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
