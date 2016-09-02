class GTabs extends GContainer(GElement) {
  constructor(id) {
    super('tabs', id);
    this.container = this.element;
    this.header = this.element.querySelector('.tabs_header');
    this.current = null;
  }
  add(...children) {
    super.add(...children);
    children.forEach(child => {
      this.header.appendChild(child.button.element);
      child.__onclick = () => this.select(child);
      child.button.on('click', child.__onclick);
    });
  }
  remove(...children) {
    super.remove(...children);
    children.forEach(child => {
      this.header.removeChild(child.button.element);
      child.button.off('click', child.__onclick);
      child.__onclick = null;
    });
  }
  select(tab) {
    if (this.current) {
      this.current.removeClass('active');
      this.current.button.removeClass('active');
    }
    tab.addClass('active');
    tab.button.addClass('active');
    this.current = tab;
  }
}