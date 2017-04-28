const async = require('async');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const request = require('request');

const articlesDb = require('./articles-db');
const articleTemplate = require('./article-template');
const feedbinFormat = require('./feedbin-format');

var articles = null;

exports.init = function init(articlesSet) {
  articles = articlesSet;
};

exports.processArticles = function processArticles() {
  var localArticleIds = articlesDb.findLocalArticleIds();
  async.eachSeries(articles, function (article, callback) {
      if (!hasLocal(article, localArticleIds)) {
        console.log('Process: ' + article.id + ' ' + articlesDb.safeFilename(feedbinFormat.extractTitle(article)));
        writeArticle(article, callback);
      } else {
        console.log('Skip: ' + article.id);
        return callback(null, 'skip');
      }
    },
    function (err, result) {
      console.log('done');
    });
};

function writeArticle(article, callback) {
  var pendingArticleBase = articlesDb.createPendingDirectory();
  createHtml(article, pendingArticleBase, function (err, result) {
    if (err) {
      console.log('Failed to process article=' + article.id + ' error=' + err);
      return callback(err);
    }
    createMetadata(article, pendingArticleBase);
    createIdRecord(article, pendingArticleBase);
    articlesDb.commitArticle(article, pendingArticleBase);
    console.log('commited ' + article.id);
    return callback(null, article);
  });
}

function createHtml(article, articlePath, callback) {
  var title = feedbinFormat.extractTitle(article);
  console.log('title=' + title);
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
  replaceDownloadableUrls(content, articlePath, function (err, result) {
    return callback(err, result);
  });
}

function replaceDownloadableUrls(content, localBasePath, callback) {
  var downloads = [];
  var c = cheerio.load(content);
  var images = c('img');
  images.each(function (i) {
    var s = c(this).attr('src');
    if (s) {
      console.log(s);
      var extension = s.split('.').pop();
      var filename = i.toString();
      if (extension && extension.length < 6) {
        filename += '.' + extension;
      }
      var out = path.join(localBasePath, filename);
      c(this).attr('src', filename);
      c(this).attr('alt', 'Original: ' + s);
      downloads.push({url: s, localPath: out});
    }
  });
  async.each(downloads, downloadUrl, function (err) {
    return callback(err, c.html());
  });
}

function downloadUrl(s, callback) {
  var file = fs.createWriteStream(s.localPath);
  request
    .get(s.url)
    .on('error', function (err) {
      console.log('ERROR: download=' + s + ' ' + err);
      if (fs.existsSync(file)) {
        fs.unlink(s.localPath);
      }
      if (callback) {
        callback(err.message);
      }
    })
    .pipe(file);
  file.on('finish', function () {
    file.close(callback);  // close() is async, call cb after close completes.
  });
}
