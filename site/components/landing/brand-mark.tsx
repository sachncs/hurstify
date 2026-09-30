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
 * Shared brand lockup using the repository's canonical logo asset.
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
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/brand/logo.svg`}
          alt=""
          className="h-full w-full rounded-md object-cover"
        />
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
