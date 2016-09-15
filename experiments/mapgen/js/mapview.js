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
    this.zoomAmount = 1;
    this.minZoom = 1;
    this.maxZoom = 10;
    this.scrollOrigin = {};
    this.scrollX = 0;
    this.scrollY = 0;
    this.viewChanged = true;
    this.mouseDown = 0;
    this.mouseDownRegion = {};
    this.mouseDownPoint = {};
    this.mouseDragPoint = null;
    this.map = map;
    this.draw();
  }
  log() {
    console.log(this.zoomAmount, this.scrollX, this.scrollY, this.mouseDown);
  }
  draw() {
    var regions = this.map.draw(new Point(this.scrollX, this.scrollY), this.zoomAmount);
    this.ctx.drawImage(this.map.canvas, 0, 0);
    if (this.viewChanged) {
      this.ctx.clearHitRegions();
      regions.forEach(r => this.ctx.addHitRegion({path: r.path, id: r.id}));
      this.viewChanged = false;
    }
  }
  continuous(x, y) {
    this.map.continuousX = !!x;
    this.map.continuousY = !!y;
  }
  zoomTo(amount) {
    this.zoomAmount = amount;
    if (this.zoomAmount > this.maxZoom) this.zoomTo(this.maxZoom);
    if (this.zoomAmount < this.minZoom) this.zoomTo(this.minZoom);
    this.viewChanged = true;
    this.log();
    this.draw();
  }
  zoom(amount) {
    this.zoomAmount += amount;
    if (this.zoomAmount > this.maxZoom) this.zoomTo(this.maxZoom);
    if (this.zoomAmount < this.minZoom) this.zoomTo(this.minZoom);
    this.viewChanged = true;
    this.log();
    this.draw();
  }
  scrollTo(x, y) {
    this.scrollX = x;
    this.scrollY = y;
    this.viewChanged = true;
    this.log()
    this.draw();
  }
  scroll(amountX, amountY) {
    this.scrollX += amountX;
    this.scrollY += amountY;
    this.viewChanged = true;
    this.log()
    this.draw();
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
      this.scroll(delta.x / this.zoomAmount, delta.y / this.zoomAmount);
      this.mouseDragPoint = new Point(e.clientX, e.clientY);
      return;
    }
    if (e.region) {
      // redraw
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
        amount = 0.1;
        break;
      case DOM_DELTA_LINE:
        amount = 0.5;
        break;
      case DOM_DELTA_PAGE:
        amount = 1;
        break;
    }
    amount *= -e.deltaY;
    this.zoom(amount);
    e.preventDefault();
    e.stopPropagation();
  }
  // TODO: touch events (pinch, etc)
}