class GScene extends GContainer(GElement) {
  constructor(id, fadeTime) {
    super('scene', id);
    this.fadeTime = fadeTime;
    //this.convertEvent(this, 'click');
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
    return this.element.style.transitionDuration;
  }
  enter() {
    this.addClass('current');
  }
  leave() {
    this.removeClass('current');
  }
};