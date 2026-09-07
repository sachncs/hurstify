'use client';

import * as React from 'react';

const HIDDEN_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  zIndex: -1,
};

const VISIBLE_STYLE: React.CSSProperties = {
  position: 'fixed',
  left: '1rem',
  top: '1rem',
  padding: '0.5rem 1rem',
  background: 'var(--color-primary)',
  color: 'var(--color-primary-foreground)',
  zIndex: 9999,
  borderRadius: '0.375rem',
  outline: '2px solid var(--color-ring)',
  outlineOffset: '2px',
};

/**
 * Visually-hidden skip link that becomes visible on keyboard focus.
 * Routes the user past the sidebar nav straight to the main content
 * region. Required for keyboard / screen-reader a11y.
 */
export function SkipToContentLink({
  targetId,
  children,
}: {
  targetId: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`#${targetId}`}
      style={HIDDEN_STYLE}
      onFocus={(e) => {
        e.currentTarget.style.cssText = visibleCssText();
      }}
      onBlur={(e) => {
        e.currentTarget.style.cssText = hiddenCssText();
      }}
      onClick={() => {
        const main = document.getElementById(targetId);
        if (main) {
          main.setAttribute('tabindex', '-1');
          main.focus({preventScroll: false});
        }
      }}
    >
      {children}
    </a>
  );
}

function visibleCssText(): string {
  return [
    'position: fixed',
    'left: 1rem',
    'top: 1rem',
    'padding: 0.5rem 1rem',
    'background: var(--color-primary)',
    'color: var(--color-primary-foreground)',
    'z-index: 9999',
    'border-radius: 0.375rem',
    'outline: 2px solid var(--color-ring)',
    'outline-offset: 2px',
  ].join('; ');
}

function hiddenCssText(): string {
  return [
    'position: absolute',
    'left: -9999px',
    'top: auto',
    'width: 1px',
    'height: 1px',
    'overflow: hidden',
    'z-index: -1',
  ].join('; ');
}
