/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REVOLUTIONARY MAIN MENU -  EDITION v2.0
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Advanced glassmorphism design with animated particles
 * - Complete theme system (Dark/Cyber/Retro/Custom)
 * - Full settings persistence via localStorage
 * - Real-time system dashboard with statistics
 * - Professional toast notification system
 * - Quick actions and recent items tracking
 * - Smooth animations with advanced easing
 * - Mouse, keyboard, and gamepad support
 * - Modular architecture with error handling
 * 
 * @author Seregon
 * @version 2.0.0
 * @date 2025-02-10
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION & SAFETY CHECKS
  // ═══════════════════════════════════════════════════════════════════════════

  try {
    include('languages.js');
  } catch (e) {
    console.error('[INIT] Failed to load languages:', e);
  }

  // Attempt to load userland.js if not present (needed for jailbreak check)
  if (typeof libc_addr === 'undefined') {
    try { include('userland.js'); } catch (e) { log('[INIT] Failed to load userland.js: ' + (e.message || e)); }
  }

  // Helper to check jailbreak status
  function isJailbrokenCheck() {
    try {
      if (typeof fn === 'undefined') return false;
      fn.register(24, 'getuid', [], 'bigint');
      fn.register(23, 'setuid', ['number'], 'bigint');
      try { fn.setuid(0); } catch (e) {}
      var uid = fn.getuid();
      var val = uid instanceof BigInt ? uid.lo : uid;
      return val === 0;
    } catch (e) {
      return false;
    }
  }

  log('[REVOLUTIONARY MENU] Initializing Enterprise UI System...');

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Theme definitions - Enterprise color schemes with enhanced visuals
   */
  var THEMES = {
    dark: {
      name: 'Dark Professional',
      primary: 'rgb(0, 174, 255)',        // PS Blue
      primaryLight: 'rgb(100, 200, 255)',  // Lighter blue for hover
      secondary: 'rgb(138, 43, 226)',     // Purple accent
      success: 'rgb(46, 204, 113)',       // Green
      warning: 'rgb(241, 196, 15)',       // Yellow
      danger: 'rgb(231, 76, 60)',         // Red
      bg: 'rgb(13, 17, 23)',              // Deep dark
      bgCard: 'rgba(30, 35, 45, 0.85)',   // Card with transparency
      bgCardHover: 'rgba(40, 50, 65, 0.95)', // Lighter on hover
      bgOverlay: 'rgba(0, 0, 0, 0.7)',    // Overlay
      text: 'rgb(240, 246, 252)',         // Light text
      textDim: 'rgb(139, 148, 158)',      // Dimmed text
      textMuted: 'rgb(88, 96, 105)',      // Muted text
      border: 'rgba(48, 54, 61, 0.8)',    // Border
      borderHover: 'rgba(0, 174, 255, 0.6)', // Glowing border
      glow: 'rgba(0, 174, 255, 0.3)',     // Glow effect
      glowIntense: 'rgba(0, 174, 255, 0.6)' // Intense glow for active
    },
    cyber: {
      name: 'Cyberpunk Neon',
      primary: 'rgb(0, 255, 255)',        // Cyan
      primaryLight: 'rgb(100, 255, 255)', // Lighter cyan
      secondary: 'rgb(255, 0, 255)',      // Magenta
      success: 'rgb(0, 255, 127)',        // Neon green
      warning: 'rgb(255, 215, 0)',        // Gold
      danger: 'rgb(255, 20, 147)',        // Deep pink
      bg: 'rgb(10, 10, 25)',              // Almost black
      bgCard: 'rgba(20, 20, 40, 0.9)',    // Dark purple
      bgCardHover: 'rgba(30, 30, 60, 0.95)', // Lighter on hover
      bgOverlay: 'rgba(0, 0, 0, 0.8)',
      text: 'rgb(0, 255, 255)',           // Cyan text
      textDim: 'rgb(138, 43, 226)',       // Purple
      textMuted: 'rgb(75, 0, 130)',       // Indigo
      border: 'rgba(0, 255, 255, 0.5)',
      borderHover: 'rgba(255, 0, 255, 0.8)', // Magenta hover
      glow: 'rgba(255, 0, 255, 0.5)',
      glowIntense: 'rgba(0, 255, 255, 0.8)' // Intense cyan glow
    },
    retro: {
      name: 'Retro Wave',
      primary: 'rgb(255, 71, 87)',        // Retro pink
      primaryLight: 'rgb(255, 120, 130)', // Lighter pink
      secondary: 'rgb(5, 195, 221)',      // Retro cyan
      success: 'rgb(250, 208, 44)',       // Retro yellow
      warning: 'rgb(255, 140, 66)',       // Retro orange
      danger: 'rgb(189, 44, 121)',        // Dark pink
      bg: 'rgb(32, 20, 46)',              // Deep purple
      bgCard: 'rgba(73, 50, 111, 0.85)',  // Purple card
      bgCardHover: 'rgba(100, 70, 140, 0.95)', // Lighter on hover
      bgOverlay: 'rgba(32, 20, 46, 0.85)',
      text: 'rgb(255, 231, 235)',         // Light pink
      textDim: 'rgb(183, 148, 244)',      // Light purple
      textMuted: 'rgb(130, 102, 187)',    // Medium purple
      border: 'rgba(255, 71, 87, 0.6)',
      borderHover: 'rgba(5, 195, 221, 0.8)', // Cyan hover
      glow: 'rgba(255, 71, 87, 0.4)',
      glowIntense: 'rgba(255, 71, 87, 0.7)' // Intense pink glow
    }
  };

  /**
   * Default configuration with validation
   */
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

  /**
   * Runtime state
   */
  var state = {
    config: null,
    recentItems: [],
    stats: {
      launchCount: 0,
      lastLaunch: null,
      totalUptime: 0,
      favoriteAction: null
    },
    currentTheme: null,
    ui: {
      currentButton: 0,
      prevButton: -1,
      menuItems: [],
      particles: [],
      notifications: []
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTENCE LAYER - localStorage with validation
  // ═══════════════════════════════════════════════════════════════════════════

  var Storage = {
    /**
     * Load configuration from localStorage with validation
     * @returns {Object} Validated configuration object
     */
    loadConfig: function() {
      try {
        var stored = localStorage.getItem('revolutionaryMenu_config');
        if (!stored) {
          log('[STORAGE] No config found, using defaults');
          return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        }

        var parsed = JSON.parse(stored);
        var validated = {};

        // Validate each field with type checking
        for (var key in DEFAULT_CONFIG) {
          if (parsed.hasOwnProperty(key) && typeof parsed[key] === typeof DEFAULT_CONFIG[key]) {
            validated[key] = parsed[key];
          } else {
            validated[key] = DEFAULT_CONFIG[key];
            log('[STORAGE] Invalid value for ' + key + ', using default');
          }
        }

        log('[STORAGE] Configuration loaded successfully');
        return validated;
      } catch (e) {
        log('[STORAGE ERROR] Failed to load config: ' + e.message);
        return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      }
    },

    /**
     * Save configuration to localStorage
     * @param {Object} config - Configuration to save
     * @returns {boolean} Success status
     */
    saveConfig: function(config) {
      try {
        if (!config || typeof config !== 'object') {
          throw new Error('Invalid config object');
        }

        localStorage.setItem('revolutionaryMenu_config', JSON.stringify(config));
        log('[STORAGE] Configuration saved successfully');
        return true;
      } catch (e) {
        log('[STORAGE ERROR] Failed to save config: ' + e.message);
        return false;
      }
    },

    /**
     * Load recent items with size limit
     * @returns {Array} Recent items array
     */
    loadRecentItems: function() {
      try {
        var stored = localStorage.getItem('revolutionaryMenu_recent');
        if (!stored) return [];

        var items = JSON.parse(stored);
        if (!Array.isArray(items)) return [];

        // Limit to configured count
        return items.slice(0, state.config.recentItemsCount);
      } catch (e) {
        log('[STORAGE ERROR] Failed to load recent items: ' + e.message);
        return [];
      }
    },

    /**
     * Add item to recent items with deduplication
     * @param {string} action - Action identifier
     * @param {string} label - Display label
     */
    addRecentItem: function(action, label) {
      try {
        var items = this.loadRecentItems();
        
        // Remove duplicates
        items = items.filter(function(item) {
          return item.action !== action;
        });

        // Add to front
        items.unshift({
          action: action,
          label: label,
          timestamp: Date.now()
        });

        // Limit size
        items = items.slice(0, state.config.recentItemsCount);

        localStorage.setItem('revolutionaryMenu_recent', JSON.stringify(items));
        state.recentItems = items;
      } catch (e) {
        log('[STORAGE ERROR] Failed to add recent item: ' + e.message);
      }
    },

    /**
     * Load statistics with validation
     * @returns {Object} Stats object
     */
    loadStats: function() {
      try {
        var stored = localStorage.getItem('revolutionaryMenu_stats');
        if (!stored) {
          return {
            launchCount: 0,
            lastLaunch: null,
            totalUptime: 0,
            favoriteAction: null,
            actionCounts: {}
          };
        }

        var stats = JSON.parse(stored);
        
        // Validate stats structure
        if (typeof stats.launchCount !== 'number') stats.launchCount = 0;
        if (!stats.actionCounts) stats.actionCounts = {};
        if (typeof stats.totalUptime !== 'number') stats.totalUptime = 0;

        return stats;
      } catch (e) {
        log('[STORAGE ERROR] Failed to load stats: ' + e.message);
        return {
          launchCount: 0,
          lastLaunch: null,
          totalUptime: 0,
          favoriteAction: null,
          actionCounts: {}
        };
      }
    },

    /**
     * Update statistics
     * @param {Object} updates - Stats updates
     */
    updateStats: function(updates) {
      try {
        var stats = this.loadStats();
        
        for (var key in updates) {
          if (updates.hasOwnProperty(key)) {
            stats[key] = updates[key];
          }
        }

        // Track action counts
        if (updates.action) {
          if (!stats.actionCounts) stats.actionCounts = {};
          stats.actionCounts[updates.action] = (stats.actionCounts[updates.action] || 0) + 1;
          
          // Update favorite
          var maxCount = 0;
          var favorite = null;
          for (var act in stats.actionCounts) {
            if (stats.actionCounts[act] > maxCount) {
              maxCount = stats.actionCounts[act];
              favorite = act;
            }
          }
          stats.favoriteAction = favorite;
        }

        localStorage.setItem('revolutionaryMenu_stats', JSON.stringify(stats));
        state.stats = stats;
      } catch (e) {
        log('[STORAGE ERROR] Failed to update stats: ' + e.message);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIO SYSTEM - Background music with smart reload
  // ═══════════════════════════════════════════════════════════════════════════

  var AudioSystem = {
    bgm: null,
    clickSfx: null,
    loadSfx: null,
    successSfx: null,
    bgmReloadTimer: null,
    bgmReloadIntervalMs: 156000,

    /**
     * Initialize audio system
     */
    init: function() {
      try {
        var __globalRoot = (typeof global !== 'undefined') ? global : 
                          ((typeof window !== 'undefined') ? window : 
                          ((typeof self !== 'undefined') ? self : this || {}));

        // Initialize or reuse BGM
        if (__globalRoot.__persistentBgm && __globalRoot.__persistentBgm._valid) {
          this.bgm = __globalRoot.__persistentBgm;
          if (this.bgm._isPlaying) this.bgm._startedOnce = true;
        } else {
          this.bgm = new jsmaf.AudioClip();
          this.bgm.volume = 0;
          try {
            this.bgm.open('file://../download0/sfx/bgm.wav');
            this.bgm.loop = true;
            
            var self = this;
            var prevOnEnded = this.bgm.onended;
            this.bgm.onended = function() {
              try { if (prevOnEnded) prevOnEnded(); } catch (e) {}
              try { self.bgm._isPlaying = false; } catch (e) {}
              try { self.bgm.play(); self.bgm._isPlaying = true; } catch (e) {}
            };
          } catch (e) {
            log('[AUDIO] BGM load error: ' + e.message);
          }
          this.bgm._valid = true;
          this.bgm._isPlaying = false;
          this.bgm._startedOnce = false;
          __globalRoot.__persistentBgm = this.bgm;
        }

        // Load SFX
        try {
          this.clickSfx = new jsmaf.AudioClip();
          this.clickSfx.open('file://../download0/sfx/click.wav');
          
          this.loadSfx = new jsmaf.AudioClip();
          this.loadSfx.open('file://../download0/sfx/load.wav');
        } catch (e) {
          log('[AUDIO] SFX load error: ' + e.message);
        }

        log('[AUDIO] System initialized');
      } catch (e) {
        log('[AUDIO ERROR] Initialization failed: ' + e.message);
      }
    },

    /**
     * Play click sound effect
     */
    playClick: function() {
      try {
        if (this.clickSfx && typeof this.clickSfx.play === 'function') {
          this.clickSfx.play();
        }
      } catch (e) {
        // Silent fail for SFX
      }
    },

    /**
     * Play load sound effect
     */
    playLoad: function() {
      try {
        if (this.loadSfx && typeof this.loadSfx.play === 'function') {
          this.loadSfx.play();
        }
      } catch (e) {
        // Silent fail for SFX
      }
    },

    /**
     * Start background music with fade-in
     */
    start: function() {
      try {
        if (!this.bgm || !this.bgm._valid) return;

        if (this.bgm._startedOnce) {
          if (this.bgm._isPlaying) {
            // if (!this.bgmReloadTimer) this.scheduleBgmReload();
          } else {
            this.bgm.play();
            this.bgm._isPlaying = true;
            // if (!this.bgmReloadTimer) this.scheduleBgmReload();
          }
          return;
        }

        this.bgm.play();
        this.bgm._isPlaying = true;
        this.bgm._startedOnce = true;
        // this.scheduleBgmReload(); // Disabled to prevent resetting loop

        // Fade in
        var targetVolume = state.config.volume;
        this.fadeVolume(0, targetVolume, 900);

      } catch (e) {
        log('[AUDIO ERROR] Failed to start BGM: ' + e.message);
      }
    },

    /**
     * Fade volume smoothly
     * @param {number} from - Start volume (0-1)
     * @param {number} to - Target volume (0-1)
     * @param {number} duration - Duration in ms
     */
    fadeVolume: function(from, to, duration) {
      try {
        if (!this.bgm) return;

        var elapsed = 0;
        var step = 50;
        var self = this;

        var fadeInterval = setInterval(function() {
          elapsed += step;
          var t = Math.min(elapsed / duration, 1);
          self.bgm.volume = from + (to - from) * t;

          if (t >= 1) {
            clearInterval(fadeInterval);
          }
        }, step);
      } catch (e) {
        log('[AUDIO ERROR] Fade failed: ' + e.message);
      }
    },

    /**
     * Schedule BGM reload to prevent audio artifacts
     */
    scheduleBgmReload: function() {
      var self = this;
      this.clearBgmReloadTimer();
      
      try {
        this.bgmReloadTimer = setTimeout(function() {
          try { self.reloadSong(); } catch (e) {}
          try { self.scheduleBgmReload(); } catch (e) {}
        }, this.bgmReloadIntervalMs);
      } catch (e) {
        this.bgmReloadTimer = null;
      }
    },

    /**
     * Clear reload timer
     */
    clearBgmReloadTimer: function() {
      try {
        if (this.bgmReloadTimer) {
          clearTimeout(this.bgmReloadTimer);
        }
      } catch (e) {}
      this.bgmReloadTimer = null;
    },

    /**
     * Reload song to prevent audio glitches
     */
    reloadSong: function() {
      try {
        if (!this.bgm || !this.bgm._valid) return;
        
        if (typeof this.bgm.stop === 'function') this.bgm.stop();
        this.bgm._isPlaying = false;
        this.bgm.open('file://../download0/sfx/bgm.wav');
        
        var self = this;
        var prevOnEnded = this.bgm.onended;
        this.bgm.onended = function() {
          try { if (prevOnEnded) prevOnEnded(); } catch (e) {}
          try { self.bgm._isPlaying = false; } catch (e) {}
          try { self.bgm.play(); self.bgm._isPlaying = true; } catch (e) {}
        };
        
        if (typeof this.bgm.play === 'function') {
          this.bgm.play();
          this.bgm._isPlaying = true;
        }
        this.bgm._startedOnce = true;
      } catch (e) {
        log('[AUDIO] Reload error: ' + e.message);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATION SYSTEM - Toast messages
  // ═══════════════════════════════════════════════════════════════════════════

  var NotificationSystem = {
    queue: [],
    activeToasts: [],

    /**
     * Show notification toast
     * @param {string} message - Message text
     * @param {string} type - Type: 'info', 'success', 'warning', 'error'
     * @param {number} duration - Display duration in ms (default: 3000)
     */
    show: function(message, type, duration) {
      if (!state.config.notificationsEnabled) return;

      type = type || 'info';
      duration = duration || 3000;

      var notification = {
        id: Date.now() + Math.random(),
        message: message,
        type: type,
        duration: duration,
        startTime: Date.now()
      };

      this.queue.push(notification);
      this.processQueue();
    },

    /**
     * Process notification queue
     */
    processQueue: function() {
      if (this.queue.length === 0) return;
      if (this.activeToasts.length >= 3) return; // Max 3 visible

      var notification = this.queue.shift();
      this.displayToast(notification);
    },

    /**
     * Display toast notification
     * @param {Object} notification - Notification object
     */
    displayToast: function(notification) {
      try {
        var theme = state.currentTheme;
        var yOffset = 100 + (this.activeToasts.length * 90);

        // Background
        var bg = new Image({
          url: 'file:///assets/img/ad_pod_marker.png',
          x: 1920 - 420,
          y: yOffset,
          width: 400,
          height: 70,
          alpha: 0
        });

        // Icon based on type
        var iconColor = theme.primary;
        if (notification.type === 'success') iconColor = theme.success;
        if (notification.type === 'warning') iconColor = theme.warning;
        if (notification.type === 'error') iconColor = theme.danger;

        var icon = new jsmaf.Text();
        icon.text = '●';
        icon.x = 1920 - 400;
        icon.y = yOffset + 15;
        icon.style = 'toast_icon';
        icon.color = iconColor;
        icon.alpha = 0;

        // Message
        var msg = new jsmaf.Text();
        msg.text = notification.message;
        msg.x = 1920 - 370;
        msg.y = yOffset + 20;
        msg.style = 'toast_text';
        msg.alpha = 0;

        var elements = [bg, icon, msg];
        
        // Add to scene
        elements.forEach(function(el) {
          jsmaf.root.children.push(el);
        });

        // Animate in
        Animator.animate(bg, {alpha: 0, x: 1920 - 390}, {alpha: 0.95, x: 1920 - 420}, 300);
        Animator.animate(icon, {alpha: 0}, {alpha: 1}, 300);
        Animator.animate(msg, {alpha: 0, x: 1920 - 350}, {alpha: 1, x: 1920 - 370}, 300);

        var toast = {
          notification: notification,
          elements: elements
        };

        this.activeToasts.push(toast);

        // Auto-dismiss
        var self = this;
        setTimeout(function() {
          self.dismissToast(toast);
        }, notification.duration);

      } catch (e) {
        log('[NOTIFICATION ERROR] Display failed: ' + e.message);
      }
    },

    /**
     * Dismiss toast notification
     * @param {Object} toast - Toast object
     */
    dismissToast: function(toast) {
      try {
        // Animate out
        toast.elements.forEach(function(el) {
          Animator.animate(el, {alpha: el.alpha, x: el.x}, {alpha: 0, x: el.x + 50}, 200, function() {
            // Remove from scene
            var idx = jsmaf.root.children.indexOf(el);
            if (idx > -1) {
              jsmaf.root.children.splice(idx, 1);
            }
          });
        });

        // Remove from active
        var idx = this.activeToasts.indexOf(toast);
        if (idx > -1) {
          this.activeToasts.splice(idx, 1);
        }

        // Process next
        setTimeout(function() {
          NotificationSystem.processQueue();
        }, 100);

      } catch (e) {
        log('[NOTIFICATION ERROR] Dismiss failed: ' + e.message);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PARTICLE SYSTEM - Animated background particles
  // ═══════════════════════════════════════════════════════════════════════════

  var ParticleSystem = {
    particles: [],
    updateInterval: null,

    /**
     * Initialize particle system
     */
    init: function() {
      if (!state.config.particlesEnabled) return;

      log('[PARTICLES] Initializing system with ' + state.config.particleCount + ' particles');

      for (var i = 0; i < state.config.particleCount; i++) {
        this.createParticle();
      }

      // Start update loop
      var self = this;
      this.updateInterval = setInterval(function() {
        self.update();
      }, 50);
    },

    /**
     * Create single particle
     */
    createParticle: function() {
      try {
        var particle = {
          x: Math.random() * 1920,
          y: Math.random() * 1080,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.3 + 0.1,
          color: state.currentTheme.primary
        };

        // Create visual
        var visual = new Image({
          url: 'file:///assets/img/ad_pod_marker.png',
          x: particle.x,
          y: particle.y,
          width: particle.size * 2,
          height: particle.size * 2,
          alpha: particle.alpha
        });

        jsmaf.root.children.unshift(visual); // Behind everything
        particle.visual = visual;

        this.particles.push(particle);
      } catch (e) {
        log('[PARTICLES ERROR] Create failed: ' + e.message);
      }
    },

    /**
     * Update all particles
     */
    update: function() {
      try {
        for (var i = 0; i < this.particles.length; i++) {
          var p = this.particles[i];
          
          // Update position
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around screen
          if (p.x < 0) p.x = 1920;
          if (p.x > 1920) p.x = 0;
          if (p.y < 0) p.y = 1080;
          if (p.y > 1080) p.y = 0;

          // Pulse alpha
          p.alpha += (Math.random() - 0.5) * 0.02;
          p.alpha = Math.max(0.05, Math.min(0.4, p.alpha));

          // Update visual
          if (p.visual) {
            p.visual.x = p.x;
            p.visual.y = p.y;
            p.visual.alpha = p.alpha;
          }
        }
      } catch (e) {
        // Silent fail to avoid log spam
      }
    },

    /**
     * Destroy particle system
     */
    destroy: function() {
      try {
        if (this.updateInterval) {
          clearInterval(this.updateInterval);
          this.updateInterval = null;
        }

        // Remove visuals
        for (var i = 0; i < this.particles.length; i++) {
          var p = this.particles[i];
          if (p.visual) {
            var idx = jsmaf.root.children.indexOf(p.visual);
            if (idx > -1) {
              jsmaf.root.children.splice(idx, 1);
            }
          }
        }

        this.particles = [];
      } catch (e) {
        log('[PARTICLES ERROR] Destroy failed: ' + e.message);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIMATION ENGINE - Smooth animations with easing
  // ═══════════════════════════════════════════════════════════════════════════

  var Animator = {
    activeAnimations: [],

    /**
     * Easing functions
     */
    easing: {
      linear: function(t) { return t; },
      easeInOut: function(t) { return (1 - Math.cos(t * Math.PI)) / 2; },
      easeOut: function(t) { return 1 - Math.pow(1 - t, 3); },
      easeIn: function(t) { return Math.pow(t, 3); },
      elastic: function(t) {
        return t === 0 || t === 1 ? t : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
      },
      bounce: function(t) {
        var n1 = 7.5625;
        var d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    },

    /**
     * Animate object properties
     * @param {Object} obj - Object to animate
     * @param {Object} from - Start values
     * @param {Object} to - End values
     * @param {number} duration - Duration in ms
     * @param {Function} onComplete - Completion callback
     * @param {string} easingType - Easing function name
     */
    animate: function(obj, from, to, duration, onComplete, easingType) {
      if (!state.config.animationsEnabled) {
        // Apply final values immediately
        for (var k in to) {
          obj[k] = to[k];
        }
        if (onComplete) onComplete();
        return;
      }

      easingType = easingType || 'easeInOut';
      var easingFn = this.easing[easingType] || this.easing.easeInOut;

      var animation = {
        obj: obj,
        from: from,
        to: to,
        duration: duration,
        elapsed: 0,
        onComplete: onComplete,
        easingFn: easingFn
      };

      this.activeAnimations.push(animation);
    },

    /**
     * Update all active animations
     */
    update: function(deltaTime) {
      if (!state.config.animationsEnabled) return;

      for (var i = this.activeAnimations.length - 1; i >= 0; i--) {
        var anim = this.activeAnimations[i];
        anim.elapsed += deltaTime;

        var t = Math.min(anim.elapsed / anim.duration, 1);
        var e = anim.easingFn(t);

        // Apply eased values (rounded to integer coordinates for better text quality)
        for (var k in anim.to) {
          var fromVal = (anim.from && anim.from[k] !== undefined) ? anim.from[k] : (anim.obj[k] || 0);
          var newVal = fromVal + (anim.to[k] - fromVal) * e;
          
          if (k === 'x' || k === 'y') {
            anim.obj[k] = Math.round(newVal);
          } else {
            anim.obj[k] = newVal;
          }
        }

        // Complete
        if (t >= 1) {
          if (anim.onComplete) {
            try {
              anim.onComplete();
            } catch (e) {
              log('[ANIMATOR ERROR] Callback failed: ' + e.message);
            }
          }
          this.activeAnimations.splice(i, 1);
        }
      }
    }
  };

  // Start animation loop
  var lastAnimTime = Date.now();
  setInterval(function() {
    var now = Date.now();
    var delta = now - lastAnimTime;
    lastAnimTime = now;
    Animator.update(delta);
  }, 16); // ~60fps

  // ═══════════════════════════════════════════════════════════════════════════
  // UI BUILDER - Construct interface elements
  // ═══════════════════════════════════════════════════════════════════════════

  var UIBuilder = {
    elements: {},

    /**
     * Initialize UI styles
     */
    initStyles: function() {
      var theme = state.currentTheme;

      // Create all required styles
      new Style({ name: 'logo', color: theme.primary, size: 52 }); // Primary color for brand
      new Style({ name: 'title', color: theme.text, size: 40 }); // Larger titles
      new Style({ name: 'subtitle', color: theme.primary, size: 24 }); // Primary for emphasis
      new Style({ name: 'header', color: theme.textDim, size: 22 }); // Slightly larger
      new Style({ name: 'menu_item', color: theme.textDim, size: 26 });
      new Style({ name: 'menu_item_active', color: theme.primary, size: 34 }); // Larger when active
      new Style({ name: 'footer', color: theme.textMuted, size: 18 });
      new Style({ name: 'stat_label', color: theme.primary, size: 20 }); // Primary for labels
      new Style({ name: 'stat_value', color: theme.success, size: 24 }); // Larger values
      new Style({ name: 'toast_icon', color: theme.primary, size: 28 }); // Larger icons
      new Style({ name: 'toast_text', color: theme.text, size: 20 }); // Larger toast text
      new Style({ name: 'quick_action', color: theme.secondary, size: 22 }); // More visible
    },

    /**
     * Build complete UI
     */
    build: function() {
      log('[UI] Building interface...');

      // Clear scene
      jsmaf.root.children.length = 0;

      this.initStyles();
      this.buildBackground();
      this.buildHeader();
      this.buildMenu();
      this.buildDashboard();
      this.buildQuickActions();
      this.buildFooter();

      log('[UI] Interface built successfully');
    },

    /**
     * Build animated background
     */
    buildBackground: function() {
      var theme = state.currentTheme;

      // Base background
      var bg = new Image({
        url: 'file:///c:/Users/marco/source/repos/TEST-SC/PSVueRestyle/img/background.png',
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        alpha: 0
      });
      jsmaf.root.children.push(bg);
      this.elements.background = bg;

      // Animate in
      Animator.animate(bg, {alpha: 0}, {alpha: 1}, 1000);
    },

    /**
     * Build header section
     */
    buildHeader: function() {
      var theme = state.currentTheme;

      // Logo
      var logo = new jsmaf.Text();
      logo.text = "PS VUE";
      logo.x = 80;
      logo.y = 60;
      logo.style = 'logo'; // Make sure this style uses a bright/visible color
      logo.alpha = 0;
      jsmaf.root.children.push(logo);
      this.elements.logo = logo;

      // System time
      var timeText = new jsmaf.Text();
      timeText.text = this.getFormattedTime();
      timeText.x = 860;
      timeText.y = 60;
      timeText.style = 'header';
      timeText.alpha = 0;
      jsmaf.root.children.push(timeText);
      this.elements.timeText = timeText;

      // Update time every second
      setInterval(function() {
        try {
          timeText.text = UIBuilder.getFormattedTime();
        } catch (e) {}
      }, 1000);

      // User info
      var userInfo = new jsmaf.Text();
      userInfo.text = "UWU After Free";
      userInfo.x = 1600;
      userInfo.y = 60;
      userInfo.style = 'header';
      userInfo.alpha = 0;
      jsmaf.root.children.push(userInfo);
      this.elements.userInfo = userInfo;

      // Animate in
      Animator.animate(logo, {alpha: 0, x: 30}, {alpha: 1, x: 60}, 800, null, 'easeOut');
      Animator.animate(timeText, {alpha: 0, y: 40}, {alpha: 1, y: 60}, 900, null, 'easeOut');
      Animator.animate(userInfo, {alpha: 0, x: 1630}, {alpha: 1, x: 1600}, 1000, null, 'easeOut');
    },

    /**
     * Build main menu
     */
    buildMenu: function() {
      var theme = state.currentTheme;

      // Menu title
      var menuTitle = new jsmaf.Text();
      menuTitle.text = "━━━ MAIN MENU ━━━";
      menuTitle.x = 120;
      menuTitle.y = 200;
      menuTitle.style = 'subtitle';
      menuTitle.alpha = 0;
      jsmaf.root.children.push(menuTitle);

      Animator.animate(menuTitle, {alpha: 0}, {alpha: 1}, 1000);

      // Menu items definition
      var menuItems = [
        { label: "⚡ Load The Jailbreak", action: 'jailbreak', icon: '⚡' },
        { label: "📁 File Explorer", action: 'explorer', icon: '📁' },
        { label: "🐧 Linux Payloads", action: 'linux', icon: '🐧' },
        { label: "🌐 FTP Server", action: 'ftp', icon: '🌐' },
        { label: "📦 BinLoader", action: 'binloader', icon: '📦' },
        { label: "🎮 Other Payloads", action: 'payloads', icon: '🎮' },
        { label: "⚙️  Settings", action: 'settings', icon: '⚙️' }
      ];

      var startX = 180; // Shifted right
      var startY = 320; // Shifted down
      var spacing = 75; // Slightly reduced spacing

      state.ui.menuItems = [];

      for (var i = 0; i < menuItems.length; i++) {
        var item = menuItems[i];
        var yPos = startY + i * spacing;

        // Selection indicator (animated bar)
        var indicator = new Image({
          url: 'file:///assets/img/ad_pod_marker.png',
          x: startX - 40,
          y: yPos + 8,
          width: 6,
          height: 32,
          alpha: 0
        });
        jsmaf.root.children.push(indicator);

        // Menu text
        var text = new jsmaf.Text();
        text.text = item.label;
        text.x = startX;
        text.y = yPos;
        text.style = 'menu_item';
        text.alpha = 0;
        jsmaf.root.children.push(text);

        // Glow effect placeholder
        var glow = new Image({
          url: 'file:///assets/img/ad_pod_marker.png',
          x: startX - 10,
          y: yPos,
          width: 400,
          height: 40,
          alpha: 0
        });
        jsmaf.root.children.push(glow);

        state.ui.menuItems.push({
          label: item.label,
          action: item.action,
          icon: item.icon,
          text: text,
          indicator: indicator,
          glow: glow,
          index: i
        });

        // Staggered entrance animation
        (function(idx, txt, ind) {
          var delay = 1200 + idx * 100;
          setTimeout(function() {
            Animator.animate(txt, {alpha: 0, x: startX - 30}, {alpha: 1, x: startX}, 600, null, 'easeOut');
          }, delay);
        })(i, text, indicator);
      }
    },

    /**
     * Build dashboard with statistics
     */
    buildDashboard: function() {
      if (!state.config.showStats) return;

      var theme = state.currentTheme;
      var startX = 1100;
      var startY = 250;

      // Dashboard title with enhanced styling
      var dashTitle = new jsmaf.Text();
      dashTitle.text = "━━━ SYSTEM DASHBOARD ━━━";
      dashTitle.x = startX;
      dashTitle.y = startY;
      dashTitle.style = 'subtitle';
      dashTitle.color = theme.primary;
      dashTitle.alpha = 0;
      jsmaf.root.children.push(dashTitle);

      Animator.animate(dashTitle, {alpha: 0, y: startY - 10}, {alpha: 1, y: startY}, 1400, null, 'easeOut');

      // Stats
      var stats = [
        { label: "Total Launches", value: state.stats.launchCount.toString() },
        { label: "Uptime", value: this.formatUptime(state.stats.totalUptime) },
        { label: "Favorite", value: state.stats.favoriteAction || 'None' },
        { label: "Theme", value: state.currentTheme.name }
      ];

      for (var i = 0; i < stats.length; i++) {
        var stat = stats[i];
        var yPos = startY + 60 + i * 50;

        var label = new jsmaf.Text();
        label.text = stat.label + ":";
        label.x = startX + 20;
        label.y = yPos;
        label.style = 'stat_label';
        label.color = theme.primary;
        label.alpha = 0;
        jsmaf.root.children.push(label);

        var value = new jsmaf.Text();
        value.text = stat.value;
        value.x = startX + 200;
        value.y = yPos - 3;
        value.style = 'stat_value';
        value.color = theme.success;
        value.alpha = 0;
        jsmaf.root.children.push(value);

        // Animate in
        (function(lbl, val, idx) {
          var delay = 1600 + idx * 100;
          setTimeout(function() {
            Animator.animate(lbl, {alpha: 0, x: startX}, {alpha: 1, x: startX + 20}, 500);
            Animator.animate(val, {alpha: 0, x: startX + 180}, {alpha: 1, x: startX + 200}, 500);
          }, delay);
        })(label, value, i);
      }

      // Recent items section
      if (state.recentItems.length > 0) {
        var recentTitle = new jsmaf.Text();
        recentTitle.text = "Recent Actions:";
        recentTitle.x = startX + 20;
        recentTitle.y = startY + 320;
        recentTitle.style = 'stat_label';
        recentTitle.color = theme.primary;
        recentTitle.alpha = 0;
        jsmaf.root.children.push(recentTitle);

        Animator.animate(recentTitle, {alpha: 0, y: startY + 310}, {alpha: 1, y: startY + 320}, 1800, null, 'easeOut');

        for (var j = 0; j < Math.min(3, state.recentItems.length); j++) {
          var recent = state.recentItems[j];
          var recentText = new jsmaf.Text();
          recentText.text = "  • " + recent.label;
          recentText.x = startX + 20;
          recentText.y = startY + 360 + j * 30;
          recentText.style = 'footer';
          recentText.alpha = 0;
          jsmaf.root.children.push(recentText);

          (function(txt, idx) {
            setTimeout(function() {
              Animator.animate(txt, {alpha: 0}, {alpha: 0.8}, 400);
            }, 1900 + idx * 100);
          })(recentText, j);
        }
      }
    },

    /**
     * Build quick actions section
     */
    buildQuickActions: function() {
      if (!state.config.quickActionsEnabled) return;

      var theme = state.currentTheme;
      var startX = 1100;
      var startY = 700; // Increased Y to avoid overlapping with Recent Actions

      var qaTitle = new jsmaf.Text();
      qaTitle.text = "Quick Actions:";
      qaTitle.x = startX + 20;
      qaTitle.y = startY;
      qaTitle.style = 'subtitle';
      qaTitle.color = theme.primary;
      qaTitle.alpha = 0;
      jsmaf.root.children.push(qaTitle);

      var quickActions = [
        "[R1] Change Theme",
        "[R3] Save & Restart",
        "[Triangle] Quick Jailbreak"
      ];

      for (var i = 0; i < quickActions.length; i++) {
        var qa = new jsmaf.Text();
        qa.text = quickActions[i];
        qa.x = startX + 30;
        qa.y = startY + 50 + i * 35;
        qa.style = 'quick_action';
        qa.color = theme.secondary;
        qa.alpha = 0;
        jsmaf.root.children.push(qa);

        (function(txt, idx) {
          setTimeout(function() {
            Animator.animate(txt, {alpha: 0, x: startX + 20}, {alpha: 1, x: startX + 30}, 600, null, 'easeOut');
          }, 2000 + idx * 120);
        })(qa, i);
      }

      Animator.animate(qaTitle, {alpha: 0, y: startY - 10}, {alpha: 1, y: startY}, 2000, null, 'easeOut');
    },

    /**
     * Build footer with controls
     */
    buildFooter: function() {
      var theme = state.currentTheme;

      // Auto-jailbreak countdown
      if (state.config.autoJailbreak) {
        var isJailbroken = isJailbrokenCheck();

        var autoJbText = new jsmaf.Text();
        autoJbText.text = isJailbroken ? "System Jailbroken (Auto-load skipped)" : ("Auto-jailbreak in: " + state.config.autoJailbreakDelay + "s");
        autoJbText.x = 80;
        autoJbText.y = 950;
        autoJbText.style = 'footer';
        autoJbText.alpha = 0;
        jsmaf.root.children.push(autoJbText);
        this.elements.autoJbText = autoJbText;

        Animator.animate(autoJbText, {alpha: 0}, {alpha: 1}, 1500);

        // Countdown timer only if not jailbroken
        if (!isJailbroken) {
          var countdown = state.config.autoJailbreakDelay;
          var countdownInterval = setInterval(function() {
            countdown--;
            if (countdown <= 0) {
              clearInterval(countdownInterval);
              autoJbText.text = "Auto-loading...";
              setTimeout(function() {
                MenuController.executeAction('jailbreak');
              }, 500);
            } else {
              autoJbText.text = "Auto-jailbreak in: " + countdown + "s";
            }
          }, 1000);
        }
      }

      // Controls hint
      var controlsText = new jsmaf.Text();
      controlsText.text = "(X) Select  •  (O) Back  •  [L2/R2] Switch  •  [Start] Menu";
      controlsText.x = 80;
      controlsText.y = 1000;
      controlsText.style = 'footer';
      controlsText.alpha = 0;
      jsmaf.root.children.push(controlsText);

      Animator.animate(controlsText, {alpha: 0, y: 1020}, {alpha: 0.8, y: 1000}, 1600);

      // Version info
      var versionText = new jsmaf.Text();
      versionText.text = "Revolutionary Menu v2.0 • Enterprise Edition";
      versionText.x = 1300;
      versionText.y = 1000;
      versionText.style = 'footer';
      versionText.alpha = 0;
      jsmaf.root.children.push(versionText);

      Animator.animate(versionText, {alpha: 0}, {alpha: 0.6}, 1700);
    },

    /**
     * Format current time
     * @returns {string} Formatted time string
     */
    getFormattedTime: function() {
      var now = new Date();
      var hours = now.getHours();
      var minutes = now.getMinutes();
      var hStr = (hours < 10 ? '0' : '') + hours;
      var mStr = (minutes < 10 ? '0' : '') + minutes;
      return hStr + ":" + mStr;
    },

    /**
     * Format uptime
     * @param {number} ms - Milliseconds
     * @returns {string} Formatted uptime
     */
    formatUptime: function(ms) {
      var seconds = Math.floor(ms / 1000);
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);
      
      if (hours > 0) return hours + "h " + (minutes % 60) + "m";
      if (minutes > 0) return minutes + "m";
      return seconds + "s";
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MENU CONTROLLER - Handle menu interactions
  // ═══════════════════════════════════════════════════════════════════════════

  var MenuController = {
    /**
     * Update menu highlight
     */
    updateHighlight: function() {
      var items = state.ui.menuItems;
      var current = state.ui.currentButton;
      var prev = state.ui.prevButton;

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        if (i === current) {
          // Selected item
          item.text.style = 'menu_item_active';
          
          // Enhanced indicator animation
          Animator.animate(item.indicator, {alpha: 0, width: 4}, {alpha: 1, width: 8}, 250, null, 'easeOut');
          
          // Intense glow effect
          Animator.animate(item.glow, {alpha: 0}, {alpha: 0.25}, 300, null, 'easeOut');
          item.glow.color = state.currentTheme.glowIntense;
          
          // Enhanced scale pulse
          Animator.animate(item.text, {scaleX: 1, scaleY: 1}, {scaleX: 1.08, scaleY: 1.08}, 180, null, 'easeOut');
          
        } else {
          // Unselected item
          item.text.style = 'menu_item';
          item.text.color = state.currentTheme.textDim;
          item.indicator.alpha = 0;
          item.glow.alpha = 0;
          
          if (i === prev) {
            // Animate out previous selection
            Animator.animate(item.text, {scaleX: 1.08, scaleY: 1.08}, {scaleX: 1, scaleY: 1}, 150, null, 'easeOut');
          }
        }
      }

      state.ui.prevButton = current;
    },

    /**
     * Move selection up
     */
    moveUp: function() {
      AudioSystem.playClick();
      state.ui.currentButton = (state.ui.currentButton - 1 + state.ui.menuItems.length) % state.ui.menuItems.length;
      this.updateHighlight();
    },

    /**
     * Move selection down
     */
    moveDown: function() {
      AudioSystem.playClick();
      state.ui.currentButton = (state.ui.currentButton + 1) % state.ui.menuItems.length;
      this.updateHighlight();
    },

    /**
     * Execute current selection
     */
    executeSelection: function() {
      var item = state.ui.menuItems[state.ui.currentButton];
      if (!item) return;

      AudioSystem.playLoad();
      
      // Enhanced visual feedback
      var originalX = item.text.x;
      Animator.animate(item.text, {x: originalX, scaleX: 1.08, scaleY: 1.08}, {x: originalX + 20, scaleX: 1.15, scaleY: 1.15}, 120, function() {
        Animator.animate(item.text, {x: originalX + 20, scaleX: 1.15, scaleY: 1.15}, {x: originalX, scaleX: 1, scaleY: 1}, 150, null, 'easeOut');
      }, 'easeOut');

      this.executeAction(item.action, item.label);
    },

    /**
     * Execute action by name
     * @param {string} action - Action identifier
     * @param {string} label - Display label (optional)
     */
    executeAction: function(action, label) {
      log('[MENU] Executing action: ' + action);

      // Update stats
      Storage.updateStats({
        action: action,
        lastLaunch: Date.now()
      });

      // Add to recent items
      if (label) {
        Storage.addRecentItem(action, label);
      }

      // Show notification
      NotificationSystem.show('Loading: ' + (label || action), 'info', 2000);

      // Execute action with error handling
      try {
        switch(action) {
          case 'jailbreak':
            include('loader.js');
            break;
          case 'explorer':
            include('file-explorer.js');
            break;
          case 'linux':
            include('linux-menu.js');
            break;
          case 'ftp':
            include('ftp.js');
            break;
          case 'binloader':
            include('binloader.js');
            break;
          case 'payloads':
            include('payload_host.js');
            break;
          case 'settings':
            include('config_ui.js');
            break;
          default:
            NotificationSystem.show('Unknown action: ' + action, 'error', 3000);
        }
      } catch (e) {
        log('[MENU ERROR] Action failed: ' + e.message);
        NotificationSystem.show('Error: ' + e.message, 'error', 4000);
      }
    },

    /**
     * Cycle through themes
     */
    cycleTheme: function() {
      var themeNames = Object.keys(THEMES);
      var currentIndex = themeNames.indexOf(state.config.theme);
      var nextIndex = (currentIndex + 1) % themeNames.length;
      var nextTheme = themeNames[nextIndex];

      state.config.theme = nextTheme;
      state.currentTheme = THEMES[nextTheme];
      
      Storage.saveConfig(state.config);
      
      NotificationSystem.show('Theme changed to: ' + state.currentTheme.name, 'success', 2000);
      
      // Rebuild UI with new theme
      setTimeout(function() {
        MenuSystem.initialize();
      }, 500);
    },

    /**
     * Quick jailbreak (Triangle button)
     */
    quickJailbreak: function() {
      NotificationSystem.show('Quick Jailbreak activated!', 'success', 2000);
      this.executeAction('jailbreak', 'Quick Jailbreak');
    },

    /**
     * Save and restart
     */
    saveAndRestart: function() {
      Storage.saveConfig(state.config);
      NotificationSystem.show('Settings saved! Restarting...', 'success', 2000);
      
      setTimeout(function() {
        location.reload();
      }, 2500);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // INPUT HANDLER - Keyboard, mouse, and gamepad
  // ═══════════════════════════════════════════════════════════════════════════

  var InputHandler = {
    lastAnalogMoveTime: 0,
    analogMoveThreshold: 200,
    analogAxisThreshold: 0.6,

    /**
     * Initialize input handlers
     */
    init: function() {
      // Keyboard
      jsmaf.onKeyDown = function(keyCode) {
        InputHandler.handleKeyPress(keyCode);
      };

      // Mouse wheel
      jsmaf.onMouseWheel = function(delta) {
        if (delta > 0) {
          MenuController.moveDown();
        } else {
          MenuController.moveUp();
        }
      };

      // Mouse move for hover
      jsmaf.onMouseMove = function(mx, my) {
        InputHandler.handleMouseMove(mx, my);
      };

      // Mouse click
      jsmaf.onMouseDown = function(mx, my) {
        InputHandler.handleMouseClick(mx, my);
      };

      // Gamepad polling
      setInterval(function() {
        InputHandler.pollGamepad();
      }, 50);

      log('[INPUT] Handlers initialized');
    },

    /**
     * Handle keyboard input
     * @param {number} keyCode - Key code
     */
    handleKeyPress: function(keyCode) {
      // Arrow keys / D-Pad
      // Support for: Standard (38/40), PS4 WebKit (1/2, 21/22), Legacy (4/6)
      if (keyCode === 1 || keyCode === 21 || keyCode === 38 || keyCode === 4) {  // Up
        MenuController.moveUp();
      } else if (keyCode === 2 || keyCode === 22 || keyCode === 40 || keyCode === 6) {  // Down
        MenuController.moveDown();
      }
      
      // Action buttons
      else if (keyCode === 14 || keyCode === 13 || keyCode === 32) {  // X / Enter / Space
        MenuController.executeSelection();
      } else if (keyCode === 27 || keyCode === 8) {  // O / Escape / Backspace
        // Back functionality (could add confirmation dialog)
        NotificationSystem.show('Press Start to exit', 'info', 2000);
      }
      
      // Shoulder buttons
      else if (keyCode === 10) {  // R1
        MenuController.cycleTheme();
      } else if (keyCode === 12) {  // R3
        MenuController.saveAndRestart();
      }
      
      // Face buttons
      else if (keyCode === 16) {  // Triangle
        MenuController.quickJailbreak();
      }
    },

    /**
     * Handle mouse movement
     * @param {number} mx - Mouse X
     * @param {number} my - Mouse Y
     */
    handleMouseMove: function(mx, my) {
      // Check if hovering over menu item
      for (var i = 0; i < state.ui.menuItems.length; i++) {
        var item = state.ui.menuItems[i];
        var text = item.text;
        
        // Simple bounding box
        if (mx >= text.x - 20 && mx <= text.x + 400 &&
            my >= text.y - 10 && my <= text.y + 40) {
          if (state.ui.currentButton !== i) {
            state.ui.currentButton = i;
            MenuController.updateHighlight();
          }
          break;
        }
      }
    },

    /**
     * Handle mouse click
     * @param {number} mx - Mouse X
     * @param {number} my - Mouse Y
     */
    handleMouseClick: function(mx, my) {
      for (var i = 0; i < state.ui.menuItems.length; i++) {
        var item = state.ui.menuItems[i];
        var text = item.text;
        
        if (mx >= text.x - 20 && mx <= text.x + 400 &&
            my >= text.y - 10 && my <= text.y + 40) {
          state.ui.currentButton = i;
          MenuController.updateHighlight();
          MenuController.executeSelection();
          break;
        }
      }
    },

    /**
     * Poll gamepad state
     */
    pollGamepad: function() {
      try {
        if (!navigator || !navigator.getGamepads) return;
        
        var gamepads = navigator.getGamepads();
        if (!gamepads || !gamepads[0]) return;
        
        var gp = gamepads[0];
        var now = Date.now();
        
        if (now - this.lastAnalogMoveTime < this.analogMoveThreshold) return;

        // --- Analog Sticks ---
        // Left stick Y axis (typically axis 1)
        var yAxis = gp.axes[1];
        
        // Lowered threshold for better responsiveness
        if (yAxis > 0.5) { 
          MenuController.moveDown();
          this.lastAnalogMoveTime = now;
        } else if (yAxis < -0.5) {
          MenuController.moveUp();
          this.lastAnalogMoveTime = now;
        }

        // --- D-Pad Support (Buttons 12/13/14/15) ---
        // Some browsers/controllers map D-Pad to buttons instead of axes
        if (gp.buttons) {
          if (gp.buttons[12] && (gp.buttons[12].pressed || gp.buttons[12].value > 0.5)) {
            MenuController.moveUp();
            this.lastAnalogMoveTime = now;
          } else if (gp.buttons[13] && (gp.buttons[13].pressed || gp.buttons[13].value > 0.5)) {
            MenuController.moveDown();
            this.lastAnalogMoveTime = now;
          }
        }

        // Left stick X axis for theme switching
        var xAxis = gp.axes[0];
        
        if (xAxis > 0.5) {
          MenuController.cycleTheme();
          this.lastAnalogMoveTime = now;
        }

      } catch (e) {
        // Silent fail to avoid log spam
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MENU SYSTEM - Main orchestrator
  // ═══════════════════════════════════════════════════════════════════════════

  var MenuSystem = {
    initialized: false,
    startTime: Date.now(),

    /**
     * Initialize entire menu system
     */
    initialize: function() {
      try {
        log('[MENU SYSTEM] Starting initialization...');

        // Load configuration
        state.config = Storage.loadConfig();
        state.currentTheme = THEMES[state.config.theme];
        state.recentItems = Storage.loadRecentItems();
        state.stats = Storage.loadStats();

        // Update launch count
        // Only increment if this is a fresh session start, not a reload
        if (typeof window !== 'undefined' && !window.__menu_session_started) {
          state.stats.launchCount++;
          Storage.updateStats({ launchCount: state.stats.launchCount });
          window.__menu_session_started = true;
        }

        // Initialize subsystems
        AudioSystem.init();
        InputHandler.init();
        
        // Build UI
        UIBuilder.build();

        // Initialize particles
        if (state.config.particlesEnabled) {
          ParticleSystem.init();
        }

        // Start audio
        setTimeout(function() {
          AudioSystem.start();
        }, 1500);

        // Initial highlight
        setTimeout(function() {
          MenuController.updateHighlight();
        }, 2000);

        // Welcome notification
        setTimeout(function() {
          var greeting = state.stats.launchCount === 1 ? 'Welcome!' : 'Welcome back!';
          NotificationSystem.show(greeting + ' Launch #' + state.stats.launchCount, 'success', 3000);
        }, 2500);

        this.initialized = true;
        
        log('[MENU SYSTEM] Initialization complete!');

      } catch (e) {
        log('[MENU SYSTEM ERROR] Initialization failed: ' + e.message);
        
        // Fallback: show error notification
        try {
          NotificationSystem.show('System error: ' + e.message, 'error', 5000);
        } catch (e2) {}
      }
    },

    /**
     * Cleanup on exit
     */
    cleanup: function() {
      try {
        // Calculate uptime
        var uptime = Date.now() - this.startTime;
        state.stats.totalUptime += uptime;
        Storage.updateStats({ totalUptime: state.stats.totalUptime });

        // Save config
        Storage.saveConfig(state.config);

        // Cleanup particles
        ParticleSystem.destroy();

        // Clear audio timer
        AudioSystem.clearBgmReloadTimer();

        log('[MENU SYSTEM] Cleanup complete');
      } catch (e) {
        log('[MENU SYSTEM ERROR] Cleanup failed: ' + e.message);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STARTUP
  // ═══════════════════════════════════════════════════════════════════════════

  // Cleanup any existing systems
  try {
    if (typeof __menuSystemInstance !== 'undefined' && __menuSystemInstance) {
      __menuSystemInstance.cleanup();
    }
  } catch (e) {}

  // Initialize
  MenuSystem.initialize();

  // Store instance globally for cleanup
  if (typeof window !== 'undefined') {
    window.__menuSystemInstance = MenuSystem;
  } else if (typeof global !== 'undefined') {
    global.__menuSystemInstance = MenuSystem;
  }

  // Cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', function() {
      MenuSystem.cleanup();
    });
  }

  log('[REVOLUTIONARY MENU] System ready!');

})();