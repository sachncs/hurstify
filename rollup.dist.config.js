import * as babel from '@babel/core';
import commonjs from '@rollup/plugin-commonjs';

function babelTransform({exclude} = {}) {
  const excludeRE = exclude
    ? typeof exclude === 'string' && exclude.startsWith('/')
      ? new RegExp(exclude.slice(1, -1))
      : new RegExp(exclude)
    : null;
  return {
    name: 'babel-transform',
    async transform(code, id) {
      if (excludeRE && excludeRE.test(id)) return null;
      const result = await babel.transformAsync(code, {
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        filename: id,
        presets: ['@babel/preset-env'],
      });
      return {code: result.code, map: result.map};
    },
  };
}

function babelOutput() {
  return {
    name: 'babel-output',
    async renderChunk(code, chunk) {
      const result = await babel.transformAsync(code, {
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        filename: chunk.fileName,
        presets: ['@babel/preset-env'],
      });
      return {code: result.code, map: result.map};
    },
  };
}

export default [
  {
    input: 'lib/index.js',
    output: [
      {
        file: 'dist/index.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/index.es5.js',
        format: 'es',
        plugins: [babelOutput()],
        sourcemap: true,
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
    ],
  },
  {
    input: 'lib/index.js',
    output: {
      file: 'dist/index.iife.js',
      format: 'iife',
      name: 'hurstify',
      sourcemap: true,
    },
    plugins: [commonjs(), babelTransform({exclude: '/node_modules/'})],
  },
];
