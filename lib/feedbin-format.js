const url = require('url');

exports.extractTitle = function extractTitle(article) {
  var title = article.title || article.id.toString();
  title = title.trim();
  return title;
};

exports.extractContent = function extractContent(article) {
  return article.content || 'no content';
};

exports.extractAuthor = function extractAuthor(article) {
  var author = article.author;
  if (!author) {
    var hostname = url.parse(article.url).hostname;
    author = hostname.split('.')[0];
  }
  if (!author) {
    author = article.id.toString();
  }
  return author;
};
