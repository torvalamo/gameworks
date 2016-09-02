class GEventEmitter {
  constructor() {
    this.listeners = {};
  }
  static unique() {
    return ++GEventEmitter._unique;
  }
  on(event, listener) {
    if (!(event in this.listeners)) this.listeners[event] = {};
    var uid = GEventEmitter.unique();
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
  off(event, listener) {
    if (!(event in this.listeners)) return;
    var uid = -1;
    for (var i = 0, len = listener.__event.length; i < len; i++) {
      if (listener.__event[i] in this.listeners) {
        uid = listener.__event[i];
        break;
      }
    }
    if (~uid) delete this.listeners[event][uid];
  }
  emit(event, ...args) {
    if (!(event in this.listeners)) return 0;
    Object.keys(this.listeners[event]).forEach(uid => this.listeners[event][uid](...args));
    return Object.keys(this.listeners[event]).length;
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
}

GEventEmitter._unique = 0;