import rolster from '@rolster/rollup';

export default rolster({
  requiredEsm: true,
  entryFiles: ['index', 'helpers'],
  packages: ['@rolster/commons', '@rolster/validators', 'uuid']
});
