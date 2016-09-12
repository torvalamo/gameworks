function generateTerrain(canvas, seed) {
  Math.seedrandom(seed);
  var ctx = canvas.getContext('2d')
  
  // stage 1
  // create a 6x4 random 5-stage heightmap and a 6x4 random 5-stage biome map
  var w = 6, h = 4;
  var stage1height = generateStage1(w, h);
  var stage1biome = generateStage1(w, h);
  console.log(stage1height);
  console.log(stage1biome);
  
  // print map
  var x = 0, y = 0;
  for (var i = 0, len = stage1height.length; i < len; i++) {
    // style
    // red = biome
    // green/blue = height
    var gb = [[0, 127], [127, 255], [127, 127], [255, 127], [127 ,0]];
    var r = 0;(stage1biome[i] * 20);
    var g = gb[stage1height[i]][0];
    var b = gb[stage1height[i]][1];
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    console.log(ctx.fillStyle, r, g, b);
    // position
    x = (i % w) * 100;
    y = Math.floor(i / w) * 100;
    ctx.fillRect(x, y, 100, 100);
    var r = (stage1biome[i] * 60);
    var g = 0;gb[stage1height[i]][0];
    var b = 0;gb[stage1height[i]][1];
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.fillRect(x + 40, y + 40, 20, 20);
  }
}

function generateStage1(w, h) {
  var arr = new Array(w*h);
  for (var i = 0, len = arr.length; i < len; i++) {
    arr[i] = Math.floor(Math.random() * 5);
  }
  return arr;
}