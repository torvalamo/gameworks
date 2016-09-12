class SquareMap {
  construct(width, height, size) {
    this.width = width;
    this.height = height;
    this.tiles = {};
    this.pxmap = document.createElement('canvas');
    this.pxmap.width = width;
    this.pxmap.height = height;
    this.pxctx = this.pxmap.getContext('2d', {alpha: false});
    this.pxctx
  }
  
}

class PixelMap {
  construct(width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    this.ctx = this.canvas.getContext('2d', {alpha: false});
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, width, height);
  }
  
}

class Region {
  construct() {
    this.path = new Path2D();
  }
  
}