(function () {

  include('languages.js');
  log(lang.loadingMainMenu);

  var currentButton = 0;
  // "buttons" will now hold the text objects for the menu items
  var buttons = [];
  // Store actions separately to map them to the visual elements
  var buttonActions = [];
  var buttonMarkers = []; // The vertical selection bars

  // Styles
  new Style({ name: 'mm_white', color: 'white', size: 28 });
  new Style({ name: 'mm_grey', color: 'rgb(150,150,150)', size: 26 });
  new Style({ name: 'mm_title', color: 'white', size: 36 });
  new Style({ name: 'mm_header', color: 'white', size: 22 });
  new Style({ name: 'mm_footer', color: 'rgb(200,200,200)', size: 20 });
  new Style({ name: 'mm_logoText', color: 'white', size: 42 });

  // - reset scene
  jsmaf.root.children.length = 0;

  // -- Background Music Logic (Preserved) --
  var __globalRoot = (typeof global !== 'undefined') ? global : ((typeof window !== 'undefined') ? window : ((typeof self !== 'undefined') ? self : this || {}));
  var bgm = null;
  var bgmReloadTimer = null;
  var bgmReloadIntervalMs = 156000;

  function clearBgmReloadTimer() {
    try { if (bgmReloadTimer) { jsmaf.clearTimeout(bgmReloadTimer); } } catch (e) {}
    bgmReloadTimer = null;
  }

  function scheduleBgmReload() {
    clearBgmReloadTimer();
    try {
      bgmReloadTimer = jsmaf.setTimeout(function () {
        try { reloadSong(); } catch (e) {}
        try { scheduleBgmReload(); } catch (e) {}
      }, bgmReloadIntervalMs);
    } catch (e) { bgmReloadTimer = null; }
  }

  function reloadSong() {
    try {
      if (!bgm || !bgm._valid) return;
      try { if (typeof bgm.stop === 'function') bgm.stop(); } catch (e) {}
      try { bgm._isPlaying = false; } catch (e) {}
      try { bgm.open('file://../download0/sfx/bgm.wav'); } catch (e) {}
      try {
        var prevOnEnded = bgm.onended;
        bgm.onended = function () {
          try { if (prevOnEnded) prevOnEnded(); } catch (e) {}
          try { bgm._isPlaying = false; } catch (e) {}
          try { bgm.play(); bgm._isPlaying = true; } catch (e) {}
        };
      } catch (e) {}
      try { if (typeof bgm.play === 'function') { bgm.play(); bgm._isPlaying = true; } } catch (e) {}
      try { bgm._startedOnce = true; } catch (e) {}
    } catch (e) { log('bgm reload error: ' + (e.message || e)); }
  }

  if (__globalRoot.__persistentBgm && __globalRoot.__persistentBgm._valid) {
    bgm = __globalRoot.__persistentBgm;
    try { if (bgm._isPlaying) bgm._startedOnce = true; } catch (e) {}
  } else {
    bgm = new jsmaf.AudioClip();
    bgm.volume = 0;
    try {
      bgm.open('file://../download0/sfx/bgm.wav');
      try { bgm.loop = true; } catch (e) {}
      try {
        var prevOnEnded = bgm.onended;
        bgm.onended = function () {
          try { if (prevOnEnded) prevOnEnded(); } catch (e) {}
          try { bgm._isPlaying = false; } catch (e) {}
          try { bgm.play(); bgm._isPlaying = true; } catch (e) {}
        };
      } catch (e) {}
    } catch (e) { log('bgm load error: ' + (e.message || e)); }
    bgm._valid = true;
    bgm._isPlaying = false;
    bgm._startedOnce = false;
    __globalRoot.__persistentBgm = bgm;
  }

  var _bgmFadeInterval = null;
  var clickSfx = new jsmaf.AudioClip();
  try { clickSfx.open('file://../download0/sfx/click.wav'); } catch (e) { }
  var loadSfx = new jsmaf.AudioClip();
  try { loadSfx.open('file://../download0/sfx/load.wav'); } catch (e) { }

  // -- Visual Elements Construction --

  // 1. Background (Dark Blue simulation using existing BG with filters if possible, or just the image)
  // Since we want "paro paro" (exact match) and don't have a solid color primitive, we rely on the image.
  // We'll overlay a dark filter if possible, or just use the image. The user image is very dark blue.
  var background = new Image({ url: 'file:///../download0/img/background.png', x: 0, y: 0, width: 1920, height: 1080 });
  background.alpha = 0; // fade in later
  jsmaf.root.children.push(background);

  // 2. Header
  // Logo "PS VUE" (Top Left)
  var headerLogo = new jsmaf.Text();
  headerLogo.text = "PS VUE";
  headerLogo.x = 80; headerLogo.y = 60;
  headerLogo.style = 'mm_logoText';
  headerLogo.alpha = 0;
  jsmaf.root.children.push(headerLogo);

  // Top Nav (Center)
  var navText = new jsmaf.Text();
  navText.text = "[L2]    Main Menu    Settings Menu    [R2]";
  navText.x = 760; navText.y = 70;
  navText.style = 'mm_header';
  navText.alpha = 0;
  jsmaf.root.children.push(navText);

  // Info (Top Right)
  var infoText = new jsmaf.Text();
  infoText.text = "UWU After Free";
  infoText.x = 1600; infoText.y = 70;
  infoText.style = 'mm_header';
  infoText.alpha = 0;
  jsmaf.root.children.push(infoText);

  // 3. Menu List (Left Side)
  var menuItems = [
    { label: "Load The Jailbreak", action: 'jailbreak' },
    { label: "File Explorer", action: 'explorer' },
    { label: "Linux Payloads", action: 'linux' },
    { label: "FTP", action: 'ftp' },
    { label: "BinLoader", action: 'binloader' },
    { label: "Other Payloads", action: 'payloads' },
    { label: "Settings", action: 'settings' }
  ];

  var listStartX = 180;
  var listStartY = 300;
  var listSpacing = 70;

  for (var i = 0; i < menuItems.length; i++) {
    var item = menuItems[i];
    var yPos = listStartY + i * listSpacing;

    // Selection Bar (Vertical line to the left)
    // Using a scaled marker image to simulate a vertical bar
    var bar = new Image({ url: 'file:///assets/img/ad_pod_marker.png', x: listStartX - 30, y: yPos + 4, width: 6, height: 28 });
    bar.visible = false;
    bar.alpha = 0;
    buttonMarkers.push(bar);
    jsmaf.root.children.push(bar);

    // Menu Item Text
    var btnText = new jsmaf.Text();
    btnText.text = item.label;
    btnText.x = listStartX;
    btnText.y = yPos;
    btnText.style = 'mm_grey'; // Default unselected
    btnText.alpha = 0; // fade in later
    
    buttons.push(btnText);
    buttonActions.push(item.action);
    jsmaf.root.children.push(btnText);
  }

  // 4. Right Content Area (Large Logo)
  // "GOLD HEN" placeholder using existing logo
  var rightLogo = new Image({ url: 'file:///../download0/img/logo.png', x: 1100, y: 350, width: 500, height: 280 });
  rightLogo.alpha = 0;
  jsmaf.root.children.push(rightLogo);

  // Footer
  // Auto-jailbreak text
  var autoJbText = new jsmaf.Text();
  autoJbText.text = "Auto-jailbreak in: 1";
  autoJbText.x = 80; autoJbText.y = 900;
  autoJbText.style = 'mm_footer';
  autoJbText.alpha = 0;
  jsmaf.root.children.push(autoJbText);

  // Commands Bar
  var commandsText = new jsmaf.Text();
  commandsText.text = "(X) Select    (O) Back    [R1] Change HEN    (Triangle) Run HEN    [R3] Restart (Save)";
  commandsText.x = 80; commandsText.y = 960;
  commandsText.style = 'mm_footer';
  commandsText.alpha = 0;
  jsmaf.root.children.push(commandsText);

  // -- Animation & Interaction Logic --

  var _intervals = [];
  var prevButton = -1;

  function _setInterval(fn, ms) { var id = jsmaf.setInterval(fn, ms); _intervals.push(id); return id; }
  function _clearAllIntervals() { for (var i = 0; i < _intervals.length; i++) { try { jsmaf.clearInterval(_intervals[i]); } catch (e) {} } _intervals = []; if (_bgmFadeInterval) { try { jsmaf.clearInterval(_bgmFadeInterval); } catch (e) {} _bgmFadeInterval = null; } }
  function easeInOut(t) { return (1 - Math.cos(t * Math.PI)) / 2; }
  
  function animate(obj, from, to, duration, onStep, done) {
    var elapsed = 0; var step = 16;
    var id = _setInterval(function () {
      elapsed += step; var t = Math.min(elapsed / duration, 1); var e = easeInOut(t);
      for (var k in to) { var f = (from && from[k] !== undefined) ? from[k] : (obj[k] || 0); obj[k] = f + (to[k] - f) * e; }
      if (onStep) onStep(e);
      if (t >= 1) { try { jsmaf.clearInterval(id); } catch (e2) {} if (done) done(); }
    }, step);
    return id;
  }

  function startBgm() {
    try {
      if (!bgm || !bgm._valid) return;
      if (bgm._startedOnce) {
        if (bgm._isPlaying) {
          if (!bgmReloadTimer) scheduleBgmReload();
        } else {
          try { bgm.play(); bgm._isPlaying = true; } catch (e) {}
          if (!bgmReloadTimer) scheduleBgmReload();
        }
        return;
      }
      try { if (typeof bgm.play === 'function') { bgm.play(); bgm._isPlaying = true; } } catch (e) {}
      bgm._startedOnce = true;
      scheduleBgmReload();
    } catch (e) {}
    if (_bgmFadeInterval) try { jsmaf.clearInterval(_bgmFadeInterval); } catch (e) {}
    var elapsed = 0; var dur = 900; var step = 50;
    _bgmFadeInterval = jsmaf.setInterval(function () { elapsed += step; var t = Math.min(elapsed / dur, 1); try { bgm.volume = 0.45 * t; } catch (e) {} if (t >= 1) { try { jsmaf.clearInterval(_bgmFadeInterval); } catch (e) {} _bgmFadeInterval = null; } }, step);
  }

  function entrance() {
    // Fade in background and static elements
    animate(background, { alpha: 0 }, { alpha: 1 }, 800);
    animate(headerLogo, { alpha: 0, x: 50 }, { alpha: 1, x: 80 }, 800);
    animate(navText, { alpha: 0, y: 50 }, { alpha: 1, y: 70 }, 800);
    animate(infoText, { alpha: 0, x: 1630 }, { alpha: 1, x: 1600 }, 800);
    animate(rightLogo, { alpha: 0, scaleX: 0.9, scaleY: 0.9 }, { alpha: 1, scaleX: 1.0, scaleY: 1.0 }, 1000);
    animate(autoJbText, { alpha: 0 }, { alpha: 1 }, 900);
    animate(commandsText, { alpha: 0, y: 980 }, { alpha: 1, y: 960 }, 900);

    // Staggered menu items
    for (var i = 0; i < buttons.length; i++) {
      (function(idx) {
        var btn = buttons[idx];
        var delay = 300 + idx * 100;
        jsmaf.setTimeout(function() {
          animate(btn, { alpha: 0, x: listStartX - 20 }, { alpha: 1, x: listStartX }, 600);
        }, delay);
      })(i);
    }

    jsmaf.setTimeout(function () {
      startBgm();
      updateHighlight();
    }, 1200);
  }

  function updateHighlight() {
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var bar = buttonMarkers[i];
      
      if (i === currentButton) {
        // Selected
        btn.style = 'mm_white';
        // Subtle glow/pulse could be added here
        if (bar) {
          bar.visible = true;
          animate(bar, { alpha: 0, scaleY: 0 }, { alpha: 1, scaleY: 1 }, 200);
        }
      } else {
        // Unselected
        btn.style = 'mm_grey';
        if (bar) {
          bar.visible = false;
          bar.alpha = 0;
        }
      }
    }
  }

  function handleButtonPress() {
    try { if (clickSfx && typeof clickSfx.play === 'function') clickSfx.play(); } catch (e) {}
    
    var action = buttonActions[currentButton];
    log('Selected action: ' + action);

    // Simple press animation
    var btn = buttons[currentButton];
    animate(btn, { x: listStartX }, { x: listStartX + 10 }, 100, null, function() {
        animate(btn, { x: listStartX + 10 }, { x: listStartX }, 100);
    });

    if (action === 'jailbreak') {
        try { include('loader.js'); } catch (e) { log('Error: ' + e); }
    } else if (action === 'explorer') {
        try { include('file-explorer.js'); } catch (e) { log('Error: ' + e); }
    } else if (action === 'linux') {
        try { include('linux-menu.js'); } catch (e) { log('Error: ' + e); }
    } else if (action === 'ftp') {
        try { include('ftp.js'); } catch (e) { log('Error: ' + e); }
    } else if (action === 'binloader') {
        try { include('binloader.js'); } catch (e) { log('Error: ' + e); }
    } else if (action === 'payloads') {
        try { include('payload_host.js'); } catch (e) { log('Error: ' + e); }
    } else if (action === 'settings') {
        try { include('config_ui.js'); } catch (e) { log('Error: ' + e); }
    }
  }

  // Input Handling
  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 6 || keyCode === 5 || keyCode === 22) { // Down
      currentButton = (currentButton + 1) % buttons.length; updateHighlight();
    } else if (keyCode === 4 || keyCode === 7 || keyCode === 21) { // Up
      currentButton = (currentButton - 1 + buttons.length) % buttons.length; updateHighlight();
    } else if (keyCode === 14) { // X / Enter
      handleButtonPress();
    }
  };

  // Analog Support (Simulated Polling)
  var lastMoveTime = 0;
  var moveThreshold = 200; // ms
  var axisThreshold = 0.5;

  _setInterval(function() {
      try {
          if (!navigator || !navigator.getGamepads) return;
          var gps = navigator.getGamepads();
          if (!gps) return;
          var gp = gps[0];
          if (!gp) return;
          
          var now = Date.now();
          if (now - lastMoveTime < moveThreshold) return;

          // Left Stick Y (Axis 1) or D-Pad (Axis 9 sometimes)
          // Standard: Axis 1 is Left Stick Y. -1 is Up, 1 is Down.
          var y = gp.axes[1];
          
          if (y > axisThreshold) { // Down
             currentButton = (currentButton + 1) % buttons.length; 
             updateHighlight();
             lastMoveTime = now;
          } else if (y < -axisThreshold) { // Up
             currentButton = (currentButton - 1 + buttons.length) % buttons.length; 
             updateHighlight();
             lastMoveTime = now;
          }
      } catch(e) {}
  }, 50);

  jsmaf.onMouseWheel = function (delta) {
    if (delta > 0) { currentButton = (currentButton + 1) % buttons.length; } 
    else { currentButton = (currentButton - 1 + buttons.length) % buttons.length; }
    updateHighlight();
  };

  // Basic mouse support (hover)
  jsmaf.onMouseMove = function (mx, my) {
    for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        // Simple bounding box for text
        if (mx >= btn.x && mx <= btn.x + 300 && my >= btn.y && my <= btn.y + 40) {
            if (currentButton !== i) { currentButton = i; updateHighlight(); }
        }
    }
  };

  jsmaf.onMouseDown = function (mx, my) {
     for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        if (mx >= btn.x && mx <= btn.x + 300 && my >= btn.y && my <= btn.y + 40) {
            currentButton = i; updateHighlight(); handleButtonPress();
        }
    }
  };

  // Start
  entrance();

})();
