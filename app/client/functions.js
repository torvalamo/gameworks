function randomSeed() {
  const map = [0,1,2,3,4,5,6,7,8,9,
             'a','b','c','d','e','f','g','h',
             'i','j','k','l','m','n','o','p',
             'q','r','s','t','u','v','w','x','y','z'];
  const mapLength = map.length;
  const seed = new Array(Math.ceil(Math.random() * 16));
  const seedLength = seed.length;
  for (var i = 0; i < seedLength; i++) {
    seed[i] = map[Math.floor(Math.random() * mapLength)];
  }
  return seed.join('');
}