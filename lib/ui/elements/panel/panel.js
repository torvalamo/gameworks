class GPanel extends GContainer(GElement) {
  constructor(id) {
    super('panel', id);
    this.container = this.element;
  }
}