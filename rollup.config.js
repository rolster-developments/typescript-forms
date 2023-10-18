import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const plugins = [
  commonjs(),
  resolve(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: 'dist'
  })
];

const createConfiguration = (file) => {
  return {
    input: [`dist/esm/${file}.js`],
    output: [
      {
        file: `dist/cjs/${file}.js`,
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true
      },
      {
        file: `dist/es/${file}.js`,
        format: 'es',
        sourcemap: true,
        inlineDynamicImports: true
      }
    ],
    external: ['rxjs'],
    plugins
  };
};

export default [
  createConfiguration('index'),
  createConfiguration('validators')
];
