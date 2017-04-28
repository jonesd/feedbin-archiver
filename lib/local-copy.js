/*

Download local copy of external documents referenced by article content.

Currently only images are downloaded.

 */

const async = require('async');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const request = require('request');

exports.replaceDownloadableUrls = function replaceDownloadableUrls(content, localBasePath, callback) {
  var downloads = [];
  var c = cheerio.load(content);
  handleImages(c, localBasePath, downloads);
  async.each(downloads, downloadUrl, function (err) {
    return callback(err, c.html());
  });
};

function handleImages(c, localBasePath, downloads) {
  var images = c('img');
  images.each(function (i) {
    var s = c(this).attr('src');
    if (s) {
      console.log('Downloading ' + s);
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
}
exports.test_handleImages = handleImages;

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