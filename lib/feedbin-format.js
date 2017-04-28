/*

Accessors for feedbin JSON format:

 {
 "id": 504686085,
 "title": "sunwooseo:\n\nsunwooseo\ndaniel andresen s/s 15 lookbook.",
 "author": null,
 "content": "<img src=\"http://38.media.tumblr.com/18853e000686e88372f0e39de06ea8bb/tumblr_n9grztmaoA1sqjhoco1_500.jpg\"><br><br><p><a href=\"http://sunwooseo.tumblr.com/post/93195102347/sunwooseo-daniel-andresen-s-s-15-lookbook\" class=\"tumblr_blog\">sunwooseo</a>:</p>\n\n<blockquote>\n<p><strong><a class=\"tumblelog\" href=\"http://tmblr.co/mW5wQaRZ2VlzgI7VBZrsDvg\">sunwooseo</a></strong></p>\n<p>daniel andresen s/s 15 lookbook.</p>\n</blockquote>",
 "url": "http://luketrimble.tumblr.com/post/93201617870",
 "published": "2014-07-29T10:46:31.000000Z",
 "created_at": "2014-07-29T11:06:04.740551Z"
 }

 */

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
  if (!author && article.url) {
    var hostname = url.parse(article.url).hostname;
    if (hostname) {
      author = hostname.split('.')[0];
    }
  }
  if (!author) {
    author = article.id.toString();
  }
  return author;
};
