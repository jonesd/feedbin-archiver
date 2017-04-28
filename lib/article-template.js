/*

Basic HTML based template mechanism. Update html content from article data.

Variables are indicated like: {{varName}}

Supported article variables:
{{title}}
{{author}}
{{content}}
{{published}}
{{url}}

 */
const fs = require('fs');

const feedbinFormat = require('./feedbin-format');

const defaultTemplatePath = 'template.html';

var templateHtml = null;

exports.init = function init(templatePath) {
  var path = templatePath || defaultTemplatePath;
  templateHtml = fs.readFileSync(path, 'utf8');
};

exports.render = function render(article, overrideContent) {
  var html = templateHtml;
  var author = feedbinFormat.extractAuthor(article);
  html = html.replace(/\{\{title\}\}/g, feedbinFormat.extractTitle(article));
  html = html.replace(/\{\{author\}\}/g, feedbinFormat.extractAuthor(article));
  html = html.replace(/\{\{content\}\}/g, overrideContent || feedbinFormat.extractContent(article));
  html = html.replace(/\{\{published\}\}/g, article.published || article.created_at);
  html = html.replace(/\{\{url\}\}/g, article.url);
  return html;
};