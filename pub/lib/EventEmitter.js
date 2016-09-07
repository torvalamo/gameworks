export default Base => class extends Base {
  constructor() {
    super();
    this.listenerRegistry = {};
  }
  on(event, listener) {
    !(event in this.listenerRegistry) && this.listenerRegistry[event] = [];
    this.listenerRegistry[event].push(listener);
    return this.off.bind(this, event, listener);
  }
  once(event, listener) {
    var nested = ...args => {
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
    this.listenerRegistry[type].forEach(listener => listener(...args));
    return this.listenerRegistry[type].length;
  }
  convertEvent(event, newName, argsFunc, options) {
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
    this.addEventListener(event, listener, options);
  }
}