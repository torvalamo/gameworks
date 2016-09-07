class GWindow extends GContainer(GElement) {
  constructor(id, title) {
    super('window', id);
    this.container = this.element;
    this.title = new GTitle(id + '-title', title);
    this.add(this.title);
  }
  open() {
    this.emit('open');
    this.removeClass('hide');
  }
  close() {
    this.addClass('hide');
    this.emit('close');
  }
}