'use client';

import * as React from 'react';
import {cn} from '@/lib/utils';

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  once?: boolean;
};

/**
 * Lightweight "scroll reveal" wrapper. Uses `IntersectionObserver` so the
 * effect fires on entry without forcing a layout. Animation is driven by
 * CSS variables so duration and offset stay declarative.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 18,
  duration = 700,
  className,
  as: Tag = 'div',
  once = true,
}: RevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      {threshold: 0.18, rootMargin: '0px 0px -8% 0px'},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  const style: React.CSSProperties & Record<string, string | number> = {
    '--reveal-distance': `${distance}px`,
    '--reveal-duration': `${duration}ms`,
    '--reveal-delay': `${delay}ms`,
  };

  return React.createElement(
    Tag,
    {
      ref: ref as React.Ref<HTMLElement>,
      style,
      className: cn('reveal', visible && 'is-visible', className),
    },
    children,
  );
}
