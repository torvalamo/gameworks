class GBox extends GContainer(GElement) {
  constructor(id) {
    super('box', id);
    this.container = this.element;
  }
}