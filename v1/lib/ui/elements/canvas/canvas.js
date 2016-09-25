class GCanvas extends GElement {
  constructor(id, width, height) {
    super('canvas', id);
    this.width = width;
    this.height = height;
    // listen for click events and pass on x/y and button data
  }
  get context2() {
    return this.element.getContext('2d');
  }
  get context3() {
    return this.element.getContext('webgl');
  }
  set width(width) {
    this.element.width = width;
  }
  get width() {
    return this.element.width;
  }
  set height(height) {
    this.element.height = height;
  }
  get height() {
    return this.element.height;
  }
}