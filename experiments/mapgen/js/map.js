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
    
    this.viewRects = [
      new Rectangle(new Point(0, 0), 
                    new Point(width, height))
    ];
    this.viewTrans = [
      new Point(0, 0)
    ];
  }
  resize(width, height) {
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
  }
  click(region, buttons, ctrlKey, shiftKey, altKey) {
    console.log(region, buttons, this.tiles[region]);
  }
  rescale(origin) {
    console.log('in map.rescale', origin);
    var p1 = origin;
    var p2 = new Point(p1.x + this.width / origin.z,
                       p1.y + this.height / origin.z);
    var p3 = new Point(p2.x % this.width,
                       p2.y % this.height);
    var viewRects, viewTrans;
    if (p2.x > this.width && p2.y < this.height) {
      viewRects = [
        new Rectangle(new Point(p1.x, p1.y), 
                      new Point(this.width, p3.y)),
        new Rectangle(new Point(0, p1.y), 
                      new Point(p3.x, p3.y))
      ];
      viewTrans = [
        new Point(0, 0),
        new Point(-this.width, 0)
      ];
    } else if (p2.x < this.width && p2.y > this.height) {
      viewRects = [
        new Rectangle(new Point(p1.x, p1.y), 
                      new Point(p3.x, this.height)),
        new Rectangle(new Point(p1.x, 0), 
                      new Point(p3.x, p3.y))
      ];
      viewTrans = [
        new Point(0, 0),
        new Point(0, -this.height)
      ];
    } else if (p2.x > this.width && p2.y > this.width) {
      viewRects = [
        new Rectangle(new Point(p1.x, p1.y), 
                      new Point(this.width, this.height)),
        new Rectangle(new Point(0, p1.y), 
                      new Point(p3.x, this.height)),
        new Rectangle(new Point(p1.x, 0), 
                      new Point(this.width, p3.y)),
        new Rectangle(new Point(0, 0), 
                      new Point(p3.x, p3.y))
      ];
      viewTrans = [
        new Point(0, 0),
        new Point(-this.width, 0),
        new Point(0, -this.height),
        new Point(-this.width, -this.height)
      ];
    } else {
      viewRects = [
        new Rectangle(new Point(p1.x, p1.y), 
                      new Point(p2.x, p2.y))
      ];
      viewTrans = [
        new Point(0, 0)
      ];
    }
    this.viewRects = viewRects;
    this.viewTrans = viewTrans;
  }
  draw(origin) {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.width, this.height);
    if (origin) {
      this.rescale(origin);
      var regions = [];
      this.tiles.forEach(tile => {
        console.log('in tile', tile.id);
        tile.getTileViews(...this.viewRects).forEach((pointSets, vrIdx) => {
          pointSets.forEach((pointSet, idx) => {
            console.log(pointSet, tile);
            var path = pointSet.translate(this.viewTrans[vrIdx]).toPath();
            regions.push({
              path: path,
              id: tile.id
            });
          });
        });
      });
      this.regions = regions;
    }
    this.regions.forEach(region => {
      var tile = this.tiles[region.id];
      this.ctx.fillStyle = tile.color;
      this.ctx.fill(region.path);
    });
    return this.regions;
  }
}

class SquareMap extends Map {
  constructor(width, height, dx, dy, opts) {
    super(width, height);
    var sizeX = width / dx;
    var sizeY = height / dy;
    this.opts = Object.assign({
      pointLinks: false,
      continuousX: true,
      continuousY: true
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
    /*
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
    });*/
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