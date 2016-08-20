export default Base => class extends Base {
  constructor() {
    super();
  }
  add(...children) {
    children.forEach(child => this.contentElement.appendChild(child));
  }
  remove(...children) {
    children.forEach(child => this.contentElement.removeChild(child));
  }
}