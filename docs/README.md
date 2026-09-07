# hurstify docs

This folder holds the user-facing documentation. The full API
reference is generated as a single Markdown file at [`API.md`](../API.md)
by `npm run docs` and published alongside the package.

## Guides

- **[Getting started](getting-started.md)** — install from source,
  generate a synthetic fBm path, estimate `H`, run rolling and
  multi-scale analyses.
- **[Architecture](architecture.md)** — strategy-injection design,
  module map, base classes (`Sampler`, `KsObjective`, `Kernel`,
  `StochasticModel`, `Forecaster`, `HypothesisTest`), data flow,
  and design-pattern rationale.

## Reference

- **[API reference](../API.md)** — every exported class, function,
  constant, and typedef, with JSDoc-derived descriptions and
  parameter tables.

## How the docs are produced

`npm run docs` runs `jsdoc2md ./lib/**/*.js > ./API.md`. The `lib/`
JSDoc tags are the single source of truth — type info, descriptions,
defaults, and examples flow from there into the published reference.
See [CONTRIBUTING.md](../CONTRIBUTING.md) for the JSDoc conventions
this project follows.
