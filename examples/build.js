var Metalsmith = require('metalsmith');
var shortcodes = require('..');

Metalsmith(__dirname)
  .use(shortcodes({ directory: ".", pattern: "*.html" }))
  .build(function(err,files){
    if (err) throw err; 
  });


