class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  translate(dx, dy) {
    return new Point(this.x + dx, 
                     this.y + dy);
  }
  scale(origin, amount) {
    return new Point((this.x - origin.x) * amount,
                     (this.y - origin.y) * amount);
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
  translate(dx, dy) {
    return new PointSet(...this.points.map(point => point.translate(dx, dy)));
  }
  scale(origin, amount) {
    return new PointSet(...this.points.map(point => point.scale(origin, amount)));
  }
  toPath() {
    if (this.path) return this.path;
    var path = new Path2D();
    this.points.forEach((point, idx) => {
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
    return (p.x >= this.p1.x && p.x < this.p2.x && 
            p.y >= this.p1.y && p.y < this.p2.y);
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