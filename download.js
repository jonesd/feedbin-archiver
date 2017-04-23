var fs = require('fs');
var path = require('path');
var url = require('url');

const async = require('async');
const cheerio = require('cheerio');
const request = require('request');
var tmp = require('tmp');

var basePath = 'out';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node process.js JSON');
  exit(1);
}

const articles = JSON.parse(fs.readFileSync(args[0], 'utf8'));

processArticles();

function processArticles() {
  async.eachSeries(articles, function(article, callback) {
    if (! hasLocal(article)) {
      console.log('Process: '+article.id);
      writeArticle(article, callback);
    } else {
      console.log('Skip: '+article.id);
      return callback(null, 'skip');
    }
  },
  function(err,result) {
    console.log('done '+err);
  });
}

function writeArticle(article, callback) {
  var pendingArticleBase = createPendingDirectory();
  createHtml(article, pendingArticleBase, function(err, result) {
    console.log('complete html'+err+result);
    createMetadata(article, pendingArticleBase);
    var finalArticleBase = articleDirectory(article);
    commitArticle(pendingArticleBase, finalArticleBase);
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
    var author = extractAuthor(article);
    var text = '<html>\n' +
      '<head>\n' +
      '<title>' + title + '</title>\n' +
      '</head>\n' +
      '<body\n>' +
      '<h1>' + title + '</h1>\n' +
      '<h2>' + author + '</h2>\n' +
      '<div>' + content + '</div>\n' +
      '</body>\n' +
      '</html>';

    var titleFilename = safeFilename(title);
    var htmlPath = path.join(articlePath, titleFilename + '.html');
    fs.writeFileSync(htmlPath, text);
    return callback(err, htmlPath);
  });
}

function createMetadata(article, articlePath) {
  //fixme write more into this
  var metadataPath = path.join(articlePath, '.metadata.json');
  var content = JSON.stringify(article);
  fs.writeFileSync(metadataPath, content);
}

function hasLocal(article) {
  return fs.existsSync(articleDirectory(article));
}

function articleDirectory(article) {
  return path.join(basePath, article.id.toString());
}

function extractTitle(article) {
  var title = article.title || article.id.toString();
  title = title.trim();
  return title;
}

function safeFilename(s) {
  var title = s.replace(/[:\;"'/.?]/g, ' ');
  if (title.length > 150) {
    title = title.substr(0, 150);
  }
  return title;
}

function extractContentAndDownloadImages(article, articlePath, callback) {
  var content = extractContent(article);
  replaceDownloadableUrls(content, articlePath, function(err, result) {
    console.log(result);
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
    author = 'unknown';
  }
  return author;
}

function createPendingDirectory(localBasePath) {
  var tmpobj = tmp.dirSync({dir: localBasePath});
  console.log(tmpobj);
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
      console.log('s='+s+' out='+out);
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

function commitArticle(pendingArticleBase, finalArticleBase) {
  fs.renameSync(pendingArticleBase, finalArticleBase);
}