const fs = require('fs');
const path = require('path');
const linefile = require('linefile');

/**
 * Return ordered element folders.
 */
function elementList(callback) {
  var dir = path.join(__dirname, 'elements');
  linefile(path.join(dir, '.order'), (err, data) => {
    if (err) throw err;
    callback(data);
  })
}

/**
 * Return ordered style files, including user styles.
 */
function styleFiles(callback) {
  var userDir = path.join(__dirname, '../../app/client');
  // Get order of user stylesheets
  linefile(path.join(userDir, '.css'), (err, data) => {
    if (err) throw err;
    data = data.map(file => {
      if (file.substr(file.length - 4) != '.css') file += '.css';
      return '/client/' + file;
    });
    // insert base stylesheet
    data.unshift('/elements.css');
    callback(data);
  });
}

/**
 * Return script files, including user scripts.
 */
function scriptFiles(callback) {
  var userDir = path.join(__dirname, '../../app/client');
  linefile(path.join(userDir, '.js'), (err, data) => {
    if (err) throw err;
    data = data.map(file => {
      if (file.substr(file.length - 3) != '.js') file += '.js';
      return '/client/' + file;
    });
    // insert base scrpts, in reverse order
    data.unshift('/gameworks.js');
    data.unshift('/elements.js');
    callback(data);
  });
}

/**
 * Return templates.
 */
function templates(callback) {
  var dir = path.join(__dirname, 'elements');
  elementList(elements => {
    var templates = [], count = elements.length, complete = 0;
    elements.forEach(element => {
      fs.readFile(path.join(dir, element, element + '.html'), 'utf8', (err, data) => {
        if (err) throw err;
        templates.push(data.trim());
        if (++complete == count) callback(templates.join('\n'));
      });
    });
  });
}

/**
 * Return the root page with templates, script and styles all included or linked.
 */
exports.index = function(title, callback) {
  var out = `<!doctype html>\n<title>${title}</title>`;
  styleFiles(files => {
    var styles = files.map(file => `<link href="${file}" rel="stylesheet">`).join('\n');
    scriptFiles(files => {
      var scripts = files.map(file => `<script src="${file}"></script>`).join('\n');
      templates(tpl => {
        out += `\n${styles}\n${tpl}\n${scripts}`;
        callback(out);
      });
    })
  });
};

/**
 * Return the main gameworks script. /gameworks.js
 */
exports.main = function(callback) {
  fs.readFile(path.join(__dirname, 'bases', 'main.js'), 'utf8', (err, data) => {
    if (err) throw err;
    callback(data);
  });
};

/**
 * Return base class and element scripts. /elements.js
 */
exports.scripts = function(callback) {
  var dir = path.join(__dirname, 'elements'), scripts = [];
  fs.readFile(path.join(__dirname, 'elements/eventemitter.js'), 'utf8', (err, data) => {
    if (err) throw err;
    scripts.push(data);
    fs.readFile(path.join(__dirname, 'elements/element.js'), 'utf8', (err, data) => {
      if (err) throw err;
      scripts.push(data);
      fs.readFile(path.join(__dirname, 'elements/container.js'), 'utf8', (err, data) => {
        if (err) throw err;
        scripts.push(data);
        elementList(elements => {
          var count = elements.length, complete = 0;
          elements.forEach(element => {
            fs.readFile(path.join(dir, element, element + '.js'), 'utf8', (err, data) => {
              if (err) throw err;
              scripts.push(data.trim());
              if (++complete == count) callback(scripts.join('\n'));
            });
          });
        });
      });
    });
  });
};

/**
 * Return base and element styles. /elements.css
 */
exports.styles = function(callback) {
  var dir = path.join(__dirname, 'elements'), styles = [];
  fs.readFile(path.join(__dirname, 'bases', 'default.css'), 'utf8', (err, data) => {
    if (err) throw err;
    styles.push(data);
    elementList(elements => {
      if (err) throw err;
      var count = elements.length, complete = 0;
      elements.forEach(element => {
        fs.readFile(path.join(dir, element, element + '.css'), 'utf8', (err, data) => {
          if (err) throw err;
          styles.push(data.trim());
          if (++complete == count) callback(styles.join('\n'));
        });
      });
    });
  });
};