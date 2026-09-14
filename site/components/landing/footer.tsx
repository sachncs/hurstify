import * as React from 'react';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {siteCopy} from '@/lib/site-copy';
import {BrandMark} from '@/components/landing/brand-mark';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-border/60 bg-background/60 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr),minmax(0,2fr)]">
          <div className="flex flex-col gap-5">
            <BrandMark size={32} eyebrow={siteCopy.brand.tagline} />
            <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              {siteCopy.footer.tagline}
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/sachncs/hurstify"
                target="_blank"
                rel="noreferrer"
                aria-label="hurstify on GitHub"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.16-.02-2.11-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.77.12 3.06.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.21.66.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
                </svg>
              </a>
              <a
                href="https://github.com/sponsors/sachncs"
                target="_blank"
                rel="noreferrer"
                aria-label="Sponsor hurstify"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {siteCopy.footer.columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                        className="group inline-flex items-center gap-1 text-sm text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {link.label}
                        {link.href.startsWith('http') ? (
                          <ArrowUpRight
                            aria-hidden="true"
                            className="h-3 w-3 -translate-y-px text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-border/60 pt-6">
          <p className="text-pretty text-xs text-muted-foreground">
            © {year}–2026 Sachin · Released under the MIT License · Built
            independently of the paper authors.
          </p>
        </div>
      </div>
    </footer>
  );
}
