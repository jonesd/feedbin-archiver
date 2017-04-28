const should = require('should');

const articleTemplate = require('../lib/article-template');
articleTemplate.init();

describe('article-template', function() {
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

  describe('render', function() {
    it('contains title template', function() {
      var html = articleTemplate.render(article);
      html.should.containEql('<title>test article</title>');
      html.should.containEql('<h1 class="p-name">test article</h1>');
    });
    it('contains author', function() {
      var html = articleTemplate.render(article);
      html.should.containEql('<h2 class="p-author">test author</h2>');
    });
    it('contains content', function() {
      var html = articleTemplate.render(article);
      html.should.containEql('<p>some content</p><img src="picture.jpg">');
    });
    it('can override article content', function() {
      article.content = 'original content';
      var html = articleTemplate.render(article, '<p>Overide Content</p>');
      html.should.containEql('<p>Overide Content</p>');
      html.should.not.containEql(article.content);
    });
    it('contains original url', function() {
      var html = articleTemplate.render(article);
      html.should.containEql('<p>Original URL: <a class="u-url" href="http://test.com/article">http://test.com/article</a></p>');
    });
    it('contains published timestamp', function() {
      var html = articleTemplate.render(article);
      html.should.containEql('<p>Date: <time class="p-publication">2014-07-29T10:46:31.000000Z</time></p>');
    });
    it('faills back to created timestamp when published missing', function() {
      article.published = null;
      var html = articleTemplate.render(article);
      html.should.containEql('<p>Date: <time class="p-publication">2014-07-29T11:06:04.740551Z</time></p>');
    });
  });
});