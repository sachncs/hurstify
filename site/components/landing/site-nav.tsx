'use client';

import * as React from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {ArrowUpRight, Menu, Moon, Sun, X} from 'lucide-react';
import {cn} from '@/lib/utils';
import {BrandMark} from '@/components/landing/brand-mark';
import {useTheme} from '@/components/theme-provider';
import {siteCopy} from '@/lib/site-copy';
import {Button} from '@/components/ui/button';
import {SECTION_IDS} from '@/components/landing/site-shell';

const NAV_LINKS: Array<{label: string; href: string}> = [
  {label: 'Features', href: `#${SECTION_IDS.features}`},
  {label: 'Method', href: `#${SECTION_IDS.method}`},
  {label: 'Use cases', href: `#${SECTION_IDS.useCases}`},
  {label: 'Observatory', href: '/observatory'},
];

export function SiteNav() {
  const pathname = usePathname();
  const {theme, toggleTheme} = useTheme();
  const isDark = theme === 'dark';
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isLanding = pathname === '/';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,border-color] duration-500',
        scrolled
          ? 'border-b border-border/70 bg-background/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          aria-label={`${siteCopy.brand.name} home`}
          className="flex items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BrandMark size={28} withWordmark={false} />
          <span className="typography-serif text-lg font-normal text-foreground">
            {siteCopy.brand.name}
          </span>
          <span
            aria-hidden="true"
            className="ml-1 hidden rounded-full border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground sm:inline-flex"
          >
            v2.1
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {isLanding
            ? NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-[13px] font-medium text-foreground/70 transition-colors hover:text-foreground',
                  )}
                >
                  {item.label}
                </a>
              ))
            : null}
          <a
            href={siteCopy.nav.docs}
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-2 text-[13px] font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            aria-pressed={!isDark}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/50 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {isDark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <Button asChild size="sm" className="rounded-full px-4">
            <a
              href={siteCopy.footer.columns[1].links[0].href}
              target="_blank"
              rel="noreferrer"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.16-.02-2.11-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.77.12 3.06.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.21.66.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
              </svg>
              Star
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/50 text-foreground md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <div className="md:hidden">
          <div className="border-t border-border/60 bg-background/95 px-5 py-4 backdrop-blur-xl sm:px-8">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {isLanding
                ? NAV_LINKS.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2 text-sm text-foreground/80"
                    >
                      {item.label}
                    </a>
                  ))
                : null}
              <a
                href={siteCopy.nav.docs}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-foreground/80"
              >
                GitHub
              </a>
              <div className="mt-2 flex items-center gap-2 border-t border-border/60 pt-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs"
                >
                  {isDark ? (
                    <Sun className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Moon className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isDark ? 'Light theme' : 'Dark theme'}
                </button>
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
