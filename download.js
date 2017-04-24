var fs = require('fs');
var path = require('path');
var url = require('url');

const async = require('async');
const cheerio = require('cheerio');
const glob = require('glob');
const request = require('request');
var tmp = require('tmp');

var basePath = 'out';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node process.js JSON');
  exit(1);
}

const articles = JSON.parse(fs.readFileSync(args[0], 'utf8'));

const templateHtml = fs.readFileSync('template.html', 'utf8');

processArticles();

function processArticles() {
  var localArticleIds = findLocalArticleIds();
  async.eachSeries(articles, function (article, callback) {
      if (!hasLocal(article, localArticleIds)) {
        console.log('Process: ' + article.id + ' '+safeFilename(extractTitle(article)));
        writeArticle(article, callback);
      } else {
        console.log('Skip: ' + article.id);
        return callback(null, 'skip');
      }
    },
    function (err, result) {
      console.log('done ' + err);
    });
}

function writeArticle(article, callback) {
  var pendingArticleBase = createPendingDirectory();
  createHtml(article, pendingArticleBase, function(err, result) {
    console.log('complete html'+err+result);
    createMetadata(article, pendingArticleBase);
    createIdRecord(article, pendingArticleBase);
    commitArticle(article, pendingArticleBase);
    console.log('commited ' + article.id);
    return callback(err, article);
  });
}

function createHtml(article, articlePath, callback) {
  //fixme use template
  var title = extractTitle(article);
  console.log('title='+title);
  extractContentAndDownloadImages(article, articlePath, function(err, content) {
    //FIXME handle err
    var html = templateHtml;
    var author = extractAuthor(article);
    html = html.replace(/\{\{title\}\}/g, title);
    html = html.replace(/\{\{author\}\}/g, author);
    html = html.replace(/\{\{content\}\}/g, content);
    html = html.replace(/\{\{published\}\}/g, article.published || article.created_at);
    html = html.replace(/\{\{url\}\}/g, article.url);
    var titleFilename = safeFilename(title);
    var htmlPath = path.join(articlePath, titleFilename + '.html');
    fs.writeFileSync(htmlPath, html);
    return callback(err, htmlPath);
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
  var idPath = path.join(articlePath, '.'+id+'.id');
  fs.writeFileSync(idPath, ''+id);
}

function hasLocal(article, localArticleIds) {
  return localArticleIds[article.id.toString()];
}

function createAuthorDirectory(article) {
  var authorDirectoryName = safeFilename(extractAuthor(article));
  var authorPath = path.join(basePath, authorDirectoryName);
  if (!fs.existsSync(authorPath)) {
    fs.mkdirSync(authorPath);
  }
  return authorPath;
}

function articleDirectory(article, parentPath) {
  var root = parentPath || basePath;
  var directoryName = safeFilename(extractTitle(article) + ' '+article.id.toString());
  return path.join(root, directoryName);
}

function extractTitle(article) {
  var title = article.title || article.id.toString();
  title = title.trim();
  return title;
}

function safeFilename(s) {
  var title = s.replace(/[:\;"'/.\?]/g, ' ');
  title = title.replace(/\s+/g, ' ');
  title = title.trim();
  if (title.length > 150) {
    title = title.substr(0, 150);
  }
  return title;
}

function extractContentAndDownloadImages(article, articlePath, callback) {
  var content = extractContent(article);
  replaceDownloadableUrls(content, articlePath, function(err, result) {
    return callback(err, result);
  });

}

function extractContent(article) {
  return article.content || 'no content';
}

function extractAuthor(article) {
  var author = article.author;
  if (!author) {
    var hostname = url.parse(article.url).hostname;
    author = hostname.split('.')[0];
  }
  if (!author) {
    author = article.id.toString();
  }
  return author;
}

function createPendingDirectory(localBasePath) {
  var tmpobj = tmp.dirSync({dir: localBasePath});
  return tmpobj.name;
}

function replaceDownloadableUrls(content, localBasePath, callback) {
  var downloads = [];
  var c = cheerio.load(content);
  var images = c('img');
  images.each(function(i) {
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
      c(this).attr('alt', 'Original: '+s);
      downloads.push({url:s, localPath:out});
    }
  });
  async.each(downloads, downloadUrl, function(err) {
      return callback(err, c.html());
  });
}

function downloadUrl(s, callback) {
  var file = fs.createWriteStream(s.localPath);
  request
    .get(s.url)
    .on('error', function(err) {
      console.log('ERROR: download='+s+' '+err);
      if (fs.existsSync(file)) {
        fs.unlink(s.localPath);
      }
      if (callback) {
        callback(err.message);
      }
    })
    .pipe(file);
  file.on('finish', function() {
    file.close(callback);  // close() is async, call cb after close completes.
  });
}

function commitArticle(article, pendingArticleBase) {
  var authorBase = createAuthorDirectory(article);
  var finalArticleBase = articleDirectory(article, authorBase);
  fs.renameSync(pendingArticleBase, finalArticleBase);
}

function findLocalArticleIds() {
  var paths = glob.sync('**/.*.id');
  var localArticleIds = {};
  paths.forEach(function(p) {
    var result = p.match(/\.(\w+)\.id$/);
    if (result[1]) {
      var id = result[1];
      localArticleIds[id] = id;
    }
  });
  return localArticleIds;
}