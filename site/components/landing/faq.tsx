'use client';

import * as React from 'react';
import {Plus} from 'lucide-react';
import {siteCopy} from '@/lib/site-copy';
import {Reveal} from '@/components/landing/reveal';
import {SECTION_IDS} from '@/components/landing/site-shell';
import {cn} from '@/lib/utils';

export function FAQ() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section
      id={SECTION_IDS.faq}
      aria-labelledby="faq-title"
      className="relative mx-auto w-full max-w-5xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
    >
      <Reveal as="div" className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <span className="eyebrow">{siteCopy.faq.eyebrow}</span>
        <h2
          id="faq-title"
          className="display-serif text-balance text-4xl sm:text-5xl"
        >
          {siteCopy.faq.title}
        </h2>
      </Reveal>

      <div className="reveal-stagger mt-12 overflow-hidden rounded-3xl border border-border/60 bg-card">
        {siteCopy.faq.items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.question}
              className={cn(
                'border-border/60 transition-colors',
                i !== 0 && 'border-t',
              )}
              style={{['--stagger-index' as never]: i}}
            >
              <Reveal once delay={i * 60} className="">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-start justify-between gap-6 px-6 py-5 text-left text-base font-medium text-foreground transition-colors hover:bg-accent/40 sm:px-8"
                >
                  <span>{item.question}</span>
                  <Plus
                    aria-hidden="true"
                    className={cn(
                      'mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-45',
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'grid transition-all duration-500 ease-in-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 pr-12 text-pretty text-sm leading-relaxed text-muted-foreground sm:px-8">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </section>
  );
}
