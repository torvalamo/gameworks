const GContainer = Base => class extends Base {
  constructor(...args) {
    super(...args);
  }
  add(...children) {
    children.forEach(child => this.element.appendChild(child.element));
  }
  remove(...children) {
    children.forEach(child => this.element.removeChild(child.element));
  }
};
class GElement {
  constructor(element, id) {
    this.element = this.load(element);
    this.element.gClass = this;
    this.id = id;
  }
  set id(id) {
    this.element.id = id;
  }
  get id() {
    return this.element.id;
  }
  addClass(className) {
    this.element.classList.add(className);
  }
  removeClass(className) {
    this.element.classList.remove(className);
  }
  attach(parent) {
    parent.appendChild(this.element);
  }
  detatch() {
    this.element.parent.removeChild(this.element);
  }
  load(element) {
    var tpl = document.querySelector('#template-' + element).content;
    return document.importNode(tpl, true);
  }
}