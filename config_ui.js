(function () {
  include('languages.js');
  log(lang.loadingConfig);

  // -- Filesystem Helpers --
  var fs = {
    write: function (filename, content, callback) {
      var xhr = new jsmaf.XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && callback) {
          callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('failed'));
        }
      };
      xhr.open('POST', 'file://../download0/' + filename, true);
      xhr.send(content);
    },
    read: function (filename, callback) {
      var xhr = new jsmaf.XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && callback) {
          callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('failed'), xhr.responseText);
        }
      };
      xhr.open('GET', 'file://../download0/' + filename, true);
      xhr.send();
    }
  };

  // -- Config State --
  var currentConfig = {
    autolapse: false,
    autopoop: false,
    autoclose: false,
    jb_behavior: 0
  };
  var userPayloads = [];
  var jbBehaviorLabels = [lang.jbBehaviorAuto, lang.jbBehaviorNetctrl, lang.jbBehaviorLapse];

  var configOptions = [
    { key: 'autolapse', label: lang.autoLapse, type: 'toggle' },
    { key: 'autopoop', label: lang.autoPoop, type: 'toggle' },
    { key: 'autoclose', label: lang.autoClose, type: 'toggle' },
    { key: 'jb_behavior', label: lang.jbBehavior, type: 'cycle' },
    { key: 'save_exit', label: 'Save & Exit', type: 'action' },
    { key: 'cancel', label: 'Cancel', type: 'action' }
  ];

  // -- Stats --
  try { include('stats-tracker.js'); } catch (e) {}
  try { stats.load(); } catch (e) {}
  var statsData = (typeof stats !== 'undefined' && typeof stats.get === 'function') ? stats.get() : { total: 0, success: 0, failures: 0, successRate: 0, failureRate: 0 };

  // -- Visuals --
  jsmaf.root.children.length = 0;

  // Styles
  new Style({ name: 'white', color: 'white', size: 28 });
  new Style({ name: 'grey', color: 'rgb(150,150,150)', size: 26 });
  new Style({ name: 'value', color: 'rgb(100,200,255)', size: 26 });
  new Style({ name: 'title', color: 'white', size: 36 });
  new Style({ name: 'header', color: 'white', size: 22 });
  new Style({ name: 'footer', color: 'rgb(200,200,200)', size: 20 });
  new Style({ name: 'logoText', color: 'white', size: 42 });

  // Background
  var background = new Image({ url: 'file:///../download0/img/background.png', x: 0, y: 0, width: 1920, height: 1080 });
  jsmaf.root.children.push(background);

  // Header
  var headerLogo = new jsmaf.Text();
  headerLogo.text = "SETTINGS";
  headerLogo.x = 80; headerLogo.y = 60;
  headerLogo.style = 'logoText';
  jsmaf.root.children.push(headerLogo);

  var navText = new jsmaf.Text();
  navText.text = "Configure Jailbreak Options";
  navText.x = 760; navText.y = 70;
  navText.style = 'header';
  jsmaf.root.children.push(navText);

  // Left List (Options)
  var listStartX = 180;
  var listStartY = 250;
  var listSpacing = 70;
  
  var buttons = [];
  var buttonMarkers = [];
  var valueTexts = [];

  for (var i = 0; i < configOptions.length; i++) {
    var opt = configOptions[i];
    var yPos = listStartY + i * listSpacing;

    // Marker
    var bar = new Image({ url: 'file:///assets/img/ad_pod_marker.png', x: listStartX - 30, y: yPos + 4, width: 6, height: 28 });
    bar.visible = false; bar.alpha = 0;
    buttonMarkers.push(bar);
    jsmaf.root.children.push(bar);

    // Label
    var btnText = new jsmaf.Text();
    btnText.text = opt.label;
    btnText.x = listStartX; btnText.y = yPos;
    btnText.style = 'grey';
    buttons.push(btnText);
    jsmaf.root.children.push(btnText);

    // Value (for toggles/cycles)
    if (opt.type !== 'action') {
        var valText = new jsmaf.Text();
        valText.text = ""; // updated later
        valText.x = listStartX + 400; valText.y = yPos;
        valText.style = 'value';
        valueTexts.push(valText);
        jsmaf.root.children.push(valText);
    } else {
        valueTexts.push(null);
    }
  }

  // Right Side (Stats)
  var statsTitle = new jsmaf.Text();
  statsTitle.text = "Success Stats";
  statsTitle.x = 1100; statsTitle.y = 300;
  statsTitle.style = 'title';
  jsmaf.root.children.push(statsTitle);

  var statLines = [
    "Total Attempts: " + statsData.total,
    "Successes: " + statsData.success,
    "Failures: " + statsData.failures,
    "Success Rate: " + statsData.successRate + "%"
  ];

  for (var j = 0; j < statLines.length; j++) {
      var st = new jsmaf.Text();
      st.text = statLines[j];
      st.x = 1100; st.y = 360 + j * 40;
      st.style = 'white';
      jsmaf.root.children.push(st);
  }

  // Footer
  var footer = new jsmaf.Text();
  footer.text = "(X) Toggle/Select    (O) Cancel";
  footer.x = 80; footer.y = 960;
  footer.style = 'footer';
  jsmaf.root.children.push(footer);

  // -- Logic --
  var currentButton = 0;

  function updateValues() {
      for (var i = 0; i < configOptions.length; i++) {
          var opt = configOptions[i];
          var vt = valueTexts[i];
          if (!vt) continue;
          
          if (opt.type === 'toggle') {
              vt.text = currentConfig[opt.key] ? "[ON]" : "[OFF]";
              vt.style = currentConfig[opt.key] ? 'value' : 'grey';
          } else if (opt.type === 'cycle') {
              vt.text = jbBehaviorLabels[currentConfig.jb_behavior] || "Unknown";
          }
      }
  }

  function updateHighlight() {
      for (var i = 0; i < buttons.length; i++) {
          var btn = buttons[i];
          var bar = buttonMarkers[i];
          if (i === currentButton) {
              btn.style = 'white';
              if (bar) { bar.visible = true; bar.alpha = 1; }
          } else {
              btn.style = 'grey';
              if (bar) { bar.visible = false; bar.alpha = 0; }
          }
      }
  }

  function saveConfig() {
    var configContent = 'const CONFIG = {\n';
    configContent += '    autolapse: ' + currentConfig.autolapse + ',\n';
    configContent += '    autopoop: ' + currentConfig.autopoop + ',\n';
    configContent += '    autoclose: ' + currentConfig.autoclose + ',\n';
    configContent += '    jb_behavior: ' + currentConfig.jb_behavior + '\n';
    configContent += '};\n\n';
    configContent += 'const payloads = [\n';
    for (var i = 0; i < userPayloads.length; i++) {
      configContent += '    "' + userPayloads[i] + '"' + (i < userPayloads.length - 1 ? ',' : '') + '\n';
    }
    configContent += '];\n';
    
    fs.write('config.js', configContent, function (err) {
      if (err) log('Save error: ' + err.message);
      else log('Config saved.');
      try { include('main-menu.js'); } catch(e) {}
    });
  }

  function loadConfig() {
    fs.read('config.js', function (err, data) {
      if (!err) {
        try {
          eval(data || '');
          if (typeof CONFIG !== 'undefined') {
            currentConfig.autolapse = CONFIG.autolapse || false;
            currentConfig.autopoop = CONFIG.autopoop || false;
            currentConfig.autoclose = CONFIG.autoclose || false;
            currentConfig.jb_behavior = CONFIG.jb_behavior || 0;
            if (typeof payloads !== 'undefined' && Array.isArray(payloads)) userPayloads = payloads.slice();
            updateValues();
          }
        } catch (e) { log('Parse error: ' + e.message); }
      }
      updateValues();
    });
  }

  function handlePress() {
      var opt = configOptions[currentButton];
      if (opt.key === 'save_exit') {
          saveConfig();
      } else if (opt.key === 'cancel') {
          try { include('main-menu.js'); } catch(e) {}
      } else if (opt.type === 'toggle') {
          currentConfig[opt.key] = !currentConfig[opt.key];
          updateValues();
      } else if (opt.type === 'cycle') {
          currentConfig.jb_behavior = (currentConfig.jb_behavior + 1) % jbBehaviorLabels.length;
          updateValues();
      }
  }

  // Input
  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 6 || keyCode === 5 || keyCode === 22) { // Down
      currentButton = (currentButton + 1) % buttons.length; updateHighlight();
    } else if (keyCode === 4 || keyCode === 7 || keyCode === 21) { // Up
      currentButton = (currentButton - 1 + buttons.length) % buttons.length; updateHighlight();
    } else if (keyCode === 14) { // X
      handlePress();
    } else if (keyCode === 13 || keyCode === 27) { // O
      try { include('main-menu.js'); } catch(e) {}
    }
  };
  
  jsmaf.onMouseWheel = function (delta) {
    if (delta > 0) { currentButton = (currentButton + 1) % buttons.length; } 
    else { currentButton = (currentButton - 1 + buttons.length) % buttons.length; }
    updateHighlight();
  };
  
  jsmaf.onMouseMove = function (mx, my) {
    for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        if (mx >= btn.x && mx <= btn.x + 600 && my >= btn.y && my <= btn.y + 40) { // wider hit area
            if (currentButton !== i) { currentButton = i; updateHighlight(); }
        }
    }
  };

  jsmaf.onMouseDown = function (mx, my) {
     for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        if (mx >= btn.x && mx <= btn.x + 600 && my >= btn.y && my <= btn.y + 40) {
            currentButton = i; updateHighlight(); handlePress();
        }
    }
  };

  // Init
  loadConfig();
  updateHighlight();

})();
