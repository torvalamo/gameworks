const fs = require('fs');
  
const pattern = /\{([a-z_][a-z0-9_]*)\}/g;

const parse = exports.parse = function(string, callback) {
  console.log('parse');
  var pat = new RegExp(pattern);
  var array = [], match = null;
  while ((match = pat.exec(string)) !== null) {
    if (!~array.indexOf(match[1])) array.push(match[1]);
  }
  console.log(array);
  callback(array);
};

const parseFile = exports.parseFile = function(file, callback) {
  console.log('parseFile');
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    else parse(data, callback);
  });
};

const compile = exports.compile = function(string, locals, callback) {
  console.log('compile', locals);
  callback(string.replace(pattern, (match, p1) => {
    console.log(match, p1);
    if (p1 in locals) return locals[p1];
    return match;
  }));
};

const compileFile = exports.compileFile = function(file, locals, callback) {
  console.log('compileFile');
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    else compile(data, locals, callback);
  })
};