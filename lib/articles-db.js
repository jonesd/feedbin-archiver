const fs = require('fs');
const glob = require('glob');
const path = require('path');
const tmp = require('tmp');

const feedbinFormat = require('./feedbin-format');

const basePath = 'out';

function createAuthorDirectory(article) {
  var authorDirectoryName = safeFilename(feedbinFormat.extractAuthor(article));
  var authorPath = path.join(basePath, authorDirectoryName);
  if (!fs.existsSync(authorPath)) {
    fs.mkdirSync(authorPath);
  }
  return authorPath;
}

function articleDirectory(article, parentPath) {
  var root = parentPath || basePath;
  var directoryName = safeFilename(feedbinFormat.extractTitle(article) + ' '+article.id.toString());
  return path.join(root, directoryName);
}

exports.createPendingDirectory = function createPendingDirectory(localBasePath) {
  var tmpobj = tmp.dirSync({dir: localBasePath});
  return tmpobj.name;
};

exports.commitArticle = function commitArticle(article, pendingArticleBase) {
  var authorBase = createAuthorDirectory(article);
  var finalArticleBase = articleDirectory(article, authorBase);
  fs.renameSync(pendingArticleBase, finalArticleBase);
};

exports.findLocalArticleIds = function findLocalArticleIds() {
  var paths = glob.sync('**/.*.id');
  var localArticleIds = {};
  paths.forEach(function (p) {
    var result = p.match(/\.(\w+)\.id$/);
    if (result[1]) {
      var id = result[1];
      localArticleIds[id] = id;
    }
  });
  return localArticleIds;
};


function safeFilename(s) {
  var title = s.replace(/[:\\;"'/.\?]/g, ' ');
  title = title.replace(/\s+/g, ' ');
  title = title.trim();
  if (title.length > 150) {
    title = title.substr(0, 150);
  }
  return title;
}
exports.safeFilename = safeFilename;
