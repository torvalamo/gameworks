class GInput extends GElement {
  constructor(id) {
    super('input', id);
  }
  set value(value) {
    this.element.value = value;
  }
  get value() {
    return this.element.value;
  }
}