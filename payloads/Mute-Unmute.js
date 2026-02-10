// this doesnt wotrk lol

(function () {





  var __globalRoot = (typeof global !== 'undefined') ? global : ((typeof window !== 'undefined') ? window : ((typeof self !== 'undefined') ? self : this || {}));



  // create a visual button

  var buttonWidth = 200, buttonHeight = 60;

  var centerX = 960, centerY = 900;



  var bgmButton = new Image({

    url: 'file:///assets/img/button_over_9.png',

    x: centerX - buttonWidth/2,

    y: centerY,

    width: buttonWidth,

    height: buttonHeight

  });

  bgmButton.alpha = 1.0;

  bgmButton._isBgmButton = true;



  // add label

  var btnText = new jsmaf.Text();

  btnText.text = 'Mute BGM';

  btnText.x = bgmButton.x + buttonWidth/2 - 50;

  btnText.y = bgmButton.y + buttonHeight/2 - 12;

  btnText.style = 'white';

  btnText.fontWeight = '600';



  try { jsmaf.root.children.push(bgmButton); jsmaf.root.children.push(btnText); } catch(e){}



  // keep track of mute state

  var isMuted = false;



  function safePlayAudio(a) { try { if (a && typeof a.play === 'function') a.play(); } catch(e){} }

  function safeStopAudio(a) { try { if (a && typeof a.stop === 'function') a.stop(); } catch(e){} try { if (a && typeof a.pause === 'function') a.pause(); } catch(e){} }



  function toggleBgmMute() {

    try {

      var bgm = __globalRoot.__persistentBgm;

      if (!bgm || !bgm._valid) return;



      if (isMuted) {

        // unmute

        bgm.volume = 0.45;

        safePlayAudio(bgm);

        btnText.text = 'Mute BGM';

        isMuted = false;

      } else {

        // mute

        bgm.volume = 0;

        safeStopAudio(bgm);

        btnText.text = 'Unmute BGM';

        isMuted = true;

      }

    } catch (e) { log('toggleBgmMute error: ' + (e.message || e)); }

  }



  // mouse click handler

  jsmaf.onMouseDown = function(mx, my, button) {

    try {

      var bx = bgmButton.x, by = bgmButton.y, bw = bgmButton.width, bh = bgmButton.height;

      if (mx >= bx && my >= by && mx <= bx + bw && my <= by + bh) {

        toggleBgmMute();

      }

    } catch(e){}

  };



})();

