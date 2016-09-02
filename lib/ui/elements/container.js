const GContainer = Base => class extends Base {
  constructor(...args) {
    super(...args);
  }
  add(...children) {
    children.forEach(child => this.container.appendChild(child.element));
  }
  remove(...children) {
    children.forEach(child => this.container.removeChild(child.element));
  }
};