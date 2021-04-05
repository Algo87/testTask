// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"Popup/popup.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Popup = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

var getTemplate = function getTemplate() {
  var _calcWidthHeight = calcWidthHeight(),
      popupWidth = _calcWidthHeight.popupWidth,
      popupHeight = _calcWidthHeight.popupHeight;

  var popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = "\n    <div class=\"popup__bg\"></div>\n    <div class=\"popup__inner\">\n    <button class=\"popup__close-btn\" data-close=\"true\"></button>\n        <div class=\"popup__video-container\" data-container style = \"width: ".concat(popupWidth, "px; height: ").concat(popupHeight, "px\" >\n          <div id=\"player\"></div> \n        </div>\n       \n    </div>\n");
  return popup;
};

var calcWidthHeight = function calcWidthHeight(screenWidthResize, screenHeightResize) {
  var screenWidth = screenWidthResize || window.innerWidth;
  var screenHeight = screenHeightResize || window.innerHeight;
  var popupWidth = screenWidth * 0.8;
  var popupHeight = screenWidth * 0.8 * 9 / 16;

  if (popupHeight > screenHeight * 0.8) {
    popupHeight = screenHeight * 0.8;
    popupWidth = screenHeight * 0.8 * 16 / 9;
  }

  return {
    popupHeight: popupHeight,
    popupWidth: popupWidth
  };
};

var _focusElements = ["a[href]", "area[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "button:not([disabled]):not([aria-hidden])", "iframe", "object", "embed", "[contenteditable]", '[tabindex]:not([tabindex^="-"])'];

var _onResize = new WeakSet();

var _changeSizePopup = new WeakSet();

var _render = new WeakSet();

var _setup = new WeakSet();

var _startPlayer = new WeakSet();

var Popup = /*#__PURE__*/function () {
  function Popup(selector, _options) {
    _classCallCheck(this, Popup);

    _startPlayer.add(this);

    _setup.add(this);

    _render.add(this);

    _changeSizePopup.add(this);

    _onResize.add(this);

    this.init(selector, _options);
  }

  _createClass(Popup, [{
    key: "init",
    value: function init(selector, options) {
      this.screenHeight = window.innerHeight;
      this.screenWidth = window.innerWidth;
      this.options = options;
      this.$play = document.querySelector(selector);
      this.$popup = getTemplate();
      this.open = this.open.bind(this);
      this.close = this.close.bind(this);
      this.closeListener = this.closeListener.bind(this);
      this.tabPressControl = this.tabPressControl.bind(this);

      _classPrivateMethodGet(this, _setup, _setup2).call(this);

      _classPrivateMethodGet(this, _onResize, _onResize2).call(this);

      this.opened = false;
      this.lastFocusedElement = document.activeElement;
      console.log(this.lastFocusedElement);
    }
  }, {
    key: "tabPressControl",
    value: // TABPRESScONTROL
    function tabPressControl(event) {
      var popupNodes = this.$popup.querySelectorAll(_focusElements);
      var iframe = document.querySelector("#player"); // var iframeDoc = iframe.contentWindow.document;

      console.log(iframe); // if (iframeDoc.readyState == "complete") {
      //   console.log(iframeDoc);
      // }
      // iframe.onload = function () {
      //   var iframeDoc2 = iframe.contentWindow.document;
      //   console.log(iframeDoc2);
      // };
      // console.log(iframe);
      // iframe.onload = function () {
      //   var iframeDoc2 = iframe.contentWindow.document;
      //   console.log(iframeDoc2.querySelectorAll(_focusElements));
      // };

      var listener = addEventListener("blur", function () {
        if (document.activeElement === document.getElementById("player")) {
          console.log("sldkjfslkjflskjflksjlfkdjskdfjsldjkf");
        } // removeEventListener("blur", listener);

      });
      console.log(document.activeElement);
      var firstTabStop = popupNodes[0];
      var lastTabStop = popupNodes[popupNodes.length - 1];
      firstTabStop.focus();
      this.lastFocusedElement = document.activeElement;

      if (event.keyCode === 9) {
        if (event.shiftKey) {
          if (document.activeElement === firstTabStop) {
            event.preventDefault();
            lastTabStop.focus();
          }
        } else {
          if (document.activeElement === lastTabStop) {
            event.preventDefault();
            firstTabStop.focus();
          }
        }
      }
    }
  }, {
    key: "closeListener",
    value: function closeListener(event) {
      // console.log(event.type, "event.type");
      // console.log(this.opened, "this.opened");
      // console.log(event.keyCode, "event.keyCode");
      if (event.type === "click" && event.target.dataset.close || event.type === "keydown" && event.target.dataset.close && this.opened === true && event.keyCode === 13 || event.type === "keydown" && this.opened === true && event.keyCode === 27) {
        this.lastFocusedElement.focus();
        this.close();
      }
    }
  }, {
    key: "open",
    value: function open() {
      this.opened = true;
      typeof this.options.onOpen === "function" && this.options.onOpen();

      _classPrivateMethodGet(this, _render, _render2).call(this);

      this.$popup.classList.add("open");

      _classPrivateMethodGet(this, _startPlayer, _startPlayer2).call(this, this.options);

      this.$popup.addEventListener("keydown", this.tabPressControl);
    }
  }, {
    key: "close",
    value: function close() {
      this.opened = false;
      typeof this.options.onClose === "function" && this.options.onClose();
      this.$popup.classList.remove("open");
      console.log(this.player); // this.player && this.player.stopVideo();

      this.player && this.player.destroy();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      typeof this.options.onDestroy === "function" && this.options.onDestroy();
      this.$popup.removeEventListener("click", this.closeListener);
      this.$popup.removeEventListener("keydown", this.tabPressControl);
    }
  }]);

  return Popup;
}();

exports.Popup = Popup;

function _onResize2() {
  var _this = this;

  window.onresize = function (e) {
    _this.screenWidth = window.innerWidth;
    _this.screenHeight = window.innerHeight;

    _classPrivateMethodGet(_this, _changeSizePopup, _changeSizePopup2).call(_this);
  };
}

function _changeSizePopup2() {
  var _calcWidthHeight2 = calcWidthHeight(this.screenWidth, this.screenHeight),
      popupWidth = _calcWidthHeight2.popupWidth,
      popupHeight = _calcWidthHeight2.popupHeight;

  var popupInner = this.$popup.querySelector("[data-container]");
  popupInner.style.height = "".concat(popupHeight, "px");
  popupInner.style.width = "".concat(popupWidth, "px");
}

function _render2() {
  document.body.appendChild(this.$popup);
}

function _setup2() {
  this.$play.addEventListener("click", this.open);
  this.$popup.addEventListener("click", this.closeListener);
  this.$popup.addEventListener("keydown", this.closeListener);
  document.addEventListener("keydown", this.closeListener);
}

function _startPlayer2(options) {
  var _this2 = this;

  window.YT.ready(function () {
    console.log("ready");
    _this2.player = new YT.Player("player", {
      height: "100%",
      width: "100%",
      videoId: options.videoId,
      origin: "http://localhost:1234",
      events: {// onReady: (event) => {
        //   event.target.playVideo();
        // },
        // onStateChange: onPlayerStateChange,
      }
    }); // console.log("this.player", this.player);
  });
}
},{}],"C:/Users/HP/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;

function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);

    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)?\/[^/]+(?:\?.*)?$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"C:/Users/HP/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
var bundle = require('./bundle-url');

function updateLink(link) {
  var newLink = link.cloneNode();

  newLink.onload = function () {
    link.remove();
  };

  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;

function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');

    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

module.exports = reloadCSS;
},{"./bundle-url":"C:/Users/HP/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"Popup/style.scss":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"D:\\work\\TestTask\\img\\close-icon.svg":[["close-icon.f70d4c43.svg","img/close-icon.svg"],"img/close-icon.svg"],"_css_loader":"C:/Users/HP/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/css-loader.js"}],"img/main_bg.png":[function(require,module,exports) {
module.exports = "/main_bg.eb0bf3ea.png";
},{}],"img/btn_img.svg":[function(require,module,exports) {
module.exports = "/btn_img.e7ac2f10.svg";
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _popup = require("./Popup/popup");

require("./Popup/style.scss");

var _main_bg = _interopRequireDefault(require("./img/main_bg.png"));

var _btn_img = _interopRequireDefault(require("./img/btn_img.svg"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var img = new Array(_main_bg.default, _btn_img.default);
var modal = new _popup.Popup("#play", {
  videoId: "MB80ZuIJATI",
  onOpen: function onOpen() {
    console.log("onOpen");
  },
  onClose: function onClose() {
    console.log("onClose");
  },
  onDestroy: function onDestroy() {
    console.log("destroy");
  }
}); // modal.destroy();

registerListener("load", setLazy);
registerListener("load", lazyLoad);
registerListener("scroll", lazyLoad);
var lazy = [];

function setLazy() {
  lazy = document.querySelectorAll("[data-lazy]");
  lazy.forEach(function (l, i) {
    l.setAttribute("data-src", img[i]);
  });
  console.log("Found " + lazy.length + " lazy images");
}

function lazyLoad() {
  for (var i = 0; i < lazy.length; i++) {
    var dataLazy = lazy[i].getAttribute("data-lazy");

    if (isInViewport(lazy[i])) {
      if (lazy[i].getAttribute("data-src")) {
        if (dataLazy === "img") {
          lazy[i].src = lazy[i].getAttribute("data-src");
        } else if (dataLazy === "background") {
          lazy[i].style.backgroundImage = "url(\"".concat(lazy[i].getAttribute("data-src"), "\")");
        }

        lazy[i].removeAttribute("data-src");
      }
    }
  }

  cleanLazy();
}

function cleanLazy() {
  lazy = Array.prototype.filter.call(lazy, function (l) {
    return l.getAttribute("data-src");
  });
}

function isInViewport(el) {
  var rect = el.getBoundingClientRect();
  return rect.bottom >= 0 && rect.right >= 0 && rect.top <= (window.innerHeight || document.documentElement.clientHeight) && rect.left <= (window.innerWidth || document.documentElement.clientWidth);
}

function registerListener(event, func) {
  if (window.addEventListener) {
    window.addEventListener(event, func);
  } else {
    window.attachEvent("on" + event, func);
  }
}
},{"./Popup/popup":"Popup/popup.js","./Popup/style.scss":"Popup/style.scss","./img/main_bg.png":"img/main_bg.png","./img/btn_img.svg":"img/btn_img.svg"}],"C:/Users/HP/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63989" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["C:/Users/HP/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/TestTask.e31bb0bc.js.map