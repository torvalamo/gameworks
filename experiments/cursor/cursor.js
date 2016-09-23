'use strict';
const Cursor = (function(){
  var cursors       = {}; // entire cursor object
  var currentCursor = {}; // pointer to current cursor
  var currentFrame  = {}; // pointer to current frame
  var currentName   = 'default';
  var currentLength = 1;
  var currentTicks  = 0;
  var frameIndex    = 0;
  var frameTicks    = 0;
  return Object.freeze({
    load(obj) {
      cursors = obj;
      this.set('default');
    },
    set(name) {
      if (currentName == name) return;
      currentName   = name;
      currentCursor = cursors[currentName];
      currentLength = currentCursor.frames.length;
      currentTicks  = 0;
      frameIndex    = 0;
      currentFrame  = currentCursor.frames[frameIndex];
      frameTicks    = currentFrame.ticks;
    },
    next() {
      if (currentLength == 1) {
        return currentFrame;
      }
      currentTicks = ++currentTicks % frameTicks;
      if (!currentTicks) {
        frameIndex = ++frameIndex % currentLength;
        currentFrame = currentCursor.frames[frameIndex];
      }
      return currentFrame;
    }
  });
})();