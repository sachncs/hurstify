import {cn} from '@/lib/utils';

type BrandMarkProps = {
  size?: number;
  className?: string;
  label?: string;
  withWordmark?: boolean;
  version?: string;
};

/**
 * Hurstify monogram — a circle framing a damped sinusoid over a center dot.
 * The wordmark is the product name in set-face, with a tracking-wide
 * product-line eyebrow underneath.
 */
export function BrandMark({
  size = 32,
  className,
  label = 'hurstify',
  withWordmark = true,
  version,
}: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span
        aria-hidden="true"
        className="relative inline-flex shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
        style={{width: size, height: size}}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[62%] w-[62%]"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6 12 Q9 6 12 12 Q15 18 18 12"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
        </svg>
      </span>
      {withWordmark ? (
        <div className="flex flex-col leading-none">
          <span className="typography-serif text-lg font-normal tracking-tight text-foreground">
            {label}
          </span>
          <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {version ? `Observatory · ${version}` : 'Observatory'}
          </span>
        </div>
      ) : null}
    </div>
  );
}
