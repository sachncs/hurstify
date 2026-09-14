import * as React from 'react';
import type {Metadata} from 'next';
import {SiteNav} from '@/components/landing/site-nav';
import {Hero} from '@/components/landing/hero';
import {Marquee} from '@/components/landing/marquee';
import {Trust} from '@/components/landing/trust';
import {Features} from '@/components/landing/features';
import {Showcase} from '@/components/landing/showcase';
import {Method} from '@/components/landing/method';
import {UseCases} from '@/components/landing/use-cases';
import {Metrics} from '@/components/landing/metrics';
import {FAQ} from '@/components/landing/faq';
import {Cta} from '@/components/landing/cta';
import {SiteFooter} from '@/components/landing/footer';
import {MAIN_CONTENT_ID} from '@/components/landing/site-shell';

export const metadata: Metadata = {
  title: 'Measure the roughness of volatility',
  description:
    'hurstify is a zero-dependency JavaScript library for estimating the Hurst parameter of rough-volatility processes. Implementation of the RK-SAVR algorithm.',
};

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="relative">
        <Hero />
        <Marquee />
        <Trust />
        <Features />
        <Showcase />
        <Method />
        <UseCases />
        <Metrics />
        <FAQ />
        <Cta />
      </main>
      <SiteFooter />
    </>
  );
}
