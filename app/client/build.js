new Gameworks(gw => {
  /**
   * Main menu
   */
  var mainmenu = new GScene('mainmenu')
    , mmbox = new GBox('mmbox')
    , mmtitle = new GTitle('mmtitle', 'Grey State (v0.1a)')
    , mmgroup = new GGroup('mmgroup')
    , mmnewgame = new GButton('mmnewgame', 'New Game', 'Create a new game')
    , mmloadgame = new GButton('mmloadgame', 'Load Game', 'Load a saved game')
    , mmjoingame = new GButton('mmjoingame', 'Join Game', 'Join an online game')
    , mmoptions = new GButton('mmoptions', 'Options', 'Open options window')
    , mmcredits = new GButton('mmcredits', 'Credits', 'Developer credits')
    , mmweb = new GButton('mmweb', 'Developer blog', 'Open blog in new browser tab/window')
    , mmtext = new GText('mmtext', 'Copyright &copy; 2016 Digibug Games. All rights reserved.');
  
  mmnewgame.on('click', () => gw.goto(newgame));
  mmloadgame.on('click', () => loadgame.open());
  mmjoingame.on('click', () => joingame.open());
  mmoptions.on('click', () => options.open());
  mmcredits.on('click', () => gw.goto(credits));
  mmweb.on('click', () => window.open('http://blog.digibug.me/mygame', '_blank'));
  mmgroup.add(mmnewgame, mmloadgame, mmjoingame, mmoptions, mmcredits, mmweb);
  mmbox.add(mmtitle, mmgroup);
  mainmenu.add(mmbox, mmtext);
  
  /**
   * New game scene
   */
  var newgame = new GScene('newgame')
    , nggroup = new GGroup('nggroup')
    , ngback = new GButton('ngback', '&lt;&lt; Return To Menu')
    , ngnext = new GButton('ngnext', 'Proceed To Lobby &gt;&gt;')
    , ngbox = new GBox('ngbox')
    , ngtitle = new GTitle('ngtitle', 'New Game')
    , nggroup1 = new GGroup('nggroup1')
    , ngcanvas = new GCanvas('ngcanvas', 600, 400)
    , ngrandom = new GButton('ngrandom', 'Randomize seed')
    , ngseed = new GInput('ngseed')
    , nggenerate = new GButton('nggenerate', 'Generate map')
    , ngcopy = new GButton('ngcopy', 'Copy to clipboard')
    , nggroup2 = new GGroup('nggroup2')
    , ngtext1 = new GText('ngtext1', 'Sea Level')
    , ngslider1 = new GSlider('ngslider1')
    , ngtext2 = new GText('ngtext2', 'Altitudes')
    , ngslider2 = new GSlider('ngslider2')
    , ngtext3 = new GText('ngtext3', 'Temperatures')
    , ngslider3 = new GSlider('ngslider3')
    , ngtext4 = new GText('ngtext4', 'Precipitation')
    , ngslider4 = new GSlider('ngslider4');
  
  ngback.on('click', () => gw.goto(mainmenu));
  ngnext.on('click', () => gw.goto(lobby));
  nggroup.add(ngback, ngnext);
  
  ngrandom.on('click', () => {
    ngseed.value = randomSeed();
  });
  ngseed.value = randomSeed();
  ngseed.on('blur', () => {
    var seed = Terrain.parseSeed(ngseed);
    ngseed.value = seed.seed;
    ngslider1.value = seed.sl;
    ngslider2.value = seed.al;
    ngslider3.value = seed.te;
    ngslider4.value = seed.pr;
  });
  var map = new Terrain(ngcanvas.context2, ngcanvas.width, ngcanvas.height);
  nggenerate.on('click', () => {
    var seed = ngseed.value;
    seed += strOpts();
    seed = Terrain.parseSeed(seed);
    map.generate(seed);
  });
  
  function strOpts() {
    return '[' + [
      'sl:' + ngslider1.value,
      'al:' + ngslider2.value,
      'te:' + ngslider3.value,
      'pr:' + ngslider4.value
    ].join(',') + ']';
  }
  
  ngcopy.on('click', () => {
    var seed = ngseed.value;
    ngseed.element.focus();
    ngseed.value = seed + strOpts();
    ngseed.element.setSelectionRange(0, ngseed.value.length);
    document.execCommand('copy');
    ngseed.value = seed;
    ngseed.element.blur();
    ngcopy.addClass('success');
    setTimeout(() => ngcopy.removeClass('success'), 1000);
  });
  nggroup1.add(ngcanvas, ngrandom, ngseed, nggenerate, ngcopy);
  
  var notches = ['low', null, null, null, 'normal', null, null, null, 'high'];
  ngslider1.notches = notches;
  ngslider1.value = 4;
  ngslider2.notches = notches;
  ngslider2.value = 4;
  ngslider3.notches = notches;
  ngslider3.value = 4;
  ngslider4.notches = notches;
  ngslider4.value = 4;
  nggroup2.add(ngtext1, ngslider1, ngtext2, ngslider2, ngtext3, ngslider3, ngtext4, ngslider4);
  
  ngbox.add(ngtitle, nggroup1, nggroup2);
  
  newgame.add(nggroup, ngbox);
  
  /**
   * Lobby scene
   */
  var lobby = new GScene('lobby')
    , lbbox = new GBox('lbbox')
    , lbback = new GButton('lbback', 'Back', 'Back to map generation')
    , lbnext = new GButton('lbnext', 'Start game', 'Start the game with these settings')
  
  lbback.on('click', () => gw.goto(newgame));
  lobby.add(lbbox, lbback, lbnext);
  
  /**
   * Credits scene
   */
  var credits = new GScene('credits')
    , crback = new GButton('crback', 'Back to menu')
  
  crback.on('click', () => gw.goto(mainmenu));
  credits.add(crback);
  
  /**
   * Load game window
   */
  var loadgame = new GWindow('loadgame', 'Load saved game')
  
  mainmenu.add(loadgame);
  
  /**
   * Join game window
   */
  var joingame = new GWindow('joingame', 'Find multiplayer game')
  
  mainmenu.add(joingame);
  
  /**
   * Options window
   */
  var options = new GWindow('options', 'Options')
    , optabs = new GTabs('optabs')
    , opgame = new GTab('opgame', 'Gameplay')
    , opsound = new GTab('opsound', 'Sound')
    , opgraph = new GTab('opgraph', 'Graphics')
    , opmods = new GTab('opmods', 'Mods')
    , opreset = new GButton('opreset', 'Reset')
    , opclose = new GButton('opclose', 'Close')
  
  optabs.add(opgame, opsound, opgraph, opmods);
  opclose.on('click', () => options.close());
  options.add(optabs, opreset, opclose);
  
  /**
   * Add all scenes
   */
  gw.add(mainmenu, newgame, lobby, credits);
  
  /**
   * Add all global windows
   */
  gw.add(options);
  
  /**
   * Global events
   */
  gw.on('start', () => gw.goto(newgame));
});