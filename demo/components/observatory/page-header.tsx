import * as React from 'react';
import {cn} from '@/lib/utils';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  meta,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'flex flex-col gap-6 pb-8 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-3">
        {eyebrow ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="typography-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
        {meta ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">{meta}</div>
        ) : null}
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </header>
  );
}
