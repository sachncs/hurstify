import {cn} from '@/lib/utils';
import {siteBasePath} from '@/lib/site-url';

type BrandMarkProps = {
  size?: number;
  className?: string;
  label?: string;
  withWordmark?: boolean;
  version?: string;
};

/**
 * Observatory brand lockup using the same canonical logo as the public site.
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
      <img
        src={`${siteBasePath}/brand/logo.svg`}
        alt=""
        aria-hidden="true"
        className="shrink-0 rounded-md object-cover"
        style={{width: size, height: size}}
      />
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
