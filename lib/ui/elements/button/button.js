class GButton extends GElement {
  constructor(id, text) {
    super('button', id);
    this.span = this.element.querySelector('span');
    this.img = this.element.querySelector('img');
    if (text) this.text = text;
    this.element.addEventListener('click', e => {
      if (!e.button) this.emit('click');
    });
  }
  set text(text) {
    this.span.innerHTML = text;
  }
}