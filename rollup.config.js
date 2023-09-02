export default {
  input: 'dist/esm/index.js',
  output: [
    {
      file: 'dist/lib.js',
      format: 'es',
      sourcemap: true,
      inlineDynamicImports: true
    },
    {
      file: 'dist/lib.cjs.js',
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true
    }
  ],
  plugins: []
};
