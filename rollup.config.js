import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

export default {
  input: 'index.js',
  output: {
    file: 'dist/bundle.mjs.js',
    sourcemap: true,
    banner: '#!/usr/bin/env node'
  },
  plugins: [
    commonjs(),
    babel({ babelHelpers: 'bundled' }),
    json(),
    // nodeResolve({ browser: true, preferBuiltins: true }),
    terser()
  ]
};
