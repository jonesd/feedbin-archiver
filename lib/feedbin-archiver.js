const fs = require('fs');

const manager = require('./manager');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: npm start JSON');
  process.exit(1);
}

var articles = JSON.parse(fs.readFileSync(args[0], 'utf8'));

var templateHtml = fs.readFileSync('template.html', 'utf8');

manager.init(articles, templateHtml);
manager.processArticles();
