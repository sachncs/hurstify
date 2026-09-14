import * as React from 'react';
import {cn} from '@/lib/utils';

type BrandMarkProps = {
  size?: number;
  className?: string;
  label?: string;
  withWordmark?: boolean;
  eyebrow?: string;
  variant?: 'default' | 'mono-light' | 'mono-dark';
};

/**
 * Hurstify monogram — a circle framing a damped sinusoid over a center dot.
 * Designed for both small icon use and inline branding in the marketing
 * pages.
 */
export function BrandMark({
  size = 32,
  className,
  label = 'hurstify',
  withWordmark = true,
  eyebrow,
  variant = 'default',
}: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-md',
          variant === 'mono-dark'
            ? 'bg-foreground text-background'
            : variant === 'mono-light'
              ? 'bg-background text-foreground shadow-inset'
              : 'bg-primary text-primary-foreground',
        )}
        style={{width: size, height: size}}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[62%] w-[62%]"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6 12 Q9 6 12 12 Q15 18 18 12"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
        </svg>
      </span>
      {withWordmark ? (
        <div className="flex flex-col leading-none">
          <span className="typography-serif text-lg font-normal tracking-tight text-foreground">
            {label}
          </span>
          {eyebrow ? (
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
