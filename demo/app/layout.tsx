import type {Metadata, Viewport} from 'next';
import {Geist, Instrument_Serif} from 'next/font/google';
import './globals.css';
import {ThemeProvider} from '@/components/theme-provider';
import {Toaster} from '@/components/ui/sonner';
import {TooltipProvider} from '@/components/ui/tooltip';
import {SkipToContentLink} from '@/components/skip-to-content-link';
import {MAIN_CONTENT_ID} from '@/components/observatory/app-shell';
import {siteUrl} from '@/lib/site-url';

const geistSans = Geist({subsets: ['latin'], variable: '--font-geist-sans'});
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
});

export const metadata: Metadata = {
  title: {
    default: 'hurstify',
    template: '%s · hurstify',
  },
  description:
    'hurstify — randomized Kolmogorov–Smirnov estimator for rough-volatility Hurst parameters. Pure JavaScript, zero dependencies.',
  applicationName: 'hurstify',
  metadataBase: new URL(siteUrl),
  other: {
    // Tells the browser to use light/dark UA colors (scrollbars,
    // form controls) so they match the user's manual theme choice
    // even before the React tree mounts.
    'color-scheme': 'light dark',
  },
  openGraph: {
    title: 'hurstify',
    description:
      'Randomized Kolmogorov–Smirnov estimator for rough-volatility Hurst parameters.',
    type: 'website',
    images: ['/brand/wordmark.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'hurstify',
    description:
      'Randomized Kolmogorov–Smirnov estimator for rough-volatility Hurst parameters.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#f3ecdf'},
    {media: '(prefers-color-scheme: dark)', color: '#1a140f'},
  ],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      // ThemeProvider hydrates the class on mount. Default to light
      // for SSR so first paint matches the warm-beige aesthetic.
      className={`${geistSans.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body>
        <SkipToContentLink targetId={MAIN_CONTENT_ID}>
          Skip to main content
        </SkipToContentLink>
        <ThemeProvider>
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
