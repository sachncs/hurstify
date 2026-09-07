'use client';

import * as React from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {
  Activity,
  ChartLine,
  LayoutDashboard,
  Moon,
  Sun,
  Workflow,
} from 'lucide-react';
import {useTheme} from '@/components/theme-provider';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Separator} from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import {BrandMark} from '@/components/observatory/brand-mark';
import {Topbar, type Crumb} from '@/components/observatory/topbar';
import {cn} from '@/lib/utils';
import {copy} from '@/lib/copy';

export const MAIN_CONTENT_ID = 'main-content';

const navItems = [
  {href: '/', label: 'Overview', icon: LayoutDashboard},
  {href: '/dashboard', label: 'Real-Time Estimation', icon: Activity},
  {href: '/explorer', label: 'Parameter Explorer', icon: Workflow},
  {href: '/figures', label: 'Figures / Diagnostics', icon: ChartLine},
] as const;

const routeCrumbs: Record<string, Crumb[]> = {
  '/': [{label: 'Overview'}],
  '/dashboard': [
    {label: 'Overview', href: '/'},
    {label: 'Real-Time Estimation'},
  ],
  '/explorer': [{label: 'Overview', href: '/'}, {label: 'Parameter Explorer'}],
  '/figures': [
    {label: 'Overview', href: '/'},
    {label: 'Figures / Diagnostics'},
  ],
};

export function AppShell({
  children,
  breadcrumbs,
  actions,
}: {
  children: React.ReactNode;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
}) {
  const pathname = usePathname() ?? '/';
  const {theme, toggleTheme} = useTheme();
  const isDark = theme === 'dark';

  const crumbs = breadcrumbs ?? routeCrumbs[pathname] ?? [];

  return (
    <div className="relative z-10 flex min-h-screen bg-background text-foreground">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card/30">
        <div className="flex flex-col gap-2 px-5 pb-2 pt-7">
          <Link
            href="/"
            aria-label={`${copy.brand.name} home`}
            className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandMark version={copy.brand.version} />
          </Link>
        </div>

        <div className="px-5 pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Workspace
          </span>
        </div>

        <ScrollArea className="flex-1 px-3">
          <nav aria-label="Primary" className="flex flex-col gap-0.5 py-2">
            {navItems.map(({href, label, icon: Icon}) => {
              const active =
                href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="font-medium">{label}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="mt-auto space-y-3 px-5 pb-6">
          <Separator />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] text-primary"
                  >
                    DW
                  </span>
                  <span className="font-mono uppercase tracking-wider">
                    {copy.shell.workspace}
                  </span>
                </span>
                <span aria-hidden="true" className="text-muted-foreground">
                  ▾
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Workspace</DropdownMenuLabel>
              <DropdownMenuItem>Default Workspace</DropdownMenuItem>
              <DropdownMenuItem disabled>
                Quant Research (coming soon)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Manage workspaces…</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            aria-pressed={!isDark}
            className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
          >
            {isDark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
              {isDark ? 'Light theme' : 'Dark theme'}
            </span>
          </Button>

          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-success"
              />
              {copy.shell.online}
            </span>
            <a
              href="https://github.com/sachncs/hurstify"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar crumbs={crumbs} actions={actions} />
        <main
          id={MAIN_CONTENT_ID}
          className="flex-1 overflow-y-auto px-6 pb-16 pt-6 md:px-10 md:pt-8"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
