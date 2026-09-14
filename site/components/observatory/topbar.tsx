import * as React from 'react';
import Link from 'next/link';
import {ChevronRight} from 'lucide-react';
import {cn} from '@/lib/utils';

export type Crumb = {
  label: string;
  href?: string;
};

export function Topbar({
  crumbs,
  actions,
  className,
}: {
  crumbs?: Crumb[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md md:px-10',
        className,
      )}
    >
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex items-center gap-1.5 text-xs">
          {crumbs && crumbs.length > 0 ? (
            crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <li
                  key={`${c.label}-${i}`}
                  className="flex items-center gap-1.5 truncate"
                >
                  {c.href && !isLast ? (
                    <Link
                      href={c.href}
                      className="truncate font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        'truncate font-mono uppercase tracking-wider',
                        isLast ? 'text-foreground' : 'text-muted-foreground',
                      )}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {c.label}
                    </span>
                  )}
                  {!isLast ? (
                    <ChevronRight
                      aria-hidden="true"
                      className="h-3 w-3 text-muted-foreground/50"
                    />
                  ) : null}
                </li>
              );
            })
          ) : (
            <li className="font-mono uppercase tracking-wider text-muted-foreground">
              hurstify
            </li>
          )}
        </ol>
      </nav>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
