
var assert = require('assert');
var equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var subject = require('..');

describe('metalsmith-shortcodes', function(){

  function testFixture(fix,opts,done){
    Metalsmith('test/fixtures/' + fix)
      .use(subject(opts))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/' + fix + '/expected', 'test/fixtures/' + fix + '/build');
        done();
      });
  }

  it('should render a single shortcode', function(done){
    testFixture('basic',{},done);
  });

  it('should render shortcode with content', function(done){
    testFixture('content',{},done);
  });

})


