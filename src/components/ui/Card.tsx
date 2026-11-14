import React from 'react';

export type CardStatusStripe =
  | 'open'
  | 'closing_soon'
  | 'exam'
  | 'result'
  | 'upcoming'
  | 'closed';

const STRIPE_COLORS: Record<CardStatusStripe, string> = {
  open: 'border-s-4 border-s-[var(--status-open-stripe)]',
  closing_soon: 'border-s-4 border-s-[var(--status-closing-stripe)]',
  exam: 'border-s-4 border-s-[var(--status-exam-stripe)]',
  result: 'border-s-4 border-s-[var(--status-result-stripe)]',
  upcoming: 'border-s-4 border-s-[var(--status-upcoming-stripe)]',
  closed: 'border-s-4 border-s-[var(--status-closed-stripe)]',
};

interface CardProps {
  as?: 'div' | 'article' | 'a';
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  interactive?: boolean;
  statusStripe?: CardStatusStripe;
  className?: string;
  children: React.ReactNode;
  'aria-label'?: string;
}

export function Card({
  as = 'div',
  href,
  onClick,
  interactive = false,
  statusStripe,
  className = '',
  children,
  'aria-label': ariaLabel,
}: CardProps) {
  const stripeClass = statusStripe ? STRIPE_COLORS[statusStripe] : '';
  const baseClasses = `bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] ${stripeClass} ${
    interactive
      ? 'hover:border-[var(--border-strong)] hover:shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]'
      : ''
  } ${className}`;

  if (as === 'a') {
    return (
      <a
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        className={`block no-underline ${baseClasses}`}
      >
        {children}
      </a>
    );
  }

  if (as === 'article') {
    return (
      <article onClick={onClick} aria-label={ariaLabel} className={baseClasses}>
        {children}
      </article>
    );
  }

  return (
    <div onClick={onClick} aria-label={ariaLabel} className={baseClasses}>
      {children}
    </div>
  );
}

export default Card;
