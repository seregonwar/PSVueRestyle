/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADVANCED SETTINGS UI - ENTERPRISE CONFIGURATION PANEL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Complete settings interface for Revolutionary Menu system
 * Allows real-time customization of all aspects:
 * - Theme selection and customization
 * - Animation preferences
 * - Audio settings
 * - Particle effects
 * - Auto-jailbreak configuration
 * - Dashboard toggles
 * 
 * @version 2.0.0
 */

(function() {
  'use strict';

  log('[SETTINGS UI] Loading advanced configuration panel...');

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  var STORAGE_KEY = 'revolutionaryMenu_config';
  
  var DEFAULT_CONFIG = {
    theme: 'dark',
    volume: 0.45,
    autoJailbreak: true,
    autoJailbreakDelay: 5,
    particlesEnabled: true,
    particleCount: 50,
    animationsEnabled: true,
    showStats: true,
    recentItemsCount: 5,
    quickActionsEnabled: true,
    notificationsEnabled: true
  };

  // Current config (loaded from storage)
  var currentConfig = {};
  var currentSection = 0;
  var currentOption = 0;

  // UI Elements
  var sections = [];
  var optionElements = [];
  var previewElements = [];

  // ═══════════════════════════════════════════════════════════════════════════
  // STORAGE FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  function loadConfig() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      }
      
      var parsed = JSON.parse(stored);
      var validated = {};
      
      for (var key in DEFAULT_CONFIG) {
        if (parsed.hasOwnProperty(key)) {
          validated[key] = parsed[key];
        } else {
          validated[key] = DEFAULT_CONFIG[key];
        }
      }
      
      return validated;
    } catch (e) {
      log('[SETTINGS] Load error: ' + e.message);
      return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
  }

  function saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
      log('[SETTINGS] Configuration saved');
      showNotification('Settings saved successfully!', 'success');
      return true;
    } catch (e) {
      log('[SETTINGS] Save error: ' + e.message);
      showNotification('Failed to save settings: ' + e.message, 'error');
      return false;
    }
  }

  function resetConfig() {
    currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    saveConfig();
    showNotification('Settings reset to defaults', 'info');
    buildUI();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UI BUILDING
  // ═══════════════════════════════════════════════════════════════════════════

  function buildUI() {
    // Clear scene
    jsmaf.root.children.length = 0;
    sections = [];
    optionElements = [];

    // Create styles
    createStyles();

    // Background
    var bg = new Image({
      url: 'file://../download0/img/background.png',
      x: 0, y: 0,
      width: 1920, height: 1080
    });
    jsmaf.root.children.push(bg);

    // Header
    buildHeader();

    // Sections
    buildSections();

    // Preview panel
    buildPreview();

    // Footer
    buildFooter();

    // Update display
    updateSectionHighlight();
    updateOptionDisplay();
  }

  function createStyles() {
    new Style({ name: 'settings_title', color: 'rgb(0, 174, 255)', size: 48 }); // Larger title
    new Style({ name: 'settings_section', color: 'rgb(180, 180, 180)', size: 26 });
    new Style({ name: 'settings_section_active', color: 'rgb(0, 174, 255)', size: 32 }); // Brighter active
    new Style({ name: 'settings_option', color: 'rgb(160, 160, 160)', size: 24 });
    new Style({ name: 'settings_option_active', color: 'rgb(0, 174, 255)', size: 28 }); // Primary color when active
    new Style({ name: 'settings_value', color: 'rgb(46, 204, 113)', size: 26 }); // Larger values
    new Style({ name: 'settings_hint', color: 'rgb(140, 140, 140)', size: 18 }); // Brighter hints
    new Style({ name: 'settings_preview', color: 'rgb(240, 240, 240)', size: 22 }); // Larger preview
  }

  function buildHeader() {
    // Title
    var title = new jsmaf.Text();
    title.text = "⚙️  ADVANCED SETTINGS";
    title.x = 80;
    title.y = 50;
    title.style = 'settings_title';
    jsmaf.root.children.push(title);

    // Subtitle
    var subtitle = new jsmaf.Text();
    subtitle.text = "Configure your Revolutionary Menu experience";
    subtitle.x = 80;
    subtitle.y = 110;
    subtitle.style = 'settings_hint';
    jsmaf.root.children.push(subtitle);
  }

  function buildSections() {
    var sectionDefs = [
      {
        name: 'THEME',
        options: [
          { key: 'theme', label: 'Color Theme', type: 'cycle', values: ['dark', 'cyber', 'retro'] },
          { key: 'animationsEnabled', label: 'Animations', type: 'toggle' },
          { key: 'particlesEnabled', label: 'Particle Effects', type: 'toggle' },
          { key: 'particleCount', label: 'Particle Count', type: 'range', min: 10, max: 100, step: 10 }
        ]
      },
      {
        name: 'AUDIO',
        options: [
          { key: 'volume', label: 'Music Volume', type: 'range', min: 0, max: 1, step: 0.05 }
        ]
      },
      {
        name: 'AUTO-JB',
        options: [
          { key: 'autoJailbreak', label: 'Auto-Jailbreak', type: 'toggle' },
          { key: 'autoJailbreakDelay', label: 'Delay (seconds)', type: 'range', min: 1, max: 30, step: 1 }
        ]
      },
      {
        name: 'DASHBOARD',
        options: [
          { key: 'showStats', label: 'Show Statistics', type: 'toggle' },
          { key: 'quickActionsEnabled', label: 'Quick Actions', type: 'toggle' },
          { key: 'notificationsEnabled', label: 'Notifications', type: 'toggle' },
          { key: 'recentItemsCount', label: 'Recent Items', type: 'range', min: 0, max: 10, step: 1 }
        ]
      }
    ];

    var tabStartX = 120;
    var tabY = 160;
    var tabSpacing = 250;

    for (var i = 0; i < sectionDefs.length; i++) {
      var section = sectionDefs[i];
      
      // Tab Header
      var sectionText = new jsmaf.Text();
      sectionText.text = section.name;
      sectionText.x = tabStartX + i * tabSpacing;
      sectionText.y = tabY;
      sectionText.style = 'settings_section';
      jsmaf.root.children.push(sectionText);

      sections.push({
        def: section,
        text: sectionText,
        index: i
      });
    }

    renderOptions();
  }

  function renderOptions() {
    // Clear existing options from scene
    for (var i = 0; i < optionElements.length; i++) {
      var opt = optionElements[i];
      removeFromScene(opt.label);
      removeFromScene(opt.value);
      removeFromScene(opt.indicator);
    }
    optionElements = [];

    var currentDef = sections[currentSection].def;
    var startY = 260;
    var spacing = 50;

    // Divider line
    var divider = new jsmaf.Text();
    divider.text = "______________________________________________________";
    divider.x = 120;
    divider.y = 200;
    divider.style = 'settings_hint';
    divider.alpha = 0.3;
    // We don't track the divider, it stays until rebuildUI or we can clear scene
    jsmaf.root.children.push(divider);

    for (var j = 0; j < currentDef.options.length; j++) {
      var option = currentDef.options[j];
      var yPos = startY + j * spacing;

      // Option label
      var optLabel = new jsmaf.Text();
      optLabel.text = option.label;
      optLabel.x = 150;
      optLabel.y = yPos;
      optLabel.style = 'settings_option';
      jsmaf.root.children.push(optLabel);

      // Option value
      var optValue = new jsmaf.Text();
      optValue.text = getValueString(option);
      optValue.x = 600;
      optValue.y = yPos;
      optValue.style = 'settings_value';
      jsmaf.root.children.push(optValue);

      // Selection indicator
      var indicator = new Image({
        url: 'file:///assets/img/ad_pod_marker.png',
        x: 120,
        y: yPos + 6,
        width: 10,
        height: 10,
        alpha: 0
      });
      indicator.isOrangeDot = true; // reusing marker style
      jsmaf.root.children.push(indicator);

      optionElements.push({
        option: option,
        label: optLabel,
        value: optValue,
        indicator: indicator
      });
    }
  }

  function removeFromScene(el) {
    var idx = jsmaf.root.children.indexOf(el);
    if (idx > -1) jsmaf.root.children.splice(idx, 1);
  }

  function buildPreview() {
    var previewX = 900;
    var previewY = 200;

    // Preview title
    var previewTitle = new jsmaf.Text();
    previewTitle.text = "━━━ LIVE PREVIEW ━━━";
    previewTitle.x = previewX;
    previewTitle.y = previewY;
    previewTitle.style = 'settings_section';
    jsmaf.root.children.push(previewTitle);

    // Theme preview
    var themePreview = new jsmaf.Text();
    themePreview.text = "Current Theme: " + currentConfig.theme.toUpperCase();
    themePreview.x = previewX + 20;
    themePreview.y = previewY + 60;
    themePreview.style = 'settings_preview';
    jsmaf.root.children.push(themePreview);

    previewElements.push(themePreview);

    // Status indicators
    var statusY = previewY + 120;
    var statusItems = [
      { label: 'Animations', key: 'animationsEnabled' },
      { label: 'Particles', key: 'particlesEnabled' },
      { label: 'Auto-JB', key: 'autoJailbreak' },
      { label: 'Dashboard', key: 'showStats' },
      { label: 'Notifications', key: 'notificationsEnabled' }
    ];

    for (var i = 0; i < statusItems.length; i++) {
      var item = statusItems[i];
      var status = currentConfig[item.key] ? '✓' : '✗';
      var color = currentConfig[item.key] ? 'rgb(46, 204, 113)' : 'rgb(231, 76, 60)';

      var statusText = new jsmaf.Text();
      statusText.text = status + '  ' + item.label;
      statusText.x = previewX + 20;
      statusText.y = statusY + i * 35;
      statusText.style = 'settings_preview';
      statusText.color = color;
      jsmaf.root.children.push(statusText);

      previewElements.push({ text: statusText, key: item.key });
    }

    // Volume indicator
    var volumeY = statusY + statusItems.length * 35 + 40;
    var volumeText = new jsmaf.Text();
    volumeText.text = "Volume: " + Math.round(currentConfig.volume * 100) + "%";
    volumeText.x = previewX + 20;
    volumeText.y = volumeY;
    volumeText.style = 'settings_preview';
    jsmaf.root.children.push(volumeText);

    previewElements.push({ text: volumeText, key: 'volume' });
  }

  function buildFooter() {
    // Save hint
    var saveHint = new jsmaf.Text();
    saveHint.text = "[X] Adjust  •  [Square] Save  •  [Triangle] Reset  •  [O] Back to Menu";
    saveHint.x = 80;
    saveHint.y = 1000;
    saveHint.style = 'settings_hint';
    jsmaf.root.children.push(saveHint);

    // Navigation hint
    var navHint = new jsmaf.Text();
    navHint.text = "Use D-Pad/Stick: ↕ Navigate Options  •  ← → Change Values  •  L2/R2 Switch Sections";
    navHint.x = 80;
    navHint.y = 950;
    navHint.style = 'settings_hint';
    jsmaf.root.children.push(navHint);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VALUE FORMATTING
  // ═══════════════════════════════════════════════════════════════════════════

  function getValueString(option) {
    var value = currentConfig[option.key];
    
    switch(option.type) {
      case 'toggle':
        return value ? 'ENABLED' : 'DISABLED';
      
      case 'cycle':
        return value.toUpperCase();
      
      case 'range':
        if (option.key === 'volume') {
          return Math.round(value * 100) + '%';
        }
        return value.toString();
      
      default:
        return value.toString();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UI UPDATES
  // ═══════════════════════════════════════════════════════════════════════════

  function updateSectionHighlight() {
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      
      if (i === currentSection) {
        section.text.style = 'settings_section_active';
      } else {
        section.text.style = 'settings_section';
      }
    }
  }

  function updateOptionDisplay() {
    // Update all options in current view
    for (var i = 0; i < optionElements.length; i++) {
      var opt = optionElements[i];
      
      if (i === currentOption) {
        // Active option
        opt.label.style = 'settings_option_active';
        opt.value.style = 'settings_value';
        opt.indicator.alpha = 1;
      } else {
        // Inactive option
        opt.label.style = 'settings_option';
        opt.indicator.alpha = 0;
      }

      // Update value text
      opt.value.text = getValueString(opt.option);
    }

    updatePreview();
  }

  function updatePreview() {
    // Update theme preview
    if (previewElements.length > 0) {
      previewElements[0].text = "Current Theme: " + currentConfig.theme.toUpperCase();
    }

    // Update status indicators
    for (var i = 1; i < previewElements.length; i++) {
      var elem = previewElements[i];
      if (!elem.key) continue;

      var value = currentConfig[elem.key];
      
      if (typeof value === 'boolean') {
        var status = value ? '✓' : '✗';
        var color = value ? 'rgb(46, 204, 113)' : 'rgb(231, 76, 60)';
        elem.text.color = color;
        
        // Extract label from current text
        var parts = elem.text.text.split('  ');
        if (parts.length > 1) {
          elem.text.text = status + '  ' + parts[1];
        }
      } else if (elem.key === 'volume') {
        elem.text.text = "Volume: " + Math.round(value * 100) + "%";
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OPTION MANIPULATION
  // ═══════════════════════════════════════════════════════════════════════════

  function getCurrentOption() {
    if (optionElements[currentOption]) {
        return optionElements[currentOption].option;
    }
    return null;
  }

  function increaseValue() {
    var option = getCurrentOption();
    if (!option) return;

    switch(option.type) {
      case 'toggle':
        currentConfig[option.key] = !currentConfig[option.key];
        break;
      
      case 'cycle':
        var currentIndex = option.values.indexOf(currentConfig[option.key]);
        var nextIndex = (currentIndex + 1) % option.values.length;
        currentConfig[option.key] = option.values[nextIndex];
        break;
      
      case 'range':
        var newVal = currentConfig[option.key] + option.step;
        currentConfig[option.key] = Math.min(newVal, option.max);
        break;
    }

    updateOptionDisplay();
  }

  function decreaseValue() {
    var option = getCurrentOption();
    if (!option) return;

    switch(option.type) {
      case 'toggle':
        currentConfig[option.key] = !currentConfig[option.key];
        break;
      
      case 'cycle':
        var currentIndex = option.values.indexOf(currentConfig[option.key]);
        var prevIndex = (currentIndex - 1 + option.values.length) % option.values.length;
        currentConfig[option.key] = option.values[prevIndex];
        break;
      
      case 'range':
        var newVal = currentConfig[option.key] - option.step;
        currentConfig[option.key] = Math.max(newVal, option.min);
        break;
    }

    updateOptionDisplay();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════

  function moveUp() {
    if (currentOption > 0) {
      currentOption--;
    } else {
      currentOption = optionElements.length - 1; // Wrap to bottom
    }
    updateOptionDisplay();
  }

  function moveDown() {
    if (currentOption < optionElements.length - 1) {
      currentOption++;
    } else {
      currentOption = 0; // Wrap to top
    }
    updateOptionDisplay();
  }

  function switchSectionLeft() {
    if (currentSection > 0) {
      currentSection--;
    } else {
      currentSection = sections.length - 1;
    }
    currentOption = 0;
    updateSectionHighlight();
    renderOptions();
    updateOptionDisplay();
  }

  function switchSectionRight() {
    if (currentSection < sections.length - 1) {
      currentSection++;
    } else {
      currentSection = 0;
    }
    currentOption = 0;
    updateSectionHighlight();
    renderOptions();
    updateOptionDisplay();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  var notificationElement = null;
  var notificationTimeout = null;

  function showNotification(message, type) {
    // Clear existing notification
    if (notificationElement) {
      var idx = jsmaf.root.children.indexOf(notificationElement);
      if (idx > -1) jsmaf.root.children.splice(idx, 1);
    }
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }

    // Create notification
    var color = 'rgb(0, 174, 255)';
    if (type === 'success') color = 'rgb(46, 204, 113)';
    if (type === 'error') color = 'rgb(231, 76, 60)';

    notificationElement = new jsmaf.Text();
    notificationElement.text = "✦ " + message;
    notificationElement.x = 700;
    notificationElement.y = 150;
    notificationElement.style = 'settings_section';
    notificationElement.color = color;
    jsmaf.root.children.push(notificationElement);

    // Auto-hide after 2 seconds
    notificationTimeout = setTimeout(function() {
      if (notificationElement) {
        var idx = jsmaf.root.children.indexOf(notificationElement);
        if (idx > -1) jsmaf.root.children.splice(idx, 1);
        notificationElement = null;
      }
    }, 2000);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INPUT HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  jsmaf.onKeyDown = function(keyCode) {
    // Navigation
    // Support for: Standard (38/40/37/39), PS4 WebKit (1/2, 21/22), Legacy (4/6)
    if (keyCode === 1 || keyCode === 21 || keyCode === 38) {  // Up
      moveUp();
    } else if (keyCode === 2 || keyCode === 22 || keyCode === 40) {  // Down
      moveDown();
    } else if (keyCode === 4 || keyCode === 7 || keyCode === 37) {  // Left
      decreaseValue();
    } else if (keyCode === 5 || keyCode === 6 || keyCode === 39) {  // Right
      increaseValue();
    }
    
    // Actions
    else if (keyCode === 14 || keyCode === 32) {  // X / Enter / Space - Toggle/Adjust
      var option = getCurrentOption();
      if (option && option.type === 'toggle') {
        increaseValue();
      }
    } else if (keyCode === 15) {  // Square - Save
      saveConfig();
    } else if (keyCode === 16) {  // Triangle - Reset
      if (confirm('Reset all settings to default?')) {
        resetConfig();
      }
    } else if (keyCode === 13 || keyCode === 27 || keyCode === 8) {  // O / Escape / Backspace - Back
      try {
        saveConfig();
        include('main-menu.js');
      } catch (e) {
        log('[SETTINGS] Error returning to menu: ' + e.message);
      }
    }
    
    // Section switching
    else if (keyCode === 10) {  // L2 -> R1 (Actually L1/R1 are better for tab switch) or keep as is? User said L2/R2 previously.
        // Let's support both L1/R1 and L2/R2 for convenience
        switchSectionLeft();
    } else if (keyCode === 11) { // R1
        switchSectionRight();
    } else if (keyCode === 8) {  // L2 (KeyCode 8 is Backspace on PC but often L2 on PS4 WebKit)
      switchSectionLeft();
    } else if (keyCode === 9) {  // R2 (KeyCode 9 is Tab on PC but often R2 on PS4 WebKit)
      switchSectionRight();
    }
  };

  // Gamepad support
  var lastAnalogTime = 0;
  var analogThreshold = 0.5; // Lowered threshold
  var analogDelay = 150;

  setInterval(function() {
    try {
      if (!navigator || !navigator.getGamepads) return;
      
      var gps = navigator.getGamepads();
      if (!gps || !gps[0]) return;
      
      var gp = gps[0];
      var now = Date.now();
      
      if (now - lastAnalogTime < analogDelay) return;

      var x = gp.axes[0];
      var y = gp.axes[1];

      // D-Pad Support (Buttons 12/13/14/15)
      // Some browsers/controllers map D-Pad to buttons instead of axes
      if (gp.buttons) {
        if (gp.buttons[12] && (gp.buttons[12].pressed || gp.buttons[12].value > 0.5)) {
          moveUp();
          lastAnalogTime = now;
          return;
        } else if (gp.buttons[13] && (gp.buttons[13].pressed || gp.buttons[13].value > 0.5)) {
          moveDown();
          lastAnalogTime = now;
          return;
        } else if (gp.buttons[14] && (gp.buttons[14].pressed || gp.buttons[14].value > 0.5)) {
          decreaseValue();
          lastAnalogTime = now;
          return;
        } else if (gp.buttons[15] && (gp.buttons[15].pressed || gp.buttons[15].value > 0.5)) {
          increaseValue();
          lastAnalogTime = now;
          return;
        }
      }

      // Analog Sticks
      if (y > analogThreshold) {
        moveDown();
        lastAnalogTime = now;
      } else if (y < -analogThreshold) {
        moveUp();
        lastAnalogTime = now;
      } else if (x > analogThreshold) {
        increaseValue();
        lastAnalogTime = now;
      } else if (x < -analogThreshold) {
        decreaseValue();
        lastAnalogTime = now;
      }
    } catch (e) {}
  }, 50);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  // Load current configuration
  currentConfig = loadConfig();

  // Build UI
  buildUI();

  log('[SETTINGS UI] Advanced configuration panel loaded');

})();