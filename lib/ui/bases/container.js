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