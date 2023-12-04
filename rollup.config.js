import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

const plugins = [
  commonjs(),
  resolve(),
  typescript({
    tsconfig: './tsconfig.app.json',
    declaration: true,
    declarationDir: 'dist'
  })
];

const rollupTs = (file) => {
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
    external: ['@rolster/validators', 'rxjs', 'uuid'],
    plugins
  };
};

const exports = ['index', 'helpers'];

export default [...exports.map((file) => rollupTs(file))];
