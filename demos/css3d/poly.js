

function pointLineDistanceSquared(p, a, b) {
  var ab = create(),
      ap = create(),
      cr = create()
  
  subtract(ab, b, a)
  subtract(ap, p, a)
  cross(cr, ap, ab)
  return squaredLength(cr) / squaredLength(ab)
}

function pointLineDistance(p, a, b) {
  return Math.sqrt(pointLineDistanceSquared(p, a, b));
}

function rad2deg(rad) {
  return rad * (180 / Math.PI);
}

function homogenous() {
  
}

function triangle(a, b, c) {
  var ab = distance(a, b)
    , ac = distance(a, c)
    , bc = distance(b, c)
    , da = pointLineDistance(a, b, c)
    , db = pointLineDistance(b, a, c)
    , dc = pointLineDistance(c, a, b)
    , ax = Math.sqrt(Math.pow(ac, 2) - Math.pow(dc, 2))
    , bx = Math.sqrt(Math.pow(bc, 2) - Math.pow(dc, 2))
  
  var ow = ab,
      oh = dc,
      iw = bc,
      ih = da,
      r = Math.asin(dc / bc),
      s = Math.acos(da / ac),
      x = ax
  
  if (ax < bx && ab < bx) { // c is to the left of a
    ow += ax
    x = 0
  } else if (ax > bx && ab < ax) { // c is to the right of b
    r = 180 - r
  } else if (dc * 2 < ab) { // angle c is > 90
    s = -s
  }
  
  // translation
  var tx = c[0] - x,
      ty = c[1],
      tz = c[2]
  
  // planes
  var pz = create(), py = create()
  set(pz, 0, 0, -1)
  set(py, 0, 1, 0)
  
  // plane of ABC
  var pab = create(), pac = create(), pcr = create()
  subtract(pab, b, a)
  subtract(pac, c, a)
  cross(pcr, pab, pac)
  normalize(pcr, pcr)
  
  var rv = create()
  cross(rv, pz, pcr)
  normalize(rv, rv)
  var ra = angle(pz, pcr)
  
  var ca = create(), // current a
      pca = create()
  subtract(pca, a, c)
  //transformQuat(ca, )
  
  var rdc = create(), // target c->ab vector
      rtc = create()  // current c->ab vector
  cross(rdc, pab, pcr)
  normalize(rdc, rdc)
  //cross(rtc, pab, )
  //normalize(rtc, rtc)
  //scale(rtc, rv, -1)
  var rz = create(), pca = create()
  subtract(pca, a, c)
  transformQuat(rz, pca, rv)
  //rz = angle(rz, )
  console.log(rv, ra)
  
  return makeDiv(ow, oh, iw, ih, r, s, x, tx, ty, tz, rv, ra, 0)
//  return makeDiv(ow, oh, iw, ih, r, s, x, tx, ty, tz, rx, ry, rz)
}

function makeDiv(ow, oh, iw, ih, r, s, x, tx, ty, tz, rv, ra, rz) {
  var out = '<div style="width:' + ow + 'px;height:' + oh + 'px;overflow:hidden;'
  out += 'transform:translateX(' + tx + 'px) translateY(' + ty + 'px) translateZ(' + tz + 'px) '
  out += 'rotate3d(' + rv[0] + ', ' + rv[1] + ', ' + rv[2] + ', ' + ra + 'rad) rotateZ(' + rz + 'rad);'
  out += 'transform-origin:top ' + x + 'px;">'
  out += '<div style="width:' + iw + 'px;height:' + ih + 'px;'
  out += 'transform:translateX(' + x + 'px) rotateZ(' + r + 'rad) skewX(' + s + 'rad);'
  out += '"></div></div>'
  return out
}