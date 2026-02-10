(function() {
  include('languages.js');
  
  // -- Setup Scene --
  jsmaf.root.children.length = 0;

  // Styles
  new Style({ name: 'white', color: 'white', size: 28 });
  new Style({ name: 'title', color: 'white', size: 36 });
  new Style({ name: 'info', color: 'rgb(200,200,200)', size: 24 });

  // Background
  var background = new Image({ url: 'file:///../download0/img/background.png', x: 0, y: 0, width: 1920, height: 1080 });
  jsmaf.root.children.push(background);

  // Header
  var headerLogo = new jsmaf.Text();
  headerLogo.text = "FTP SERVER";
  headerLogo.x = 80; headerLogo.y = 60;
  headerLogo.style = 'title';
  jsmaf.root.children.push(headerLogo);

  // Status Info
  var statusText = new jsmaf.Text();
  statusText.text = "FTP Server is running...";
  statusText.x = 960; statusText.y = 400;
  statusText.style = 'title';
  statusText.x -= 150; // approximate center offset
  jsmaf.root.children.push(statusText);

  var portText = new jsmaf.Text();
  portText.text = "Listening on Port: 1337";
  portText.x = 960; portText.y = 460;
  portText.style = 'info';
  portText.x -= 120;
  jsmaf.root.children.push(portText);

  var ipText = new jsmaf.Text();
  ipText.text = "IP: 192.168.1.xxx (Check System Settings)";
  ipText.x = 960; ipText.y = 520;
  ipText.style = 'info';
  ipText.x -= 200;
  jsmaf.root.children.push(ipText);

  var footerText = new jsmaf.Text();
  footerText.text = "Press (Circle) to Stop and Return";
  footerText.x = 960; footerText.y = 900;
  footerText.style = 'white';
  footerText.x -= 180;
  jsmaf.root.children.push(footerText);

  // Attempt to start binloader or actual FTP payload if available
  // For now, this is a placeholder interface.
  log("Starting FTP UI...");

  // Input Handling
  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 13 || keyCode === 27) { // Circle / ESC
      try { include('main-menu.js'); } catch(e) { log(e); }
    }
  };
  
  jsmaf.onMouseDown = function() {
      try { include('main-menu.js'); } catch(e) {}
  };

})();
