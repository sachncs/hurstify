import type {Metadata, Viewport} from 'next';
import {Geist, Instrument_Serif} from 'next/font/google';
import './globals.css';
import {ThemeProvider} from '@/components/theme-provider';
import {Toaster} from '@/components/ui/sonner';
import {TooltipProvider} from '@/components/ui/tooltip';
import {SkipToContentLink} from '@/components/skip-to-content-link';
import {MAIN_CONTENT_ID} from '@/components/landing/site-shell';
import {siteUrl} from '@/lib/site-url';
import {siteCopy} from '@/lib/site-copy';

const geistSans = Geist({subsets: ['latin'], variable: '--font-geist-sans'});
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteCopy.brand.name} — Measure the roughness of volatility`,
    template: `%s · ${siteCopy.brand.name}`,
  },
  description: siteCopy.hero.subtitle,
  applicationName: siteCopy.brand.name,
  authors: [{name: 'Sachin'}],
  creator: 'Sachin',
  publisher: siteCopy.brand.name,
  generator: 'Next.js',
  keywords: [
    'hurst',
    'hurstify',
    'rough volatility',
    'fractional brownian motion',
    'kolmogorov-smirnov',
    'quantitative finance',
    'time series',
    'RK-SAVR',
  ],
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: `${siteCopy.brand.name} — Measure the roughness of volatility`,
    description: siteCopy.hero.subtitle,
    siteName: siteCopy.brand.name,
    images: [
      {
        url: '/brand/wordmark.svg',
        width: 1200,
        height: 630,
        alt: `${siteCopy.brand.name} — Measure the roughness of volatility`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteCopy.brand.name} — Measure the roughness of volatility`,
    description: siteCopy.hero.subtitle,
    creator: '@sachncs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/brand/favicon.svg',
    shortcut: '/brand/favicon.svg',
    apple: '/brand/favicon.svg',
  },
  manifest: '/brand/manifest.webmanifest',
  other: {
    'color-scheme': 'light dark',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#f3ecdf'},
    {media: '(prefers-color-scheme: dark)', color: '#1a140f'},
  ],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
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
