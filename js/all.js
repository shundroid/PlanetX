(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _on = require("./on");

var on = _interopRequireWildcard(_on);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// main.js から ctx、canvasElem へはアクセスしないようにする
var canvasElem;
var ctx;

var canvasModule = {
  canvasRect: {},
  // [x] initializeCanvas という名前にするのではなく、
  // [x] この中で処理がわかれている部分は 別関数にしたい。
  // [x] -> attachListeners resizeCanvas disableSmoothing
  initialize: function initialize() {
    canvasModule.attachListeners();
    // リサイズ処理を行う
    canvasModule.fitToWindow();
    canvasModule.disableSmoothing();
  },
  attachListeners: function attachListeners() {
    // ui.setupCanvas
    canvasElem = document.getElementById("pla-canvas");
    canvasElem.addEventListener("mousedown", function (e) {
      return void on.raise("mousedownCanvas");
    });
    canvasElem.addEventListener("mousemove", function (e) {
      if (e.buttons === 1) {
        on.raise("mousemoveCanvas");
      } else {
        on.raise("hoverCanvas");
      }
    });
    canvasElem.addEventListener("mouseup", function (e) {
      return void on.raise("mouseupCanvas");
    });
  },
  disableSmoothing: function disableSmoothing() {
    // canvas.ts initDOM
    if (canvasElem && canvasElem.getContext) {
      // 次 : ここから
      ctx = canvasElem.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;
    }
  },
  // イベントハンドラ (window.addEventListener("resize", ...)) は main.js に書くのが望ましい。
  // -> いや、main.js からは、window などの Core にはアクセスせず、ラップしたい
  // -> いや、on.js でwindow.addEventListener をラップしたい（イベント名で判別 とか）
  fitToWindow: function fitToWindow() {
    canvasElem.width = window.innerWidth;
    canvasElem.height = window.innerHeight;
    canvasModule.updateCanvasRect();
  },
  updateCanvasRect: function updateCanvasRect() {
    canvasModule.canvasRect = { x: 0, y: 0, width: canvasElem.width, height: canvasElem.height };
  }
};

module.exports = canvasModule;

},{"./on":4}],2:[function(require,module,exports){
"use strict";

module.exports = {
  pack: "oa",
  grid: 25
};

},{}],3:[function(require,module,exports){
"use strict";

var _stage = require("./stage");

var stage = _interopRequireWildcard(_stage);

var _editorConfig = require("./editor-config");

var config = _interopRequireWildcard(_editorConfig);

var _on = require("./on");

var on = _interopRequireWildcard(_on);

var _tempDatas = require("./temp-datas");

var temp = _interopRequireWildcard(_tempDatas);

var _canvas = require("./canvas");

var canvas = _interopRequireWildcard(_canvas);

var _ui = require("./ui");

var ui = _interopRequireWildcard(_ui);

var _pack = require("./pack");

var _tray = require("./tray");

var tray = _interopRequireWildcard(_tray);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

+function () {
  var pack = void 0;

  document.addEventListener("DOMContentLoaded", function () {
    canvas.initialize();
    (0, _pack.loadPack)(config.pack).then(function (packObject) {
      pack = packObject;
      stage.skyboxes.push(pack.editor.defaultSkybox);
      ui.setEditorBackground((0, _pack.getPackPath)(config.pack, pack.skyboxes[pack.editor.defaultSkybox].filename));
      on.raise("initializedPack", null);
      ui.initilizeTray(pack.blocks, pack.objs);
    });
  });
  on.on("initializedTray", function () {
    ui.changeLoadingStatusUI("making DataUrl");
    temp.tray.dataUrls = tray.makeDataUrl(pack.blocks, pack.objs, config.grid);
    var defaultItem = pack.blocks[pack.editor.defaultBlock];
    temp.tray.updateActiveBlock = tray.updateActiveBlock(pack.editor.defaultBlock, defaultItem.filename, defaultItem.bName, config.grid);
    ui.hideLoadingUI();
    on.raise("ready", null);
  });

  // stage 関係

  // tray 関係

  // ui 関係
  on.on("initializedPack", ui.setEditorBackgroundMode);
  // pack 関係
}();

},{"./canvas":1,"./editor-config":2,"./on":4,"./pack":5,"./stage":6,"./temp-datas":7,"./tray":8,"./ui":9}],4:[function(require,module,exports){
"use strict";

var _arguments = arguments;
var eventer = {};
var listeners = {};
eventer.on = function (event, fn) {
  if (!(listeners[event] instanceof Array)) {
    listeners[event] = [];
  }
  listeners[event].push(fn);
};
eventer.raise = function (event) {
  var args = [];
  if (typeof _arguments[1] !== "undefined") {
    for (var i = 1; i < _arguments.length; i++) {
      // 0 番目は省略するため、i は、1 から始める。
      args.push(_arguments[i]);
    }
  }
  if (listeners[event] instanceof Array) {
    listeners[event].forEach(function (listener) {
      listener.apply(undefined, args);
    });
  }
};
module.exports = eventer;

},{}],5:[function(require,module,exports){
"use strict";

var packModule = {
  loadPack: function loadPack(packName) {
    return new Promise(function (resolve) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", packModule.getPackPath(packName, "packinfo.json"));
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        }
      };
      xhr.send(null);
    });
  },
  getPackPath: function getPackPath(packName, file) {
    return "pack/" + packName + "/" + file;
  }
};
module.exports = packModule;

},{}],6:[function(require,module,exports){
"use strict";

var stage = {};
stage.skyboxes = [];

module.exports = stage;

},{}],7:[function(require,module,exports){
"use strict";

var datas = {
  tray: {
    dataUrls: {},
    activeBlock: null
  }
};
module.exports = datas;

},{}],8:[function(require,module,exports){
"use strict";

var _pack = require("./pack");

var _editorConfig = require("./editor-config");

var trayModule = {
  makeDataUrl: function makeDataUrl(blocks, objs, grid) {
    var urls = {};
    var blockList = Object.keys(blocks);
    blockList.forEach(function (item) {
      urls[item] = image((0, _pack.getPackPath)(_editorConfig.pack, blocks[item].filename), true, { x: grid, y: grid }).src;
    });
    var objList = Object.keys(objs);
    objList.forEach(function (itemName) {
      var item = objs[itemName];
      urls[itemName] = image((0, _pack.getPackPath)(_editorConfig.pack, item.filename), true, { x: item.width, y: item.height });
    });
    return urls;
  },
  updateActiveBlock: function updateActiveBlock(blockName, fileName, label, width, height, grid) {
    var w = width || grid * 2;
    var h = height || grid * 2;
    return { blockName: blockName, fileName: fileName, label: label, w: w, h: h };
  }
};
function image(url, isNoJaggy, size) {
  var a = new Image();
  a.src = url;
  if (isNoJaggy) {
    var width = (a.width + size.x) / 2;
    var height = (a.height + size.y) / 2;
    var newC = document.createElement("canvas");
    newC.width = width;
    newC.height = height;
    var ctx = newC.getContext("2d");
    ctx.drawImage(a, 0, 0, width, height);
    return image(newC.toDataURL("image/png"));
  } else {
    return a;
  }
}

module.exports = trayModule;

},{"./editor-config":2,"./pack":5}],9:[function(require,module,exports){
"use strict";

var _pack = require("./pack");

var _on = require("./on");

var on = _interopRequireWildcard(_on);

var _editorConfig = require("./editor-config");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var uiModule = {
  setListeners: function setListeners() {
    Array.prototype.forEach.call(document.querySelectorAll(".ev-btn"), function (elem) {
      elem.addEventListener("click", uiModule[elem.dataset["listener"]]);
    });
    Array.prototype.forEach.call(document.querySelector(".ev-input"), function (elem) {
      if (typeof elem.dataset["default"] !== "undefined") {
        elem.value = elem.dataset["default"];
      }
      if (typeof elem.dataset["change"] !== "undefined") {
        elem.addEventListener("change", uiModule[elem.dataset["change"]]);
      }
    });
  },
  setEditorBackground: function setEditorBackground(path) {
    document.body.style.backgroundImage = "url(" + path + ")";
  },
  changeLoadingStatusUI: function changeLoadingStatusUI(status) {
    document.querySelector(".loading").innerHTML = "Loading...<br />" + status;
  },
  hideLoadingUI: function hideLoadingUI() {
    document.querySelector(".loading").classList.add("loading-closing");
    setTimeout(function () {
      document.querySelector(".loading").style.display = "none";
    }, 1000);
  },
  initilizeTray: function initilizeTray(blocks, objs) {
    var initializeTrayObserve = function (nextCallback, completedCallback) {
      var blockList = Object.keys(blocks);
      var objList = Object.keys(objs);
      var isModeObj = false;
      var appendTrayItem = function appendTrayItem(i) {
        var blockName = isModeObj ? objList[i] : blockList[i];
        var packItem = isModeObj ? objs[blockName] : blocks[blockName];
        uiModule.makeTrayItem(isModeObj ? "obj" : "block", packItem, blockName, function (trayItem) {
          if (isModeObj && i === objList.length - 1) {
            completedCallback();
          } else if (!isModeObj && i === blockList.length - 1) {
            isModeObj = true;
            appendTrayItem(0);
          } else {
            var maxLength = isModeObj ? objList.length - 1 : blockList.length - 1;
            nextCallback({ numerator: i, denominator: maxLength, mode: isModeObj ? "obj" : "block", item: trayItem });
            appendTrayItem(i + 1);
          }
        });
      };
      appendTrayItem(0);
    }(function (conf) {
      uiModule.changeLoadingStatusUI("Loading Tray(" + conf.mode + ") : " + conf.numerator + " / " + conf.denominator);
      document.querySelector(".tray-items").appendChild(conf.item);
    }, function () {
      on.raise("initializedTray", null);
    });
  },
  makeTrayItem: function makeTrayItem(mode, packItem, blockName, onloadCallback) {
    var trayItem = document.createElement("div");
    trayItem.classList.add("tray-list", "tray-list-" + mode);
    trayItem.addEventListener("mousedown", function (e) {
      return void on.raise("clickedTray", e);
    });
    var trayItemThumbnail = document.createElement("img");
    trayItemThumbnail.src = (0, _pack.getPackPath)(_editorConfig.pack, packItem.filename);
    trayItemThumbnail.alt = packItem.name;
    trayItemThumbnail.dataset["block"] = blockName;
    trayItemThumbnail.onload = function () {
      if (mode === "obj") {
        trayItem.style.width = trayItemThumbnail.style.width = packItem.width / (packItem.height / 50) + "px";
        trayItem.style.height = trayItemThumbnail.style.height = "50px";
        trayItem.appendChild(trayItemThumbnail);
      }
      onloadCallback(trayItem);
    };
    trayItem.appendChild(trayItemThumbnail);
  },
  setEditorBackgroundMode: function setEditorBackgroundMode(editor) {
    // ui での pack の配置方法を決める
    // editor = pack.editor
    if (typeof editor.skyboxMode !== "undefined") {
      if (editor.skyboxMode === "repeat") {
        document.body.style.backgroundRepeat = "repeat";
        if (typeof editor.skyboxSize !== "undefined") {
          document.body.style.backgroundSize = editor.skyboxSize;
        } else {
          document.body.style.backgroundSize = "auto";
        }
      }
    }
  }
};
module.exports = uiModule;

},{"./editor-config":2,"./on":4,"./pack":5}]},{},[3]);
