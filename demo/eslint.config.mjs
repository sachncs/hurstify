// ESLint flat config for the demo (Next.js + shadcn/ui + recharts).
//
// Reserved for future TS-aware linting once typescript-eslint ships
// TypeScript 7 support (see
// https://github.com/typescript-eslint/typescript-eslint/issues/10940).
// The CI `npm run lint` pass ignores demo/** (see eslint.config.js),
// so this file currently ships as a no-op stub. Re-introduce the
// `@typescript-eslint/parser` config here once upstream supports TS 7.

export default [
  {
    ignores: [
      'demo/.next/**',
      'demo/dist/**',
      'demo/node_modules/**',
      'demo/components/ui/**',
      'demo/next-env.d.ts',
      '**/*.{ts,tsx,js,jsx}',
    ],
  },
];
