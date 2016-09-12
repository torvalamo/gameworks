class Map {
  constructor(width, height, _canvas) {
    this.canvas = _canvas || document.createElement('canvas');
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d', {alpha: false});
    this.tiles = [];
    this.zoom = 0;
  }
  draw(center, zoom, active, click) {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.tiles.forEach((tile, idx) => {
      tile.makePath(center, zoom);
      //if (this.ctx.isPointInPath(tile.path, cursor.x, cursor.y)) {
      if (active == idx) {
        this.ctx.fillStyle = click ? tile.click : tile.hover;
        //this.ctx.strokeStyle = 'green';
      } else {
        this.ctx.fillStyle = tile.color;
        //this.ctx.strokeStyle = '#666';
      }
      this.ctx.fill(tile.path);
      //this.ctx.stroke(tile.path);
      if (zoom != this.zoom) {
        this.ctx.removeHitRegion(idx);
        this.ctx.addHitRegion({id: idx, path: tile.path});
      }
    });
    this.zoom = zoom;
  }
}

class SquareMap extends Map {
  constructor(size, width, height, _canvas) {
    super(width * size, height * size, _canvas);
    this.size = size;
    this.wide = width;
    this.high = height;
    this.tiles = Array(width * height).fillFunc(idx => {
      return new SquareTile(idx % width, Math.floor(idx / width), size);
    });
  }
}

class HexMap extends Map {
  constructor(size, width, height, _canvas) {
    var pxh = size * 2;
    var pxw = pxh * Math.cos(Math.deg2rad(30));
    super(pxw * width + pxw / 2, height * pxh * 0.75 + pxh / 4, _canvas);
    this.size = size;
    this.wide = width;
    this.high = height;
    this.tiles = Array(width * height).fillFunc(idx => {
      return new HexTile(idx % width, Math.floor(idx / width), size);
    });
  }
}

class Tile {
  constructor() {
    this.color = '#' + zerofill(random(Math.pow(2, 24)).toString(16), 6);
    this.hover = '#' + zerofill(random(Math.pow(2, 24)).toString(16), 6);
    this.click = '#' + zerofill(random(Math.pow(2, 24)).toString(16), 6);
    this.points = [];
    this.path = null;
  }
  makePath(center, zoom) {
    var path = new Path2D();
    this.points.forEach((point, idx) => {
      point = point.relative(center, zoom);
      if (idx) path.lineTo(point.x, point.y);
      else path.moveTo(point.x, point.y);
    });
    path.closePath();
    return this.path = path;
  }
}

class SquareTile extends Tile {
  constructor(x, y, size) {
    super();
    var adjust = 0;
    this.from = new Point(x * size + adjust, y * size + adjust);
    this.size = size;
  }
  makePath(center, zoom) {
    var from = this.from.relative(center, zoom);
    //var to = this.to.relative(center, zoom);
    var path = new Path2D();
    path.rect(from.x, from.y, this.size, this.size);
    path.closePath();
    return this.path = path;
  }
}

class HexTile extends Tile {
  constructor(x, y, size) {
    super();
    var pxh = size;
    var pxw = pxh * Math.cos(Math.deg2rad(30));
    this.size = size;
    var side = this.side = size / Math.cos(Math.deg2rad(30));
    //       0
    //   5       1
    //
    //   4       2
    //       3
    var top = new Point(x * pxw * 2 + pxw, y * pxh * 1.5);
    if (y % 2) top = top.add(pxw, 0);
    this.points = [
      top,
      top.add(pxw, pxh / 2),
      top.add(pxw, pxh * 1.5),
      top.add(0, pxh * 2),
      top.add(-pxw, pxh * 1.5),
      top.add(-pxw, pxh / 2)
    ];
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  relative(point, zoom) {
    return new Point((this.x - point.x) * zoom, 
                     (this.y - point.y) * zoom);
  }
  add(x, y) {
    return new Point(this.x + x, this.y + y);
  }
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
  console.log(string);
  return string;
}

class MapGen {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d', {alpha: false});
    this.clear();
  }
  clear() {
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  generate(seed, width, height, magnitude) {
    this.clear();
    Math.seedrandom(seed);
    
    this.generateNodes(width, height);
    this.nodes.width = width;
    this.nodes.height = height;
    
    this.generateNodeLinks();
    this.generateNodeDeltas();
    
    this.drawNodes(magnitude);
    this.drawHalfwayPoints();
  }
  generateNodes(width, height) {
    var size = width * height;
    this.nodes = Array(size).fillFunc(i => {
      var node = {
        x: i % width,
        y: Math.floor(i / width),
        pull: Array(8).fillFunc(i => Math.random())
      };
      return node;
    });
  }
  generateNodeLinks() {
    this.nodes.forEach(node => {
      node.links = Array(8).fillFunc(i => {
        var x = node.x, y = node.y;
        if (i > 0 && i < 4) x += 1;
        if (i > 4) x -= 1;
        if (i > 6 || i < 2) y -= 1;
        if (i > 2 && i < 6) y += 1;
        x = nmod(x, this.nodes.width);
        y = nmod(y, this.nodes.height);
        var idx = y * this.nodes.width + x;
        return this.nodes[idx];
      });
    })
  }
  generateNodeDeltas() {
    this.nodes.forEach(node => {
      var pulls = node.links.map((link, idx) => {
        return link.pull[(idx + 4) % 8];
      });
      this.deltaPulls(node.pull, pulls, node);
    });
  }
  drawNodes(magnitude) {
    var nw = this.width / this.nodes.width
      , nh = this.height / this.nodes.height
      , nx = nw / 2
      , ny = nh / 2;
    this.ctx.strokeStyle = '#ccc';
    this.nodes.forEach(node => {
      var x = nx + (node.x * nw)
        , y = ny + (node.y * nh);
      node._x = x;
      node._y = y;
      this.ctx.fillStyle = '#ccc';
      this.ctx.fillRect(x-1, y-1, 3, 3);
      var dx = x + (node.dx * (nw / 3) * magnitude)
        , dy = y + (node.dy * (nh / 3) * magnitude);
      node._dx = dx;
      node._dy = dy;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(dx, dy);
      this.ctx.stroke();
      this.ctx.fillStyle = '#666';
      this.ctx.fillRect(nmod(dx-1, this.width), nmod(dy-1, this.height), 3, 3);
    });
  }
  drawHalfwayPoints() {
    this.ctx.fillStyle = '#c33';
    this.nodes.forEach(node => {
      var points = [];
      node.links.forEach((link, idx) => {
        //var pull = link.pull[(idx + 4) % 8];
        var dx = link._dx - node._dx;
        var dy = link._dy - node._dy;
        if (node.x == 0 && link.x == this.nodes.width - 1) {
          dx = (link._dx - this.width) - node._dx;
        }
        if (node.x == this.nodes.width - 1 && link.x == 0) {
          dx = link._dx - (node._dx + this.width);
        }
        if (node.y == 0 && link.y == this.nodes.height - 1) {
          dy = (link._dy - this.height) - node._dy;
        }
        if (node.y == this.nodes.height - 1 && link.y == 0) {
          dy = link._dy - (node._dy + this.height);
        }
        var x = node._dx + (dx / 2);
        var y = node._dy + (dy / 2);
        points.push([nmod(x, this.width), nmod(y, this.height)]);
      });
      var path = new Path2D();
      points.forEach((point, idx) => {
        if (!idx) path.moveTo(...point);
        else path.lineTo(...point);
        //this.ctx.fillRect(nmod(point[0]-1, this.width), nmod(point[1]-1, this.height), 3, 3);
      });
      path.closePath();
      this.ctx.stroke(path);
    });
  }
  deltaPulls(me, them, node) {
    var dx = 0, dy = 0;
    node.delta = zip(me, them, (a, b) => a - b);

    node.delta.forEach((p, idx) => {
      if (idx % 2) {
        var sign = p / Math.abs(p);
        p = Math.sqrt(Math.pow(p, 2) / 2);
        if (idx < 4) dx += sign * p;
        else dx -= sign * p;
        if (idx < 6 && idx > 2) dy += sign * p;
        else dy -= sign * p;
      }
      else if (idx == 0) dy -= p;
      else if (idx == 2) dx += p;
      else if (idx == 4) dy += p;
      else if (idx == 6) dx -= p;
    });
    node.dx = dx;
    node.dy = dy;
  }
}
  
function nmod(n, m) { // negative "wrap around" modulo
  return ((n % m) + m) % m;
}

Array.prototype.fillFunc = function(func) {
  for (let i = 0, len = this.length; i < len; i++) {
    this[i] = func(i);
  }
  return this;
}

function zip(a, b, func) {
  var c = Array(Math.min(a.length, b.length));
  for (var i = 0, len = Math.min(a.length, b.length); i < len; i++) {
    c[i] = func(a[i], b[i]);
  }
  return c;
}

Math.deg2rad = function(a) {
  return a * Math.PI / 180;
}

Math.rad2deg = function(a) {
  return a * 180 / Math.PI;
}