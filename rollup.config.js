import rolster from '@rolster/rollup';

export default rolster({
  entryFiles: ['index', 'helpers', 'arguments'],
  packages: ['@rolster/commons', '@rolster/validators', 'uuid']
});
