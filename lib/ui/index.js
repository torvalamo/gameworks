const fs = require('fs');
const path = require('path');
const minify = require('minify');
const tpl = require('../tpl');
const compressor = require('node-minify');

function getMinified(files, callback) {
  var list = [], started = 0, ended = 0;
  files.forEach(file => {
    started++;
    minify(file, (err, data) => {
      if (err) {
        console.error(err.message);
        throw err;
      }
      list.push(data);
      ended++;
      if (ended == started) callback(list.join(''));
    });
  });
}

exports.templates = function(elements, callback) {
  var files = elements.map(element => path.join(__dirname, 'elements', element, element + '.html'));
  getMinified(files, callback);
};

exports.styles = function(elements, callback) {
  var files = elements.map(element => path.join(__dirname, 'elements', element, element + '.css'));
  files.unshift(path.join(__dirname, 'index.css'));
  getMinified(files, callback);
};

exports.scripts = function(elements, callback) {
  var files = elements.map(element => path.join(__dirname, 'elements', element, element + '.js'));
  //getMinified(files, callback);
  new compressor.minify({
    type: 'no-compress',
    fileIn: files,
    fileOut: path.join(__dirname, '_elements.js'),
    callback: function(err, min) {
      if (err) {
        console.error(err.message);
        throw err;
      }
      callback(min);
    }
  });
};

exports.bases = function(elements, callback) {
  fs.readdir(path.join(__dirname, 'bases'), (err, files) => {
    if (err) throw err;
    files = files.map(file => path.join(__dirname, 'bases', file));
    //getMinified(files, callback);
    new compressor.minify({
      type: 'no-compress',
      fileIn: files,
      fileOut: path.join(__dirname, '_bases.js'),
      callback: function(err, min) {
        if (err) {
          console.error(err.message);
          throw err;
        }
        callback(min);
      }
    });
  });
};

exports.index = function(elements, callback) {
  console.log('index');
  var file = path.join(__dirname, 'index.html');
  tpl.parseFile(file, names => {
    console.log('parseFile callback');
    var locals = {}, started = 0, ended = 0;
    names = names.filter(name => name in exports);
    if (!names.length) tpl.compileFile(file, locals, callback);
    names.forEach(name => {
      started++;
      exports[name](elements, data => {
        locals[name] = data;
        ended++;
        if (ended == started) tpl.compileFile(file, locals, callback);
      });
    });
  });
};