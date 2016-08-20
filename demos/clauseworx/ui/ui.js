(function(){
  
})();

'use strict';

var ui = {
  /**
   * type
   * 0 - toggle (default): 
   *   clicking a button automatically closes the others before opening, 
   *   or closes itself if it is already open.
   * 1 - switch:
   *   clicking a button automatically closes the others before opening, 
   *   and one of the buttons must always be "on".
   * 2 - modal:
   *   these buttons only have onclick, and no style changes.
   */
  createButtonGroup: function(id, type) {},
  showButtonGroup: function(id) {},
  hideButtonGroup: function(id) {},
  removeButtonGroup: function(id) {},
  
  createButton: function(id, group, button) {},
  clickButton: function(id) {},
  enableButton: function(id) {},
  disableButton: function(id) {},
  removeButton: function(id) {},
  
  createModal: function(id) {},
  getModal: function(id) {}
};


(function(){
  var ui = window.ui = {};
  
  function Scene(id) {
    this.id = id;
  }
  
  Object.assign(Scene.prototype, elements);
  
  var scenes = {};
  
  ui.scene = function(id) {
    if (!(id in scenes)) {
      scenes[id] = new Scene(id);
    }
    return scenes[id];
  }
  
})();