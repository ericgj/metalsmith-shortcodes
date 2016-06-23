'use strict';

var jade = require('jade');
var shortcodes = require('shortcode-parser');
var debug = require('debug')('metalsmith-shortcodes');
var each = require('async').each;
var extend = require('extend');
var join = require('path').join;
var match = require('multimatch');
var fs = require('fs');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin to run wordpress-esque shortcodes through any jade 
 * template in a template `directory`. The template file basename should be 
 * the same as the shortcode.
 *
 * Note this plugin ignores any shortcodes that don't have a corresponding
 * template. To avoid syntax collision with markdown (and any other language
 * that uses single brackets), avoid using shortcodes that are likely to
 * be used e.g. as markdown link or image tags.
 *
 * It's not ideal but for most real cases works fine. The other option is to
 * parameterize the shortcode delimiters (e.g. use `[[` `]]`), but that
 * requires a change to the underlying parser library.
 *
 * @param {String or Object} opts
 *   @property {String} pattern (optional)
 *   @property {String} directory (optional)
 * @return {Function}
 */

var SHORTCODE_RE = /\[\s*([^\/][A-Za-z0-9\-_]*)/g

function plugin(opts){
  opts = opts || {};

  var dir = opts.directory || 'templates';
  var pattern = opts.pattern;

  return function(files, metalsmith, done){

    each(Object.keys(files), convert, done);

    function convert(file, done){
      debug('checking file: %s', file);
      var data = files[file];

      if (pattern && !match(file, pattern)[0]) return done();

      var contents = data.contents.toString()
      var codes = addTemplatesFrom(contents);

      contents = shortcodes.parse(contents,data)
      data.contents = new Buffer(contents);
      debug('converted file: %s', file);

      // sucky workaround to avoid shortcode/template collision between files
      codes.forEach( function(c){ shortcodes.remove(c); } );

      done();

    }

    function addTemplatesFrom(str){
      var codes = [], c
      while (c = SHORTCODE_RE.exec(str)) codes.push(c[1]);
      codes.forEach( function(code){
        var tmpl = join(dir, code + ".jade")
        // if (shortcodes._shortcodes[code]) return;  // need shortcodes.has() 
        debug('found shortcode: %s', code);
        try {
          fs.readFileSync(tmpl)
        } catch(e) { 
          debug('no template found for %s, ignoring', code);
          return;
        }
        shortcodes.add(code, function(buf,attrs,extra){
          var obj = extend({}, extra, attrs, {innerText: buf.toString()});
          return jade.renderFile(tmpl, obj);
        })
      });
      return codes;
    }

  };

}


