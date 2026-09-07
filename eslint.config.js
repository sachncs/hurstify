// ESLint v10 flat config.
// Migrated from .eslintrc.cjs which is no longer supported by ESLint
// v9+. Uses `@eslint/eslintrc`'s `FlatCompat` shim to keep the legacy
// `eslint-config-google` and `eslint-config-prettier` configs working.
//
// We strip `valid-jsdoc` and `require-jsdoc` from the loaded `google`
// config because both rules were deprecated and removed from core
// ESLint in v9.0.0 and the unmaintained google config still
// references them. JSDoc enforcement belongs in `eslint-plugin-jsdoc`
// or in the JSDoc tooling itself.

import {FlatCompat} from '@eslint/eslintrc';
import jsdoc from 'eslint-plugin-jsdoc';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({baseDirectory: __dirname});

// Rules that were removed from ESLint v9+ but still appear in the
// legacy `eslint-config-google` config. They are filtered out before
// the google rules are merged into the flat config.
const REMOVED_FROM_ESLINT = new Set(['valid-jsdoc', 'require-jsdoc']);

/**
 * Loads a legacy config and removes any rule that no longer exists in
 * the current ESLint runtime. Returns the cleaned array suitable for
 * spread-into a flat config.
 *
 * @param {...string} names Config names to `extends`.
 * @return {Array<Object>} Cleaned flat-config segments.
 */
function cleanedExtends(...names) {
  const segments = compat.extends(...names);
  return segments.map((segment) => {
    if (!segment || typeof segment !== 'object') return segment;
    const rules = segment.rules;
    if (!rules || typeof rules !== 'object') return segment;
    const filtered = {};
    for (const [name, value] of Object.entries(rules)) {
      if (REMOVED_FROM_ESLINT.has(name)) continue;
      filtered[name] = value;
    }
    return {...segment, rules: filtered};
  });
}

export default [
  // Ignore patterns (replaces .eslintignore).
  {
    ignores: [
      'coverage/**',
      '.nyc_output/**',
      'node_modules/**',
      'dist/**',
      'docs/**',
      'demo/.next/**',
      'demo/dist/**',
      'demo/node_modules/**',
      '.next/**',
      '.env',
      '*.log',
      '.vscode/**',
      '.idea/**',
      '.DS_Store',
      'out/**',
      '*.tsbuildinfo',
    ],
  },

  // Google (legacy → flat, with removed rules stripped) + Prettier.
  ...cleanedExtends('google', 'prettier'),

  // Project-specific language options and globals.
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Globals declared in the legacy config.
        Plotly: 'readonly',
      },
    },
    rules: {
      // Prettier handles formatting; disable conflicting Google rules.
      'max-len': 'off',
      indent: 'off',
      quotes: 'off',
      'comma-dangle': 'off',
      semi: 'off',
      'block-spacing': 'off',
      'brace-style': 'off',
      'object-curly-spacing': 'off',
      'array-bracket-spacing': 'off',
      'space-before-function-paren': 'off',
      'space-before-blocks': 'off',
      'keyword-spacing': 'off',
      'arrow-parens': 'off',
      'operator-linebreak': 'off',
      'function-paren-newline': 'off',
      'implicit-arrow-linebreak': 'off',
      'no-confusing-arrow': 'off',
      'no-trailing-spaces': 'off',

      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // JSDoc enforcement for the public library surface. We configure
  // eslint-plugin-jsdoc to match Google's JSDoc conventions:
  //   - `@fileoverview` (not `@file`)
  //   - `@return` (not `@returns`)
  //   - `Object`, `Number`, `String`, `Boolean` as capitalized primitives
  // The historical `valid-jsdoc` rule from eslint-config-google covered
  // these checks, but it was removed in ESLint v9.0.0. This block is
  // the replacement so docstring drift is caught at lint time.
  {
    files: ['lib/**/*.js'],
    plugins: {jsdoc},
    settings: {
      jsdoc: {
        // Google's JSDoc style uses these tag names; do not warn on them.
        tagNamePreference: {
          file: 'fileoverview',
          returns: 'return',
          augments: 'extends',
          constant: 'const',
        },
      },
    },
    rules: {
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: [
            'fileoverview',
            'return',
            'override',
            'abstract',
            'enum',
            'template',
            'typedef',
            'throws',
            'example',
            'extends',
            'const',
          ],
        },
      ],
      'jsdoc/check-types': 'off',
      'jsdoc/no-undefined-types': 'off',
      'jsdoc/require-param': 'error',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-return-description': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/valid-types': 'off',
      'jsdoc/require-description': 'off',
    },
  },

  // Test files — relax rules that don't fit Mocha + Chai tests.
  {
    files: ['tests/**/*.js', 'tests/**/*.tests.js'],
    rules: {
      'no-invalid-this': 'off',
    },
  },

  // Experiments — allow console because they are diagnostic scripts.
  {
    files: ['experiments/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },

  // Demo (Next.js + shadcn/ui + recharts) — TypeScript-aware linting is
  // scoped to demo/eslint.config.js; this top-level config only handles
  // JS lib/tests/experiments.
];
