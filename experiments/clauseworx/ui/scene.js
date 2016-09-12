function Scene(id) {
  if (!(this instanceof Scene)) {
    return Scene.scenes[id];
  }
  Scene.scenes[id] = this;
  this.id = id;
}

Scene.scenes = {};

/**
 * Container types
 * - group (buttons, input elements, etc)
 * - window
 * - dialog (modal)
 * - 
 */

function Container(id) {
  if (!(this instanceof Container)) {
    return Container.containers[id];
  }
  Container.containers[id] = this;
  this.id = id;
}

function Group(id) {
  if (!(this instanceof Group)) {
    return Group.groups[id];
  }
  Group.groups[id] = this;
  this.id = id;
}