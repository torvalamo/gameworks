class GScene extends GContainer(GElement) {
  constructor(id, fadeTime) {
    super('scene', id);
    this.fadeTime = fadeTime;
    //this.convertEvent(this, 'click');
  }
  set fade(fadeTime) {
    if (typeof fadeTime == 'undefined') return;
    if (typeof fadeTime == 'number') {
      if (fadeTime % 1 == 0) { 
        // integer, so it's milliseconds
        fadeTime = fadeTime / 1000;
      }
      // make a string with unit
      fadeTime += 's';
    }
    this.element.style.transitionDuration = fadeTime;
  }
  get fade() {
    return this.element.style.transitionDuration;
  }
  enter() {
    this.model('current', 'current');
  }
}