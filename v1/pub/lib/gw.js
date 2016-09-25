const gw = new class {
  constructor() {
    this.scenesList = {};
    this.currentScene = null;
    this.scene('preload', (scene) => {});
    window.addEventListener('DOMContentLoaded', () => this.goto('preload'));
  }
  main(main) {
    window.addEventListener('load', main);
  }
  create(element, id, className) {
    var el = document.createElement('g-' + element);
    if (id) el.id = id;
    if (className) el.className = className;
    return el;
  }
  scene(id, define) {
    if (!define) return this.scenesList[id];
    var scene = this.create('scene', id);
    this.scenesList[id] = scene;
    define(scene);
    window.addEventListener('DOMContentLoaded', () => document.body.appendChild(scene));
  }
  goto(id) {
    var scene = this.scene(id);
    if (this.currentScene) {
      this.currentScene.once('leave', () => scene.enter());
      this.currentScene.leave();
    } else {
      scene.enter();
    }
    this.currentScene = scene;
  }
  createWindow(id, title) {
    var win = this.create('window', id);
    win.title = title;
    return win;
  }
  createModal(title) {
    var mod = this.create('modal');
    mod.title = title;
    return mod;
  }
  createGroup(id, className) {
    return this.create('group', id, className);
  }
  createTitle(text) {
    var title = this.create('title');
    title.innerHTML = text;
    return title;
  }
  createButton(id, text, iconURL) {
    var btn = this.create('button', id);
    btn.text = text;
    if (iconURL) btn.icon = iconURL;
    return btn;
  }
  createTabs(id, className) {
    return this.create('tabs', id, className);
  }
  createTab(id, className) {
    return this.create('tab', id, className);
  }
  createCanvas(id, className) {
    return this.create('canvas', id, className);
  }
  createInput(id, className) {
    return this.create('input', id, className);
  }
}