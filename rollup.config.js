import rolster from '@rolster/rollup';

export default rolster({
  entryFiles: ['index', 'helpers'],
  packages: ['@rolster/commons', '@rolster/validators', 'uuid']
});
