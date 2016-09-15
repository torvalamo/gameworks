const COS_30 = Math.cos(Math.deg2rad(30));

/**
 * Unchecked possible errors (with no explanation or intention to support):
 * - Can't have tiles that are wider or taller than the map size.
*/

class Map {
  constructor(width, height) {
    this.canvas = document.createElement('canvas');
    //document.body.appendChild(this.canvas);
    this.resize(width, height);
    this.ctx = this.canvas.getContext('2d', {alpha: false});
    this.view = [new Point(0, 0), 1];
    this.tiles = [];
    this.regions = [];
  }
  resize(width, height) {
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
  }
  click(region, buttons, ctrlKey, shiftKey, altKey) {
    console.log(region, buttons, this.tiles[region]);
  }
  draw(p1, zoom) {
    this.view = [p1, zoom];
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.width, this.height);
    // draw the map area corresponding to the given rectangle
    // and stretch it to fit the current canvas size
    var x2 = (p1.x + (this.width - 1) / zoom) % this.width;
    var y2 = (p1.y + (this.height - 1) / zoom) % this.height;
    var p2 = new Point(x2, y2);
    var regions = [];
    console.log(p1, p2, this.width, this.height, zoom);
    this.tiles.forEach(tile => {
      var path;
      if (tile.inView(p1, p2, 0, 0)) {
        //console.log('in view', tile);
        path = tile.relative(p1, zoom);
        regions.push({
          path: path,
          id: tile.id
        });
        this.ctx.fillStyle = tile.color;
        this.ctx.fill(path);
      }
      if (tile.wrapX) {
        var aw = tile.wrapX * this.width;
        var wx1 = p1.translate(aw, 0);
        var wx2 = p2.translate(aw, 0);
        if (tile.inView(wx1, wx2, aw, 0)) {
          path = tile.relative(p1, zoom, aw, 0);
          regions.push({
            path: path,
            id: tile.id
          });
          this.ctx.fillStyle = tile.color;
          this.ctx.fill(path);
        }
      }
      if (tile.wrapY) {
        var ah = tile.wrapY * this.height;
        var wy1 = p1.translate(0, ah);
        var wy2 = p2.translate(0, ah);
        if (tile.inView(wy1, wy2, 0, ah)) {
          path = tile.relative(p1, zoom, 0, ah);
          regions.push({
            path: path,
            id: tile.id
          });
          this.ctx.fillStyle = tile.color;
          this.ctx.fill(path);
        }
      }
    });
    return this.regions = regions;
  }
}

class SquareMap extends Map {
  constructor(width, height, dx, dy, opts) {
    super(width, height);
    var sizeX = width / dx;
    var sizeY = height / dy;
    this.opts = Object.assign({
      pointLinks: false
    }, opts);
    this.tiles = Array(dx * dy).fillFunc(idx => {
      var anchor = new Point((idx % dx) * sizeX, Math.floor(idx / dx) * sizeY);
      /**
       *  a---b
       *  |   |
       *  d---c
       */
      var pointset = new PointSet(
        anchor,
        anchor.translate(sizeX, 0),
        anchor.translate(sizeX, sizeY),
        anchor.translate(0, sizeY)
      );
      return new Tile(idx, pointset, width, height);
    });
    // TODO: Make better.....
    this.tiles.forEach((tile, idx) => {
      // to left
      if (!(idx % dx)) { // col 0
        tile.addLink(this.tiles[idx + dx - 1]);
      } else {
        tile.addLink(this.tiles[idx - 1]);
      }
      // to right
      if (idx % dx == dx - 1) { // col N
        tile.addLink(this.tiles[idx - dx + 1]);
      } else {
        tile.addLink(this.tiles[idx + 1]);
      }
      // to above
      if (!Math.floor(idx / dx)) { // row 0
        tile.addLink(this.tiles[this.tiles.length - dx + idx]);
      } else {
        tile.addLink(this.tiles[idx - dx]);
      }
      // to below
      if (Math.floor(idx / dx) == dy - 1) { // row N
        tile.addLink(this.tiles[idx % dx]);
      } else {
        tile.addLink(this.tiles[idx + dx]);
      }
      if (this.opts.pointLinks) {
        // to top left
        if (!(idx % dx) && !Math.floor(idx / dx)) { // 0,0
          tile.addLink(this.tiles[this.tiles.length - 1]);
        } else if (!(idx % dx)) { // other col 0
          tile.addLink(this.tiles[idx - 1]);
        } else if (Math.floor(idx / dx)) { // other row 0
          tile.addLink(this.tiles[this.tiles.length - dx - 1 + idx]);
        } else {
          tile.addLink(this.tiles[idx - dx - 1])
        }
        // to top right
        if (idx % dx == dx - 1 && !Math.floor(idx / dx)) { // N,0
          tile.addLink(this.tiles[this.tiles.length - dx]);
        } else if (idx % dx == dx - 1) { // other col N
          tile.addLink(this.tiles[idx + 1 - dx * 2]);
        } else if (!Math.floor(idx / dx)) { // other row 0
          tile.addLink(this.tiles[this.tiles.length - dx + idx + 1]);
        } else {
          tile.addLink(this.tiles[idx - dx + 1]);
        }
        // to bottom left
        if (!(idx % dx) && Math.floor(idx / dx) == dy - 1) { // 0,N
          tile.addLink(this.tiles[dx - 1]);
        } else if (!(idx % dx)) { // other col 0
          tile.addLink(this.tiles[idx - 1 + dx * 2]);
        } else if (Math.floor(idx / dx) == dy - 1) { // other row N
          tile.addLink(this.tiles[idx % dx - 1]);
        } else {
          tile.addLink(this.tiles[idx + dx - 1]);
        }
        // to bottom right
        if (idx % dx == dx - 1 && Math.floor(idx / dx) == dy - 1) { // N,N
          tile.addLink(this.tiles[0]);
        } else if (idx % dx == dx - 1) { // other col N
          tile.addLink(this.tiles[idx + 1]);
        } else if (Math.floor(idx / dx) == dy - 1) { // other row N
          tile.addLink(this.tiles[idx % dx + 1]);
        } else {
          tile.addLink(this.tiles[idx + dx + 1]);
        }
      }
    });
  }
}

class TriangleMap extends Map {
  constructor(width, height, dx, dy) {
    super(width, height);
    var sizeX = 2 * width / dx;
    var sizeY = height / dy;
    var size = sizeX;
    this.tiles = Array(dx * dy).fillFunc(idx => {
      var x = idx % dx;
      var y = Math.floor(idx / dx);
      if ((!(x % 2) && !(y % 2)) || (x % 2 && y % 2)) {
        // even tiles in even rows or odd tiles in odd rows
        // pointing down triangle
        var anchor = new Point(x * sizeX / 2, 
                               y * sizeY);
        /**
         *  a---b
         *   \ /
         *    c
         */
        var pointset = new PointSet(
          anchor,
          anchor.translate(sizeX, 0),
          anchor.translate(sizeX / 2, sizeY)
        );
      } else { 
        // pointing up triangle
        var anchor = new Point((x - 1) * sizeX / 2 + sizeX,
                               y * sizeY);
        /**
         *    a
         *   / \
         *  c---b
         */
        var pointset = new PointSet(
          anchor,
          anchor.translate(size / 2, sizeY),
          anchor.translate(size / -2, sizeY)
        );
      }
      return new Tile(idx, pointset, width, height);
    });
  }
}

class HexMap extends Map {
  constructor(width, height, dx, dy) {
    var size = width / (dx + 0.5);
    super(width, height);
    this.tiles = Array(dx, dy).fillFunc(idx => {
      //       a
      //   f       b
      //
      //   e       c
      //       d
      //   size = a->b, b->c, c->d, etc
      //   innerSize = f x a->d, a x b->e, b x c->f, etc
      var innerSize = size * COS_30;
      var anchor = new Point((idx % dx) * innerSize * 2 + innerSize, 
                             Math.floor(idx / dx) * size * 1.5);
      if (Math.floor(idx / dx) % 2) {
        // odd row is moved slightly to the right
        // "a" in odd row is at same point as "c"/"e" in previous row
        anchor = anchor.translate(innerSize, 0);
      }
      var pointset = new PointSet(
        anchor,
        anchor.translate(innerSize, size / 2),
        anchor.translate(innerSize, size * 1.5),
        anchor.translate(0, size * 2),
        anchor.translate(-innerSize, size * 1.5),
        anchor.translate(-innerSize, size / 2)
      );
      return new Tile(idx, pointset, width, height);
    });
  }
}