const should = require('should');

const articlesDb = require('../lib/articles-db');

describe('articles-db', function() {
  describe('safeFilename', function() {
    it('trims trailing whitespace', function() {
      articlesDb.safeFilename(' one two\t\t').should.equal('one two');
    });
    it('trims duplicate internal whitespace', function() {
      articlesDb.safeFilename('one\t\ttwo').should.equal('one two');
    });
    it('replaces file system sensitive characters', function() {
      articlesDb.safeFilename('a: "quoted"').should.equal('a quoted');
      articlesDb.safeFilename('a/b/c').should.equal('a b c');
    });
    it('limits length of filename', function() {
      const longText = 'a'.repeat(255);
      articlesDb.safeFilename(longText).should.equal('a'.repeat(150));
    });
  });
});