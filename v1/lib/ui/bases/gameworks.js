(function(){
  'use strict';
  const debug = true;
  const elementList = {};
  const sceneList = [];
  const windowGroups = {};
  const unique = 0;
  
  function create(tag, id, ...classes) {
    var el = document.createElement(name);
    if (id) el.id = id;
    classes.forEach(c => el.classList.add(c));
    return el;
  }
  
  class GWElement {
    constructor(id, element, content) {
      if (id in elementList) {
        throw new Error('Duplicate element id ' + id + '.');
      }
      if (id) elementList[id] = this;
      this.element = element;
      this.content = content || element;
      this.children = [];
      this.listeners = {};
    }
    add(...elements) {
      elements.forEach(el => {
        if (typeof el == 'string') this.content.appendChild(document.createTextNode(el));
        else if (el instanceof GWElement) this.content.appendChild(el.element);
        else this.content.appendChild(el);
      });
      return this;
    }
    addClass(className) {
      this.element.classList.add(className);
      return this;
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
      const listener = e => {
        var args = argsFunc(e);
        args && this.emit(newName, ...args);
      }
      element.addEventListener(event, listener, options);
    }
    emit(event, ...args) {
      if (event in this.listeners) {
        Object.keys(this.listeners[event]).forEach(uid => this.listeners[event][uid](...args));
      }
      return this;
    }
    off(event, listener) {
      if (event in this.listeners) {
        for (var i = 0, len = listener.__event.length; i < len; i++) {
          if (listener.__event[i] in this.listeners) {
            delete this.listeners[event][listener.__event[i]];
            break;
          }
        }
      }
      return this;
    }
    on(event, listener) {
      if (!(event in this.listeners)) this.listeners[event] = {};
      var uid = ++unique;
      if (!('__event' in listener)) listener.__event = [];
      listener.__event.push(uid);
      this.listeners[event][uid] = listener;
      return this;
    }
    once(event, listener) {
      var nested = (...args) => {
        if (!listener(...args)) this.off(event, nested);
      }
      return this.on(event, nested);
    }
    remove(...elements) {
      elements.forEach(el => {
        if (typeof el == 'string') this.content.removeChild(document.createTextNode(el));
        else this.content.removeChild(el.element);
      });
      return this;
    }
    removeClass(className) {
      this.element.classList.remove(className);
      return this;
    }
    set(...elements) {
      this.content.innerHTML = '';
      this.add(...elements);
      return this;
    }
    
  }
  
  class GWBox extends GWElement {
    constructor(id) {
      super(id, create('div', id, 'box'));
    }
  }
  
  class GWButton extends GWElement {
    constructor(id) {
      super(id, create('button', id));
      this.convertEvent(this.element, 'click', e => [e.button, e]);
    }
  }
  
  class GWCanvas extends GWElement {
    construct(id) {
      super(id, create('canvas', id));
    }
    size(width, height) {
      this.element.width = width;
      this.element.height = height;
      return this;
    }
    getContext(type) {
      if (typeof type == 'undefined') return this._ctx;
      this._ctx = this.element.getContext(type);
      return this._ctx;
    }
  }
  
  class GWImage extends GWElement {
    constructor(id, src) {
      super(id, create('img', id));
      if (url) this.src = src;
    }
    src(src) {
      if (typeof src == 'undefined') {
        return this.element.src;
      }
      this.element.src = src;
      return this;
    }
  }
  
  class GWPane extends GWElement {
    constructor(id) {
      super(id, create('div', id, 'pane'));
    }
  }
  
  class GWScene extends GWElement {
    constructor(id) {
      super(id, create('section', id));
      this.convertEvent(this.element, 'click', e => [e.button, e]);
    }
    enter(delay) {
      if (delay) return setTimeout(() => this.enter(), delay);
      this.removeClass('hide');
      this.addClass('current');
      setTimeout(() => {
        this.emit('start');
      }, this.fadeTime);
      this.emit('enter');
      return this;
    }
    fadeTime(fadeTime) {
      if (typeof fadeTime == 'undefined') {
        var dur = window.getComputedStyle(this.element).transitionDuration;
        return Math.round(parseFloat(dur) * 1000);
      }
      if (typeof fadeTime == 'number') {
        if (fadeTime % 1 == 0) { 
          // integer, so it's milliseconds, convert it to seconds
          fadeTime = fadeTime / 1000;
        }
        // make a string with unit
        fadeTime += 's';
      }
      this.element.style.transitionDuration = fadeTime;
      return this;
    }
    leave() {
      this.removeClass('current');
      setTimeout(() => {
        this.addClass('hide');
        this.emit('leave');
      }, this.fadeTime);
      return this;
    }
    goto() {
      gw.goto(this.id);
      return this;
    }
  }
  
  class GWText extends GWElement {
    constructor(id) {
      super(id, create('p', id));
    }
    editable(editable, multiline) {
      if (typeof editable == 'undefined') return this.element.isContentEditable;
      this.element.contentEditable = editable ? "true" : "false";
      if (this._blur) {
        this.element.removeEventListener('blur', this._blur);
        if (!this._multiline) this.element.removeEventListener('input', this._input);
      }
      delete this._blur;
      delete this._input;
      delete this._multiline;
      if (editable) {
        this._blur = () => this.emit('edit', this.element.innerHTML);
        this.element.addEventListener('blur', this._blur);
        if (!(this._multiline = multiline)) {
          this._input = () => {
            if (this.element.innerHTML.search(/[\r\n]/)) {
              this.element.innerHTML = this.element.innerHTML.replace(/[\r\n]/, '');
              this.element.blur();
            }
          };
          this.element.addEventListener('input', this._input);
        }
      }
      return this;
    }
  }
  
  class GWWindow extends GWElement {
    construct(id) {
      var content = gw.pane(id + '-content');
      super(id, create('aside', id), content.element);
      this._title = gw.text(id + '-title');
      this._title.on('edit', t => this.emit('edit', t));
      this.element.add(this._title);
      this._close = gw.button(id + '-close').on('click', () => this.close());
      this._buttons = gw.text(id + '-button-group');
      this._buttons.add(this._close);
      this.element.add(this._buttons);
    }
    addButton(...buttons) {
      this._buttons.add(...buttons);
      return this;
    }
    close() {
      this.addClass('hide');
      this.emit('close');
    }
    editable(...args) {
      return this._title.editable(...args);
    }
    open() {
      this.removeClass('hide');
      this.emit('open');
    }
  }
  
  class GW extends GWElement {
    constructor() {
      super();
      this.currentScene = null;
      window.addEventListener('DOMContentLoader', () => {
        this.element = this.content = document.body;
        document.body.gClass = this;
        this.emit('ready');
      }); 
      window.addEventListener('load', () => this.emit('start'));
      window.addEventListener('contextmenu', e => e.preventDefault());
    }
    add(...elements) {
      if (document.readyState !== "loading") {
        super.add(...elements);
      } else {
        this.once('ready', () => super.add(...elements));
      }
      return gw;
    }
    debug(bool) {
      if (typeof bool == 'undefined') {
        return debug;
      }
      return debug = bool;
    }
    elementList() {
      // Create a shallow copy of the elementList (so that the internal list isn't altered).
      return Object.assign({}, elementList);
    }
    emit(...args) {
      super.emit(...args);
      return gw;
    }
    get(...elements) {
      if (!elements.length) return super.get();
      if (elements.length == 1) return elementList[elements[0]];
      return elements.map(e => elementList[e]);
    }
    goto(sceneId) {
      scene = elementList[sceneId];
      if (this.currentScene) {
        this.currentScene.leave();
        scene.enter(this.currentScene.fadeTime);
      } else {
        scene.enter();
      }
      this.currentScene = scene;
      return gw;
    }
    on(...args) {
      super.on(...args);
      return gw;
    }
    once(...args) {
      super.once(...args);
      return gw;
    }
    remove(...elements) {
      super.remove(...elements);
      return gw;
    }
    set(...elements) {
      super.set(...elements);
      return gw;
    }
    
    /**
     * Shorthand element constructors
     */
    box(id) {return new GWBox(id)}
    button(id) {return new GWButton(id)}
    canvas(id) {return new GWCanvas(id)}
    image(id) {return new GWImage(id)}
    pane(id) {return new GWPane(id)}
    scene(id) {return new GWScene(id)}
    text(id) {return new GWText(id)}
    window(id) {return new GWWindow(id)}
  }
  
  const gwInstance = new GW();
  window.gw = gw = new Proxy((...elements) => {
    return gwInstance.get(...elements);
  }, {
    get: (_, p) => gwInstance[p],
    ownKeys: gwInstance.getOwnPropertyNames.bind(gwInstance),
    set: (_, p, v) => gwInstance[p] = v
  });
})();