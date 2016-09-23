'use strict';

// HAX, should be part of key bindings
const LEFT  = 1;
const RIGHT = 2;
const MID   = 4;
const CTRL  = 8;
const SHIFT = 16;
const ALT   = 32;
const META  = 64;

const COMBO_SELECT = LEFT;
const COMBO_SCROLL = LEFT | SHIFT;

const DEBUG_EVENTS = true;

function hasCombo(e, combo) {
  var keys = e.ctrlKey * CTRL | e.shiftKey * SHIFT |
             e.altKey * ALT | e.metaKey * META;
  return !(e.buttons | keys | combo);
}


const BTN_CONVERT = [1, 2, 4];

const DOM_DELTA_PIXEL = 0;
const DOM_DELTA_LINE = 1;
const DOM_DELTA_PAGE = 2;

const COS_30 = Math.cos(Math.deg2rad(30));

/**
 * _MapView is an abstract representation of the "viewport" dimensions.
 * It only keeps track of translations, zoom and proportions.
 * It is not connected to any DOM element.
 */
class _MapView {
  constructor(width, height, mapWidth, mapHeight) {
    this.width = width;
    this.height = height;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.minZ = Math.max(this.width / this.mapWidth,
                         this.height / this.mapHeight);
    this.maxZ = 10;
    this.interval = 1000 / 60;
    this.speed = 1;
    this.continuousX = true;
    this.continuousY = false;
    this.x = 0;
    this.y = 0;
    this.z = 1;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get z() {
    return this._z;
  }
  set x(x) {
    this._x = nmod(x, this.mapWidth);
    // make sure the scroll doesn't go past non-continuous map edges
    if (!this.continuousX && this._x + this.width / this._z > this.mapWidth) {
      this._x = this.mapWidth - this.width / this._z;
    }
  }
  set y(y) {
    this._y = nmod(y, this.mapHeight);
    // make sure the scroll doesn't go past non-continuous map edges
    if (!this.continuousY && this._y + this.height / this._z > this.mapHeight) {
      this._y = this.mapHeight - this.height / this._z;
    }
  }
  set z(z) {
    console.log(this._z, z, this.maxZ, this.minZ);
    this._z = Math.max(Math.min(z, this.maxZ), this.minZ);
    // make sure the zoom doesn't go past non-continuous map edges
    if (!this.continuousX && 
        this._x + this.width / this._z > this.mapWidth) {
      this._x = this.mapWidth - this.width / this._z;
    }
    if (!this.continuousY && 
        this._y + this.height / this._z > this.mapHeight) {
      this._y = this.mapHeight - this.height / this._z;
    }
  }
  translateX(dx) {
    this.x = this.x + dx / this.z;
    console.log(this.x);
  }
  translateY(dy) {
    this.y = this.y + dy / this.z;
    console.log(this.y);
  }
  translate(dx, dy) {
    this.translateX(dx);
    this.translateY(dy);
  }
  translateSpeed(vx, vy) {
    clearInterval(this._trint);
    if (vx || vy) {
      this._trint = setInterval(() => {
        console.log('interval', vx, vy);
        vx && this.translateX(vx * this.speed);
        vy && this.translateY(vy * this.speed);
      }, this.interval);
    }
  }
  zoom(dz) {
    this.z += dz;
  }
  /**
   * zoomAt
   * Used with mouse wheel to keep the same coordinates
   * under the pointer while zooming.
   * x,y are converted canvas coordinates (0<=x<width,0<=y<height)
   */
  zoomAt(dz, x, y) {
    var z = this.z;
    zoom(dz);
    this.translate((x * x) / (z * this.width),
                   (y * y) / (z * this.height));
  }
  zoomSpeed(vz) {
    clearInterval(this._zmint);
    if (vz) {
      this._zmint = setInterval(() => {
        vz && this.zoom(vz * this.speed);
      }, this.interval);
    }
  }
  slideTo(x, y, z) {
    z = z || this.z;
    clearInterval(this._anint);
    var len = Math.round(1000 / this.interval);
    var dx = x - (this.x + this.width / 2 / this.z);
    var dy = y - (this.y + this.height / 2 / this.z);
    var dz = z - this.z;
    if (this.continuousX && Math.abs(dx) > this.mapWidth / 2) dx *= -1;
    if (this.continuousY && Math.abs(dy) > this.mapHeight / 2) dy *= -1;
    dx /= len;
    dy /= len;
    dz /= len;
    // TODO: make this ease-in-out instead of linear
    var steps = Array(len).fillFunc(idx => [dx, dy, dz]);
    this._anint = setInterval(() => {
      var step = steps.pop();
      if (!step) return clearInterval(this._anint);
      this.translate(step[0], step[1]);
      this.zoom(step[2]);
    }, this.interval);
  }
  moveTo(x, y, z) {
    z = z || this.z;
    var dx = x - (this.x + this.width / 2 / this.z);
    var dy = y - (this.y + this.height / 2 / this.z);
    var dz = z - this.z;
    this.translate(dx, dy);
    this.zoom(dz);
  }
  getRect() {
    return new Rectangle(
      new Point(this.x, this.y), 
      new Point(this.width / this.z, this.height / this.z)
    );
  }
}

/**
 * MapView takes care of
 * - canvas size/resize
 * - rectangle or point selection (send to World)
 * - calculating hot edges, click-drag and 
 *     arrow key scrolling (send to _MapView)
 * - calculating mouse wheel zooming (send to _MapView)
 * - relay ui button scroll and zoom commands to _MapView
 * - drawing hot regions
 * - hot region hover and click (send to Map)
 */
class MapView {
  constructor(opts) {
    this.opts = Object.assign({
      hotEdges: false,
      hotEdgeSize: 10,
      capture: false,
      continuousX: true,
      continuousY: false
    }, opts);
    this.map = opts.map;
    this.canvas = opts.canvas;
    this.view = new _MapView(this.canvas.width, this.canvas.height,
                             this.map.width, this.map.height);
    this.view.continuousX = this.opts.continuousX;
    this.view.continuousY = this.opts.continuousY;
    var obs = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName == 'width') {
          this.width = this.canvas.width;
        } else if (mutation.attributeName == 'height') {
          this.height = this.canvas.height;
        }
      });
    });
    obs.observe(canvas, {attributes: true});
    this.ctx = canvas.getContext('2d', {alpha: false});
    
    /**
     * Capture cursor?
     */
    if (this.opts.capture) {
      canvas.requestPointerLock();
    }
    
    /**
     * Cursor enters canvas
     */
    canvas.addEventListener('mouseenter', e => {
      //console.log('enter', e.clientX);
    });
    
    /**
     * Cursor leaves canvas
     * 
     * - Cancel hot edge animation
     */
    canvas.addEventListener('mouseleave', e => {
      //console.log('leave', e.clientX);
      // cancel translation
      if (this.opts.hotEdges) {
        this.view.translateSpeed(0, 0);
        this.cursor = null;
      }
    });
    
    canvas.addEventListener('mousemove', e => {
      //console.log('move', e.clientX);
      var point = this.convert(e);
      if (this.opts.hotEdges) {
        // proximity to edge indicates speed
        // v = 1     = pointer is on an edge pixel
        // v = 1/hes = pointer is on the hes'th pixel from edge
        // v = 0     = pointer is more than hes pixels from edge
        var hes = this.opts.hotEdgeSize;
        var vx = 0, vy = 0;
        if (point.x < hes) {
          vx = (hes - point.x) / hes;
        } else if (point.x >= this.width - hes) {
          vx = (point.x - (this.width - hes - 1)) / hes;
        }
        if (point.y < hes) {
          vy = (hes - point.y) / hes;
        } else if (point.y >= this.height - hes) {
          vy = (point.y - (this.height - hes - 1)) / hes;
        }
        var v = Math.max(vx, vy);
        // Direction is determined by pointer position 
        // relative to center of view
        var dx = (point.x - (this.width / 2)) / this.width;
        var dy = (point.y - (this.height / 2)) / this.height;
        // normalize
        // total velocity is never more than 1
        var len = Math.sqrt((dx * dx) + (dy * dy));
        vx = v * dx / len;
        vy = v * dy / len;
        //console.log(point.x, point.y, vx, vy);
        this.view.translateSpeed(vx, vy);
        if (vx || vy) {
          var resize = '';
          if (dy < -0.15) resize += 'n';
          if (dy >= 0.15) resize += 's';
          if (dx < -0.15) resize += 'w';
          if (dx >= 0.15) resize += 'e';
          this.cursor = resize + '-resize';
        } else {
          this.cursor = null;
        }
      }
    });
    
    canvas.addEventListener('mousedown', e => {
      
    });
    
    canvas.addEventListener('mouseup', e => {
      
    });
    
    canvas.addEventListener('click', e => {
      
    });
    
    canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
      e.stopPropagation();
    });
    
    canvas.addEventListener('wheel', e => {
      
    });
    
    // Set starting scroll and zoom levels
    //this.translateTo(0, 0);
    //this.zoomTo(0); // automatically adjusts to MIN_ZOOM
    
    // Currently held down buttons (bit flags)
    // 1 = left mb, 2 = right mb, 4 = center mb
    this.buttons = 0;
    
    // Point where select click started
    this.selectStart = null;
    
    // Continuous scroll origin (changes as scroll is updated)
    this.scrollPoint = null;
    
    // Original mousedown points, for each button
    // (used to suppress click if mouse moved)
    // These are client coords, not canvas.
    this.clickStart = {
      COMBO_SELECT: new Point(-1, -1),
      COMBO_SCROLL: new Point(-1, -1)
    };
    
    this.mouseDownRegion = {};
    this.mouseDownPoint = {};
    this.mouseDragPoint = null;
    this.hover = new Point(-1, -1);
    this.select = new Rectangle(-1, -1, 0, 0);
    this.draw(true);
  }
  set width(width) {
    this.view.width = width;
  }
  get width() {
    return this.view.width;
  }
  set height(height) {
    this.view.height = height;
  }
  get height() {
    return this.view.height;
  }
  set cursor(cursor) {
    if (cursor != this._cursor) {
      this.canvas.style.cursor = this._cursor = cursor;
    }
  }
  draw(rescaled) {
    return;
    if (!rescaled) {
      this.map.draw(this.hover, this.select);
    } else {
      this.ctx.clearHitRegions();
      this.map.rescale(this.origin, this.scale);
      this.map.draw(this.hover, this.select).forEach(region => {
        this.ctx.addHitRegion(region);
      });
    }
    this.ctx.drawImage(this.map.canvas, 0, 0);
  }
  translateTo(x, y) {
    this.origin = new Point(x % this.width, y % this.height, z);
    this.draw(true);
  }
  translate(dx, dy) {
    this.translateTo(this.x + dx, this.y + dy);
  }
  zoomTo(z) {
    this.scale = Math.min(Math.max(z, MIN_ZOOM), MAX_ZOOM);
    this.draw(true);
  }
  zoom(dz) {
    this.zoomTo(this.z + dz);
  }
  get x() {
    return this.origin.x;
  }
  get y() {
    return this.origin.y;
  }
  get z() {
    return this.scale;
  }
  convert(e) {
    return this.getCoords(e.clientX, e.clientY);
  }
  getCoords(clientX, clientY) {
    var rect = this.canvas.getBoundingClientRect();
    var style = getComputedStyle(this.canvas);
    clientX = (clientX - rect.left) * this.width / parseInt(style.width);
    clientY = (clientY - rect.top) * this.height / parseInt(style.height);
    this.hover = new Point(clientX, clientY);
    //console.log(this.hover);
    return this.hover;
  }
  convertPoint(point) {
    return this.origin.translate(point.x / this.scale, 
                                 point.y / this.scale);
  }
  enterEvent(e) {
    // mouseenter is ALWAYS followed by a mousemove event 
    // with the same coords, so we ignore this.
  }
  leaveEvent(e) {
    // reset all buttons to off, to prevent weird behavior
    // when returning.
    this.buttons = 0;
    // mouseleave is ALWAYS followed by a mousemove event
    // with the same (off-canvas) coords, so we ignore this.
  }
  moveEvent(e) {
    var point = this.getCoords(e.clientX, e.clientY);
    if (this.buttons && hasCombo(e, COMBO_SCROLL)) {
      var delta = this.mouseDragPoint.translate(-point.x, -point.y);
      this.translate(delta.x / this.z, delta.y / this.z, 0);
      this.mouseDragPoint = point;
      return;
    }
    if (e.region) {
      // redraw hover
      //this.draw();
    }
    if (this.buttons && hasCombo(e, COMBO_SELECT)) {
      this.ctx.strokeStyle = 'gray';
      var x1 = this.mouseDownPoint[CLICK_SELECT_BTN].x;
      var y1 = this.mouseDownPoint[CLICK_SELECT_BTN].y;
      // draw a select rectangle
    }
  }
  clickEvent(e) {
    if (this.clickStart[BTN_CONVERT[e.button]].x != e.clientX ||
        this.clickStart[BTN_CONVERT[e.button]].y != e.clientY) {
      return; // prevent click from firing if the pointer moved
    }
    if (e.region) {
      this.map.click(e.region, e.button, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);
    }
  }
  downEvent(e) {
    console.log('down', e);
    this.buttons = e.buttons;
    var point = this.getCoords(e.clientX, e.clientY);
    if (hasCombo(e, COMBO_SCROLL)) {
      this.scrollPoint = point;
    } else if (hasCombo(e, COMBO_SELECT)) {
      this.selectStart = point;
    }
    this.clickStart[BTN_CONVERT[e.button]] = new Point(e.clientX, e.clientY);
  }
  upEvent(e) {
    console.log('up', e);
    this.mouseDown = e.buttons;
    if (BTN_CONVERT[e.button] == CLICK_SCROLL_BTN) {
      this.scrollPoint = null;
    }
    if (BTN_CONVERT[e.button] == CLICK_SELECT_BTN) {
      // create a select rectangle
    }
  }
  wheelEvent(e) {
    var amount;
    switch (e.deltaMode) {
      case DOM_DELTA_PIXEL:
        amount = -0.1;
        break;
      case DOM_DELTA_LINE:
        amount = -0.5;
        break;
      case DOM_DELTA_PAGE:
        amount = -1;
        break;
    }
    this.zoom(amount * e.deltaY);
    e.preventDefault();
    e.stopPropagation();
  }
  // TODO: touch events (pinch, etc)
}