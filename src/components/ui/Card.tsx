import React from 'react';

interface CardProps {
  as?: 'div' | 'article' | 'a';
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
  'aria-label'?: string;
}

export function Card({
  as = 'div',
  href,
  onClick,
  interactive = false,
  className = '',
  children,
  'aria-label': ariaLabel,
}: CardProps) {
  const baseClasses = `bg-white border border-[#DCE3EE] rounded-xl text-[#101A36] ${
    interactive
      ? 'hover:border-[#101A36]/40 hover:shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]'
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
