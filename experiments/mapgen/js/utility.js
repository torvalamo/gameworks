Math.deg2rad = function(a) {
  return a * Math.PI / 180;
}

Math.rad2deg = function(a) {
  return a * 180 / Math.PI;
}

// fuck it, yolo
Math.COS_30 = Math.cos(Math.deg2rad(30)); // its about 0.866025..

Array.prototype.fillFunc = function(func) {
  for (let i = 0, len = this.length; i < len; i++) {
    this[i] = func(i);
  }
  return this;
}
  
function nmod(n, m) { // negative "wrap around" modulo
  return ((n % m) + m) % m;
}

function zip(a, b, func) {
  var c = Array(Math.min(a.length, b.length));
  for (var i = 0, len = Math.min(a.length, b.length); i < len; i++) {
    c[i] = func(a[i], b[i]);
  }
  return c;
}

function random(min, max) {
  if (typeof max == 'undefined') {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

function zerofill(string, length) {
  if (string.length >= length) return string;
  if (string.padStart) return string.padStart(length, '0');
  string = '0'.repeat(length - string.length) + string;
  return string;
}