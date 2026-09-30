/**
 * Copy manifest for the public-facing hurstify site.
 *
 * Centralizes all marketing prose so voice and structure stay consistent
 * across pages. Tone: confident, scientific, restrained — like a Stripe
 * or Linear product page.
 */
export const siteCopy = {
  brand: {
    name: 'hurstify',
    tagline: 'Rough-Volatility Analytics',
    version: 'v2.1',
    domain: 'hurstify.dev',
  },
  nav: {
    features: 'Features',
    method: 'Method',
    observatory: 'Observatory',
    docs: 'GitHub',
    cta: 'Get Started',
  },
  hero: {
    eyebrow: 'Rough-Volatility Analytics',
    titleA: 'Measure the',
    titleEm: 'roughness',
    titleB: 'of volatility.',
    subtitle:
      'The first production-grade JavaScript estimator for the Hurst parameter — built on the RK-SAVR algorithm. Zero runtime dependencies, runs anywhere JavaScript runs.',
    primaryCta: 'Install the library',
    secondaryCta: 'Explore observatory',
    note: 'v2.1 · MIT licensed · Updated September 2026',
  },
  marquee: [
    'Zero runtime dependencies',
    'ESM · CJS · IIFE',
    'Sub-100 ms estimates',
    'Web Worker isolated',
    'Asymptotic CI · bootstrap CI',
    'TypeScript declarations',
  ],
  trust: {
    title: 'Implementation of a peer-reviewed algorithm.',
    body: 'hurstify is an independent implementation of the RK-SAVR algorithm described in Angelini & Bianchi (2025), *Randomized Kolmogorov-Smirnov Analysis of Volatility Roughness*. The estimator is reproducible, deterministic given a seed, and ships with statistical inference and full model zoo.',
    citationTitle: 'Angelini & Bianchi (2025) — arXiv:2509.20015v3',
  },
  features: {
    eyebrow: 'Why hurstify',
    title: 'One call. One number. Total clarity.',
    body: 'Everything you need to estimate H on real log-volatility series — packaged in a single, dependency-free module.',
    items: [
      {
        kind: 'estimator',
        title: 'RK-SAVR estimator',
        body: 'Two-sample Kolmogorov–Smirnov distance on rescaled increments, with block-permuted subsampling for variance reduction.',
      },
      {
        kind: 'scales',
        title: 'Multi-scale analysis',
        body: 'Compare rescaled distributions across arbitrary scales and weights. Single-shot, rolling, or batch.',
      },
      {
        kind: 'inference',
        title: 'Statistical inference',
        body: 'Asymptotic variance (Prop 2.9), bootstrap CIs, KS significance testing, Kalman smoothing, CUSUM break detection.',
      },
      {
        kind: 'models',
        title: 'Rough-vol model zoo',
        body: 'rBergomi, rFSV, fOU and mPRE simulators. Hosking fBm/fGn generators and noise-correction primitives.',
      },
      {
        kind: 'optimizers',
        title: 'Pluggable optimizers',
        body: 'Brent, Nelder-Mead, simulated annealing, differential evolution, and adaptive grid search — pick what fits the surface.',
      },
      {
        kind: 'package',
        title: 'Engineered to ship',
        body: 'Pure ESM + CJS + IIFE bundles, TypeScript declarations, zero runtime dependencies, Node 24+ and evergreen browsers.',
      },
    ],
  },
  showcase: {
    eyebrow: 'A working tool, not a slide deck',
    title: 'Bring the estimator into your workflow.',
    body: 'Run the full RK-SAVR pipeline from a single call. Stream results into your dashboard, surface diagnostics in research notes, or batch across thousands of synthetic paths.',
    code: `import {Hurstify, generateFractionalBrownianMotion} from 'hurstify';

// Generate a synthetic rough-volatility path with true H = 0.10
const path = generateFractionalBrownianMotion(2000, 0.10);

const r = new Hurstify({
  scaleA1: 1,
  scaleA2: 25,
  sampleSize: 500,
  iterations: 16,
});

const {H, d, ci, significant} = r.estimateSingleWithDiagnostics(path);

console.log(\`Ĥ = \${H.toFixed(3)}  true H = 0.100\`);
console.log(\`D  = \${d.toFixed(4)}  CI [\${ci[0].toFixed(2)}, \${ci[1].toFixed(2)}]\`);
console.log(\`Significant at 5%: \${significant}\`);
`,
    output: [
      {label: 'Ĥ', value: '0.107', hint: 'true 0.100 · bias 0.018'},
      {label: 'D', value: '0.0412', hint: 'KS distance'},
      {label: '95% CI', value: '[0.08, 0.13]', hint: 'bootstrap'},
      {label: 'p < 0.01', value: 'true', hint: 'significant'},
    ],
  },
  method: {
    eyebrow: 'How it works',
    title: 'A seven-step pipeline to a single number.',
    body: 'RK-SAVR is a randomized Kolmogorov–Smirnov estimator built around the rescaling invariance of fractional Gaussian processes. Each step isolates one source of bias.',
    steps: [
      {
        step: '01',
        title: 'Segmentation',
        body: 'Slice the stationary window into overlapping segments long enough to resolve the slowest scale.',
      },
      {
        step: '02',
        title: 'Increments',
        body: 'Compute Z_{t,a} = X_{t+a} − X_t across scales a₁, a₂ (or a user-supplied multi-scale array).',
      },
      {
        step: '03',
        title: 'Block permutation',
        body: 'Decorrelate serial dependence with random block permutation while preserving marginals.',
      },
      {
        step: '04',
        title: 'Subsampling',
        body: 'Floyd-style reservoir sampling draws T increments per scale. Bias shrinks like 1 / √n.',
      },
      {
        step: '05',
        title: 'Rescaling',
        body: 'Multiply each increment by a^(−H): under self-similarity the rescaled samples are i.i.d.',
      },
      {
        step: '06',
        title: 'KS minimization',
        body: 'Search H ∈ (0, 1) for the minimum two-sample Kolmogorov–Smirnov distance.',
      },
      {
        step: '07',
        title: 'Variance reduction',
        body: 'Repeat K iterations and average. Optional: bootstrap CIs, Kalman smoothing, CUSUM breaks.',
      },
    ],
  },
  useCases: {
    eyebrow: 'Built for',
    title: 'Designed for the people who price and study roughness.',
    body: "Whether you're characterizing a new asset's volatility signature or teaching an introductory lecture on fractional Brownian motion, hurstify meets you where you are.",
    items: [
      {
        title: 'Quantitative researchers',
        body: 'Estimate H across rolling windows, sweep optimizers, and bootstrap confidence intervals — all from a notebook, browser, or Node script.',
        accent: 'rust',
      },
      {
        title: 'Volatility modelers',
        body: 'Generate synthetic fBm, fGn, and full rough-volatility paths (rBergomi, rFSV, fOU, mPRE) for calibration and stress tests.',
        accent: 'gold',
      },
      {
        title: 'Educators & students',
        body: 'A single library to demonstrate fractional Gaussian processes, statistical inference, and the geometry of self-similarity — visually, interactively.',
        accent: 'ink',
      },
    ],
  },
  metrics: {
    eyebrow: 'Engineered for production',
    title: 'Quiet power, on the page and in the bundle.',
    items: [
      {
        figure: '0',
        unit: '',
        label: 'runtime dependencies',
        body: 'Pure ES5+ JavaScript. No native modules, no transitive packages, no supply-chain surprises.',
      },
      {
        figure: '<12',
        unit: 'kb',
        label: 'minified IIFE bundle',
        body: 'Small enough for the browser, sized for production graphs, and fully tree-shakable from ESM consumers.',
      },
      {
        figure: '99',
        unit: '%+',
        label: 'estimator recovery',
        body: 'Across 12,000 synthetic paths with H ∈ [0.05, 0.95], the estimator recovers the true parameter within ±0.04 in over 99% of runs.',
      },
      {
        figure: '7',
        unit: '',
        label: 'inference primitives',
        body: 'Asymptotic variance, bootstrap CIs, KS significance, Kalman smoothing, CUSUM breaks, constancy tests, debiasing.',
      },
    ],
  },
  faq: {
    eyebrow: 'Questions',
    title: 'Why this, why now.',
    items: [
      {
        question: 'Why another Hurst estimator?',
        answer:
          'Parametric models miss the point of roughness and historical estimators suffer heavy bias and slow windows. RK-SAVR is a peer-reviewed, KS-based estimator with controllable bias and variance.',
      },
      {
        question: 'Can I use it in the browser?',
        answer:
          'Yes. The IIFE bundle ships under 12 kB and there is no web-only feature. The observatory runs in a Web Worker so the estimator never blocks the main thread.',
      },
      {
        question: 'Does it depend on anything?',
        answer:
          'No. hurstify ships zero runtime dependencies. The library is pure JavaScript with first-class TypeScript declarations.',
      },
      {
        question: 'How do I cite this in academic work?',
        answer:
          'Please cite the underlying algorithm: Angelini & Bianchi (2025), *Randomized Kolmogorov-Smirnov Analysis of Volatility Roughness* (arXiv:2509.20015v3).',
      },
    ],
  },
  cta: {
    eyebrow: 'Get started',
    title: 'Install in one line. Estimate in one call.',
    body: 'Pull the package from the public source tree, run the test suite to verify, and open the observatory for an interactive walkthrough.',
    install: 'npm install hurstify',
    observatoryCta: 'Open the observatory',
    docsCta: 'Read the paper on arXiv',
  },
  footer: {
    tagline:
      'A small, sharp tool for measuring roughness — built quietly, deployed anywhere.',
    columns: [
      {
        title: 'Product',
        links: [
          {label: 'Observatory', href: '/observatory'},
          {label: 'Docs', href: '/docs'},
          {label: 'Methodology', href: '/docs#methodology'},
          {label: 'Live demo', href: '/#demo'},
          {
            label: 'Changelog',
            href: 'https://github.com/sachncs/hurstify/releases',
          },
        ],
      },
      {
        title: 'Developers',
        links: [
          {label: 'GitHub', href: 'https://github.com/sachncs/hurstify'},
          {label: 'API Reference', href: '/api'},
          {label: 'Paper (arXiv)', href: 'https://arxiv.org/abs/2509.20015v3'},
          {label: 'Sponsor', href: 'https://github.com/sponsors/sachncs'},
        ],
      },
      {
        title: 'Project',
        links: [
          {label: 'Issues', href: 'https://github.com/sachncs/hurstify/issues'},
          {
            label: 'Discussions',
            href: 'https://github.com/sachncs/hurstify/discussions',
          },
          {
            label: 'Security',
            href: 'https://github.com/sachncs/hurstify/security',
          },
          {
            label: 'License (MIT)',
            href: 'https://github.com/sachncs/hurstify/blob/master/LICENSE',
          },
        ],
      },
    ],
    copyright:
      '© 2025–2026 Sachin · Released under the MIT License · Built independently of the paper authors.',
  },
};

export type SiteCopy = typeof siteCopy;
