const yargs = require('yargs');

const argv = yargs
  .usage('Usage: $0 [options] <source.json>')
  .demandCommand(1)
  .boolean('v')
  .alias('v', 'verbose')
  .describe('v', 'Verbose logging')
  .help('h')
  .alias('h', 'help')
  .argv;


exports.sourcePath = argv._[0];

exports.verbose = argv.v;