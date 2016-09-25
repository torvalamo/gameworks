class Tile {
  constructor(id, pointSet, mapWidth, mapHeight) {
    this.id = id;
    this.pointSets = [pointSet]
    
    var rect = pointSet.rectangle;
    // X border overlap
    if (rect.p1.x < 0) { 
      // left has right twin
      this.pointSets.push(pointSet.translate(mapWidth, 0));
    } else if (rect.p2.x > mapWidth) { 
      // right has left twin
      this.pointSets.push(pointSet.translate(-mapWidth, 0));
    }
    
    // Y border overlap
    if (rect.p1.y < 0) { 
      // top has bottom twin
      this.pointSets.push(pointSet.translate(0, mapHeight));
    } else if (rect.p2.y > mapHeight) { 
      // bottom has top twin
      this.pointSets.push(pointSet.translate(0, -mapHeight));
    }
    
    // X and Y border overlap (additional diagonal twin)
    if (rect.p1.x < 0 && rect.p1.y < 0) {
      // top left has bottom right twin
      this.pointSets.push(pointSet.translate(mapWidth, mapHeight));
    } else if (rect.p1.x < 0 && rect.p2.y > mapHeight) {
      // bottom left has top right twin
      this.pointSets.push(pointSet.translate(mapWidth, -mapHeight));
    } else if (rect.p2.x > mapWidth && rect.p1.y < 0) {
      // top right has bottom left twin
      this.pointSets.push(pointSet.translate(-mapWidth, mapHeight));
    } else if (rect.p2.x > mapWidth && rect.p2.y > mapHeight) {
      // bottom right has top left twin
      this.pointSets.push(pointSet.translate(-mapWidth, -mapHeight));
    }
    
    console.assert(this.pointSets.length <= 4, 'Tile has too many twins: ', this);
    // original + any twins (0-3), min 1, max 4
    
    
    
    this.links = {};
    this.path = null;
    this.color = '#' + zerofill(random(Math.pow(2, 24)).toString(16), 6);
    this.hover = '#' + zerofill(random(Math.pow(2, 24)).toString(16), 6);
    this.click = '#' + zerofill(random(Math.pow(2, 24)).toString(16), 6);
  }
  get anchor() {
    return this.points[0];
  }
  addLink(tile) {
    this.links[tile.id] = tile;
  }
  /*relative(p0, ratio, aw, ah) {
    aw = aw || 0;
    ah = ah || 0;
    var path = new Path2D();
    this.points.forEach((p, idx) => {
      var x = (p.x - p0.x) * ratio;
      var y = (p.y - p0.y) * ratio;
      if (!idx) path.moveTo(x - aw, y - ah);
      else path.lineTo(x - aw, y - ah);
    });
    path.closePath();
    return this.path = path;
  }*/
  getTileViews(...viewRects) {
    // any point set should only be in one view,
    // because drawing the translations will take care of overlaps
    // so we dont want to draw the same area twice
    var assigned = Array(this.pointSets.length).fill(false);
    return viewRects.map(viewRect => {
      return this.pointSets.reduce((array, pointSet, idx) => {
        if (!assigned[idx] && viewRect.overlaps(pointSet.rectangle)) {
          array.push(pointSet);
          assigned[idx] = true;
        }
        return array;
      }, []);
    });
  }
}




