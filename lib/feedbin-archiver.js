const fs = require('fs');

const articleTemplate = require('./article-template');
const manager = require('./manager');

const options = require('./options');

var articles = JSON.parse(fs.readFileSync(options.sourcePath, 'utf8'));

articleTemplate.init();

manager.init(articles);
manager.processArticles();
