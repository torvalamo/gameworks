// HAX, should be part of key bindings
const CLICK_DRAG_BTN = 1;


const BTN_CONVERT = [1, 2, 4];

const DOM_DELTA_PIXEL = 0;
const DOM_DELTA_LINE = 1;
const DOM_DELTA_PAGE = 2;

class MapView {
  constructor(canvas, map) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    var obs = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName == 'width' || mutation.attributeName == 'height') {
          this[mutation.attributeName] = this.canvas[mutation.attributeName];
          this.map.resize(this.width, this.height);
        }
      });
    });
    obs.observe(canvas, {attributes: true});
    this.ctx = canvas.getContext('2d', {alpha: false});
    canvas.addEventListener('mouseenter', e => this.enterEvent(e));
    canvas.addEventListener('mouseleave', e => this.leaveEvent(e));
    canvas.addEventListener('mousemove', e => this.moveEvent(e));
    canvas.addEventListener('click', e => this.clickEvent(e));
    canvas.addEventListener('mousedown', e => this.downEvent(e));
    canvas.addEventListener('mouseup', e => this.upEvent(e));
    canvas.addEventListener('wheel', e => this.wheelEvent(e));
    canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
      e.stopPropagation();
    });
    this.origin = new Point(0, 0, 1);
    this.minZ = 1;
    this.maxZ = 10;
    this.mouseDown = 0;
    this.mouseDownRegion = {};
    this.mouseDownPoint = {};
    this.mouseDragPoint = null;
    this.map = map;
    this.draw(true);
  }
  draw(rescaled) {
    if (!rescaled) {
      this.map.draw();
    } else {
      this.ctx.clearHitRegions();
      this.map.draw(this.origin).forEach(region => {
        this.ctx.addHitRegion(region);
      });
    }
    this.ctx.drawImage(this.map.canvas, 0, 0);
  }
  translateTo(x, y, z) {
    z = Math.min(Math.max(z, this.minZ), this.maxZ);
    this.origin = new Point(x % this.width, y % this.height, z);
    this.draw(true);
  }
  translate(dx, dy, dz) {
    this.translateTo(this.x + dx, this.y + dy, this.z + dz);
  }
  zoomTo(z) {
    this.translateTo(this.x, this.y, z);
  }
  zoom(dz) {
    this.translate(0, 0, dz);
  }
  get x() {
    return this.origin.x;
  }
  get y() {
    return this.origin.y;
  }
  get z() {
    return this.origin.z;
  }
  enterEvent(e) {
    this.moveEvent(e); // just proxy it
  }
  leaveEvent(e) {
    this.moveEvent(e); // just proxy it
    this.mouseDown = 0;
  }
  moveEvent(e) {
    if (this.mouseDown & CLICK_DRAG_BTN) {
      // move map inside view
      var delta = this.mouseDragPoint.translate(-e.clientX, -e.clientY);
      console.log(delta, this.x, this.y, this.z);
      this.translate(delta.x / this.z, delta.y / this.z, 0);
      this.mouseDragPoint = new Point(e.clientX, e.clientY);
      return;
    }
    if (e.region) {
      // redraw hover
      //this.draw();
    }
  }
  clickEvent(e) {
    if (this.mouseDownPoint[BTN_CONVERT[e.button]].x != e.clientX ||
        this.mouseDownPoint[BTN_CONVERT[e.button]].y != e.clientY) {
      return; // prevent click from firing if the pointer moved
    }
    if (e.region) {
      this.map.click(e.region, e.buttons, e.ctrlKey, e.shiftKey, e.altKey);
    }
  }
  downEvent(e) {
    this.mouseDown = e.buttons;
    this.mouseDownRegion[BTN_CONVERT[e.button]] = e.region;
    this.mouseDownPoint[BTN_CONVERT[e.button]] = this.mouseDragPoint = new Point(e.clientX, e.clientY);
  }
  upEvent(e) {
    this.mouseDown = e.buttons;
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