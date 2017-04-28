const yargs = require('yargs');

const argv = yargs
  .usage('Usage: $0 [options] <source.json>')
  .demandCommand(1)
  .alias('t', 'template')
  .nargs('t', 1)
  .describe('t', 'Article HTML output template')
  .boolean('v')
  .alias('v', 'verbose')
  .describe('v', 'Verbose logging')
  .help('h')
  .alias('h', 'help')
  .argv;


exports.sourcePath = argv._[0];

exports.verbose = argv.v;

exports.templatePath = argv.template;
