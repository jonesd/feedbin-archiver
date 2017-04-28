const fs = require('fs');

const articleTemplate = require('./article-template');
const manager = require('./manager');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: npm start JSON');
  process.exit(1);
}

var articles = JSON.parse(fs.readFileSync(args[0], 'utf8'));

articleTemplate.init();

manager.init(articles);
manager.processArticles();
