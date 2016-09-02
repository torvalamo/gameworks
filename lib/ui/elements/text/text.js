class GText extends GElement {
  constructor(id, text) {
    super('text', id);
    if (text) this.text = text;
  }
  set text(text) {
    this.element.innerHTML = text;
  }
}