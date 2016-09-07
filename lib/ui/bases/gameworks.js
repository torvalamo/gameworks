(function(){
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
        else this.content.appendChild(el.element);
      });
    }
    addClass(className) {
      this.element.classList.add(className);
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
      if (!(event in this.listeners)) return 0;
      Object.keys(this.listeners[event]).forEach(uid => this.listeners[event][uid](...args));
      return Object.keys(this.listeners[event]).length;
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
    }
    on(event, listener) {
      if (!(event in this.listeners)) this.listeners[event] = {};
      var uid = ++unique;
      if (!('__event' in listener)) listener.__event = [];
      listener.__event.push(uid);
      this.listeners[event][uid] = listener;
      return this.off.bind(this, event, listener);
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
    }
    removeClass(className) {
      this.element.classList.remove(className);
    }
    set(...elements) {
      this.content.innerHTML = '';
      this.add(...elements);
    }
    
  }
  
  class GWImage extends GWElement {
    constructor(id, src) {
      super(id, create('img', id));
      if (url) this.src = src;
    }
    set src(src) {
      this.element.src = src;
    }
    get src() {
      return this.element.src;
    }
  }
  
  class GWScene extends GWElement {
    constructor(id, fadeTime) {
      super(id, create('section', id));
      this.fadeTime = fadeTime;
      this.convertEvent(this.element, 'click', e => {
        return [e.clientX, e.clientY, e.button, e];
      });
    }
    set fadeTime(fadeTime) {
      if (typeof fadeTime == 'undefined') return;
      if (typeof fadeTime == 'number') {
        if (fadeTime % 1 == 0) { 
          // integer, so it's milliseconds, convert it to seconds
          fadeTime = fadeTime / 1000;
        }
        // make a string with unit
        fadeTime += 's';
      }
      this.element.style.transitionDuration = fadeTime;
    }
    get fadeTime() {
      var dur = window.getComputedStyle(this.element).transitionDuration;
      return Math.round(parseFloat(dur) * 1000);
    }
    enter(delay) {
      if (delay) return setTimeout(() => this.enter(), delay);
      this.removeClass('hide');
      this.addClass('current');
      setTimeout(() => {
        this.emit('start');
      }, this.fadeTime);
      this.emit('enter');
    }
    leave() {
      this.removeClass('current');
      setTimeout(() => {
        this.addClass('hide');
        this.emit('leave');
      }, this.fadeTime);
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
    
    /**
     * Properties
     */
    set debug(bool) {
      return debug = bool;
    }
    get debug() {
      return debug;
    }
    set elementList() {}
    get elementList() {
      // Create a shallow copy of the elementList (so that the internal list isn't altered).
      return Object.assign({}, elementList);
    }
    
    /**
     * Methods
     */
    add(...elements) {
      if (document.readyState !== "loading") {
        super.add(...elements);
      } else {
        this.once('ready', () => super.add(...elements));
      }
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
    box(id) {return new GWBox(id);}
    button(id) {return new GWButton(id);}
    canvas(id) {return new GWCanvas(id);}
    image(id) {return new GWImage(id);}
    pane(id) {return new GWPane(id);}
    scene(id) {return new GWScene(id);}
    text(id) {return new GWText(id);}
    window(id) {return new GWWindow(id);}
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