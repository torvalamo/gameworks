class Gameworks extends GContainer(GEventEmitter) {
  constructor(main) {
    super();
    this.currentScene = null;
    if (main) main(this);
    window.addEventListener('DOMContentLoaded', () => {
      this.container = document.body;
      document.body.gClass = this;
      this.emit('ready');
    });
    window.addEventListener('load', () => this.emit('start'));
    window.addEventListener('contextmenu', e => e.preventDefault());
  }
  goto(scene) {
    if (this.currentScene) {
      this.currentScene.leave();
      scene.enter(this.currentScene.fadeTime);
    } else {
      scene.enter();
    }
    this.currentScene = scene;
  }
  /*switch(from, to) {
    from.leave();
    to.enter(from.fadeTime);
  }*/
  add(...args) { 
    // can't add to the document before dom is ready
    if (document.readyState !== "loading") {
      return super.add(...args);
    }
    this.once('ready', () => super.add(...args));
  }
  // add some render loop stuff and some worker thread stuff(?) to hook game code into
}