(function () {
  include('languages.js');
  log("Loading Linux Menu...");

  var currentButton = 0;
  var buttons = [];
  var buttonActions = [];
  var buttonMarkers = [];

  // Styles
  new Style({ name: 'lm_white', color: 'white', size: 28 });
  new Style({ name: 'lm_grey', color: 'rgb(150,150,150)', size: 26 });
  new Style({ name: 'lm_title', color: 'white', size: 36 });
  new Style({ name: 'lm_header', color: 'white', size: 22 });
  new Style({ name: 'lm_footer', color: 'rgb(200,200,200)', size: 20 });
  new Style({ name: 'lm_logoText', color: 'white', size: 42 });

  // - reset scene
  jsmaf.root.children.length = 0;

  // Background
  var background = new Image({ url: 'file:///../download0/img/background.png', x: 0, y: 0, width: 1920, height: 1080 });
  jsmaf.root.children.push(background);

  // Header
  var headerLogo = new jsmaf.Text();
  headerLogo.text = "LINUX LOADER";
  headerLogo.x = 80; headerLogo.y = 60;
  headerLogo.style = 'lm_logoText';
  jsmaf.root.children.push(headerLogo);

  var navText = new jsmaf.Text();
  navText.text = "Select VRAM Configuration";
  navText.x = 760; navText.y = 70;
  navText.style = 'lm_header';
  jsmaf.root.children.push(navText);

  // Menu List (Left Side)
  var menuItems = [
    { label: "1GB VRAM", action: 'linux_1g' },
    { label: "2GB VRAM", action: 'linux_2g' },
    { label: "3GB VRAM", action: 'linux_3g' },
    { label: "4GB VRAM", action: 'linux_4g' },
    { label: "5GB VRAM", action: 'linux_5g' },
    { label: "Back to Main Menu", action: 'back' }
  ];

  var listStartX = 180;
  var listStartY = 300;
  var listSpacing = 70;

  for (var i = 0; i < menuItems.length; i++) {
    var item = menuItems[i];
    var yPos = listStartY + i * listSpacing;

    var bar = new Image({ url: 'file:///assets/img/ad_pod_marker.png', x: listStartX - 30, y: yPos + 4, width: 6, height: 28 });
    bar.visible = false;
    bar.alpha = 0;
    buttonMarkers.push(bar);
    jsmaf.root.children.push(bar);

    var btnText = new jsmaf.Text();
    btnText.text = item.label;
    btnText.x = listStartX;
    btnText.y = yPos;
    btnText.style = 'lm_grey'; 
    
    buttons.push(btnText);
    buttonActions.push(item.action);
    jsmaf.root.children.push(btnText);
  }

  // Right Logo (Tux or just Logo)
  var rightLogo = new Image({ url: 'file:///../download0/img/logo.png', x: 1100, y: 350, width: 500, height: 280 });
  jsmaf.root.children.push(rightLogo);

  // Footer
  var commandsText = new jsmaf.Text();
  commandsText.text = "(X) Select    (O) Back";
  commandsText.x = 80; commandsText.y = 960;
  commandsText.style = 'lm_footer';
  jsmaf.root.children.push(commandsText);

  // -- Animation & Interaction --
  var _intervals = [];
  function _setInterval(fn, ms) { var id = jsmaf.setInterval(fn, ms); _intervals.push(id); return id; }
  function _clearAllIntervals() { for (var i = 0; i < _intervals.length; i++) { try { jsmaf.clearInterval(_intervals[i]); } catch (e) {} } _intervals = []; }
  function easeInOut(t) { return (1 - Math.cos(t * Math.PI)) / 2; }
  
  function animate(obj, from, to, duration) {
    var elapsed = 0; var step = 16;
    var id = _setInterval(function () {
      elapsed += step; var t = Math.min(elapsed / duration, 1); var e = easeInOut(t);
      for (var k in to) { var f = (from && from[k] !== undefined) ? from[k] : (obj[k] || 0); obj[k] = f + (to[k] - f) * e; }
      if (t >= 1) { try { jsmaf.clearInterval(id); } catch (e2) {} }
    }, step);
    return id;
  }

  function updateHighlight() {
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var bar = buttonMarkers[i];
      if (i === currentButton) {
        btn.style = 'lm_white';
        if (bar) { bar.visible = true; bar.alpha = 1; }
      } else {
        btn.style = 'lm_grey';
        if (bar) { bar.visible = false; bar.alpha = 0; }
      }
    }
  }

  function handleButtonPress() {
    var action = buttonActions[currentButton];
    if (action === 'back') {
        _clearAllIntervals();
        try { include('main-menu.js'); } catch(e) { log(e); }
    } else {
        log("Loading Linux Payload: " + action);
        // Here you would normally load the specific bin payload
        // try { loader.bl_load_from_file('/mnt/usb0/linux_' + action.split('_')[1] + '.bin'); } ...
        // For now, we just simulate
        try {
            var status = new jsmaf.Text();
            status.text = "Loading " + action + "...";
            status.x = 1100; status.y = 650; status.style = 'white';
            jsmaf.root.children.push(status);
        } catch(e) {}
    }
  }

  // Input
  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 6 || keyCode === 5 || keyCode === 22) { // Down
      currentButton = (currentButton + 1) % buttons.length; updateHighlight();
    } else if (keyCode === 4 || keyCode === 7 || keyCode === 21) { // Up
      currentButton = (currentButton - 1 + buttons.length) % buttons.length; updateHighlight();
    } else if (keyCode === 14) { // X
      handleButtonPress();
    } else if (keyCode === 13 || keyCode === 27) { // O / ESC
      _clearAllIntervals();
      try { include('main-menu.js'); } catch(e) { log(e); }
    }
  };

  // Analog Support
  var lastMoveTime = 0;
  var moveThreshold = 200;
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

  jsmaf.onMouseMove = function (mx, my) {
    for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
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

  // Init
  updateHighlight();

})();
