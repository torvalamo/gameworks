class GTitle extends GElement {
  constructor(id, title, editable) {
    super('title', id);
    if (title) this.title = title;
    if (editable) this.editable = editable;
  }
  set title(title) {
    this.element.innerHTML = title;
  }
  set editable(editable) {
    this.element.contentEditable = editable ? "true" : "false";
    if (editable) {
      if (!this._onedit) {
        this._onedit = () => this.emit('edit', this.element.innerHTML);
        this._onkey = e => {
          if (e.keyCode == '13') {
            this.element.blur();
            e.preventDefault();
          }
          e.stopPropagation();
        };
        this.element.addEventListener('keydown', this._onkey);
        this.element.addEventListener('blur', this._onedit);
      }
    } else {
      this.element.removeEventListener('blur', this._onedit);
      this.element.removeEventListener('keydown', this._onkey);
      this._onedit = null;
      this._onkey = null;
    }
  }
}