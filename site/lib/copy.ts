/**
 * Centralized microcopy for the Hurstify UI.
 * Tone: concise, scientific, confident.
 */
export const copy = {
  brand: {
    name: 'hurstify',
    productLine: 'Rough-Volatility Analytics',
    version: 'v1.0',
  },
  shell: {
    workspace: 'Default Workspace',
    online: 'Observatory online',
    skipToMain: 'Skip to main content',
  },
  overview: {
    title: 'Overview',
    subtitle:
      'Real-time estimation, parameter sweeps, and diagnostic figures for the Hurst parameter.',
    emptyTitle: 'No experiments yet',
    emptyDescription:
      'Run a single-window estimate or a parameter sweep to populate your workspace.',
    emptyCta: 'Open Real-Time Estimation',
    sectionRecent: 'Recent experiments',
    sectionStatus: 'System status',
    sectionSnapshots: 'Workspace snapshots',
    snapshotEstimator: 'Estimator',
    snapshotSweep: 'Latest sweep',
    snapshotFigure: 'Latest figure',
    snapshotEmpty: 'No recent runs',
  },
  estimator: {
    title: 'Real-Time Estimation',
    subtitle:
      'Generate a synthetic path, run a sliding-window estimate, and inspect diagnostics.',
    emptyPathTitle: 'No path generated',
    emptyPathDescription:
      'Press Generate Path to produce a synthetic rough-volatility realization.',
    emptyRollingTitle: 'Awaiting first run',
    emptyRollingDescription: 'Configure inputs and press Run Estimation.',
    reliabilityReliable: 'Reliable',
    reliabilityMarginal: 'Marginal',
    reliabilityUnreliable: 'Unreliable',
    actions: {
      generate: 'Generate path',
      run: 'Run estimation',
      reset: 'Reset',
    },
  },
  explorer: {
    title: 'Parameter Explorer',
    subtitle:
      'Sweep Hurst values, window sizes, and optimizers. Compare RMSE, bias, and runtime.',
    searchSpace: 'Search space',
    sweepPreview: 'Sweep configuration',
    actions: {
      run: 'Run sweep',
    },
    bestConfigurations: 'Best configurations',
    emptyTitle: 'No sweep results yet',
    emptyDescription: 'Configure the search space and run a sweep.',
  },
  figures: {
    title: 'Figures / Diagnostics',
    subtitle: 'Replicated figures with configurable parameters and PNG export.',
    actions: {
      rerender: 'Re-render',
      export: 'Export PNG',
    },
    emptyTitle: 'No data to render',
    emptyDescription: 'Adjust inputs and press Re-render.',
  },
  metrics: {
    meanH: 'Mean Ĥ',
    trueH: 'True H',
    bias: 'Bias',
    rmse: 'RMSE',
    stdDev: 'Std dev',
    ciWidth: '95% CI width',
    runtime: 'Runtime',
    pValue: 'p-value',
    significant: 'Significant',
    se: 'Std error',
    ci: '95% CI',
    d: 'KS distance',
    reliability: 'Reliability',
    optimizer: 'Optimizer',
    windowSize: 'Window size',
    failRate: 'Fail rate',
    avgTime: 'Avg time',
  },
  units: {
    ms: 'ms',
    pct: '%',
  },
};

export type Copy = typeof copy;
