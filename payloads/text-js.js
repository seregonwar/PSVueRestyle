(function() {

    // --- helper to suppress fullscreen overlays temporarily ---

    function suppressOverlays(durationMs) {

        var baseline = jsmaf.root.children.length;

        var stopAt = Date.now() + (durationMs || 600);

        var interval = jsmaf.setInterval(function() {

            try {

                for (var i = Math.max(0, baseline - 3); i < jsmaf.root.children.length; i++) {

                    var ch = jsmaf.root.children[i];

                    if (!ch || ch._overlaySuppressed) continue;

                    // heuristic: large or centered black-ish boxes

                    var w = ch.width || 0, h = ch.height || 0, x = ch.x || 0, y = ch.y || 0;

                    if ((w >= 1400 && h >= 700) || 

                        (Math.abs(x + w/2 - 960) < 220 && Math.abs(y + h/2 - 540) < 170 && w >= 300 && h >= 160 && ((ch.alpha || 0) >= 0.7))) {

                        ch.visible = false;

                        ch._overlaySuppressed = true;

                    }

                }

            } catch(e){}

            if (Date.now() >= stopAt) {

                try { jsmaf.clearInterval(interval); } catch(e){}

            }

        }, 50);

    }



    // --- load userland.js if not loaded, with overlay suppression ---

    if (typeof libc_addr === 'undefined') {

        suppressOverlays(800); // hide any black boxes during load

        include('userland.js');

    }



    // --- call notify safely ---

    function safeNotify(msg) {

        if (typeof utils !== 'undefined' && typeof utils.notify === 'function') {

            utils.notify(msg);

        } else {

            // retry shortly if utils isn't ready yet

            jsmaf.setTimeout(function() {

                if (typeof utils !== 'undefined' && typeof utils.notify === 'function') {

                    utils.notify(msg);

                } else {

                    log('utils.notify unavailable');

                }

            }, 50);

        }

    }



    safeNotify('Hello World :)');

})();

