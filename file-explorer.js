if (typeof libc_addr === 'undefined') {
  try { include('userland.js'); } catch (e) { log('userland include failed: ' + (e.message || e)); }
}

if (typeof lang === 'undefined') {
  try { include('languages.js'); } catch (e) { log('languages include failed: ' + (e.message || e)); }
}

(function () {
  'use strict';
  log('Loading Modern File Explorer (Restyled)...');

  // --- Syscall Registration ---
  try { fn.register(0x05, 'open_sys', ['bigint', 'bigint', 'bigint'], 'bigint'); } catch (e) {}
  try { fn.register(0x06, 'close_sys', ['bigint'], 'bigint'); } catch (e) {}
  try { fn.register(0x110, 'getdents', ['bigint', 'bigint', 'bigint'], 'bigint'); } catch (e) {}
  try { fn.register(0x03, 'read_sys', ['bigint', 'bigint', 'bigint'], 'bigint'); } catch (e) {}
  try { fn.register(396, 'statfs', ['bigint', 'bigint'], 'bigint'); } catch (e) {}

  // --- Helpers ---
  function strToAddr(s) {
    var addr = mem.malloc((s ? s.length : 0) + 1);
    if (!addr) return null;
    for (var i = 0; i < (s ? s.length : 0); i++) mem.view(addr).setUint8(i, s.charCodeAt(i));
    mem.view(addr).setUint8((s ? s.length : 0), 0);
    return addr;
  }

  function extOf(name) {
    if (!name) return '';
    var idx = name.lastIndexOf('.');
    if (idx < 0) return '';
    return name.substring(idx + 1).toLowerCase();
  }

  function formatSize(bytes) {
      if (bytes === -1) return "--";
      var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      if (bytes === 0) return '0 B';
      var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  function getFreeSpace(path) {
    try {
        var paddr = strToAddr(path);
        if (!paddr) return -1;
        var buf = mem.malloc(512);
        var ret = fn.statfs(paddr, buf);
        var res = -1;
        if (ret.lo === 0) {
             // FreeBSD 9 statfs: f_bsize at 0x10 (16), f_bfree at 0x28 (40)
             var bsize = mem.view(buf.add(new BigInt(0, 16))).getUint32(0, true);
             var bfree = mem.view(buf.add(new BigInt(0, 40))).getUint32(0, true);
             res = bsize * bfree;
        }
        mem.free(buf);
        return res;
    } catch(e) { return -1; }
  }

  // --- Configuration ---
  var config = {
      colors: {
          accent: 'rgb(0, 174, 255)',    // PS Blue
          textMain: 'rgb(255, 255, 255)', // Pure white
          textDim: 'rgb(180, 180, 180)',  // Light grey
          textDark: 'rgb(20, 20, 20)',    // Dark grey (for light backgrounds)
          folder: 'rgb(255, 215, 0)',     // Gold
          file: 'rgb(100, 200, 255)',     // Light Blue
          bgSidebar: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black
          selected: 'rgb(255, 255, 255)',
          itemBg: 'rgba(255, 255, 255, 0.05)',
          itemBgSel: 'rgba(0, 174, 255, 0.2)'
      },
      layout: {
          sidebarWidth: 400,
          headerHeight: 140,
          gridStartX: 450,
          gridStartY: 180,
          gridItemW: 340,
          gridItemH: 120, // Increased height for better spacing
          cols: 4
      }
  };

  // --- State ---
  var startPath = '/download0';
  var currentPath = startPath;
  var entries = [];
  var currentButton = 0;
  
  // Navigation State
  var currentZone = 'sidebar'; // Start in sidebar for better UX
  var sidebarIndex = 0;
  
  // UI Elements
  var buttons = []; // Grid Interactive elements
  var sidebarButtons = []; // Sidebar Interactive elements
  var createdElements = []; // Visuals to clear on refresh
  
  // Intervals
  var _intervals = [];
  function _setInterval(fn, ms) { var id = (jsmaf && typeof jsmaf.setInterval === 'function') ? jsmaf.setInterval(fn, ms) : setInterval(fn, ms); _intervals.push(id); return id; }
  function _clearAllIntervals() { for (var i = 0; i < _intervals.length; i++) try { if (jsmaf && typeof jsmaf.clearInterval === 'function') jsmaf.clearInterval(_intervals[i]); else clearInterval(_intervals[i]); } catch (e) {} _intervals = []; }

  // Visual Tracker
  function pushCreated(el) { try { if (!el) return; createdElements.push(el); jsmaf.root.children.push(el); } catch (e) {} }
  function clearCreated() { 
      try { 
          for (var i = 0; i < createdElements.length; i++) {
              var idx = jsmaf.root.children.indexOf(createdElements[i]);
              if (idx > -1) jsmaf.root.children.splice(idx, 1);
          }
          createdElements = []; 
          buttons = [];
      } catch (e) { createdElements = []; buttons = []; } 
  }

  // --- Styles Setup ---
  jsmaf.root.children.length = 0;
  
  new Style({ name: 'h1', color: config.colors.textMain, size: 36 }); // Path
  new Style({ name: 'h2', color: config.colors.accent, size: 28 });   // Titles
  new Style({ name: 'label', color: config.colors.textDim, size: 20 }); // Metadata
  
  new Style({ name: 'sb_item', color: config.colors.textDim, size: 24 });
  new Style({ name: 'sb_item_sel', color: config.colors.accent, size: 26 }); // Larger when selected
  
  new Style({ name: 'grid_dir', color: config.colors.folder, size: 28 });
  new Style({ name: 'grid_file', color: config.colors.file, size: 28 });
  new Style({ name: 'grid_up', color: config.colors.textDim, size: 28 });
  
  new Style({ name: 'grid_text', color: config.colors.textMain, size: 20 });
  new Style({ name: 'grid_text_sel', color: config.colors.selected, size: 20 }); // Bright white
  new Style({ name: 'grid_text_dim', color: config.colors.textDim, size: 20 });
  
  new Style({ name: 'grid_sub', color: 'rgb(120, 120, 120)', size: 16 });

  // --- Static UI ---
  // Background
  var background = new Image({ url: 'file:///c:/Users/marco/source/repos/TEST-SC/PSVueRestyle/img/background.png', x: 0, y: 0, width: 1920, height: 1080 });
  jsmaf.root.children.push(background);

  // Sidebar Background
  var sidebarBg = new Image({ 
      url: 'file:///assets/img/ad_pod_marker.png', // Reusing as solid fill (stretched)
      x: 0, y: 0, 
      width: config.layout.sidebarWidth, height: 1080,
      alpha: 0.8
  });
  // We need a dark fill. If ad_pod_marker is not suitable, we can try to use a solid color via property if supported or just rely on the image being dark/tintable.
  // Assuming ad_pod_marker is white/grey, we can try to tint it or just leave it.
  // Actually, let's just use no image and rely on a text block or similar if we had primitives.
  // Since we don't have primitives, let's skip the image background for sidebar if we don't have a dedicated one, 
  // OR we can use the main background but darkened.
  // For now, let's just make the text pop.
  
  // Header
  var appTitle = new jsmaf.Text();
  appTitle.text = "FILE EXPLORER";
  appTitle.x = 50; appTitle.y = 50;
  appTitle.style = 'h2';
  jsmaf.root.children.push(appTitle);

  var pathLabel = new jsmaf.Text();
  pathLabel.text = "Current Location:";
  pathLabel.x = 400; pathLabel.y = 40;
  pathLabel.style = 'label';
  jsmaf.root.children.push(pathLabel);

  var pathText = new jsmaf.Text();
  pathText.text = currentPath;
  pathText.x = 400; pathText.y = 75;
  pathText.style = 'h1';
  jsmaf.root.children.push(pathText);

  var statusText = new jsmaf.Text();
  statusText.text = "Free Space: Checking...";
  statusText.x = 1400; statusText.y = 75;
  statusText.style = 'label';
  jsmaf.root.children.push(statusText);

  // Sidebar Title
  var sbTitle = new jsmaf.Text();
  sbTitle.text = "QUICK ACCESS";
  sbTitle.x = 50; sbTitle.y = 150;
  sbTitle.style = 'label';
  jsmaf.root.children.push(sbTitle);

  // Sidebar Items
  var sidebarItems = [
      { name: "Downloads", path: "/download0" },
      { name: "System Data", path: "/data" },
      { name: "USB Drive 0", path: "/mnt/usb0" },
      { name: "USB Drive 1", path: "/mnt/usb1" },
      { name: "System Root", path: "/system" },
      { name: "User Home", path: "/user/home" }
  ];

  for(var i=0; i<sidebarItems.length; i++) {
      var it = new jsmaf.Text();
      it.text = sidebarItems[i].name;
      it.x = 60; it.y = 200 + i * 60;
      it.style = 'sb_item';
      jsmaf.root.children.push(it);
      sidebarButtons.push({
          visual: it,
          path: sidebarItems[i].path,
          name: sidebarItems[i].name,
          index: i
      });
  }

  // --- Logic ---

  function scanDir(path) {
    log('Scanning: ' + path);
    currentPath = path;
    pathText.text = path;
    
    var paddr = strToAddr(path);
    if (!paddr) return [];
    
    var fd = fn.open_sys(paddr, new BigInt(0, 0), new BigInt(0, 0));
    var res = [];
    
    if (fd && !fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
        var buf = mem.malloc(4096);
        var count = fn.getdents(fd, buf, new BigInt(0, 4096));
        if (count.lo > 0) {
            var offset = 0;
            while (offset < count.lo) {
                var d_reclen = mem.view(buf.add(new BigInt(0, offset + 4))).getUint16(0, true);
                var d_type = mem.view(buf.add(new BigInt(0, offset + 6))).getUint8(0);
                var d_namlen = mem.view(buf.add(new BigInt(0, offset + 7))).getUint8(0);
                var name = '';
                for (var n = 0; n < d_namlen; n++) name += String.fromCharCode(mem.view(buf.add(new BigInt(0, offset + 8 + n))).getUint8(0));
                
                if (name !== '.' && name !== '..') {
                    res.push({
                        name: name,
                        path: path + (path === '/' ? '' : '/') + name,
                        isDir: (d_type === 4), // DT_DIR
                    });
                }
                offset += d_reclen;
            }
        }
        try { fn.close_sys(fd); } catch(e){}
        try { mem.free(buf); } catch(e){}
    }
    
    // Sort: Dirs first, then alpha
    res.sort(function(a, b) {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
    });
    
    return res;
  }

  function buildGrid() {
    clearCreated();
    entries = scanDir(currentPath);
    
    // Add "Up" button if not root
    if (currentPath !== '/') {
        var upObj = { name: 'Parent Directory', isDir: true, isUp: true };
        entries.unshift(upObj);
    }

    var col = 0;
    var row = 0;
    
    for (var i = 0; i < entries.length; i++) {
        var item = entries[i];
        
        var bx = config.layout.gridStartX + col * config.layout.gridItemW;
        var by = config.layout.gridStartY + row * config.layout.gridItemH;
        
        // Background for item (card style)
        // Since we don't have primitives, we use a scaled image or nothing.
        // Let's use a text marker as a background? No.
        // We will rely on spacing and text layout.
        
        // Icon
        var iconChar = "FILE";
        var iconStyle = 'grid_file';
        
        if (item.isUp) { iconChar = "▲"; iconStyle = 'grid_up'; }
        else if (item.isDir) { iconChar = "■"; iconStyle = 'grid_dir'; }
        else { iconChar = "●"; } // Simple circle for files
        
        var icon = new jsmaf.Text();
        icon.text = iconChar;
        icon.x = bx + 10; icon.y = by + 10;
        icon.style = iconStyle;
        pushCreated(icon);
        
        // Label
        var label = new jsmaf.Text();
        var dName = item.name;
        // Truncate
        if (dName.length > 22) dName = dName.substring(0, 19) + '...';
        
        label.text = dName;
        label.x = bx + 50; label.y = by + 10; // Aligned with icon top
        label.style = 'grid_text';
        pushCreated(label);
        
        // Sub-label (Type/Size)
        // Only if not UP
        if (!item.isUp) {
            var sub = new jsmaf.Text();
            sub.text = item.isDir ? "Folder" : extOf(item.name).toUpperCase() + " File";
            sub.x = bx + 50; sub.y = by + 40; // Below name
            sub.style = 'grid_sub';
            pushCreated(sub);
        }
        
        // Store button data
        buttons.push({
            icon: icon,
            text: label,
            item: item,
            x: bx, y: by,
            w: config.layout.gridItemW - 20,
            h: config.layout.gridItemH - 20
        });
        
        col++;
        if (col >= config.layout.cols) {
            col = 0;
            row++;
        }
    }
    
    // Reset selection if in grid
    if (currentZone === 'grid') {
        currentButton = 0;
    }
    
    // Update Status with Free Space
    var free = getFreeSpace(currentPath);
    var freeStr = formatSize(free);
    statusText.text = "Items: " + entries.length + "  |  Free: " + freeStr;
    
    updateHighlight();
  }

  function updateHighlight() {
      // Sidebar Highlight
      for(var j=0; j<sidebarButtons.length; j++) {
          var sb = sidebarButtons[j];
          if (currentZone === 'sidebar' && j === sidebarIndex) {
              sb.visual.style = 'sb_item_sel';
              sb.visual.text = "➤ " + sb.name; // Arrow indicator
          } else {
              sb.visual.style = 'sb_item';
              sb.visual.text = sb.name;
          }
      }

      // Grid Highlight
      for (var i = 0; i < buttons.length; i++) {
          var btn = buttons[i];
          if (currentZone === 'grid' && i === currentButton) {
              btn.text.style = 'grid_text_sel';
              // We can't change background color easily without primitives.
              // So we use a text marker or color change.
              btn.icon.alpha = 1.0;
              // Visual marker
              // We could add a "selection box" image if we had one, but we don't want to create new files if avoidable.
              // We'll rely on brightness.
          } else {
              btn.text.style = 'grid_text_dim'; // Dim unselected
              btn.icon.alpha = 0.5; // Fade unselected icons
          }
      }
      
      // Zone focus visuals
      if (currentZone === 'sidebar') {
          appTitle.color = config.colors.accent;
          // Dim grid?
          for (var k = 0; k < buttons.length; k++) {
              buttons[k].text.style = 'grid_text_dim';
              buttons[k].icon.alpha = 0.3;
          }
      } else {
          appTitle.color = config.colors.textDim;
          // Grid active
      }
  }

  function handlePress() {
      if (currentZone === 'sidebar') {
          var sb = sidebarButtons[sidebarIndex];
          if (sb) {
              currentPath = sb.path;
              currentZone = 'grid'; // Auto-focus grid after selection
              buildGrid();
          }
          return;
      }

      var btn = buttons[currentButton];
      if (!btn) return;
      var item = btn.item;
      
      if (item.isUp) {
          var lastSlash = currentPath.lastIndexOf('/');
          if (lastSlash <= 0) currentPath = '/';
          else currentPath = currentPath.substring(0, lastSlash);
          buildGrid();
      } else if (item.isDir) {
          currentPath = item.path;
          buildGrid();
      } else {
          var ext = extOf(item.name);
          statusText.text = "Opening: " + item.name;
          if (ext === 'png' || ext === 'jpg') {
              openViewer('image', item.path);
          } else if (ext === 'js' || ext === 'txt' || ext === 'ini' || ext === 'json' || ext === 'xml') {
              openViewer('text', item.path);
          } else {
              statusText.text = "No viewer for ." + ext;
          }
      }
  }

  // --- Modal Viewer ---
  function openViewer(type, path) {
      log('Opening viewer: ' + type + ' for ' + path);
      var msg = new jsmaf.Text();
      msg.text = "VIEWER: " + path + " (Press O to close)";
      msg.x = 400; msg.y = 500;
      msg.style = 'h2';
      pushCreated(msg);
  }

  // Input
  jsmaf.onKeyDown = function (keyCode) {
      // PS4 KeyCodes: 0:?, 1:Up, 2:Down, 3:?, 4:Left, 5:Right, 6:Right?, 7:Left?
      // Enter: 14 (X), Back: 13 (O)
      
      if (keyCode === 6 || keyCode === 5 || keyCode === 22) { // Right
          if (currentZone === 'sidebar') {
              currentZone = 'grid';
              updateHighlight();
          } else {
              if (currentButton + 1 < buttons.length) currentButton++;
              updateHighlight();
          }
      } else if (keyCode === 4 || keyCode === 7 || keyCode === 21) { // Left
          if (currentZone === 'grid') {
              if (currentButton % config.layout.cols === 0) {
                  currentZone = 'sidebar';
                  updateHighlight();
              } else if (currentButton > 0) {
                  currentButton--;
                  updateHighlight();
              }
          }
      } else if (keyCode === 2) { // Down
          if (currentZone === 'sidebar') {
              if (sidebarIndex + 1 < sidebarButtons.length) sidebarIndex++;
              updateHighlight();
          } else {
              if (currentButton + config.layout.cols < buttons.length) currentButton += config.layout.cols;
              updateHighlight();
          }
      } else if (keyCode === 1) { // Up
          if (currentZone === 'sidebar') {
              if (sidebarIndex > 0) sidebarIndex--;
              updateHighlight();
          } else {
              if (currentButton - config.layout.cols >= 0) currentButton -= config.layout.cols;
              updateHighlight();
          }
      } else if (keyCode === 14) { // X
          handlePress();
      } else if (keyCode === 13 || keyCode === 27) { // O / ESC
          if (currentPath === startPath || currentPath === '/') {
              _clearAllIntervals();
              try { include('main-menu.js'); } catch(e) {}
          } else {
              var lastSlash = currentPath.lastIndexOf('/');
              if (lastSlash <= 0) currentPath = '/';
              else currentPath = currentPath.substring(0, lastSlash);
              buildGrid();
          }
      }
  };

  // Analog Support
  var lastMoveTime = 0;
  var moveThreshold = 150; // Faster response
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

          var x = gp.axes[0];
          var y = gp.axes[1];
          var moved = false;
          
          if (x > axisThreshold) { // Right
             if (currentZone === 'sidebar') {
                 currentZone = 'grid';
             } else {
                 if (currentButton + 1 < buttons.length) currentButton++;
             }
             moved = true;
          } else if (x < -axisThreshold) { // Left
             if (currentZone === 'grid') {
                 if (currentButton % config.layout.cols === 0) {
                     currentZone = 'sidebar';
                 } else if (currentButton > 0) {
                     currentButton--;
                 }
             }
             moved = true;
          }
          
          if (y > axisThreshold) { // Down
             if (currentZone === 'sidebar') {
                 if (sidebarIndex + 1 < sidebarButtons.length) sidebarIndex++;
             } else {
                 if (currentButton + config.layout.cols < buttons.length) currentButton += config.layout.cols;
             }
             moved = true;
          } else if (y < -axisThreshold) { // Up
             if (currentZone === 'sidebar') {
                 if (sidebarIndex > 0) sidebarIndex--;
             } else {
                 if (currentButton - config.layout.cols >= 0) currentButton -= config.layout.cols;
             }
             moved = true;
          }
          
          if (moved) {
              updateHighlight();
              lastMoveTime = now;
          }
      } catch(e) {}
  }, 50);

  // Initialize
  buildGrid();

})();
