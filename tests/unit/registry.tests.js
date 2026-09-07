/**
 * Registry<T> unit tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {Registry} from '../../lib/strategies/registry.js';

describe('Registry', function () {
  it('resolves registered factories to fresh instances', function () {
    const reg = new Registry();
    let counter = 0;
    reg.register('counter', () => ({n: ++counter}));
    const a = reg.resolve('counter');
    const b = reg.resolve('counter');
    expect(a).to.deep.equal({n: 1});
    expect(b).to.deep.equal({n: 2});
    expect(a).to.not.equal(b);
  });

  it('returns undefined for unknown keys', function () {
    const reg = new Registry();
    expect(reg.resolve('missing')).to.equal(undefined);
  });

  it('resolveOr returns fallback string when missing', function () {
    const reg = new Registry();
    reg.register('brent', () => 'B');
    expect(reg.resolveOr('unknown', 'brent')).to.equal('B');
  });

  it('resolveOr throws when no fallback is provided', function () {
    const reg = new Registry();
    expect(() => reg.resolveOr('unknown', undefined)).to.throw();
  });

  it('list returns registered keys', function () {
    const reg = new Registry();
    reg.register('a', () => ({}));
    reg.register('b', () => ({}));
    expect(reg.list().sort()).to.deep.equal(['a', 'b']);
  });

  it('unregister removes entries', function () {
    const reg = new Registry();
    reg.register('a', () => ({}));
    expect(reg.unregister('a')).to.equal(true);
    expect(reg.unregister('a')).to.equal(false);
    expect(reg.resolve('a')).to.equal(undefined);
  });

  it('throws on invalid input', function () {
    const reg = new Registry();
    expect(() => reg.register('', () => ({}))).to.throw();
    expect(() => reg.register('a', null)).to.throw();
  });

  it('resolve does not invoke prototype-inherited members', function () {
    const reg = new Registry();
    expect(reg.resolve('toString')).to.equal(undefined);
    expect(reg.resolve('hasOwnProperty')).to.equal(undefined);
    expect(reg.resolve('__proto__')).to.equal(undefined);
  });

  it('resolve returns undefined when value is not a function', function () {
    const reg = new Registry();
    reg.factories['bad'] = 42;
    expect(reg.resolve('bad')).to.equal(undefined);
  });
});
