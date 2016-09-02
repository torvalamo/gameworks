class Terrain {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }
  generate(seedObj) {
    Math.seedrandom(seedObj.seed);
    console.log(Math.random(), Math.random(), Math.random());
  }
  static parseSeed(seed) {
    seed = seed.trim();
    var matches = seed.match(/^(.+?)\[(.*)\]$/);
    var out = {};
    out.seed = matches[1];
    matches[2].split(',').forEach((opt) => {
      opt = opt.split(':');
      out[opt[0]] = opt[1];
    });
    return out;
  }
}
    // parse out seed + options bracket, and correct if necessary
    // first trim it (remove whitespace from beginning and end), then match with
    // /^([\w\d\-\_]+)\s*(?:\[(?:(\w{2}\:\d)(?:,(\w{2}\:\d))*)\])/i
    // which matches, e.g.
    // Th15154533d [oc:3,mo:5,de:7]
    // The default values are 5, which equates to the relative prevalence 
    // of that particular feature on real life earth. If omitted, 5 is assumed.