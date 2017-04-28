const fs = require('fs');
const yargs = require('yargs');

// NOTE do no require any application modules until after the options have been setup

const argv = yargs
  .usage('Usage: $0 [options] <archive directory> <source.json>')
  .demandCommand(2)
  .option('t', {
    alias: 'template',
    nargs: 1,
    normalize: true,
    describe: 'Article HTML output template'
  })
  .option('v', {
    alias: 'verbose',
    type: 'boolean',
    describe: 'Verbose logging'
  })
  .help('h')
  .alias('h', 'help')
  .version()
  .argv;

const options = require('./options');
options.archiveDirectory = argv._[0];
options.sourcePath = argv._[1];
options.verbose = argv.v;
options.templatePath = argv.template;

const articleTemplate = require('./article-template');
const manager = require('./manager');

var articles = JSON.parse(fs.readFileSync(options.sourcePath, 'utf8'));

articleTemplate.init(options.templatePath);

manager.init(articles);
manager.processArticles();
