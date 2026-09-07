import * as React from 'react';
import {cn} from '@/lib/utils';

export function SectionCard({
  title,
  description,
  eyebrow,
  actions,
  children,
  footer,
  className,
  contentClassName,
  surface = 'default',
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  surface?: 'default' | 'raised' | 'flat';
}) {
  const surfaceClass =
    surface === 'raised'
      ? 'bg-card border-border shadow-card'
      : surface === 'flat'
        ? 'bg-transparent border-border shadow-none'
        : 'bg-card/70 border-border shadow-card';

  return (
    <section
      className={cn(
        'rounded-xl border backdrop-blur-[2px]',
        surfaceClass,
        className,
      )}
    >
      {(title || description || eyebrow || actions) && (
        <header className="flex flex-col gap-3 border-b border-border/70 px-6 py-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
            {eyebrow ? (
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {eyebrow}
              </span>
            ) : null}
            {title ? (
              <h2 className="typography-serif text-xl leading-tight tracking-tight">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </header>
      )}
      <div className={cn('px-6 py-6', contentClassName)}>{children}</div>
      {footer ? (
        <footer className="border-t border-border/70 px-6 py-3 text-xs text-muted-foreground">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
