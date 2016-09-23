gw.scene('splash', (scene) => {
  scene.background = 'assets/img/splash.png';
  scene.on('start', () => {
    setTimeout(() => {
      gw.goto('menuscene');
    }, 2000);
  });
});

gw.scene('menuscene', (scene) => {
  /**
   * Main menu
   */
  var mainMenu = gw.createGroup('mainmenu');
  var menuTitle = gw.createTitle('Main Menu');
  var newGameButton = gw.createButton('newgamebtn', 'New Game');
  var optionsButton = gw.createButton('optionsbtn', 'Options');
  var blogButton = gw.createButton('blogbtn', 'Game Blog');
  var modalButton = gw.createButton('modalbtn', 'Open Modal');
  newGameButton.on('click', () => {
    newGameWindow.open();
  });
  optionsButton.on('click', () => {
    optionsWindow.open();
  });
  blogButton.on('click', () => {
    window.open('http://blog.digibug.me/mygame', '_blank');
  });
  modalButton.on('click', () => {
    var newModal = gw.createModal('Testmodal');
    var modalClose = gw.createButton('modalclose', 'Close');
    modalClose.on('click', () => {
      newModal.hide();
    });
    newModal.add(modalClose);
    scene.add(newModal);
    newModal.on('hide', () => {
      scene.remove(newModal);
    });
  })
  mainMenu.add(menuTitle, newGameButton, optionsButton, blogButton, modalButton);
  
  /**
   * New game window
   */
  var newGameWindow = gw.createWindow('newgamewindow', 'New Game');
  newGameWindow.closeable = true;
  var newGameTerrain = gw.createCanvas('newgameterrain');
  var newGameRandomizeTerrainButton = gw.createButton('newgamerandomize', 'Randomize Terrain');
  var newGameTerrainSeed = gw.createInput('newgameseed');
  var newGameStartButton = gw.createButton('newgamestart', 'Start Game');
  newGameWindow.on('open', () => {
    newGameTerrainSeed.value = generateRandomSeed();
  });
  newGameTerrainSeed.on('changed', () => { 
    // = more than 1 second since last 'change' event
    if (newGameTerrainSeed.value != '') {
      generateTerrainMap(newGameTerrain, newGameTerrainSeed.value);
    }
  });
  newGameStartButton.on('click', () => {
    gw.scene('lobbyscene').inject({
      seed: newGameTerrainSeed.value,
      width: newGameTerrainWidth.value,
      height: newGameTerrainHeight.value
    }).fadeTo();
  });
  newGameWindow.add(newGameTerrain, newGameRandomizeTerrainButton, newGameTerrainSeed, newGameStartButton);
  
  /**
   * Options window
   */
  var optionsWindow = gw.createWindow('optionswindow', 'Options');
  optionsWindow.closeable = true;
  var optionsButtons = gw.createGroup('optionsbuttons');
  var optionsSaveButton = gw.createButton('optionssave', 'Save');
  var optionsResetButton = gw.createButton('optionsreset', 'Defaults');
  var optionsCancelButton = gw.createButton('optionscancel', 'Cancel');
  optionsWindow.on('open', () => {
    // get saved options
  });
  optionsSaveButton.on('click', () => {
    // save options
    optionsWindow.close();
  });
  optionsResetButton.on('click', () => {
    // show defaults
  });
  optionsCancelButton.on('click', () => {
    optionsWindow.close();
  });
  optionsButtons.add(optionsSaveButton, optionsResetButton, optionsCancelButton);
  optionsWindow.add(optionsButtons);
  
  /**
   * Scene construction
   */
  scene.background = 'assets/img/mainmenu.png';
  scene.add(mainMenu, newGameWindow, optionsWindow);
});

gw.scene('lobbyscene', (scene) => {
  scene.on('inject', (data) => {
    
  });
});

gw.main(() => {
  gw.goto('menuscene');
});