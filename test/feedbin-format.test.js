const should = require('should');

const feedbinFormat = require('../lib/feedbin-format');

describe('feedbin-format', function() {
  var article;
  beforeEach(function() {
    article = {
      id: 123456789,
      title: 'test article',
      author: 'test author',
      content: '<p>some content</p><img src="picture.jpg">',
      url: 'http://test.com/article',
      "published": "2014-07-29T10:46:31.000000Z",
      "created_at": "2014-07-29T11:06:04.740551Z"
    }
  });

  describe('extractTitle', function() {
    it('uses title when present', function() {
      feedbinFormat.extractTitle(article).should.equal('test article');
    });
    it('falls back to id when missing', function() {
      article.title = '';
      feedbinFormat.extractTitle(article).should.equal('123456789');
    });
  });

  describe('extractContent', function() {
    it('uses content when present', function() {
      feedbinFormat.extractContent(article).should.equal('<p>some content</p><img src="picture.jpg">');
    });
    it('falls back to placeholder when missing', function() {
      article.content = '';
      feedbinFormat.extractContent(article).should.equal('no content');
    });
  });

  describe('extractAuthor', function() {
    it('uses author when present', function() {
      feedbinFormat.extractAuthor(article).should.equal('test author');
    });
    it('fallback to url hostname', function() {
      article.author = '';
      feedbinFormat.extractAuthor(article).should.equal('test');
    });
    it('ignore missing url', function() {
      article.author = '';
      article.url = '';
      feedbinFormat.extractAuthor(article).should.equal('123456789');
    });
    it('finally fall back to id', function() {
      article.author = '';
      article.url = null;
      feedbinFormat.extractAuthor(article).should.equal('123456789');
    });
  });
});