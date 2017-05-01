const fs = require('fs');
const glob = require('glob');
const path = require('path');
const tmp = require('tmp');

const feedbinFormat = require('./feedbin-format');
const options = require('./options');

const basePath = options.archiveDirectory;

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

exports.createPendingDirectory = function createPendingDirectory(article) {
  var pendingPath = path.join(basePath, '.tmp-'+article.id);
  deleteDirectory(pendingPath);
  fs.mkdirSync(pendingPath);
  return pendingPath;
};

exports.commitArticle = function commitArticle(article, pendingArticleBase) {
  var authorBase = createAuthorDirectory(article);
  var finalArticleBase = articleDirectory(article, authorBase);
  deleteDirectory(finalArticleBase);
  moveDirectory(pendingArticleBase, finalArticleBase);
  return finalArticleBase;
};

exports.abortArticle = function abortArticle(article, pendingArticleBase) {
  deleteDirectory(pendingArticleBase);
};

function moveDirectory(fromPath, toPath) {
  fs.renameSync(fromPath, toPath);
}

function deleteDirectory(directoryPath) {
  if (!directoryPath || directoryPath == '/') {
    return;
  }
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach(function(entry) {
      var entry_path = path.join(directoryPath, entry);
      if (fs.lstatSync(entry_path).isDirectory()) {
        deleteDirectory(entry_path);
      } else {
        fs.unlinkSync(entry_path);
      }
    });
    fs.rmdirSync(directoryPath);
  }
}

exports.findLocalArticleIds = function findLocalArticleIds() {
  var paths = glob.sync('**/.*.id', {cwd: basePath});
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
