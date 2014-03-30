'use strict';

var jade = require('jade');
var shortcodes = require('shortcode-parser');
var debug = require('debug')('metalsmith-shortcodes');
var each = require('async').each;
var extend = require('extend');
var join = require('path').join;
var match = require('multimatch');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin to run wordpress-esque shortcodes through any jade 
 * template in a template `dir`.
 *
 * Note because of syntax collision with markdown (and any other language
 * that uses single brackets), this plugin should be run late (after HTML
 * generation).
 *
 * @param {String or Object} options
 *   @property {String} file pattern (optional)
 *   @property {String} directory (optional)
 * @return {Function}
 */

var SHORTCODE_RE = /\[\s*([^\s]+)/g

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
        var tmpl = metalsmith.join(dir,code + ".jade")
        if (shortcodes[code]) return; 
        debug('found shortcode: %s', code);
        shortcodes.add(code, function(buf,attrs,extra){
          var obj = extend({},extra,attrs);
          return jade.renderFile(tmpl, obj);
        })
      });
      return codes;
    }

  };

}

