class GTab extends GContainer(GElement) {
  constructor(id, title) {
    super('tab', id);
    this.button = new GButton(id + '-button', title);
    this.container = this.element;
  }
  enable() {}
  disable() {}
}