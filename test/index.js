
var assert = require('assert');
var equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var subject = require('..');

describe('metalsmith-shortcodes', function(){
  it('should render a single shortcode', function(done){
    Metalsmith('test/fixtures/basic')
      .use(subject())
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/basic/expected', 'test/fixtures/basic/build');
        done();
      });
  });

})


