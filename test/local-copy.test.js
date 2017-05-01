const should = require('should');

const cheerio = require('cheerio');
const localCopy = require('../lib/local-copy');

describe('local-copy', function() {
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

  describe('handleImages', function() {
    var downloads;
    beforeEach(function() {
      downloads = [];
    });

    it('processes images', function() {
      var source = '<html><body>one <img src="http://server.com/one.jpg"></body></html>';
      var c = cheerio.load(source);
      localCopy.test_handleImages(c, 'base', downloads);

      c.html().should.eql('<html><body>one <img src="0.jpg" alt="Original: http://server.com/one.jpg"></body></html>');
      downloads.should.eql([
        {
          localPath: 'base/0.jpg',
          url: 'http://server.com/one.jpg'
        }
      ]);
    });
    it('can support many images', function() {
      var source = '<html><body>one <img src="http://server.com/one.jpg"> and <img src="http://server.com/two.jpg"></body></html>';
      var c = cheerio.load(source);
      localCopy.test_handleImages(c, 'base', downloads);

      c.html().should.containEql('<img src="0.jpg" alt="Original: http://server.com/one.jpg"');
      c.html().should.containEql('<img src="1.jpg" alt="Original: http://server.com/two.jpg"');
      downloads.length.should.eql(2);
    });
    it('ignores non-img refs', function() {
      var source = '<html><body>one <a href="http://server.com/one.jpg">link</a></body></html>';
      var c = cheerio.load(source);
      localCopy.test_handleImages(c, 'base', downloads);

      c.html().should.equal(source);
      downloads.length.should.eql(0);
    });
    it('ignores adverts', function() {
      var source = '<html><body>one <img src="http://imageads.googleadservices.com/pagead.jpg"></body></html>';
      var c = cheerio.load(source);
      localCopy.test_handleImages(c, 'base', downloads);

      c.html().should.equal(source);
      downloads.length.should.eql(0);
    });
    it('transform tumblr', function() {
      var source = '<html><body>one <img src="http://41.media.tumblr.com/abc_500.jpg"></body></html>';
      var c = cheerio.load(source);
      localCopy.test_handleImages(c, 'base', downloads);

      downloads.should.eql([
        {
          localPath: 'base/0.jpg',
          url: 'https://37.media.tumblr.com/abc_500.jpg'
        }
      ]);
    });
  });
});