class GScene extends GContainer(GElement) {
  constructor(id, fadeTime) {
    super('scene', id);
    this.fadeTime = fadeTime;
    this.container = this.element;
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
};