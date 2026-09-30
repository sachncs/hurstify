'use client';

import * as React from 'react';
import Link from 'next/link';
import {Menu, X} from 'lucide-react';
import {BrandMark} from '@/components/landing/brand-mark';
import {SECTION_IDS} from '@/components/landing/site-shell';

const links = [
  {label: 'Demo', href: `#${SECTION_IDS.demo}`},
  {label: 'Docs', href: '/docs'},
  {
    label: 'API',
    href: '/api',
  },
  {label: 'Method', href: `#${SECTION_IDS.method}`},
  {label: 'GitHub', href: 'https://github.com/sachncs/hurstify'},
];

export function SiteNav() {
  const [open, setOpen] = React.useState(false);
  return (
    <header className="site-nav fixed inset-x-0 top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="hurstify home">
          <BrandMark size={29} withWordmark />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((link) =>
            link.href.startsWith('http') ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <a
          href={`#${SECTION_IDS.demo}`}
          className="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground md:inline-flex"
        >
          Try demo
        </a>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {open ? (
        <nav
          aria-label="Mobile"
          className="border-t border-border bg-background px-5 py-3 md:hidden"
        >
          {links.map((link) =>
            link.href.startsWith('http') ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="block border-b border-border/50 py-3 text-sm"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block border-b border-border/50 py-3 text-sm"
              >
                {link.label}
              </Link>
            ),
          )}
          <a
            href={`#${SECTION_IDS.demo}`}
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try demo
          </a>
        </nav>
      ) : null}
    </header>
  );
}
