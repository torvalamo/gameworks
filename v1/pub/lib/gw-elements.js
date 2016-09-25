const SCENE_FADE_TIME = 1200;
const GW_STYLESHEET = 'style/gw.css';

class Component extends HTMLElement {
  constructor() {
    super();
    this.listenerRegistry = {};
  }
  on(event, listener) {
    if (!(event in this.listenerRegistry)) this.listenerRegistry[event] = [];
    this.listenerRegistry[event].push(listener);
    return this.off.bind(this, event, listener);
  }
  once(event, listener) {
    var nested = (...args) => {
      !listener(...args) && this.off(event, nested)
    }
    return this.on(event, nested);
  }
  off(event, listener) {
    if (!(event in this.listenerRegistry)) return;
    var idx = this.listenerRegistry[event].indexOf(listener);
    if (~idx) return this.listenerRegistry[event].splice(idx, 1);
  }
  emit(event, ...args) {
    if (!(event in this.listenerRegistry)) return 0;
    this.listenerRegistry[event].forEach(listener => listener(...args));
    return this.listenerRegistry[event].length;
  }
  convertEvent(element, event, newName, argsFunc, options) {
    if (typeof newName != 'string') {
      options = argsFunc;
      argsFunc = newName;
      newName = event;
    }
    if (typeof argsFunc != 'function') {
      options = argsFunc;
      argsFunc = e => [e];
    }
    var listener = e => {
      var args = argsFunc(e);
      args && this.emit(newName, ...args);
    }
    element.addEventListener(event, listener, options);
  }
}

class Container extends Component {
  constructor() {
    super();
  }
  add(...children) {
    children.forEach(child => this.appendChild(child));
  }
  remove(...children) {
    children.forEach(child => this.removeChild(child));
  }
}

class ShadowedContainer extends Container {
  constructor() {
    super();
    this.shadowElement = this.createShadowRoot();
    var style = document.createElement('style');
    style.innerHTML = '@import "' + GW_STYLESHEET + '"';
    this.addShadow(style);
  }
  addShadow(...children) {
    children.forEach(child => this.shadowElement.appendChild(child));
  }
}

class ShadowedComponent extends Component {
  constructor() {
    super();
    this.shadowElement = this.createShadowRoot();
    var style = document.createElement('style');
    style.innerHTML = '@import "' + GW_STYLESHEET + '"';
    this.addShadow(style);
  }
  addShadow(...children) {
    children.forEach(child => this.shadowElement.appendChild(child));
  }
}

customElements.define(
  'g-scene', 
  class extends Container {
    constructor() {
      super();
      this.convertEvent(this, 'click', e => []);
    }
    enter() {
      this.classList.add('current');
      this.emit('enter');
      setTimeout(() => this.emit('start'), SCENE_FADE_TIME);
    }
    leave() {
      this.classList.remove('current');
      this.emit('stop');
      setTimeout(() => this.emit('leave'), SCENE_FADE_TIME);
    }
  });

customElements.define(
  'g-window',
  class extends ShadowedContainer {
    constructor() {
      super();
      this.windowTitle = document.createElement('g-title');
      this.windowTitle.contentEditable = "false";
      this.windowTitle.addEventListener('input', e => {
        if (this.windowTitle.innerHTML.search(/[\r\n]/)) {
          this.windowTitle.innerHTML = this.windowTitle.innerHTML.replace(/[\r\n]/, '');
          this.windowTitle.blur();
        }
      });
      this.convertEvent(this.windowTitle, 'blur', 'rename', e => [this.windowTitle.innerHtml]);
      this.closeButton = document.createElement('g-button');
      this.closeButton.addEventListener('click', () => this.close());
      this.addShadow(this.windowTitle, this.closeButton);
    }
    set editable(editable) {
      this.windowTitle.contentEditable = editable ? "true" : "false";
    }
    get editable() {
      return this.windowTitle.isContentEditable;
    }
    set title(title) {
      this.windowTitle.innerHTML = title;
    }
    get title() {
      return this.windowTitle.innerHTML;
    }
    set closeable(closeable) {
      closeable 
        ? this.classList.add('closeable') 
        : this.classList.remove('closeable');
    }
    open() {
      this.classList.add('open');
      this.emit('open');
    }
    close() {
      this.classList.remove('open');
      this.emit('close');
    }
  });

customElements.define(
  'g-modal',
  class extends ShadowedContainer {
    constructor() {
      super();
      this.modalTitle = document.createElement('g-title');
      this.addShadow(this.modalTitle);
    }
    set title(title) {
      this.modalTitle.innerHTML = title;
    }
    get title() {
      return this.modalTitle.innerHTML;
    }
    show() {
      this.classList.add('show');
      this.emit('show');
    }
    hide() {
      this.classList.remove('show');
      this.emit('hide');
    }
  });

customElements.define(
  'g-title',
  class extends Component {});

customElements.define(
  'g-group',
  class extends Container {});

customElements.define(
  'g-tabs',
  class extends ShadowedContainer {
    constructor() {
      super();
      this.tabsList = document.createElement('g-group');
      this.addShadow(this.tabsList);
      this.currentTab = null;
    }
    add(...tabs) {
      super.add(...tabs);
      tabs.forEach(tab => {
        tab.on('click', tab.__clickEvent = () => this.goto(tab));
        this.tabsList.add(tab.tabButton);
      });
      !this.currentTab && this.goto(tabs.unshift());
    }
    remove(...tabs) {
      super.remove(...tabs);
      tabs.forEach(tab => {
        tab.off('click', tab.__clickEvent);
        delete tab.__clickEvent;
        this.tabsList.remove(tab.tabButton);
      });
      this.currentTab && !this.currentTab.parentNode && this.goto(this.firstChild);
    }
    goto(tab) {
      if (this.currentTab) {
        this.currentTab.tabButton.classList.remove('active');
        this.currentTab.classList.remove('active');
      }
      if (!tab) {
        this.currentTab = null;
        return;
      }
      tab.tabButton.classList.add('active');
      tab.classList.add('active');
      this.currentTab = tab;
    }
  });

customElements.define(
  'g-tab',
  class extends Container {
    constructor() {
      super();
      this.tabButton = document.createElement('g-button');
      this.tabButton.on('click', () => this.emit('click'));
    }
    set title(text) {
      this.tabButton.text = text;
    }
    set icon(url) {
      this.tabButton.icon = url;
    }
  });

customElements.define(
  'g-button',
  class extends ShadowedComponent {
    constructor() {
      super();
      this.convertEvent(this, 'click', e => e.button ? false : []);
      this.buttonIcon = document.createElement('img');
      this.buttonText = document.createTextNode('');
      this.addShadow(this.buttonIcon, this.buttonText);
    }
    set text(text) {
      this.buttonText.data = text;
    }
    set icon(url) {
      this.buttonIcon.src = url;
    }
  }, {extends: 'button'});

customElements.define(
  'g-canvas',
  class extends Component {
    constructor() {
      super();
      var func = e => {
        var bcr = this.getBoundingClientRect();
        return [Math.floor(e.clientX) - bcr.left, Math.floor(e.clientY) - bcr.top, e.buttons, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey];
      }
      this.convertEvent(this, 'click', func);
      this.convertEvent(this, 'dblclick', func);
      this.convertEvent(this, 'mousedown', func);
      this.convertEvent(this, 'mouseup', func);
      //this.convertEvent('mouseover', func);
      this.convertEvent(this, 'mousemove', func);
    }
  }, {extends: 'canvas'});

customElements.define(
  'g-input',
  class extends Component {
    constructor() {
      super();
      this.addEventListener('input', e => {
        if (this.value.search(/[\r\n]/)) {
          this.value = this.value.replace(/[\r\n]/, '');
          this.blur();
        }
      });
      this.convertEvent(this, 'blur', 'edit', e => [this.innerHtml]);
    }
  }, {extends: 'input'});