class GGroup extends GContainer(GElement) {
  constructor(id) {
    super('group', id);
    this.container = this.element;
  }
}