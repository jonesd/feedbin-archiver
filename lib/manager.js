const async = require('async');
const fs = require('fs');
const path = require('path');

const articlesDb = require('./articles-db');
const articleTemplate = require('./article-template');
const feedbinFormat = require('./feedbin-format');
const localCopy = require('./local-copy');
const options = require('./options');

var articles = null;

exports.init = function init(articlesSet) {
  articles = articlesSet;
};

exports.processArticles = function processArticles() {
  var localArticleIds = articlesDb.findLocalArticleIds();
  var failedArticlesIds = [];
  async.eachSeries(articles, function (article, callback) {
      if (!hasLocal(article, localArticleIds) || options.force) {
        console.log('Process: ' + article.id + ' ' + articlesDb.safeFilename(feedbinFormat.extractTitle(article)));
        writeArticle(article, function(err, result) {
          if (err) {
            failedArticlesIds.push(article.id);
            return callback(null, 'aborted');
          } else {
            return callback(null, 'ok');
          }
        });
      } else {
        console.log('Skip: ' + article.id);
        return callback(null, 'skip');
      }
    },
    function (err, result) {
      if (failedArticlesIds && failedArticlesIds.length > 0) {
        console.log('Arborted '+failedArticlesIds.length+' articles');
      }
      console.log('done');
    });
};

function writeArticle(article, callback) {
  var pendingArticleBase = articlesDb.createPendingDirectory(article);
  createHtml(article, pendingArticleBase, function (err, result) {
    if (err) {
      console.log('Failed: ' + article.id + ' error=' + err);
      articlesDb.abortArticle(article, pendingArticleBase);
      return callback(err);
    }
    createMetadata(article, pendingArticleBase);
    createIdRecord(article, pendingArticleBase);
    var finalPath = articlesDb.commitArticle(article, pendingArticleBase);
    if (options.verbose) {
      console.log('Commited '+finalPath);
    }
    return callback(null, article);
  });
}

function createHtml(article, articlePath, callback) {
  var title = feedbinFormat.extractTitle(article);
  extractContentAndDownloadImages(article, articlePath, function (err, content) {
    if (err) {
      return callback(err);
    }
    var html = articleTemplate.render(article, content);
    var titleFilename = articlesDb.safeFilename(title);
    var htmlPath = path.join(articlePath, titleFilename + '.html');
    fs.writeFileSync(htmlPath, html);
    return callback(null, htmlPath);
  });
}

function createMetadata(article, articlePath) {
  //fixme write more into this
  var metadataPath = path.join(articlePath, '.metadata.json');
  var content = JSON.stringify(article);
  fs.writeFileSync(metadataPath, content);
}

function createIdRecord(article, articlePath) {
  var id = article.id.toString();
  var idPath = path.join(articlePath, '.' + id + '.id');
  fs.writeFileSync(idPath, '' + id);
}

function hasLocal(article, localArticleIds) {
  return localArticleIds[article.id.toString()];
}

function extractContentAndDownloadImages(article, articlePath, callback) {
  var content = feedbinFormat.extractContent(article);
  localCopy.replaceDownloadableUrls(content, articlePath, function (err, result) {
    return callback(err, result);
  });
}

