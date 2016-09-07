/**
 * Splash screen.
 */
gw.add(
  gw.scene('splash-screen').add(
    gw.image('splash-img')
  ).on('start', () => {
    setTimeout(() => {
      gw('main-menu').goto();
    }, 2000);
  })
);

/**
 * Main menu
 */
gw.add(
  gw.scene('main-menu').add(
    gw.box('menu-box').add(
      gw.text('menu-title').set('Main Menu'),
      gw.button('menu-new').set('New Game')
        .on('click', () => gw('new-game').open()),
      gw.button('menu-join').set('Join Game').disable()
        .on('click', () => gw('join-game').open()),
      gw.button('menu-load').set('Load Game').disable()
        .on('click', () => gw('load-game').open()),
      gw.button('menu-options').set('Options')
        .on('click', () => gw('options').open()),
      gw.button('menu-blog').set('Dev Blog').addClass('extern')
        .on('click', () => window.open('http://blog.digibug.me/mygame', '_blank')),
      gw.text('menu-version').set('v0.0.1')
    ),
    gw.window('new-game').title('New Game').group('menu').hide().add(
      gw.pane('new-left').add(

      )
    ),
    gw.window('join-game').set('Join Game').group('menu').hide(),
    gw.window('load-game').set('Load Game').group('menu').hide()
  )
);

/**
 * In game
 */
gw.add(
  gw.scene('game').add(
    gw.canvas('game-canvas')
  )
);

/**
 * Options window
 */
gw.add(
  gw.window('options').set('Options').group('menu').hide().add(
    gw.text('options-title').set('Options'),
    gw.tabs('options-tabs').add(
      gw.tab('options-gameplay').set('Game'),
      gw.tab('options-audio').set('Sound'),
      gw.tab('options-video').set('Graphics'),
      gw.tab('options-mods').set('Mods')
    ),
    gw.pane('options-btn-pane').add(
      gw.button('options-default').set('Reset').on('click'),
      gw.button('options-reset').set('Undo').disable()
    )
  )
);

/**
 * Display splash screen.
 */
gw('splash-screen').goto();