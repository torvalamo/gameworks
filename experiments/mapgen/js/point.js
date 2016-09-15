class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z || 0;
  }
  translate(x, y, z) {
    return new Point(this.x + x, this.y + y, this.z + (z || 0));
  }
  scale(delta) {
    return new Point((this.x - delta.x) * delta.z,
                     (this.y - delta.y) * delta.z,
                     this.z);
  }
}

class PointSet {
  constructor(...points) {
    this.points = points;
    var xs = points.map(p => p.x);
    var ys = points.map(p => p.y);
    this.rectangle = new Rectangle(
      new Point(Math.min(...xs), Math.min(...ys)),
      new Point(Math.max(...xs), Math.max(...ys)));
  }
  translate(x, y, z) {
    return new PointSet(this.points.map(point => {
      return point.translate(x, y, z);
    }));
  }
  scale(delta) {
    return new PointSet(this.points.map(point => {
      return point.scale(delta);
    }));
  }
  toPath() {
    if (this.path) return this.path;
    var path = new Path2D();
    this.points.forEach((point, idx) => {
      console.log(point.x, point.y);
      if (!idx) path.moveTo(point.x, point.y);
      else path.lineTo(point.x, point.y);
    });
    path.closePath();
    return this.path = path;
  }
}

class Rectangle {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.width = p2.x - p1.x;
    this.height = p2.y - p1.y;
  }
  overlaps(r) { // rectangle
    return !(r.p1.x > this.p2.x || r.p1.y > this.p2.y || 
             r.p2.x < this.p1.x || r.p2.y < this.p1.y);
  }
  contains(p) { // point
    return p.x >= this.p1.x && p.x < this.p2.x && p.y >= this.p1.y && p.y < this.p2.y;
  }
  translate(x, y) {
    return new Rectangle(this.p1.translate(x, y),
                         this.p2.translate(x, y));
  }
  scale(origin, amount) {
    return new Rectangle(this.p1.scale(origin, amount),
                         this.p2.scale(origin, amount));
  }
}