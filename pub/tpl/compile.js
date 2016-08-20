const order = ['scene'];

const fs = require('fs');
const path = require('path');

const templates = exports.templates = function(order) {
  return order.map((element) => {
    return '<template id="template-' + element + '">' 
      + fs.readFileSync(path.join(element, element + '.js'), 'utf8')
      + '</template>';
  }).join('');
};

const styles = exports.styles = function() {
  return order.map((element) => {
    return fs.readFileSync(path.join(element, element + '.css'), 'utf8');
  }).join('');
};

const scripts = exports.scripts = function() {
  return order.map((element) => {
    return fs.readFileSync(path.join(element, element + '.js'), 'utf8');
  }).join('');
};

const bases = exports.bases = function() {
  return fs.readdirSync('base').forEach((file) => {
    return fs.readFileSync(path.join('base', file), 'utf8');
  }).join('');
}

exports.index = function(order) {
  var out = '<!doctype html>'
    + '<style>' + styles(order) + '</style>'
    + '<script>' + bases() + '</script>'
    + '<script>' + scripts(order) + '</scripts>'
    + templates(order);
  return out;
};