/**
 * @fileoverview Generic keyed registry for strategy instances.
 *
 * A single `Registry<T>` is shared by every strategy family
 * (optimizers, samplers, kernels, models, forecasters, KS objectives,
 * hypothesis tests) so the codebase has exactly one place to look up
 * a string key and get a fresh instance back.
 *
 * Conventions:
 *
 * - Factories return a *new* instance per call so no mutable state is
 *   shared between strategies created from the same key.
 * - `register()` overwrites any existing entry; there is no de-duplication.
 * - `list()` returns a snapshot of the keys; the underlying object is
 *   not exposed to callers.
 *
 * @template T
 */
export class Registry {
  /**
   * Initializes an empty registry.
   */
  constructor() {
    this.factories = Object.create(null);
  }

  /**
   * Registers a factory under `name`. The factory is invoked every time
   * `resolve()` (or `get()`) is called for the same name so each caller
   * receives a freshly constructed instance.
   *
   * @param {string} name Key under which the factory is stored.
   * @param {function(): T} factory Zero-arg function returning a fresh `T`.
   * @return {void}
   */
  register(name, factory) {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('Registry.register: name must be a non-empty string');
    }
    if (typeof factory !== 'function') {
      throw new Error('Registry.register: factory must be a function');
    }
    this.factories[name] = factory;
  }

  /**
   * Resolves `name` into a fresh `T` instance. Returns `undefined` when
   * the key has not been registered; callers that need a hard default
   * should use {@link resolveOr} instead.
   *
   * @param {string} name Key to look up.
   * @return {T|undefined} Fresh instance, or `undefined` when missing.
   */
  resolve(name) {
    if (!Object.prototype.hasOwnProperty.call(this.factories, name)) {
      return undefined;
    }
    const factory = this.factories[name];
    if (typeof factory !== 'function') {
      return undefined;
    }
    return factory();
  }

  /**
   * Resolves `name` into a fresh `T` or returns `fallback` when the key
   * is unknown. When `fallback` is itself a string it is resolved
   * recursively (one level only) so callers can chain a primary
   * preferred key against a hard fallback key.
   *
   * @param {string} name Key to look up.
   * @param {string|T} fallback Fallback key or fallback instance.
   * @return {T} Fresh instance from the registry (never `undefined`).
   */
  resolveOr(name, fallback) {
    const instance = this.resolve(name);
    if (instance !== undefined) return instance;
    if (typeof fallback === 'string') {
      const second = this.resolve(fallback);
      if (second !== undefined) return second;
    }
    if (fallback !== undefined) return fallback;
    throw new Error(
      `Registry.resolveOr: no entry for "${name}" and no fallback`,
    );
  }

  /**
   * Returns a snapshot of the registered keys.
   *
   * @return {Array<string>} Keys currently registered.
   */
  list() {
    return Object.keys(this.factories);
  }

  /**
   * Removes a registered entry. No-op when the key is unknown.
   *
   * @param {string} name Key to remove.
   * @return {boolean} `true` when an entry was removed.
   */
  unregister(name) {
    if (!Object.prototype.hasOwnProperty.call(this.factories, name)) {
      return false;
    }
    if (typeof this.factories[name] !== 'function') {
      delete this.factories[name];
      return true;
    }
    delete this.factories[name];
    return true;
  }
}
