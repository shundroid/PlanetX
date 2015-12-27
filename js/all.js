(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ui = require("./modules/ui");
var initDOM = require("./modules/initDOM");
var packLoader = require("./modules/packUtil/packLoader");
var packManager = require("./modules/packUtil/packManager");
var event = require("./modules/event");
var list = require("./modules/list");
var stage = require("./modules/stage");
var d = require("./modules/data");
var makeDataUrl = require("./modules/makePrefabDataUrls");
var tray = require("./modules/tray");
var grid = require("./modules/grid");
var prefab = require("./modules/prefab");
var Vector2 = require("./modules/vector2");
var Rect = require("./modules/rect");
var canvas = require("./modules/canvas");
var main;
(function (main) {
    function init() {
        d.trayItemDataURLs = new list();
        d.defaultPackName = "halstar";
        //d.pack = new packManager.packModule({});
        d.defaultGridSize = 25;
        d.defaultBlockSize = 50;
        d.activeToolName = "pencil";
        d.isObjMode = false;
        d.isFullscreenTray = false;
        d.isShowInspector = false;
    }
    init();
    initDOM(function () {
        packLoader(d.defaultPackName).then(function (i) {
            d.pack = new packManager.packModule(i);
            event.raiseEvent("packLoaded", null);
            stage.stageEffects.skybox = d.pack.editor.defaultSkybox;
            ui.setSkybox(packManager.getPackPath(d.defaultPackName) + d.pack.skyboxes.get(d.pack.editor.defaultSkybox).data.filename);
            event.raiseEvent("initedPack", null);
            event.raiseEvent("initedUI", null);
            ui.initTrayBlock().then(function () {
                ui.initTrayObj().then(function () {
                    event.raiseEvent("initedTray", null);
                });
            });
        });
        event.addEventListener("initedTray", function () {
            ui.changeLoadingStatus("making DataURL");
            d.trayItemDataURLs = makeDataUrl();
            tray.updateActiveBlock("w1/block2", "pack/halstar/images/mapicons/w1block2-2.png", "W1草付ブロック");
            ui.changeLoadingStatus("Are you ready?");
            event.raiseEvent("ready", null);
        });
        event.addEventListener("ready", function () {
            ui.hideLoading();
        });
        event.addEventListener("gridCanvas", function (e) {
            var pre = new prefab(e.gridPos.x, e.gridPos.y, d.selectBlock.fileName, d.selectBlock.blockName, grid.toGridPos(d.selectBlock.width), grid.toGridPos(d.selectBlock.height));
            var detail = grid.getPrefabFromGrid(new Vector2(pre.gridX, pre.gridY));
            var rect = grid.toDrawRect(new Rect(pre.gridX, pre.gridY, pre.gridW, pre.gridH));
            switch (d.activeToolName) {
                case "pencil":
                    if (e.eventName === "mousedown") {
                        if (!detail.contains) {
                            canvas.render(d.selectImage, rect);
                            stage.items.push(stage.getId(), pre);
                        }
                        else {
                            stage.items.remove(detail.id);
                            stage.renderStage();
                        }
                    }
                    break;
                case "choice":
                    if (e.eventName === "mousedown") {
                        // オブジェクトに対応させる
                        if (detail.prefab) {
                            var bData = d.pack.blocks.get(detail.prefab.blockName);
                            tray.updateActiveBlock(detail.prefab.blockName, bData.data.bName, packManager.getPackPath(d.defaultPackName) + bData.data.filename);
                            ui.changeActiveBlock(detail.prefab.blockName);
                        }
                    }
                    break;
                case "hand":
                    if (e.eventName === "mousemove") {
                        scrollX += e.mousePos.x - grid.scrollBeforeX;
                        scrollY += e.mousePos.y - grid.scrollBeforeY;
                        stage.renderStage();
                    }
                    if (e.eventName !== "mouseup") {
                        grid.scrollBeforeX = e.mousePos.x;
                        grid.scrollBeforeY = e.mousePos.y;
                    }
                    break;
                default:
                    if (e.eventName === "mousemove" || e.eventName === "mousedown") {
                        if (d.activeToolName === "brush") {
                            if (detail.contains && detail.prefab.blockName !== d.selectBlock.blockName) {
                                stage.items.remove(detail.id);
                                stage.renderStage();
                            }
                            if (!detail.contains) {
                                canvas.render(d.selectImage, rect);
                                stage.items.add(stage.getId(), pre);
                            }
                        }
                        else if (d.activeToolName === "erase" && detail.contains) {
                            stage.items.remove(detail.id);
                            stage.renderStage();
                        }
                    }
                    break;
            }
        });
    });
})(main || (main = {}));
module.exports = main;
},{"./modules/canvas":2,"./modules/data":4,"./modules/event":6,"./modules/grid":7,"./modules/initDOM":10,"./modules/list":11,"./modules/makePrefabDataUrls":12,"./modules/packUtil/packLoader":14,"./modules/packUtil/packManager":15,"./modules/prefab":17,"./modules/rect":18,"./modules/stage":19,"./modules/tray":20,"./modules/ui":21,"./modules/vector2":23}],2:[function(require,module,exports){
var initDOM = require("./initDOM");
var canvas;
(function (canvas_1) {
    var canvas;
    var ctx;
    initDOM(function () {
        canvas = document.getElementById("pla-canvas");
        canvas_1.canvasRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
        resizeCanvas();
        if (canvas && canvas.getContext) {
            ctx = canvas.getContext("2d");
        }
    });
    window.addEventListener("resize", resizeCanvas);
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas_1.canvasRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    }
    /**
     * 指定された画像を描画します。
     * @param {HTMLImageElement} img - 描画する画像
     * @param {pRect} rect - 描画する部分(x, y, width, height)
     * @return {number} 画像を消すなどするときに、判別するID
     */
    function render(img, rect) {
        ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    }
    canvas_1.render = render;
    function clearByRect(rect) {
        ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
    }
    canvas_1.clearByRect = clearByRect;
    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    canvas_1.clear = clear;
})(canvas || (canvas = {}));
module.exports = canvas;
},{"./initDOM":10}],3:[function(require,module,exports){
var compiler;
(function (compiler) {
    function convertOldFile(oldFile) {
        return "";
    }
    compiler.convertOldFile = convertOldFile;
})(compiler || (compiler = {}));
module.exports = compiler;
},{}],4:[function(require,module,exports){
var tray = require("./tray");
var grid = require("./grid");
var data = (function () {
    function data() {
    }
    Object.defineProperty(data, "scrollX", {
        /**
         * alias (grid.scrollX)
         */
        get: function () {
            return grid.scrollX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "scrollY", {
        /**
         * alias (grid.scrollY)
         */
        get: function () {
            return grid.scrollY;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * alias (tray.updateSelectImage)
     */
    data.updateSelectImage = function () {
        tray.updateSelectImage();
    };
    return data;
})();
module.exports = data;
},{"./grid":7,"./tray":20}],5:[function(require,module,exports){
var elem;
(function (elem) {
    function addEventListenerforQuery(query, eventName, listener) {
        forEachforQuery(query, function (i) {
            i.addEventListener(eventName, listener);
        });
    }
    elem.addEventListenerforQuery = addEventListenerforQuery;
    function forEachforQuery(query, listener) {
        Array.prototype.forEach.call(document.querySelectorAll(query), listener);
    }
    elem.forEachforQuery = forEachforQuery;
})(elem || (elem = {}));
module.exports = elem;
},{}],6:[function(require,module,exports){
var list = require("./list");
var event;
(function (event) {
    var eventHandlers = new list();
    function addEventListener(eventName, fn) {
        if (eventHandlers.contains(eventName)) {
            eventHandlers.get(eventName).push(fn);
        }
        else {
            eventHandlers.push(eventName, [fn]);
        }
    }
    event.addEventListener = addEventListener;
    function raiseEvent(eventName, params) {
        if (eventHandlers.contains(eventName)) {
            eventHandlers.get(eventName).forEach(function (i) {
                i(params);
            });
        }
    }
    event.raiseEvent = raiseEvent;
})(event || (event = {}));
module.exports = event;
},{"./list":11}],7:[function(require,module,exports){
var Vector2 = require("./vector2");
var d = require("./data");
var stage = require("./stage");
var rect = require("./rect");
/**
 * 座標系。ひえーー
 */
var grid;
(function (grid_1) {
    var gridDetail = (function () {
        function gridDetail(gridPos, eventName, mousePos) {
            this.gridPos = gridPos;
            this.eventName = eventName;
            this.mousePos = mousePos;
        }
        return gridDetail;
    })();
    grid_1.gridDetail = gridDetail;
    function getMousePosFromCenterAndSize(center, size) {
        return center - ((size - d.defaultGridSize) / 2);
    }
    grid_1.getMousePosFromCenterAndSize = getMousePosFromCenterAndSize;
    grid_1.scrollX = 0;
    grid_1.scrollY = 0;
    grid_1.scrollBeforeX = 0;
    grid_1.scrollBeforeY = 0;
    function getGridPosFromMousePos(mousePos) {
        var cX = mousePos.x - grid_1.scrollX;
        var cY = mousePos.y - grid_1.scrollY;
        var eX = cX - (cX % d.defaultGridSize);
        var eY = cY - (cY % d.defaultGridSize);
        var gridX = eX / d.defaultGridSize;
        var gridY = eY / d.defaultGridSize;
        return new Vector2(gridX, gridY);
    }
    grid_1.getGridPosFromMousePos = getGridPosFromMousePos;
    var getPrefabFromGridDetails = (function () {
        function getPrefabFromGridDetails(contains, id, prefab) {
            this.contains = contains;
            this.id = id;
            this.prefab = prefab;
        }
        return getPrefabFromGridDetails;
    })();
    grid_1.getPrefabFromGridDetails = getPrefabFromGridDetails;
    function getPrefabFromGrid(grid) {
        var result = new getPrefabFromGridDetails(false, -1, null);
        var breakException = {};
        // breakするため
        try {
            Object.keys(stage.items.getAll()).forEach(function (i) {
                var item = stage.items.get(parseInt(i));
                if (grid.x >= item.gridX && grid.x < item.gridX + item.gridW &&
                    grid.y >= item.gridY && grid.y < item.gridY + item.gridH) {
                    result = new getPrefabFromGridDetails(true, parseInt(i), item);
                    throw breakException;
                }
            });
        }
        catch (e) {
            if (e !== breakException)
                throw e;
        }
        return result;
    }
    grid_1.getPrefabFromGrid = getPrefabFromGrid;
    function toMousePos(gridPos) {
        return gridPos * d.defaultGridSize;
    }
    grid_1.toMousePos = toMousePos;
    function toGridPos(mousePos) {
        return (mousePos - (mousePos % d.defaultGridSize)) / d.defaultGridSize;
    }
    grid_1.toGridPos = toGridPos;
    /**
     * すべてgridPosで指定された4点のrectを、描画領域に変換します。
     */
    function toDrawRect(gridRect) {
        return new rect(grid_1.scrollX + getMousePosFromCenterAndSize(toMousePos(gridRect.x), toMousePos(gridRect.width)), grid_1.scrollY + getMousePosFromCenterAndSize(toMousePos(gridRect.y), toMousePos(gridRect.height)), toMousePos(gridRect.width), toMousePos(gridRect.height));
    }
    grid_1.toDrawRect = toDrawRect;
})(grid || (grid = {}));
module.exports = grid;
},{"./data":4,"./rect":18,"./stage":19,"./vector2":23}],8:[function(require,module,exports){
function image(url, isNoJaggy, size) {
    var a = new Image();
    a.src = url;
    if (isNoJaggy) {
        var width = (a.width + size.x) / 2;
        var height = (a.height + size.y) / 2;
        var newC, ctx;
        var saveURL;
        newC = document.createElement("canvas");
        newC.width = width;
        newC.height = height;
        ctx = newC.getContext("2d");
        ctx.drawImage(a, 0, 0, width, height);
        return image(newC.toDataURL("image/png"));
    }
    else {
        return a;
    }
}
module.exports = image;
},{}],9:[function(require,module,exports){
function importJS(src) {
    var elem = document.createElement("script");
    elem.src = src;
    return elem;
}
module.exports = importJS;
},{}],10:[function(require,module,exports){
var handlerList = new Array();
function add(fn) {
    handlerList.push(fn);
}
document.addEventListener('DOMContentLoaded', function () {
    handlerList.forEach(function (i) {
        i();
    });
});
module.exports = add;
},{}],11:[function(require,module,exports){
var List = (function () {
    function List() {
        this.data = {};
    }
    List.prototype.push = function (index, item) {
        this.data[index] = item;
    };
    List.prototype.update = function (index, item) {
        this.data[index] = item;
    };
    List.prototype.get = function (index) {
        return this.data[index];
    };
    List.prototype.getAll = function () {
        return this.data;
    };
    List.prototype.remove = function (index) {
        delete this.data[index];
    };
    List.prototype.clear = function () {
        this.data = {};
    };
    List.prototype.contains = function (index) {
        return this.data.hasOwnProperty(index);
    };
    List.prototype.toSimple = function () {
        return this.data;
    };
    return List;
})();
module.exports = List;
},{}],12:[function(require,module,exports){
var d = require("./data");
var list = require("./list");
var packManager = require("./packUtil/packManager");
var Vector2 = require("./vector2");
var image = require("./image");
function makeDataUrl() {
    var result = new list();
    var blockList = d.pack.blocks.getAll();
    Object.keys(blockList).forEach(function (i) {
        result.push(i, image(packManager.getPackPath(d.defaultPackName) + d.pack.blocks.get(i).data.filename, true, new Vector2(d.defaultGridSize, d.defaultGridSize)).src);
    });
    var objList = d.pack.objs.getAll();
    Object.keys(objList).forEach(function (i) {
        var item = d.pack.objs.get(i).data;
        result.push(i, image(packManager.getPackPath(d.defaultPackName) + item.filename, true, new Vector2(item.width, item.height)).src);
    });
    return result;
}
module.exports = makeDataUrl;
},{"./data":4,"./image":8,"./list":11,"./packUtil/packManager":15,"./vector2":23}],13:[function(require,module,exports){

},{}],14:[function(require,module,exports){
/// <reference path="../../../typings/es6-promise/es6-promise.d.ts" />
var packManager = require("./packManager");
function load(packName) {
    return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", packManager.getPackPath(packName) + "packinfo.json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            }
        };
        xhr.send(null);
    });
}
module.exports = load;
},{"./packManager":15}],15:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var list = require("./../list");
var pack;
(function (pack) {
    function getPackPath(packName) {
        return "pack/" + packName + "/";
    }
    pack.getPackPath = getPackPath;
    var packModule = (function () {
        function packModule(data) {
            var _this = this;
            this.pack = new packInfo(data["pack"]);
            this.blocks = new list();
            Object.keys(data["blocks"]).forEach(function (i) {
                _this.blocks.push(i, new blockInfo({ bName: data["blocks"][i]["name"], filename: data["blocks"][i]["filename"] }));
            });
            this.objs = new list();
            Object.keys(data["objs"]).forEach(function (i) {
                var cur = data["objs"][i];
                if (cur["hidden"]) {
                    _this.objs.push(i, new objInfo({ oName: cur["name"], filename: cur["filename"], width: cur["width"], height: cur["height"], type: cur["type"] }));
                }
                else {
                    _this.objs.push(i, new objInfo({ oName: cur["name"], filename: cur["filename"], width: cur["width"], height: cur["height"], type: cur["type"], hidden: cur["hidden"] }));
                }
            });
            this.descriptions = new list();
            Object.keys(data["descriptions"]).forEach(function (i) {
                var cur = data["descriptions"][i];
                _this.descriptions.push(i, new desInfo(cur));
            });
            var a1 = new list();
            Object.keys(data["abilities"]["selectelement"]).forEach(function (i) {
                a1.push(i, data["abilities"]["selectelement"][i]);
            });
            var a2 = new list();
            Object.keys(data["abilities"]["keys"]).forEach(function (i) {
                a2.push(i, data["abilities"]["keys"][i]);
            });
            var a3 = new list();
            Object.keys(data["abilities"]["types"]).forEach(function (i) {
                a3.push(i, data["abilities"]["keys"][i]);
            });
            this.abilities = new abilityInfo({ selectelement: a1, keys: a2, types: a3 });
            this.skyboxes = new skyboxInfoList();
            Object.keys(data["skyboxes"]).forEach(function (i) {
                _this.skyboxes.push(i, new skyboxInfo(data["skyboxes"][i]));
            });
            this.editor = new packEditorInfo(data["editor"]["defaultSkybox"]);
        }
        return packModule;
    })();
    pack.packModule = packModule;
    var packEditorInfo = (function () {
        function packEditorInfo(defaultSkybox) {
            this.defaultSkybox = defaultSkybox;
        }
        return packEditorInfo;
    })();
    pack.packEditorInfo = packEditorInfo;
    var packInfo = (function () {
        function packInfo(data) {
            this.pName = data["name"];
            this.version = data["version"];
            this.author = data["author"];
            this.exportType = data["exportType"];
        }
        return packInfo;
    })();
    pack.packInfo = packInfo;
    var packItem = (function () {
        function packItem(p) {
            this.data = p;
        }
        return packItem;
    })();
    pack.packItem = packItem;
    var blockInfo = (function (_super) {
        __extends(blockInfo, _super);
        function blockInfo() {
            _super.apply(this, arguments);
        }
        return blockInfo;
    })(packItem);
    pack.blockInfo = blockInfo;
    var objInfo = (function (_super) {
        __extends(objInfo, _super);
        function objInfo() {
            _super.apply(this, arguments);
        }
        return objInfo;
    })(packItem);
    pack.objInfo = objInfo;
    var desInfo = (function (_super) {
        __extends(desInfo, _super);
        function desInfo() {
            _super.apply(this, arguments);
        }
        return desInfo;
    })(packItem);
    pack.desInfo = desInfo;
    var abilityInfo = (function (_super) {
        __extends(abilityInfo, _super);
        function abilityInfo() {
            _super.apply(this, arguments);
        }
        return abilityInfo;
    })(packItem);
    pack.abilityInfo = abilityInfo;
    var skyboxInfo = (function (_super) {
        __extends(skyboxInfo, _super);
        function skyboxInfo() {
            _super.apply(this, arguments);
        }
        return skyboxInfo;
    })(packItem);
    pack.skyboxInfo = skyboxInfo;
    var skyboxInfoList = (function (_super) {
        __extends(skyboxInfoList, _super);
        function skyboxInfoList() {
            _super.call(this);
        }
        skyboxInfoList.prototype.toSimple = function () {
            var _this = this;
            var result = {};
            Object.keys(this.getAll()).forEach(function (i) {
                result[_this.get(i).data.label] = i;
            });
            return result;
        };
        return skyboxInfoList;
    })(list);
    pack.skyboxInfoList = skyboxInfoList;
})(pack || (pack = {}));
module.exports = pack;
},{"./../list":11}],16:[function(require,module,exports){
var stage = require("./stage");
var planet;
(function (planet) {
    function exportText() {
        return "";
    }
    planet.exportText = exportText;
    function importText(file) {
        return new stage.StageEffects();
    }
    planet.importText = importText;
})(planet || (planet = {}));
module.exports = planet;
},{"./stage":19}],17:[function(require,module,exports){
var prefab = (function () {
    function prefab(gridX, gridY, fileName, blockName, gridW, gridH) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.fileName = fileName;
        this.blockName = blockName;
        this.gridW = gridW;
        this.gridH = gridH;
    }
    return prefab;
})();
module.exports = prefab;
},{}],18:[function(require,module,exports){
var rect = (function () {
    function rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    return rect;
})();
module.exports = rect;
},{}],19:[function(require,module,exports){
var list = require("./list");
var canvas = require("./canvas");
var grid = require("./grid");
var image = require("./image");
var d = require("./data");
var rect = require("./rect");
var event = require("./event");
var stage;
(function (stage) {
    var StageEffects = (function () {
        function StageEffects() {
            this.skybox = "";
        }
        return StageEffects;
    })();
    stage.StageEffects = StageEffects;
    stage.stageEffects = new StageEffects();
    var prefabList;
    var items;
    (function (items) {
        /**
         * alias (push)
         */
        function add(id, p) { push(id, p); }
        items.add = add;
        function push(id, p) {
            prefabList.push(id.toString(), p);
        }
        items.push = push;
        function getAll() {
            return prefabList.getAll();
        }
        items.getAll = getAll;
        function remove(id) {
            return prefabList.remove(id.toString());
        }
        items.remove = remove;
        function clear() {
            prefabList.clear();
        }
        items.clear = clear;
        function get(id) {
            return prefabList.get(id.toString());
        }
        items.get = get;
    })(items = stage.items || (stage.items = {}));
    var maxId;
    function init() {
        prefabList = new list();
        maxId = 0;
    }
    init();
    function getId() {
        return maxId++;
    }
    stage.getId = getId;
    function resetId() {
        maxId = 0;
    }
    function renderStage() {
        canvas.clear();
        var l = items.getAll();
        Object.keys(l).forEach(function (i) {
            var item = items.get(parseInt(i));
            var x = grid.scrollX + grid.getMousePosFromCenterAndSize(grid.toMousePos(item.gridX), grid.toMousePos(item.gridW));
            var y = grid.scrollY + grid.getMousePosFromCenterAndSize(grid.toMousePos(item.gridY), grid.toMousePos(item.gridH));
            var width = grid.toMousePos(item.gridW);
            var height = grid.toMousePos(item.gridH);
            // 画面内に入っているか
            if (x + width >= 0 && x <= canvas.canvasRect.width &&
                y + height >= 0 && x <= canvas.canvasRect.height) {
                canvas.render(image(d.trayItemDataURLs.get(item.blockName)), new rect(x, y, width, height));
            }
        });
    }
    stage.renderStage = renderStage;
    var isResizeRequest = false;
    var resizeTimerId;
    event.addEventListener("resize", function () {
        if (isResizeRequest) {
            clearTimeout(resizeTimerId);
        }
        isResizeRequest = true;
        resizeTimerId = setTimeout(function () {
            isResizeRequest = false;
            renderStage();
        }, 100);
    });
})(stage || (stage = {}));
module.exports = stage;
},{"./canvas":2,"./data":4,"./event":6,"./grid":7,"./image":8,"./list":11,"./rect":18}],20:[function(require,module,exports){
var d = require("./data");
var tray;
(function (tray) {
    var TrayBlockDetails = (function () {
        function TrayBlockDetails(blockName, fileName, label, // 表示するときのブロック名
            width, height) {
            this.blockName = blockName;
            this.fileName = fileName;
            this.label = label;
            this.width = width;
            this.height = height;
        }
        return TrayBlockDetails;
    })();
    tray.TrayBlockDetails = TrayBlockDetails;
    function updateActiveBlock(blockName, fileName, label, width, height) {
        if (!width)
            width = d.defaultBlockSize;
        if (!height)
            height = d.defaultBlockSize;
        d.selectBlock = new TrayBlockDetails(blockName, fileName, label, width, height);
    }
    tray.updateActiveBlock = updateActiveBlock;
    function updateSelectImage() {
        //d.selectImage = 
    }
    tray.updateSelectImage = updateSelectImage;
})(tray || (tray = {}));
module.exports = tray;
},{"./data":4}],21:[function(require,module,exports){
/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../definitely/move.d.ts" />
var initDOM = require("./initDOM");
var event = require("./event");
var el = require("./elem");
var compiler = require("./compiler");
var importJS = require("./importJS");
var d = require("./data");
var u = require("./util");
var grid = require("./grid");
var Vector2 = require("./vector2");
var tray = require("./tray");
var packManager = require("./packUtil/packManager");
var planet = require("./planet");
var stage = require("./stage");
var ui;
(function (ui) {
    function init() {
        window.addEventListener("resize", function () {
            event.raiseEvent("resize", null);
        });
        event.addEventListener("ui_clickTray", function (e) {
            var target = e.target;
            d.isObjMode = target.parentElement.classList.contains("tray-list-obj");
            if (!d.isObjMode) {
                var item = d.pack.blocks.get(target.dataset["block"]).data;
                tray.updateActiveBlock(target.dataset["block"], item.filename, item.bName);
            }
            else {
                var item = d.pack.objs.get(target.dataset["block"]).data;
                tray.updateActiveBlock(target.dataset["block"], item.filename, item.oName, item.width, item.height);
            }
            changeActiveBlock(target.dataset["block"]);
        });
        event.addEventListener("ui_mousedownCanvas|ui_mousemoveanddownCanvas|ui_mouseupCanvas", function (e) {
            var g = grid.getGridPosFromMousePos(new Vector2(e.clientX, e.clientY));
            event.raiseEvent("gridCanvas", new grid.gridDetail(g, e.type, new Vector2(e.clientX, e.clientY)));
        });
        event.addEventListener("initedPack", function () {
            document.getElementById("stg-skybox").value = d.pack.editor.defaultSkybox;
            el.forEachforQuery(".pack-select", function (i) {
                var elem = i;
                elem.innerHTML = u.obj2SelectElem(d.pack[elem.dataset["items"]].toSimple());
                if (elem.dataset["change"]) {
                    elem.addEventListener("change", ui[elem.dataset["change"]]);
                }
                if (elem.dataset["default"]) {
                    elem.value = elem.dataset["default"];
                }
            });
        });
        // onBtnClickhandlerList = new Array<(target:Node,e:MouseEvent)=>void>();
    }
    // var onBtnClickhandlerList:Array<(target:Node,e:MouseEvent)=>void>;
    // export function onBtnClick(fn:(target:Node,e:MouseEvent)=>void) {
    //   onBtnClickhandlerList.push(fn);
    // }
    initDOM(function () {
        document.getElementById("tray-fullscreen").addEventListener("click", togglefullScreen);
        document.getElementById("ins-close").addEventListener("click", closeInspector);
        document.getElementById("io-export").addEventListener("click", clickExport);
        document.getElementById("io-import").addEventListener("click", clickImport);
        el.addEventListenerforQuery(".ins-show-btn", "click", clickInsShowBtn);
        el.addEventListenerforQuery(".io-hf", "change", changeHeaderorFooterValue);
        document.getElementById("conv-new").value = "";
        document.getElementById("conv-old").value = "";
        document.getElementById("conv").addEventListener("click", function () {
            document.getElementById("conv-new").value =
                compiler.convertOldFile(document.getElementById("conv-old").value);
        });
        document.getElementById("pla-io").value = "";
        el.addEventListenerforQuery(".tray-list-tool", "click", clickTrayTool);
        document.head.appendChild(importJS("bower_components/move.js/move.js"));
        event.raiseEvent("initDom", null);
        // var elems = document.querySelectorAll(".ui-btn");
        // for (var i = 0; i < elems.length; i++) {
        //   (<Node>elems.item(i)).addEventListener("click", (e:MouseEvent) => {
        //     onBtnClickhandlerList.forEach(j => {
        //       j(elems.item(i), e);
        //     });
        //   });
        // }
    });
    function setupCanvas() {
        ui.canvas = document.getElementById("pla-canvas");
        ui.canvas.addEventListener("mousedown", function (e) {
            event.raiseEvent("ui_mousedownCanvas", e);
        });
        ui.canvas.addEventListener("mousemove", function (e) {
            if (e.buttons === 1) {
                event.raiseEvent("ui_mousemoveanddownCanvas", e);
            }
        });
        ui.canvas.addEventListener("mouseup", function (e) {
            event.raiseEvent("ui_mouseupCanvas", e);
        });
    }
    ui.setupCanvas = setupCanvas;
    function togglefullScreen(e) {
        if (!d.isFullscreenTray) {
            closeInspector();
            move(".pla-footer").set("height", "100%").duration("0.5s").end();
            e.target.textContent = "↓";
        }
        else {
            move(".pla-footer").set("height", "50px").duration("0.5s").end();
            e.target.textContent = "↑";
        }
        d.isFullscreenTray = !d.isFullscreenTray;
    }
    ui.togglefullScreen = togglefullScreen;
    function closeInspector() {
        if (!d.isShowInspector)
            return;
        d.isShowInspector = false;
        move(".pla-inspector")
            .set("left", "100%")
            .duration("0.5s")
            .end();
    }
    ui.closeInspector = closeInspector;
    function showInspector(inspectorName) {
        document.querySelector(".ins-article-active") && document.querySelector(".ins-article-active").classList.remove("ins-article-active");
        document.getElementById("ins-" + inspectorName).classList.add("ins-article-active");
        if (d.isShowInspector)
            return;
        d.isShowInspector = true;
        move(".pla-inspector")
            .set("left", "80%")
            .duration("0.5s")
            .end();
    }
    ui.showInspector = showInspector;
    function clickExport() {
        document.getElementById("pla-io").value = planet.exportText();
    }
    ui.clickExport = clickExport;
    function clickImport() {
        var effects = planet.importText(document.getElementById("pla-io").value);
        stage.stageEffects = effects;
        console.log(effects.skybox);
        setSkybox(d.pack.skyboxes.get(effects.skybox).data.filename);
        stage.renderStage();
    }
    ui.clickImport = clickImport;
    function clickInsShowBtn(e) {
        showInspector(e.target.dataset["ins"]);
    }
    ui.clickInsShowBtn = clickInsShowBtn;
    function changeHeaderorFooterValue(e) {
        var elem = e.target;
        if (elem.id === "io-header") {
            planet.header = elem.value;
        }
        else if (elem.id === "io-footer") {
            planet.footer = elem.value;
        }
    }
    ui.changeHeaderorFooterValue = changeHeaderorFooterValue;
    function clickTrayTool(e) {
        var elem = e.target;
        if (elem.nodeName === "I") {
            elem = elem.parentElement;
        }
        if (elem.classList.contains("tool-btn")) {
            event.raiseEvent("clickTrayToolbtn", elem.dataset["toolname"]);
            return;
        }
        document.getElementsByClassName("tool-active")[0].classList.remove("tool-active");
        elem.classList.add("tool-active");
        d.activeToolName = elem.dataset["toolname"];
    }
    ui.clickTrayTool = clickTrayTool;
    function setSkybox(fileName) {
        document.body.style.backgroundImage = "url('" + fileName + "')";
    }
    ui.setSkybox = setSkybox;
    function initTrayBlock() {
        return new Promise(function (resolve) {
            var blocks = d.pack.blocks.getAll();
            var ul = document.getElementsByClassName("tray-items")[0];
            var list = Object.keys(blocks);
            var async = function (i) {
                var item = list[i];
                var li = document.createElement("div");
                li.classList.add("tray-list", "tray-list-block");
                li.addEventListener("click", function (e) { event.raiseEvent("ui_clickTray", e); });
                var img = document.createElement("img");
                img.src = packManager.getPackPath(d.defaultPackName) + d.pack.blocks.get(item).data.filename;
                img.onload = function () {
                    img.alt = d.pack.blocks.get(item).data.bName;
                    img.dataset["block"] = item;
                    li.appendChild(img);
                    ul.appendChild(li);
                    if (i === list.length - 1) {
                        resolve();
                    }
                    else {
                        changeLoadingStatus("loading tray : " + i.toString() + " / " + (list.length - 1).toString());
                        async(i + 1);
                    }
                };
            };
            async(0);
        });
    }
    ui.initTrayBlock = initTrayBlock;
    function initTrayObj() {
        return new Promise(function (resolve) {
            var objs = d.pack.objs.getAll();
            var ul = document.getElementsByClassName("tray-items")[0];
            var list = Object.keys(objs);
            var async = function (i) {
                var item = list[i];
                var li = document.createElement("div");
                li.classList.add("tray-list", "tray-list-obj");
                li.addEventListener("click", function (e) { event.raiseEvent("ui_clickTray", e); });
                var img = document.createElement("img");
                img.src = packManager.getPackPath(d.defaultPackName) + d.pack.objs.get(item).data.filename;
                img.onload = function () {
                    img.alt = d.pack.objs.get(item).data.oName;
                    img.dataset["block"] = item;
                    li.style.width = img.style.width =
                        d.pack.objs.get(item).data.width / (d.pack.objs.get(item).data.height / 50) + "px";
                    li.style.height = img.style.height = "50px";
                    li.appendChild(img);
                    ul.appendChild(li);
                    if (i === list.length - 1) {
                        //ev.raiseEvent("initedTray", null);
                        resolve();
                    }
                    else {
                        changeLoadingStatus("loading tray-obj : " + i.toString() + " / " + (list.length - 1).toString());
                        async(i + 1);
                    }
                };
            };
            async(0);
        });
    }
    ui.initTrayObj = initTrayObj;
    function changeLoadingStatus(status) {
        document.getElementsByClassName("loading")[0].innerHTML = "Loading...<br />" + status;
    }
    ui.changeLoadingStatus = changeLoadingStatus;
    function hideLoading() {
        var elem = document.getElementsByClassName("loading")[0];
        move(".loading")
            .set("opacity", 0)
            .duration("1s")
            .then()
            .set("display", "none")
            .pop()
            .end();
    }
    ui.hideLoading = hideLoading;
    function changeActiveBlock(blockName) {
        document.querySelector(".tray-active") && document.querySelector(".tray-active").classList.remove("tray-active");
        document.querySelector("[data-block=\"" + blockName + "\"]").classList.add("tray-active");
    }
    ui.changeActiveBlock = changeActiveBlock;
    event.addEventListener("clickTrayToolbtn", function (name) {
        var btnName2InspectorName = {
            "io": "io",
            "setting": "inspector"
        };
        ui.showInspector(btnName2InspectorName[name]);
    });
    function startUIWaitMode() {
        document.getElementById("pla-canvas").style.cursor = "wait";
    }
    ui.startUIWaitMode = startUIWaitMode;
    function endUIWaitMode() {
        document.getElementById("pla-canvas").style.cursor = "crosshair";
    }
    ui.endUIWaitMode = endUIWaitMode;
    function changeSkybox(e) {
        stage.stageEffects.skybox = e.target.value;
        setSkybox(d.pack.skyboxes.get(stage.stageEffects.skybox).data.filename);
    }
    ui.changeSkybox = changeSkybox;
    init();
})(ui || (ui = {}));
module.exports = ui;
},{"./compiler":3,"./data":4,"./elem":5,"./event":6,"./grid":7,"./importJS":9,"./initDOM":10,"./packUtil/packManager":15,"./planet":16,"./stage":19,"./tray":20,"./util":22,"./vector2":23}],22:[function(require,module,exports){
var util;
(function (util) {
    function obj2SelectElem(obj) {
        var result = [];
        Object.keys(obj).forEach(function (i) {
            if (obj[i].constructor === {}.constructor) {
                result.push('<optgroup label="' + i + '">');
                result.push(obj2SelectElem(obj[i]));
                result.push('</optgroup>');
            }
            else {
                result.push('<option value="' + obj[i] + '">' + i + '</option>');
            }
        });
        return result.join("\n");
    }
    util.obj2SelectElem = obj2SelectElem;
})(util || (util = {}));
module.exports = util;
},{}],23:[function(require,module,exports){
var Vector2 = (function () {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    ;
    Object.defineProperty(Vector2, "zero", {
        get: function () {
            return new Vector2(0, 0);
        },
        enumerable: true,
        configurable: true
    });
    return Vector2;
})();
module.exports = Vector2;
},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tYWluLnRzIiwianMvbW9kdWxlcy9jYW52YXMudHMiLCJqcy9tb2R1bGVzL2NvbXBpbGVyLnRzIiwianMvbW9kdWxlcy9kYXRhLnRzIiwianMvbW9kdWxlcy9lbGVtLnRzIiwianMvbW9kdWxlcy9ldmVudC50cyIsImpzL21vZHVsZXMvZ3JpZC50cyIsImpzL21vZHVsZXMvaW1hZ2UudHMiLCJqcy9tb2R1bGVzL2ltcG9ydEpTLnRzIiwianMvbW9kdWxlcy9pbml0RE9NLnRzIiwianMvbW9kdWxlcy9saXN0LnRzIiwianMvbW9kdWxlcy9tYWtlUHJlZmFiRGF0YVVybHMudHMiLCJqcy9tb2R1bGVzL3BhY2tVdGlsL3BhY2tMb2FkZXIudHMiLCJqcy9tb2R1bGVzL3BhY2tVdGlsL3BhY2tNYW5hZ2VyLnRzIiwianMvbW9kdWxlcy9wbGFuZXQudHMiLCJqcy9tb2R1bGVzL3ByZWZhYi50cyIsImpzL21vZHVsZXMvcmVjdC50cyIsImpzL21vZHVsZXMvc3RhZ2UudHMiLCJqcy9tb2R1bGVzL3RyYXkudHMiLCJqcy9tb2R1bGVzL3VpLnRzIiwianMvbW9kdWxlcy91dGlsLnRzIiwianMvbW9kdWxlcy92ZWN0b3IyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBTyxFQUFFLFdBQVcsY0FBYyxDQUFDLENBQUM7QUFDcEMsSUFBTyxPQUFPLFdBQVcsbUJBQW1CLENBQUMsQ0FBQztBQUM5QyxJQUFPLFVBQVUsV0FBVywrQkFBK0IsQ0FBQyxDQUFDO0FBQzdELElBQU8sV0FBVyxXQUFXLGdDQUFnQyxDQUFDLENBQUM7QUFDL0QsSUFBTyxLQUFLLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUMxQyxJQUFPLElBQUksV0FBVyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3hDLElBQU8sS0FBSyxXQUFXLGlCQUFpQixDQUFDLENBQUM7QUFDMUMsSUFBTyxDQUFDLFdBQVcsZ0JB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M0IsQ0FBQzs7O09BQUE7SUFDSCxjQUFDO0FBQUQsQ0FMQSxBQUtDLElBQUE7QUFDRCxpQkFBUyxPQUFPLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHVpID0gcmVxdWlyZShcIi4vbW9kdWxlcy91aVwiKTtcclxuaW1wb3J0IGluaXRET00gPSByZXF1aXJlKFwiLi9tb2R1bGVzL2luaXRET01cIik7XHJcbmltcG9ydCBwYWNrTG9hZGVyID0gcmVxdWlyZShcIi4vbW9kdWxlcy9wYWNrVXRpbC9wYWNrTG9hZGVyXCIpO1xyXG5pbXBvcnQgcGFja01hbmFnZXIgPSByZXF1aXJlKFwiLi9tb2R1bGVzL3BhY2tVdGlsL3BhY2tNYW5hZ2VyXCIpO1xyXG5pbXBvcnQgZXZlbnQgPSByZXF1aXJlKFwiLi9tb2R1bGVzL2V2ZW50XCIpO1xyXG5pbXBvcnQgbGlzdCA9IHJlcXVpcmUoXCIuL21vZHVsZXMvbGlzdFwiKTtcclxuaW1wb3J0IHN0YWdlID0gcmVxdWlyZShcIi4vbW9kdWxlcy9zdGFnZVwiKTtcclxuaW1wb3J0IGQgPSByZXF1aXJlKFwiLi9tb2R1bGVzL2RhdGFcIik7XHJcbmltcG9ydCBtYWtlRGF0YVVybCA9IHJlcXVpcmUoXCIuL21vZHVsZXMvbWFrZVByZWZhYkRhdGFVcmxzXCIpO1xyXG5pbXBvcnQgdHJheSA9IHJlcXVpcmUoXCIuL21vZHVsZXMvdHJheVwiKTtcclxuaW1wb3J0IGdyaWQgPSByZXF1aXJlKFwiLi9tb2R1bGVzL2dyaWRcIik7XHJcbmltcG9ydCBwcmVmYWIgPSByZXF1aXJlKFwiLi9tb2R1bGVzL3ByZWZhYlwiKTtcclxuaW1wb3J0IFZlY3RvcjIgPSByZXF1aXJlKFwiLi9tb2R1bGVzL3ZlY3RvcjJcIik7XHJcbmltcG9ydCBSZWN0ID0gcmVxdWlyZShcIi4vbW9kdWxlcy9yZWN0XCIpO1xyXG5pbXBvcnQgY2FudmFzID0gcmVxdWlyZShcIi4vbW9kdWxlcy9jYW52YXNcIik7XHJcblxyXG5tb2R1bGUgbWFpbiB7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICBkLnRyYXlJdGVtRGF0YVVSTHMgPSBuZXcgbGlzdDxzdHJpbmc+KCk7XHJcbiAgICBkLmRlZmF1bHRQYWNrTmFtZSA9IFwiaGFsc3RhclwiO1xyXG4gICAgLy9kLnBhY2sgPSBuZXcgcGFja01hbmFnZXIucGFja01vZHVsZSh7fSk7XHJcbiAgICBkLmRlZmF1bHRHcmlkU2l6ZSA9IDI1O1xyXG4gICAgZC5kZWZhdWx0QmxvY2tTaXplID0gNTA7XHJcbiAgICBkLmFjdGl2ZVRvb2xOYW1lID0gXCJwZW5jaWxcIjtcclxuICAgIGQuaXNPYmpNb2RlID0gZmFsc2U7XHJcbiAgICBkLmlzRnVsbHNjcmVlblRyYXkgPSBmYWxzZTtcclxuICAgIGQuaXNTaG93SW5zcGVjdG9yID0gZmFsc2U7XHJcbiAgfVxyXG4gIGluaXQoKTtcclxuICBcclxuICBpbml0RE9NKCgpID0+IHtcclxuICAgIHBhY2tMb2FkZXIoZC5kZWZhdWx0UGFja05hbWUpLnRoZW4oaSA9PiB7XHJcbiAgICAgIGQucGFjayA9IG5ldyBwYWNrTWFuYWdlci5wYWNrTW9kdWxlKGkpO1xyXG4gICAgICBldmVudC5yYWlzZUV2ZW50KFwicGFja0xvYWRlZFwiLCBudWxsKTtcclxuICAgICAgc3RhZ2Uuc3RhZ2VFZmZlY3RzLnNreWJveCA9IGQucGFjay5lZGl0b3IuZGVmYXVsdFNreWJveDtcclxuICAgICAgdWkuc2V0U2t5Ym94KHBhY2tNYW5hZ2VyLmdldFBhY2tQYXRoKGQuZGVmYXVsdFBhY2tOYW1lKSArIGQucGFjay5za3lib3hlcy5nZXQoZC5wYWNrLmVkaXRvci5kZWZhdWx0U2t5Ym94KS5kYXRhLmZpbGVuYW1lKTtcclxuICAgICAgZXZlbnQucmFpc2VFdmVudChcImluaXRlZFBhY2tcIiwgbnVsbCk7XHJcbiAgICAgIGV2ZW50LnJhaXNlRXZlbnQoXCJpbml0ZWRVSVwiLCBudWxsKTtcclxuICAgICAgdWkuaW5pdFRyYXlCbG9jaygpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHVpLmluaXRUcmF5T2JqKCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBldmVudC5yYWlzZUV2ZW50KFwiaW5pdGVkVHJheVwiLCBudWxsKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIGV2ZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJpbml0ZWRUcmF5XCIsICgpID0+IHtcclxuICAgICAgdWkuY2hhbmdlTG9hZGluZ1N0YXR1cyhcIm1ha2luZyBEYXRhVVJMXCIpO1xyXG4gICAgICBkLnRyYXlJdGVtRGF0YVVSTHMgPSBtYWtlRGF0YVVybCgpO1xyXG4gICAgICB0cmF5LnVwZGF0ZUFjdGl2ZUJsb2NrKFwidzEvYmxvY2syXCIsIFwicGFjay9oYWxzdGFyL2ltYWdlcy9tYXBpY29ucy93MWJsb2NrMi0yLnBuZ1wiLCBcIlcx6I2J5LuY44OW44Ot44OD44KvXCIpO1xyXG4gICAgICB1aS5jaGFuZ2VMb2FkaW5nU3RhdHVzKFwiQXJlIHlvdSByZWFkeT9cIik7XHJcbiAgICAgIGV2ZW50LnJhaXNlRXZlbnQoXCJyZWFkeVwiLCBudWxsKTtcclxuICAgIH0pO1xyXG4gICAgZXZlbnQuYWRkRXZlbnRMaXN0ZW5lcihcInJlYWR5XCIsICgpID0+IHtcclxuICAgICAgdWkuaGlkZUxvYWRpbmcoKTtcclxuICAgIH0pO1xyXG4gICAgZXZlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImdyaWRDYW52YXNcIiwgKGU6Z3JpZC5ncmlkRGV0YWlsKSA9PiB7XHJcbiAgICAgIHZhciBwcmUgPSBuZXcgcHJlZmFiKGUuZ3JpZFBvcy54LCBlLmdyaWRQb3MueSwgZC5zZWxlY3RCbG9jay5maWxlTmFtZSwgZC5zZWxlY3RCbG9jay5ibG9ja05hbWUsIGdyaWQudG9HcmlkUG9zKGQuc2VsZWN0QmxvY2sud2lkdGgpLCBncmlkLnRvR3JpZFBvcyhkLnNlbGVjdEJsb2NrLmhlaWdodCkpO1xyXG4gICAgICB2YXIgZGV0YWlsID0gZ3JpZC5nZXRQcmVmYWJGcm9tR3JpZChuZXcgVmVjdG9yMihwcmUuZ3JpZFgsIHByZS5ncmlkWSkpO1xyXG4gICAgICB2YXIgcmVjdCA9IGdyaWQudG9EcmF3UmVjdChuZXcgUmVjdChwcmUuZ3JpZFgsIHByZS5ncmlkWSwgcHJlLmdyaWRXLCBwcmUuZ3JpZEgpKTtcclxuICAgICAgc3dpdGNoIChkLmFjdGl2ZVRvb2xOYW1lKSB7XHJcbiAgICAgICAgY2FzZSBcInBlbmNpbFwiOlxyXG4gICAgICAgICAgaWYgKGUuZXZlbnROYW1lID09PSBcIm1vdXNlZG93blwiKSB7XHJcbiAgICAgICAgICAgIGlmICghZGV0YWlsLmNvbnRhaW5zKSB7XHJcbiAgICAgICAgICAgICAgY2FudmFzLnJlbmRlcihkLnNlbGVjdEltYWdlLCByZWN0KTtcclxuICAgICAgICAgICAgICBzdGFnZS5pdGVtcy5wdXNoKHN0YWdlLmdldElkKCksIHByZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgc3RhZ2UuaXRlbXMucmVtb3ZlKGRldGFpbC5pZCk7XHJcbiAgICAgICAgICAgICAgc3RhZ2UucmVuZGVyU3RhZ2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImNob2ljZVwiOlxyXG4gICAgICAgICAgaWYgKGUuZXZlbnROYW1lID09PSBcIm1vdXNlZG93blwiKSB7XHJcbiAgICAgICAgICAgIC8vIOOCquODluOCuOOCp+OCr+ODiOOBq+WvvuW/nOOBleOBm+OCi1xyXG4gICAgICAgICAgICBpZiAoZGV0YWlsLnByZWZhYikge1xyXG4gICAgICAgICAgICAgIHZhciBiRGF0YSA9IGQucGFjay5ibG9ja3MuZ2V0KGRldGFpbC5wcmVmYWIuYmxvY2tOYW1lKTtcclxuICAgICAgICAgICAgICB0cmF5LnVwZGF0ZUFjdGl2ZUJsb2NrKGRldGFpbC5wcmVmYWIuYmxvY2tOYW1lLCBiRGF0YS5kYXRhLmJOYW1lLCBwYWNrTWFuYWdlci5nZXRQYWNrUGF0aChkLmRlZmF1bHRQYWNrTmFtZSkgKyBiRGF0YS5kYXRhLmZpbGVuYW1lKTtcclxuICAgICAgICAgICAgICB1aS5jaGFuZ2VBY3RpdmVCbG9jayhkZXRhaWwucHJlZmFiLmJsb2NrTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJoYW5kXCI6XHJcbiAgICAgICAgICBpZiAoZS5ldmVudE5hbWUgPT09IFwibW91c2Vtb3ZlXCIpIHtcclxuICAgICAgICAgICAgc2Nyb2xsWCArPSBlLm1vdXNlUG9zLnggLSBncmlkLnNjcm9sbEJlZm9yZVg7XHJcbiAgICAgICAgICAgIHNjcm9sbFkgKz0gZS5tb3VzZVBvcy55IC0gZ3JpZC5zY3JvbGxCZWZvcmVZO1xyXG4gICAgICAgICAgICBzdGFnZS5yZW5kZXJTdGFnZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGUuZXZlbnROYW1lICE9PSBcIm1vdXNldXBcIikge1xyXG4gICAgICAgICAgICBncmlkLnNjcm9sbEJlZm9yZVggPSBlLm1vdXNlUG9zLng7XHJcbiAgICAgICAgICAgIGdyaWQuc2Nyb2xsQmVmb3JlWSA9IGUubW91c2VQb3MueTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBpZiAoZS5ldmVudE5hbWUgPT09IFwibW91c2Vtb3ZlXCIgfHwgZS5ldmVudE5hbWUgPT09IFwibW91c2Vkb3duXCIpIHtcclxuICAgICAgICAgICAgaWYgKGQuYWN0aXZlVG9vbE5hbWUgPT09IFwiYnJ1c2hcIikge1xyXG4gICAgICAgICAgICAgIGlmIChkZXRhaWwuY29udGFpbnMgJiYgZGV0YWlsLnByZWZhYi5ibG9ja05hbWUgIT09IGQuc2VsZWN0QmxvY2suYmxvY2tOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBzdGFnZS5pdGVtcy5yZW1vdmUoZGV0YWlsLmlkKTtcclxuICAgICAgICAgICAgICAgIHN0YWdlLnJlbmRlclN0YWdlKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmICghZGV0YWlsLmNvbnRhaW5zKSB7XHJcbiAgICAgICAgICAgICAgICBjYW52YXMucmVuZGVyKGQuc2VsZWN0SW1hZ2UsIHJlY3QpO1xyXG4gICAgICAgICAgICAgICAgc3RhZ2UuaXRlbXMuYWRkKHN0YWdlLmdldElkKCksIHByZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGQuYWN0aXZlVG9vbE5hbWUgPT09IFwiZXJhc2VcIiAmJiBkZXRhaWwuY29udGFpbnMpIHtcclxuICAgICAgICAgICAgICBzdGFnZS5pdGVtcy5yZW1vdmUoZGV0YWlsLmlkKTtcclxuICAgICAgICAgICAgICBzdGFnZS5yZW5kZXJTdGFnZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuZXhwb3J0ID0gbWFpbjsiLCJpbXBvcnQgaW5pdERPTSA9IHJlcXVpcmUoXCIuL2luaXRET01cIik7XHJcbmltcG9ydCBSZWN0ID0gcmVxdWlyZShcIi4vcmVjdFwiKTtcclxubW9kdWxlIGNhbnZhcyB7XHJcbiAgdmFyIGNhbnZhczpIVE1MQ2FudmFzRWxlbWVudDtcclxuICB2YXIgY3R4OkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuICBleHBvcnQgdmFyIGNhbnZhc1JlY3Q6UmVjdDtcclxuICBpbml0RE9NKCgpID0+IHtcclxuICAgIGNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsYS1jYW52YXNcIik7XHJcbiAgICBjYW52YXNSZWN0ID0geyB4OiAwLCB5OiAwLCB3aWR0aDogd2luZG93LmlubmVyV2lkdGgsIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IH07XHJcbiAgICByZXNpemVDYW52YXMoKTtcclxuICAgIGlmIChjYW52YXMgJiYgY2FudmFzLmdldENvbnRleHQpIHtcclxuICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgIH1cclxuICB9KTtcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCByZXNpemVDYW52YXMpO1xyXG4gIGZ1bmN0aW9uIHJlc2l6ZUNhbnZhcygpIHtcclxuICAgIGNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgIGNhbnZhc1JlY3QgPSB7IHg6IDAsIHk6IDAsIHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCwgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICog5oyH5a6a44GV44KM44Gf55S75YOP44KS5o+P55S744GX44G+44GZ44CCXHJcbiAgICogQHBhcmFtIHtIVE1MSW1hZ2VFbGVtZW50fSBpbWcgLSDmj4/nlLvjgZnjgovnlLvlg49cclxuICAgKiBAcGFyYW0ge3BSZWN0fSByZWN0IC0g5o+P55S744GZ44KL6YOo5YiGKHgsIHksIHdpZHRoLCBoZWlnaHQpXHJcbiAgICogQHJldHVybiB7bnVtYmVyfSDnlLvlg4/jgpLmtojjgZnjgarjganjgZnjgovjgajjgY3jgavjgIHliKTliKXjgZnjgotJRFxyXG4gICAqL1xyXG4gIGV4cG9ydCBmdW5jdGlvbiByZW5kZXIoaW1nOkhUTUxJbWFnZUVsZW1lbnQsIHJlY3Q6UmVjdCk6dm9pZCB7XHJcbiAgICBjdHguZHJhd0ltYWdlKGltZywgcmVjdC54LCByZWN0LnksIHJlY3Qud2lkdGgsIHJlY3QuaGVpZ2h0KTtcclxuICB9XHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGNsZWFyQnlSZWN0KHJlY3Q6UmVjdCkge1xyXG4gICAgY3R4LmNsZWFyUmVjdChyZWN0LngsIHJlY3QueSwgcmVjdC53aWR0aCwgcmVjdC5oZWlnaHQpO1xyXG4gIH1cclxuICBleHBvcnQgZnVuY3Rpb24gY2xlYXIoKSB7XHJcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcbiAgfVxyXG59XHJcbmV4cG9ydCA9IGNhbnZhczsiLCJtb2R1bGUgY29tcGlsZXIge1xyXG4gIGV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0T2xkRmlsZShvbGRGaWxlOnN0cmluZykge1xyXG4gICAgcmV0dXJuIFwiXCI7XHJcbiAgfVxyXG59XHJcbmV4cG9ydCA9IGNvbXBpbGVyOyIsImltcG9ydCBsaXN0ID0gcmVxdWlyZShcIi4vbGlzdFwiKTtcclxuaW1wb3J0IHBhY2tNYW5hZ2VyID0gcmVxdWlyZShcIi4vcGFja1V0aWwvcGFja01hbmFnZXJcIik7XHJcbmltcG9ydCB0cmF5ID0gcmVxdWlyZShcIi4vdHJheVwiKTtcclxuaW1wb3J0IGdyaWQgPSByZXF1aXJlKFwiLi9ncmlkXCIpO1xyXG5cclxuY2xhc3MgZGF0YSB7XHJcbiAgc3RhdGljIHRyYXlJdGVtRGF0YVVSTHM6bGlzdDxzdHJpbmc+O1xyXG4gIHN0YXRpYyBkZWZhdWx0UGFja05hbWU6c3RyaW5nO1xyXG4gIHN0YXRpYyBwYWNrOnBhY2tNYW5hZ2VyLnBhY2tNb2R1bGU7XHJcbiAgc3RhdGljIGRlZmF1bHRHcmlkU2l6ZTpudW1iZXI7XHJcbiAgc3RhdGljIGRlZmF1bHRCbG9ja1NpemU6bnVtYmVyO1xyXG4gIHN0YXRpYyBzZWxlY3RCbG9jazp0cmF5LlRyYXlCbG9ja0RldGFpbHM7XHJcbiAgc3RhdGljIGFjdGl2ZVRvb2xOYW1lOnN0cmluZztcclxuICBzdGF0aWMgc2VsZWN0SW1hZ2U6SFRNTEltYWdlRWxlbWVudDtcclxuICBzdGF0aWMgaXNPYmpNb2RlOmJvb2xlYW47XHJcbiAgc3RhdGljIGlzRnVsbHNjcmVlblRyYXk6Ym9vbGVhbjtcclxuICBzdGF0aWMgaXNTaG93SW5zcGVjdG9yOmJvb2xlYW47XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogYWxpYXMgKGdyaWQuc2Nyb2xsWClcclxuICAgKi9cclxuICBzdGF0aWMgZ2V0IHNjcm9sbFgoKSB7XHJcbiAgICByZXR1cm4gZ3JpZC5zY3JvbGxYO1xyXG4gIH0gXHJcbiAgLyoqXHJcbiAgICogYWxpYXMgKGdyaWQuc2Nyb2xsWSlcclxuICAgKi9cclxuICBzdGF0aWMgZ2V0IHNjcm9sbFkoKSB7XHJcbiAgICByZXR1cm4gZ3JpZC5zY3JvbGxZO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBhbGlhcyAodHJheS51cGRhdGVTZWxlY3RJbWFnZSlcclxuICAgKi9cclxuICBzdGF0aWMgdXBkYXRlU2VsZWN0SW1hZ2UoKSB7XHJcbiAgICB0cmF5LnVwZGF0ZVNlbGVjdEltYWdlKCk7XHJcbiAgfVxyXG59XHJcbmV4cG9ydCA9IGRhdGE7IiwibW9kdWxlIGVsZW0ge1xyXG4gIGV4cG9ydCBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyZm9yUXVlcnkocXVlcnk6c3RyaW5nLCBldmVudE5hbWU6c3RyaW5nLCBsaXN0ZW5lcjooLi4ucGFyYW06YW55W10pPT52b2lkKSB7XHJcbiAgICBmb3JFYWNoZm9yUXVlcnkocXVlcnksIChpKSA9PiB7XHJcbiAgICAgIGkuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBleHBvcnQgZnVuY3Rpb24gZm9yRWFjaGZvclF1ZXJ5KHF1ZXJ5OnN0cmluZywgbGlzdGVuZXI6KGk6RWxlbWVudCk9PnZvaWQpIHtcclxuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChxdWVyeSksIGxpc3RlbmVyKTtcclxuICB9XHJcbn1cclxuZXhwb3J0ID0gZWxlbTsiLCJpbXBvcnQgbGlzdCA9IHJlcXVpcmUoXCIuL2xpc3RcIik7XHJcbm1vZHVsZSBldmVudCB7XHJcbiAgdmFyIGV2ZW50SGFuZGxlcnMgPSBuZXcgbGlzdDxBcnJheTwoZTphbnkpPT52b2lkPj4oKTtcclxuICBleHBvcnQgZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWU6c3RyaW5nLCBmbjooZTphbnkpPT52b2lkKSB7XHJcbiAgICBpZiAoZXZlbnRIYW5kbGVycy5jb250YWlucyhldmVudE5hbWUpKSB7XHJcbiAgICAgIGV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50TmFtZSkucHVzaChmbik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBldmVudEhhbmRsZXJzLnB1c2goZXZlbnROYW1lLCBbZm5dKTtcclxuICAgIH1cclxuICB9XHJcbiAgZXhwb3J0IGZ1bmN0aW9uIHJhaXNlRXZlbnQoZXZlbnROYW1lOnN0cmluZywgcGFyYW1zOmFueSkge1xyXG4gICAgaWYgKGV2ZW50SGFuZGxlcnMuY29udGFpbnMoZXZlbnROYW1lKSkge1xyXG4gICAgICBldmVudEhhbmRsZXJzLmdldChldmVudE5hbWUpLmZvckVhY2goaSA9PiB7XHJcbiAgICAgICAgaShwYXJhbXMpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuZXhwb3J0ID0gZXZlbnQ7IiwiaW1wb3J0IFZlY3RvcjIgPSByZXF1aXJlKFwiLi92ZWN0b3IyXCIpO1xyXG5pbXBvcnQgZCA9IHJlcXVpcmUoXCIuL2RhdGFcIik7XHJcbmltcG9ydCBwcmVmYWIgPSByZXF1aXJlKFwiLi9wcmVmYWJcIik7XHJcbmltcG9ydCBzdGFnZSA9IHJlcXVpcmUoXCIuL3N0YWdlXCIpO1xyXG5pbXBvcnQgcmVjdCA9IHJlcXVpcmUoXCIuL3JlY3RcIik7XHJcbi8qKlxyXG4gKiDluqfmqJnns7vjgILjgbLjgYjjg7zjg7xcclxuICovXHJcbm1vZHVsZSBncmlkIHtcclxuICBleHBvcnQgY2xhc3MgZ3JpZERldGFpbCB7XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZ3JpZFBvczpWZWN0b3IyLCBwdWJsaWMgZXZlbnROYW1lOnN0cmluZywgcHVibGljIG1vdXNlUG9zOlZlY3RvcjIpIHsgfVxyXG4gIH1cclxuICBleHBvcnQgZnVuY3Rpb24gZ2V0TW91c2VQb3NGcm9tQ2VudGVyQW5kU2l6ZShjZW50ZXI6bnVtYmVyLCBzaXplOm51bWJlcikge1xyXG4gICAgcmV0dXJuIGNlbnRlciAtICgoc2l6ZSAtIGQuZGVmYXVsdEdyaWRTaXplKSAvIDIpO1xyXG4gIH1cclxuICBleHBvcnQgdmFyIHNjcm9sbFggPSAwO1xyXG4gIGV4cG9ydCB2YXIgc2Nyb2xsWSA9IDA7XHJcbiAgZXhwb3J0IHZhciBzY3JvbGxCZWZvcmVYID0gMDtcclxuICBleHBvcnQgdmFyIHNjcm9sbEJlZm9yZVkgPSAwO1xyXG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRHcmlkUG9zRnJvbU1vdXNlUG9zKG1vdXNlUG9zOlZlY3RvcjIpIHtcclxuICAgIHZhciBjWCA9IG1vdXNlUG9zLnggLSBzY3JvbGxYOyB2YXIgY1kgPSBtb3VzZVBvcy55IC0gc2Nyb2xsWTtcclxuICAgIHZhciBlWCA9IGNYIC0gKGNYICUgZC5kZWZhdWx0R3JpZFNpemUpO1xyXG4gICAgdmFyIGVZID0gY1kgLSAoY1kgJSBkLmRlZmF1bHRHcmlkU2l6ZSk7XHJcbiAgICB2YXIgZ3JpZFggPSBlWCAvIGQuZGVmYXVsdEdyaWRTaXplO1xyXG4gICAgdmFyIGdyaWRZID0gZVkgLyBkLmRlZmF1bHRHcmlkU2l6ZTtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMihncmlkWCwgZ3JpZFkpO1xyXG4gIH1cclxuICBleHBvcnQgY2xhc3MgZ2V0UHJlZmFiRnJvbUdyaWREZXRhaWxzIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwdWJsaWMgY29udGFpbnM6IGJvb2xlYW4sXHJcbiAgICAgIHB1YmxpYyBpZDogbnVtYmVyLFxyXG4gICAgICBwdWJsaWMgcHJlZmFiOiBwcmVmYWJcclxuICAgICkgeyB9XHJcbiAgfVxyXG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRQcmVmYWJGcm9tR3JpZChncmlkOlZlY3RvcjIpIHtcclxuICAgIHZhciByZXN1bHQgPSBuZXcgZ2V0UHJlZmFiRnJvbUdyaWREZXRhaWxzKGZhbHNlLCAtMSwgbnVsbCk7XHJcbiAgICB2YXIgYnJlYWtFeGNlcHRpb24gPSB7fTtcclxuICAgIC8vIGJyZWFr44GZ44KL44Gf44KBXHJcbiAgICB0cnkge1xyXG4gICAgICBPYmplY3Qua2V5cyhzdGFnZS5pdGVtcy5nZXRBbGwoKSkuZm9yRWFjaChpID0+IHtcclxuICAgICAgICB2YXIgaXRlbSA9IHN0YWdlLml0ZW1zLmdldChwYXJzZUludChpKSk7XHJcbiAgICAgICAgaWYgKGdyaWQueCA+PSBpdGVtLmdyaWRYICYmIGdyaWQueCA8IGl0ZW0uZ3JpZFggKyBpdGVtLmdyaWRXICYmXHJcbiAgICAgICAgICBncmlkLnkgPj0gaXRlbS5ncmlkWSAmJiBncmlkLnkgPCBpdGVtLmdyaWRZICsgaXRlbS5ncmlkSCkge1xyXG4gICAgICAgICAgcmVzdWx0ID0gbmV3IGdldFByZWZhYkZyb21HcmlkRGV0YWlscyh0cnVlLCBwYXJzZUludChpKSwgaXRlbSk7XHJcbiAgICAgICAgICB0aHJvdyBicmVha0V4Y2VwdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBpZiAoZSAhPT0gYnJlYWtFeGNlcHRpb24pIHRocm93IGU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuICBleHBvcnQgZnVuY3Rpb24gdG9Nb3VzZVBvcyhncmlkUG9zOm51bWJlcikge1xyXG4gICAgcmV0dXJuIGdyaWRQb3MgKiBkLmRlZmF1bHRHcmlkU2l6ZTtcclxuICB9XHJcbiAgZXhwb3J0IGZ1bmN0aW9uIHRvR3JpZFBvcyhtb3VzZVBvczpudW1iZXIpIHtcclxuICAgIHJldHVybiAobW91c2VQb3MgLSAobW91c2VQb3MgJSBkLmRlZmF1bHRHcmlkU2l6ZSkpIC8gZC5kZWZhdWx0R3JpZFNpemU7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIOOBmeOBueOBpmdyaWRQb3PjgafmjIflrprjgZXjgozjgZ8054K544GucmVjdOOCkuOAgeaPj+eUu+mgmOWfn+OBq+WkieaPm+OBl+OBvuOBmeOAglxyXG4gICAqL1xyXG4gIGV4cG9ydCBmdW5jdGlvbiB0b0RyYXdSZWN0KGdyaWRSZWN0OnJlY3QpIHtcclxuICAgIHJldHVybiBuZXcgcmVjdChcclxuICAgICAgc2Nyb2xsWCArIGdldE1vdXNlUG9zRnJvbUNlbnRlckFuZFNpemUodG9Nb3VzZVBvcyhncmlkUmVjdC54KSwgdG9Nb3VzZVBvcyhncmlkUmVjdC53aWR0aCkpLFxyXG4gICAgICBzY3JvbGxZICsgZ2V0TW91c2VQb3NGcm9tQ2VudGVyQW5kU2l6ZSh0b01vdXNlUG9zKGdyaWRSZWN0LnkpLCB0b01vdXNlUG9zKGdyaWRSZWN0LmhlaWdodCkpLFxyXG4gICAgICB0b01vdXNlUG9zKGdyaWRSZWN0LndpZHRoKSxcclxuICAgICAgdG9Nb3VzZVBvcyhncmlkUmVjdC5oZWlnaHQpXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5leHBvcnQgPSBncmlkOyIsImltcG9ydCBWZWN0b3IyID0gcmVxdWlyZShcIi4vdmVjdG9yMlwiKTtcclxuZnVuY3Rpb24gaW1hZ2UodXJsOnN0cmluZywgaXNOb0phZ2d5Pzpib29sZWFuLCBzaXplPzpWZWN0b3IyKTpIVE1MSW1hZ2VFbGVtZW50IHtcclxuICB2YXIgYSA9IG5ldyBJbWFnZSgpO1xyXG4gIGEuc3JjID0gdXJsO1xyXG4gIGlmIChpc05vSmFnZ3kpIHtcclxuICAgIHZhciB3aWR0aCA9IChhLndpZHRoICsgc2l6ZS54KSAvIDI7XHJcbiAgICB2YXIgaGVpZ2h0ID0gKGEuaGVpZ2h0ICsgc2l6ZS55KSAvIDI7XHJcbiAgICB2YXIgbmV3QzpIVE1MQ2FudmFzRWxlbWVudCwgY3R4OkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuICAgIHZhciBzYXZlVVJMOnN0cmluZztcclxuICAgIG5ld0MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgbmV3Qy53aWR0aCA9IHdpZHRoO1xyXG4gICAgbmV3Qy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICBjdHggPSBuZXdDLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgIGN0eC5kcmF3SW1hZ2UoYSwgMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICByZXR1cm4gaW1hZ2UobmV3Qy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIikpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gYTtcclxuICB9XHJcbn1cclxuZXhwb3J0ID0gaW1hZ2U7IiwiZnVuY3Rpb24gaW1wb3J0SlMoc3JjOnN0cmluZykge1xyXG4gIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcclxuICBlbGVtLnNyYyA9IHNyYztcclxuICByZXR1cm4gZWxlbTtcclxufVxyXG5leHBvcnQgPSBpbXBvcnRKUzsiLCJ2YXIgaGFuZGxlckxpc3QgPSBuZXcgQXJyYXk8KCk9PnZvaWQ+KCk7XHJcbmZ1bmN0aW9uIGFkZChmbjooKT0+dm9pZCkge1xyXG4gIGhhbmRsZXJMaXN0LnB1c2goZm4pO1xyXG59XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XHJcbiAgaGFuZGxlckxpc3QuZm9yRWFjaChpID0+IHtcclxuICAgIGkoKTtcclxuICB9KTtcclxufSk7XHJcbmV4cG9ydCA9IGFkZDsiLCJjbGFzcyBMaXN0PGxpc3Q+IHtcclxuICAgIHByaXZhdGUgZGF0YTpPYmplY3Q7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgdGhpcy5kYXRhID0ge307XHJcbiAgICB9XHJcbiAgICBwdXNoKGluZGV4OnN0cmluZywgaXRlbTpsaXN0KSB7XHJcbiAgICAgICg8YW55PnRoaXMuZGF0YSlbaW5kZXhdID0gaXRlbTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShpbmRleDpzdHJpbmcsIGl0ZW06bGlzdCkge1xyXG4gICAgICAoPGFueT50aGlzLmRhdGEpW2luZGV4XSA9IGl0ZW07XHJcbiAgICB9XHJcbiAgICBnZXQoaW5kZXg6c3RyaW5nKTpsaXN0IHtcclxuICAgICAgcmV0dXJuICg8YW55PnRoaXMuZGF0YSlbaW5kZXhdO1xyXG4gICAgfVxyXG4gICAgZ2V0QWxsKCk6T2JqZWN0IHtcclxuICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcclxuICAgIH1cclxuICAgIHJlbW92ZShpbmRleDpzdHJpbmcpIHtcclxuICAgICAgZGVsZXRlICg8YW55PnRoaXMuZGF0YSlbaW5kZXhdO1xyXG4gICAgfVxyXG4gICAgY2xlYXIoKSB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IHt9O1xyXG4gICAgfVxyXG4gICAgY29udGFpbnMoaW5kZXg6c3RyaW5nKTpib29sZWFuIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZGF0YS5oYXNPd25Qcm9wZXJ0eShpbmRleCk7XHJcbiAgICB9XHJcbiAgICB0b1NpbXBsZSgpOk9iamVjdCB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRhdGE7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0ID0gTGlzdDsiLCJpbXBvcnQgZCA9IHJlcXVpcmUoXCIuL2RhdGFcIik7XHJcbmltcG9ydCBsaXN0ID0gcmVxdWlyZShcIi4vbGlzdFwiKTtcclxuaW1wb3J0IHBhY2tNYW5hZ2VyID0gcmVxdWlyZShcIi4vcGFja1V0aWwvcGFja01hbmFnZXJcIik7XHJcbmltcG9ydCBWZWN0b3IyID0gcmVxdWlyZShcIi4vdmVjdG9yMlwiKTtcclxuaW1wb3J0IGltYWdlID0gcmVxdWlyZShcIi4vaW1hZ2VcIik7XHJcbmZ1bmN0aW9uIG1ha2VEYXRhVXJsKCkge1xyXG4gIHZhciByZXN1bHQgPSBuZXcgbGlzdDxzdHJpbmc+KCk7XHJcbiAgdmFyIGJsb2NrTGlzdCA9IGQucGFjay5ibG9ja3MuZ2V0QWxsKCk7XHJcbiAgT2JqZWN0LmtleXMoYmxvY2tMaXN0KS5mb3JFYWNoKGkgPT4ge1xyXG4gICAgcmVzdWx0LnB1c2goaSwgaW1hZ2UocGFja01hbmFnZXIuZ2V0UGFja1BhdGgoZC5kZWZhdWx0UGFja05hbWUpICsgZC5wYWNrLmJsb2Nrcy5nZXQoaSkuZGF0YS5maWxlbmFtZSwgdHJ1ZSwgbmV3IFZlY3RvcjIoZC5kZWZhdWx0R3JpZFNpemUsIGQuZGVmYXVsdEdyaWRTaXplKSkuc3JjKTtcclxuICB9KTtcclxuICB2YXIgb2JqTGlzdCA9IGQucGFjay5vYmpzLmdldEFsbCgpO1xyXG4gIE9iamVjdC5rZXlzKG9iakxpc3QpLmZvckVhY2goaSA9PiB7XHJcbiAgICB2YXIgaXRlbSA9IGQucGFjay5vYmpzLmdldChpKS5kYXRhO1xyXG4gICAgcmVzdWx0LnB1c2goaSwgaW1hZ2UocGFja01hbmFnZXIuZ2V0UGFja1BhdGgoZC5kZWZhdWx0UGFja05hbWUpICsgaXRlbS5maWxlbmFtZSwgdHJ1ZSwgbmV3IFZlY3RvcjIoaXRlbS53aWR0aCwgaXRlbS5oZWlnaHQpKS5zcmMpO1xyXG4gIH0pO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuZXhwb3J0ID0gbWFrZURhdGFVcmw7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3MvZXM2LXByb21pc2UvZXM2LXByb21pc2UuZC50c1wiIC8+XHJcbmltcG9ydCBwYWNrTWFuYWdlciA9IHJlcXVpcmUoXCIuL3BhY2tNYW5hZ2VyXCIpO1xyXG5mdW5jdGlvbiBsb2FkKHBhY2tOYW1lOnN0cmluZykge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgIHhoci5vcGVuKFwiR0VUXCIsIHBhY2tNYW5hZ2VyLmdldFBhY2tQYXRoKHBhY2tOYW1lKSArIFwicGFja2luZm8uanNvblwiKTtcclxuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XHJcbiAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCAmJiB4aHIuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCkpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgeGhyLnNlbmQobnVsbCk7XHJcbiAgfSk7XHJcbn1cclxuZXhwb3J0ID0gbG9hZDsiLCJpbXBvcnQgbGlzdCA9IHJlcXVpcmUoXCIuLy4uL2xpc3RcIik7XHJcbm1vZHVsZSBwYWNrIHtcclxuICBleHBvcnQgZnVuY3Rpb24gZ2V0UGFja1BhdGgocGFja05hbWU6c3RyaW5nKSB7XHJcbiAgICByZXR1cm4gXCJwYWNrL1wiICsgcGFja05hbWUgKyBcIi9cIjtcclxuICB9XHJcbiAgXHJcbiAgZXhwb3J0IGNsYXNzIHBhY2tNb2R1bGUge1xyXG4gICAgcGFjazogcGFja0luZm87XHJcbiAgICBibG9ja3M6IGxpc3Q8YmxvY2tJbmZvPjtcclxuICAgIG9ianM6IGxpc3Q8b2JqSW5mbz47XHJcbiAgICBkZXNjcmlwdGlvbnM6IGxpc3Q8ZGVzSW5mbz47XHJcbiAgICBhYmlsaXRpZXM6YWJpbGl0eUluZm87XHJcbiAgICBza3lib3hlczpza3lib3hJbmZvTGlzdDtcclxuICAgIGVkaXRvcjpwYWNrRWRpdG9ySW5mbztcclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6T2JqZWN0KSB7XHJcbiAgICAgIHRoaXMucGFjayA9IG5ldyBwYWNrSW5mbygoPGFueT5kYXRhKVtcInBhY2tcIl0pO1xyXG4gICAgICB0aGlzLmJsb2NrcyA9IG5ldyBsaXN0PGJsb2NrSW5mbz4oKTtcclxuICAgICAgT2JqZWN0LmtleXMoKDxhbnk+ZGF0YSlbXCJibG9ja3NcIl0pLmZvckVhY2goaSA9PiB7XHJcbiAgICAgICAgdGhpcy5ibG9ja3MucHVzaChpLCBuZXcgYmxvY2tJbmZvKHsgYk5hbWU6ICg8YW55PmRhdGEpW1wiYmxvY2tzXCJdW2ldW1wibmFtZVwiXSwgZmlsZW5hbWU6ICg8YW55PmRhdGEpW1wiYmxvY2tzXCJdW2ldW1wiZmlsZW5hbWVcIl0gfSkpO1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5vYmpzID0gbmV3IGxpc3Q8b2JqSW5mbz4oKTtcclxuICAgICAgT2JqZWN0LmtleXMoKDxhbnk+ZGF0YSlbXCJvYmpzXCJdKS5mb3JFYWNoKGkgPT4ge1xyXG4gICAgICAgIHZhciBjdXIgPSAoPGFueT5kYXRhKVtcIm9ianNcIl1baV07XHJcbiAgICAgICAgaWYgKGN1cltcImhpZGRlblwiXSkge1xyXG4gICAgICAgICAgdGhpcy5vYmpzLnB1c2goaSwgbmV3IG9iakluZm8oeyBvTmFtZTogY3VyW1wibmFtZVwiXSwgZmlsZW5hbWU6IGN1cltcImZpbGVuYW1lXCJdLCB3aWR0aDogY3VyW1wid2lkdGhcIl0sIGhlaWdodDogY3VyW1wiaGVpZ2h0XCJdLCB0eXBlOiBjdXJbXCJ0eXBlXCJdfSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLm9ianMucHVzaChpLCBuZXcgb2JqSW5mbyh7IG9OYW1lOiBjdXJbXCJuYW1lXCJdLCBmaWxlbmFtZTogY3VyW1wiZmlsZW5hbWVcIl0sIHdpZHRoOiBjdXJbXCJ3aWR0aFwiXSwgaGVpZ2h0OiBjdXJbXCJoZWlnaHRcIl0sIHR5cGU6IGN1cltcInR5cGVcIl0sIGhpZGRlbjogY3VyW1wiaGlkZGVuXCJdIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmRlc2NyaXB0aW9ucyA9IG5ldyBsaXN0PGRlc0luZm8+KCk7XHJcbiAgICAgIE9iamVjdC5rZXlzKCg8YW55PmRhdGEpW1wiZGVzY3JpcHRpb25zXCJdKS5mb3JFYWNoKGkgPT4ge1xyXG4gICAgICAgIHZhciBjdXIgPSAoPGFueT5kYXRhKVtcImRlc2NyaXB0aW9uc1wiXVtpXTtcclxuICAgICAgICB0aGlzLmRlc2NyaXB0aW9ucy5wdXNoKGksIG5ldyBkZXNJbmZvKGN1cikpO1xyXG4gICAgICB9KTtcclxuICAgICAgdmFyIGExID0gbmV3IGxpc3Q8c3RyaW5nPigpO1xyXG4gICAgICBPYmplY3Qua2V5cygoPGFueT5kYXRhKVtcImFiaWxpdGllc1wiXVtcInNlbGVjdGVsZW1lbnRcIl0pLmZvckVhY2goaSA9PiB7XHJcbiAgICAgICAgYTEucHVzaChpLCAoPGFueT5kYXRhKVtcImFiaWxpdGllc1wiXVtcInNlbGVjdGVsZW1lbnRcIl1baV0pO1xyXG4gICAgICB9KTtcclxuICAgICAgdmFyIGEyID0gbmV3IGxpc3Q8c3RyaW5nPigpO1xyXG4gICAgICBPYmplY3Qua2V5cygoPGFueT5kYXRhKVtcImFiaWxpdGllc1wiXVtcImtleXNcIl0pLmZvckVhY2goaSA9PiB7XHJcbiAgICAgICAgYTIucHVzaChpLCAoPGFueT5kYXRhKVtcImFiaWxpdGllc1wiXVtcImtleXNcIl1baV0pO1xyXG4gICAgICB9KTtcclxuICAgICAgdmFyIGEzID0gbmV3IGxpc3Q8c3RyaW5nPigpO1xyXG4gICAgICBPYmplY3Qua2V5cygoPGFueT5kYXRhKVtcImFiaWxpdGllc1wiXVtcInR5cGVzXCJdKS5mb3JFYWNoKGkgPT4ge1xyXG4gICAgICAgIGEzLnB1c2goaSwgKDxhbnk+ZGF0YSlbXCJhYmlsaXRpZXNcIl1bXCJrZXlzXCJdW2ldKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuYWJpbGl0aWVzID0gbmV3IGFiaWxpdHlJbmZvKHtzZWxlY3RlbGVtZW50OiBhMSwga2V5czogYTIsIHR5cGVzOiBhM30pO1xyXG4gICAgICB0aGlzLnNreWJveGVzID0gbmV3IHNreWJveEluZm9MaXN0KCk7XHJcbiAgICAgIE9iamVjdC5rZXlzKCg8YW55PmRhdGEpW1wic2t5Ym94ZXNcIl0pLmZvckVhY2goaSA9PiB7XHJcbiAgICAgICAgdGhpcy5za3lib3hlcy5wdXNoKGksIG5ldyBza3lib3hJbmZvKCg8YW55PmRhdGEpW1wic2t5Ym94ZXNcIl1baV0pKTtcclxuICAgICAgfSlcclxuICAgICAgdGhpcy5lZGl0b3IgPSBuZXcgcGFja0VkaXRvckluZm8oKDxhbnk+ZGF0YSlbXCJlZGl0b3JcIl1bXCJkZWZhdWx0U2t5Ym94XCJdKTtcclxuICAgIH1cclxuICB9XHJcbiAgZXhwb3J0IGNsYXNzIHBhY2tFZGl0b3JJbmZvIHtcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZhdWx0U2t5Ym94OnN0cmluZykge31cclxuICB9XHJcbiAgZXhwb3J0IGNsYXNzIHBhY2tJbmZvIHtcclxuICAgIHBOYW1lOnN0cmluZztcclxuICAgIHZlcnNpb246c3RyaW5nO1xyXG4gICAgYXV0aG9yOnN0cmluZztcclxuICAgIGV4cG9ydFR5cGU6c3RyaW5nO1xyXG4gICAgY29uc3RydWN0b3IoZGF0YTpPYmplY3QpIHtcclxuICAgICAgdGhpcy5wTmFtZSA9ICg8YW55PmRhdGEpW1wibmFtZVwiXTtcclxuICAgICAgdGhpcy52ZXJzaW9uID0gKDxhbnk+ZGF0YSlbXCJ2ZXJzaW9uXCJdO1xyXG4gICAgICB0aGlzLmF1dGhvciA9ICg8YW55PmRhdGEpW1wiYXV0aG9yXCJdO1xyXG4gICAgICB0aGlzLmV4cG9ydFR5cGUgPSAoPGFueT5kYXRhKVtcImV4cG9ydFR5cGVcIl07XHJcbiAgICB9XHJcbiAgfVxyXG4gIGV4cG9ydCBjbGFzcyBwYWNrSXRlbTxUPiB7XHJcbiAgICBkYXRhOlQ7XHJcbiAgICBjb25zdHJ1Y3RvcihwOlQpIHtcclxuICAgICAgdGhpcy5kYXRhID0gcDtcclxuICAgIH1cclxuICB9XHJcbiAgZXhwb3J0IGludGVyZmFjZSBJQmxvY2tJbmZvIHtcclxuICAgIGJOYW1lOnN0cmluZztcclxuICAgIGZpbGVuYW1lOnN0cmluZztcclxuICB9XHJcbiAgZXhwb3J0IGNsYXNzIGJsb2NrSW5mbyBleHRlbmRzIHBhY2tJdGVtPElCbG9ja0luZm8+IHsgfVxyXG4gIGV4cG9ydCBpbnRlcmZhY2UgSU9iakluZm8ge1xyXG4gICAgb05hbWU6c3RyaW5nO1xyXG4gICAgZmlsZW5hbWU6c3RyaW5nO1xyXG4gICAgdHlwZTpzdHJpbmc7XHJcbiAgICB3aWR0aDpudW1iZXI7XHJcbiAgICBoZWlnaHQ6bnVtYmVyO1xyXG4gICAgaGlkZGVuPzpib29sZWFuO1xyXG4gIH1cclxuICBleHBvcnQgY2xhc3Mgb2JqSW5mbyBleHRlbmRzIHBhY2tJdGVtPElPYmpJbmZvPiB7IH1cclxuICBleHBvcnQgaW50ZXJmYWNlIElEZXNJbmZvIHtcclxuICAgIGRlc2NyaXB0aW9uOnN0cmluZztcclxuICAgIHR5cGU6c3RyaW5nO1xyXG4gIH1cclxuICBleHBvcnQgY2xhc3MgZGVzSW5mbyBleHRlbmRzIHBhY2tJdGVtPElEZXNJbmZvPiB7IH1cclxuICBleHBvcnQgaW50ZXJmYWNlIElBYmxpdHlJbmZvIHtcclxuICAgIHNlbGVjdGVsZW1lbnQ6IGxpc3Q8c3RyaW5nPjtcclxuICAgIGtleXM6IGxpc3Q8c3RyaW5nPjtcclxuICAgIHR5cGVzOiBsaXN0PHN0cmluZz47XHJcbiAgfVxyXG4gIGV4cG9ydCBjbGFzcyBhYmlsaXR5SW5mbyBleHRlbmRzIHBhY2tJdGVtPElBYmxpdHlJbmZvPiB7IH1cclxuICBleHBvcnQgaW50ZXJmYWNlIElTa3lib3hJbmZvIHtcclxuICAgIGZpbGVuYW1lOiBzdHJpbmc7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG4gIH1cclxuICBleHBvcnQgY2xhc3Mgc2t5Ym94SW5mbyBleHRlbmRzIHBhY2tJdGVtPElTa3lib3hJbmZvPiB7ICB9XHJcbiAgZXhwb3J0IGNsYXNzIHNreWJveEluZm9MaXN0IGV4dGVuZHMgbGlzdDxza3lib3hJbmZvPiB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuICAgIHRvU2ltcGxlKCk6T2JqZWN0IHtcclxuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLmdldEFsbCgpKS5mb3JFYWNoKGkgPT4ge1xyXG4gICAgICAgICg8YW55PnJlc3VsdClbdGhpcy5nZXQoaSkuZGF0YS5sYWJlbF0gPSBpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuZXhwb3J0ID0gcGFjazsiLCJpbXBvcnQgc3RhZ2UgPSByZXF1aXJlKFwiLi9zdGFnZVwiKTtcclxubW9kdWxlIHBsYW5ldCB7XHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydFRleHQoKTpzdHJpbmcge1xyXG4gICAgcmV0dXJuIFwiXCI7XHJcbiAgfVxyXG4gIGV4cG9ydCBmdW5jdGlvbiBpbXBvcnRUZXh0KGZpbGU6c3RyaW5nKSB7XHJcbiAgICByZXR1cm4gbmV3IHN0YWdlLlN0YWdlRWZmZWN0cygpO1xyXG4gIH1cclxuICBleHBvcnQgdmFyIGhlYWRlcjpzdHJpbmc7XHJcbiAgZXhwb3J0IHZhciBmb290ZXI6c3RyaW5nO1xyXG59XHJcbmV4cG9ydCA9IHBsYW5ldDsiLCJjbGFzcyBwcmVmYWIge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHVibGljIGdyaWRYOiBudW1iZXIsXHJcbiAgICBwdWJsaWMgZ3JpZFk6IG51bWJlcixcclxuICAgIHB1YmxpYyBmaWxlTmFtZTogc3RyaW5nLFxyXG4gICAgcHVibGljIGJsb2NrTmFtZTogc3RyaW5nLFxyXG4gICAgcHVibGljIGdyaWRXOiBudW1iZXIsXHJcbiAgICBwdWJsaWMgZ3JpZEg6IG51bWJlclxyXG4gICkgeyB9XHJcbn1cclxuZXhwb3J0ID0gcHJlZmFiOyIsImNsYXNzIHJlY3Qge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHVibGljIHg6bnVtYmVyLFxyXG4gICAgcHVibGljIHk6bnVtYmVyLFxyXG4gICAgcHVibGljIHdpZHRoOm51bWJlcixcclxuICAgIHB1YmxpYyBoZWlnaHQ6bnVtYmVyXHJcbiAgKSB7IH1cclxufVxyXG5leHBvcnQgPSByZWN0OyIsImltcG9ydCBsaXN0ID0gcmVxdWlyZShcIi4vbGlzdFwiKTtcclxuaW1wb3J0IHByZWZhYiA9IHJlcXVpcmUoXCIuL3ByZWZhYlwiKTtcclxuaW1wb3J0IGNhbnZhcyA9IHJlcXVpcmUoXCIuL2NhbnZhc1wiKTtcclxuaW1wb3J0IGdyaWQgPSByZXF1aXJlKFwiLi9ncmlkXCIpO1xyXG5pbXBvcnQgaW1hZ2UgPSByZXF1aXJlKFwiLi9pbWFnZVwiKTtcclxuaW1wb3J0IGQgPSByZXF1aXJlKFwiLi9kYXRhXCIpO1xyXG5pbXBvcnQgcmVjdCA9IHJlcXVpcmUoXCIuL3JlY3RcIik7XHJcbmltcG9ydCBldmVudCA9IHJlcXVpcmUoXCIuL2V2ZW50XCIpO1xyXG5cclxubW9kdWxlIHN0YWdlIHtcclxuICBleHBvcnQgY2xhc3MgU3RhZ2VFZmZlY3RzIHtcclxuICAgIHB1YmxpYyBza3lib3g6c3RyaW5nO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgIHRoaXMuc2t5Ym94ID0gXCJcIjtcclxuICAgIH1cclxuICB9XHJcbiAgZXhwb3J0IHZhciBzdGFnZUVmZmVjdHM6U3RhZ2VFZmZlY3RzID0gbmV3IFN0YWdlRWZmZWN0cygpO1xyXG4gIFxyXG4gIHZhciBwcmVmYWJMaXN0Omxpc3Q8cHJlZmFiPjtcclxuICBleHBvcnQgbW9kdWxlIGl0ZW1zIHtcclxuICAgIC8qKlxyXG4gICAgICogYWxpYXMgKHB1c2gpXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBhZGQoaWQ6bnVtYmVyLCBwOnByZWZhYikgeyBwdXNoKGlkLCBwKTsgfVxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHB1c2goaWQ6bnVtYmVyLCBwOnByZWZhYikge1xyXG4gICAgICBwcmVmYWJMaXN0LnB1c2goaWQudG9TdHJpbmcoKSwgcCk7XHJcbiAgICB9XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZ2V0QWxsKCkge1xyXG4gICAgICByZXR1cm4gcHJlZmFiTGlzdC5nZXRBbGwoKTtcclxuICAgIH1cclxuICAgIGV4cG9ydCBmdW5jdGlvbiByZW1vdmUoaWQ6bnVtYmVyKSB7XHJcbiAgICAgIHJldHVybiBwcmVmYWJMaXN0LnJlbW92ZShpZC50b1N0cmluZygpKTtcclxuICAgIH1cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBjbGVhcigpIHtcclxuICAgICAgcHJlZmFiTGlzdC5jbGVhcigpO1xyXG4gICAgfVxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdldChpZDpudW1iZXIpIHtcclxuICAgICAgcmV0dXJuIHByZWZhYkxpc3QuZ2V0KGlkLnRvU3RyaW5nKCkpO1xyXG4gICAgfVxyXG4gIH1cclxuICB2YXIgbWF4SWQ6bnVtYmVyO1xyXG4gIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICBwcmVmYWJMaXN0ID0gbmV3IGxpc3Q8cHJlZmFiPigpO1xyXG4gICAgbWF4SWQgPSAwO1xyXG4gIH1cclxuICBpbml0KCk7XHJcbiAgXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGdldElkKCkge1xyXG4gICAgcmV0dXJuIG1heElkKys7XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIHJlc2V0SWQoKSB7XHJcbiAgICBtYXhJZCA9IDA7XHJcbiAgfVxyXG4gIFxyXG4gIGV4cG9ydCBmdW5jdGlvbiByZW5kZXJTdGFnZSgpIHtcclxuICAgIGNhbnZhcy5jbGVhcigpO1xyXG4gICAgdmFyIGwgPSBpdGVtcy5nZXRBbGwoKTtcclxuICAgIE9iamVjdC5rZXlzKGwpLmZvckVhY2goaSA9PiB7XHJcbiAgICAgIHZhciBpdGVtID0gaXRlbXMuZ2V0KHBhcnNlSW50KGkpKTtcclxuICAgICAgdmFyIHggPSBncmlkLnNjcm9sbFggKyBncmlkLmdldE1vdXNlUG9zRnJvbUNlbnRlckFuZFNpemUoZ3JpZC50b01vdXNlUG9zKGl0ZW0uZ3JpZFgpLCBncmlkLnRvTW91c2VQb3MoaXRlbS5ncmlkVykpO1xyXG4gICAgICB2YXIgeSA9IGdyaWQuc2Nyb2xsWSArIGdyaWQuZ2V0TW91c2VQb3NGcm9tQ2VudGVyQW5kU2l6ZShncmlkLnRvTW91c2VQb3MoaXRlbS5ncmlkWSksIGdyaWQudG9Nb3VzZVBvcyhpdGVtLmdyaWRIKSk7XHJcbiAgICAgIHZhciB3aWR0aCA9IGdyaWQudG9Nb3VzZVBvcyhpdGVtLmdyaWRXKTtcclxuICAgICAgdmFyIGhlaWdodCA9IGdyaWQudG9Nb3VzZVBvcyhpdGVtLmdyaWRIKTtcclxuICAgICAgLy8g55S76Z2i5YaF44Gr5YWl44Gj44Gm44GE44KL44GLXHJcbiAgICAgIGlmICh4ICsgd2lkdGggPj0gMCAmJiB4IDw9IGNhbnZhcy5jYW52YXNSZWN0LndpZHRoICYmXHJcbiAgICAgIHkgKyBoZWlnaHQgPj0gMCAmJiB4IDw9IGNhbnZhcy5jYW52YXNSZWN0LmhlaWdodCkge1xyXG4gICAgICAgIGNhbnZhcy5yZW5kZXIoaW1hZ2UoZC50cmF5SXRlbURhdGFVUkxzLmdldChpdGVtLmJsb2NrTmFtZSkpLCBuZXcgcmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICB2YXIgaXNSZXNpemVSZXF1ZXN0ID0gZmFsc2U7XHJcbiAgdmFyIHJlc2l6ZVRpbWVySWQ6bnVtYmVyO1xyXG4gIGV2ZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xyXG4gICAgaWYgKGlzUmVzaXplUmVxdWVzdCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQocmVzaXplVGltZXJJZCk7XHJcbiAgICB9XHJcbiAgICBpc1Jlc2l6ZVJlcXVlc3QgPSB0cnVlO1xyXG4gICAgcmVzaXplVGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpc1Jlc2l6ZVJlcXVlc3QgPSBmYWxzZTtcclxuICAgICAgcmVuZGVyU3RhZ2UoKTtcclxuICAgIH0sIDEwMCk7XHJcbiAgfSk7XHJcbn1cclxuZXhwb3J0ID0gc3RhZ2U7IiwiaW1wb3J0IGQgPSByZXF1aXJlKFwiLi9kYXRhXCIpO1xyXG5pbXBvcnQgaW1hZ2UgPSByZXF1aXJlKFwiLi9pbWFnZVwiKTtcclxuXHJcbm1vZHVsZSB0cmF5IHtcclxuICBleHBvcnQgY2xhc3MgVHJheUJsb2NrRGV0YWlscyB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgcHVibGljIGJsb2NrTmFtZTpzdHJpbmcsXHJcbiAgICAgIHB1YmxpYyBmaWxlTmFtZTpzdHJpbmcsXHJcbiAgICAgIHB1YmxpYyBsYWJlbDpzdHJpbmcsIC8vIOihqOekuuOBmeOCi+OBqOOBjeOBruODluODreODg+OCr+WQjVxyXG4gICAgICBwdWJsaWMgd2lkdGg6bnVtYmVyLFxyXG4gICAgICBwdWJsaWMgaGVpZ2h0Om51bWJlclxyXG4gICAgKSB7IH1cclxuICB9XHJcbiAgZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUFjdGl2ZUJsb2NrKGJsb2NrTmFtZTpzdHJpbmcsIGZpbGVOYW1lOnN0cmluZywgbGFiZWw6c3RyaW5nLCB3aWR0aD86bnVtYmVyLCBoZWlnaHQ/Om51bWJlcikge1xyXG4gICAgaWYgKCF3aWR0aCkgd2lkdGggPSBkLmRlZmF1bHRCbG9ja1NpemU7XHJcbiAgICBpZiAoIWhlaWdodCkgaGVpZ2h0ID0gZC5kZWZhdWx0QmxvY2tTaXplO1xyXG4gICAgZC5zZWxlY3RCbG9jayA9IG5ldyBUcmF5QmxvY2tEZXRhaWxzKGJsb2NrTmFtZSwgZmlsZU5hbWUsIGxhYmVsLCB3aWR0aCwgaGVpZ2h0KTtcclxuICB9XHJcbiAgZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNlbGVjdEltYWdlKCkge1xyXG4gICAgLy9kLnNlbGVjdEltYWdlID0gXHJcbiAgfVxyXG59XHJcbmV4cG9ydCA9IHRyYXk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvZXM2LXByb21pc2UvZXM2LXByb21pc2UuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0ZWx5L21vdmUuZC50c1wiIC8+XHJcbmltcG9ydCBpbml0RE9NID0gcmVxdWlyZShcIi4vaW5pdERPTVwiKTtcclxuaW1wb3J0IGV2ZW50ID0gcmVxdWlyZShcIi4vZXZlbnRcIik7XHJcbmltcG9ydCBvSSA9IHJlcXVpcmUoXCIuL29iakluZGV4XCIpO1xyXG5pbXBvcnQgZWwgPSByZXF1aXJlKFwiLi9lbGVtXCIpO1xyXG5pbXBvcnQgY29tcGlsZXIgPSByZXF1aXJlKFwiLi9jb21waWxlclwiKTtcclxuaW1wb3J0IGltcG9ydEpTID0gcmVxdWlyZShcIi4vaW1wb3J0SlNcIik7XHJcbmltcG9ydCBkID0gcmVxdWlyZShcIi4vZGF0YVwiKTtcclxuaW1wb3J0IHUgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xyXG5pbXBvcnQgbGlzdCA9IHJlcXVpcmUoXCIuL2xpc3RcIik7XHJcbmltcG9ydCBncmlkID0gcmVxdWlyZShcIi4vZ3JpZFwiKTtcclxuaW1wb3J0IFZlY3RvcjIgPSByZXF1aXJlKFwiLi92ZWN0b3IyXCIpO1xyXG5pbXBvcnQgdHJheSA9IHJlcXVpcmUoXCIuL3RyYXlcIik7XHJcbmltcG9ydCBwYWNrTWFuYWdlciA9IHJlcXVpcmUoXCIuL3BhY2tVdGlsL3BhY2tNYW5hZ2VyXCIpO1xyXG5pbXBvcnQgcGxhbmV0ID0gcmVxdWlyZShcIi4vcGxhbmV0XCIpO1xyXG5pbXBvcnQgc3RhZ2UgPSByZXF1aXJlKFwiLi9zdGFnZVwiKTtcclxuXHJcbm1vZHVsZSB1aSB7XHJcbiAgZXhwb3J0IHZhciBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50OyBcclxuICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xyXG4gICAgICBldmVudC5yYWlzZUV2ZW50KFwicmVzaXplXCIsIG51bGwpO1xyXG4gICAgfSk7XHJcbiAgICBldmVudC5hZGRFdmVudExpc3RlbmVyKFwidWlfY2xpY2tUcmF5XCIsIChlOk1vdXNlRXZlbnQpID0+IHtcclxuICAgICAgdmFyIHRhcmdldCA9IDxIVE1MSW1hZ2VFbGVtZW50PmUudGFyZ2V0O1xyXG4gICAgICBkLmlzT2JqTW9kZSA9IHRhcmdldC5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcInRyYXktbGlzdC1vYmpcIik7XHJcbiAgICAgIGlmICghZC5pc09iak1vZGUpIHtcclxuICAgICAgICBsZXQgaXRlbSA9IGQucGFjay5ibG9ja3MuZ2V0KHRhcmdldC5kYXRhc2V0W1wiYmxvY2tcIl0pLmRhdGE7XHJcbiAgICAgICAgdHJheS51cGRhdGVBY3RpdmVCbG9jayh0YXJnZXQuZGF0YXNldFtcImJsb2NrXCJdLCBpdGVtLmZpbGVuYW1lLCBpdGVtLmJOYW1lKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgaXRlbSA9IGQucGFjay5vYmpzLmdldCh0YXJnZXQuZGF0YXNldFtcImJsb2NrXCJdKS5kYXRhO1xyXG4gICAgICAgIHRyYXkudXBkYXRlQWN0aXZlQmxvY2sodGFyZ2V0LmRhdGFzZXRbXCJibG9ja1wiXSwgaXRlbS5maWxlbmFtZSwgaXRlbS5vTmFtZSwgaXRlbS53aWR0aCwgaXRlbS5oZWlnaHQpO1xyXG4gICAgICB9XHJcbiAgICAgIGNoYW5nZUFjdGl2ZUJsb2NrKHRhcmdldC5kYXRhc2V0W1wiYmxvY2tcIl0pO1xyXG4gICAgfSk7XHJcbiAgICBldmVudC5hZGRFdmVudExpc3RlbmVyKFwidWlfbW91c2Vkb3duQ2FudmFzfHVpX21vdXNlbW92ZWFuZGRvd25DYW52YXN8dWlfbW91c2V1cENhbnZhc1wiLCAoZTpNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAgIHZhciBnID0gZ3JpZC5nZXRHcmlkUG9zRnJvbU1vdXNlUG9zKG5ldyBWZWN0b3IyKGUuY2xpZW50WCwgZS5jbGllbnRZKSk7XHJcbiAgICAgIGV2ZW50LnJhaXNlRXZlbnQoXCJncmlkQ2FudmFzXCIsIG5ldyBncmlkLmdyaWREZXRhaWwoZywgZS50eXBlLCBuZXcgVmVjdG9yMihlLmNsaWVudFgsIGUuY2xpZW50WSkpKTtcclxuICAgIH0pO1xyXG4gICAgZXZlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImluaXRlZFBhY2tcIiwgKCkgPT4ge1xyXG4gICAgICAoPEhUTUxTZWxlY3RFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RnLXNreWJveFwiKSkudmFsdWUgPSBkLnBhY2suZWRpdG9yLmRlZmF1bHRTa3lib3g7XHJcbiAgICAgIGVsLmZvckVhY2hmb3JRdWVyeShcIi5wYWNrLXNlbGVjdFwiLCAoaSkgPT4ge1xyXG4gICAgICAgIHZhciBlbGVtID0gPEhUTUxTZWxlY3RFbGVtZW50Pmk7XHJcbiAgICAgICAgZWxlbS5pbm5lckhUTUwgPSB1Lm9iajJTZWxlY3RFbGVtKCg8bGlzdDxhbnk+Pig8YW55PmQucGFjaylbZWxlbS5kYXRhc2V0W1wiaXRlbXNcIl1dKS50b1NpbXBsZSgpKTtcclxuICAgICAgICBpZiAoZWxlbS5kYXRhc2V0W1wiY2hhbmdlXCJdKSB7XHJcbiAgICAgICAgICBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKDxhbnk+dWkpW2VsZW0uZGF0YXNldFtcImNoYW5nZVwiXV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZWxlbS5kYXRhc2V0W1wiZGVmYXVsdFwiXSkge1xyXG4gICAgICAgICAgZWxlbS52YWx1ZSA9IGVsZW0uZGF0YXNldFtcImRlZmF1bHRcIl07XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgLy8gb25CdG5DbGlja2hhbmRsZXJMaXN0ID0gbmV3IEFycmF5PCh0YXJnZXQ6Tm9kZSxlOk1vdXNlRXZlbnQpPT52b2lkPigpO1xyXG4gIH1cclxuICAvLyB2YXIgb25CdG5DbGlja2hhbmRsZXJMaXN0OkFycmF5PCh0YXJnZXQ6Tm9kZSxlOk1vdXNlRXZlbnQpPT52b2lkPjtcclxuICAvLyBleHBvcnQgZnVuY3Rpb24gb25CdG5DbGljayhmbjoodGFyZ2V0Ok5vZGUsZTpNb3VzZUV2ZW50KT0+dm9pZCkge1xyXG4gIC8vICAgb25CdG5DbGlja2hhbmRsZXJMaXN0LnB1c2goZm4pO1xyXG4gIC8vIH1cclxuICBpbml0RE9NKCgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidHJheS1mdWxsc2NyZWVuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0b2dnbGVmdWxsU2NyZWVuKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5zLWNsb3NlXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZUluc3BlY3Rvcik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlvLWV4cG9ydFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xpY2tFeHBvcnQpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpby1pbXBvcnRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsaWNrSW1wb3J0KTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXJmb3JRdWVyeShcIi5pbnMtc2hvdy1idG5cIiwgXCJjbGlja1wiLCBjbGlja0luc1Nob3dCdG4pO1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcmZvclF1ZXJ5KFwiLmlvLWhmXCIsIFwiY2hhbmdlXCIsIGNoYW5nZUhlYWRlcm9yRm9vdGVyVmFsdWUpO1xyXG4gICAgKDxIVE1MVGV4dEFyZWFFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udi1uZXdcIikpLnZhbHVlID0gXCJcIjtcclxuICAgICg8SFRNTFRleHRBcmVhRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnYtb2xkXCIpKS52YWx1ZSA9IFwiXCI7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnZcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgKDxIVE1MVGV4dEFyZWFFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udi1uZXdcIikpLnZhbHVlID0gXHJcbiAgICAgICAgY29tcGlsZXIuY29udmVydE9sZEZpbGUoKDxIVE1MVGV4dEFyZWFFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udi1vbGRcIikpLnZhbHVlKTtcclxuICAgIH0pO1xyXG4gICAgKDxIVE1MVGV4dEFyZWFFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxhLWlvXCIpKS52YWx1ZSA9IFwiXCI7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyZm9yUXVlcnkoXCIudHJheS1saXN0LXRvb2xcIiwgXCJjbGlja1wiLCBjbGlja1RyYXlUb29sKTtcclxuICAgIFxyXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChpbXBvcnRKUyhcImJvd2VyX2NvbXBvbmVudHMvbW92ZS5qcy9tb3ZlLmpzXCIpKTtcclxuICAgIFxyXG4gICAgZXZlbnQucmFpc2VFdmVudChcImluaXREb21cIiwgbnVsbCk7XHJcbiAgICAvLyB2YXIgZWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnVpLWJ0blwiKTtcclxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgIC8vICAgKDxOb2RlPmVsZW1zLml0ZW0oaSkpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZTpNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAvLyAgICAgb25CdG5DbGlja2hhbmRsZXJMaXN0LmZvckVhY2goaiA9PiB7XHJcbiAgICAvLyAgICAgICBqKGVsZW1zLml0ZW0oaSksIGUpO1xyXG4gICAgLy8gICAgIH0pO1xyXG4gICAgLy8gICB9KTtcclxuICAgIC8vIH1cclxuICB9KTtcclxuICBcclxuICBleHBvcnQgZnVuY3Rpb24gc2V0dXBDYW52YXMoKSB7XHJcbiAgICBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGEtY2FudmFzXCIpO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IHtcclxuICAgICAgZXZlbnQucmFpc2VFdmVudChcInVpX21vdXNlZG93bkNhbnZhc1wiLCBlKTtcclxuICAgIH0pO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGUpID0+IHtcclxuICAgICAgaWYgKGUuYnV0dG9ucyA9PT0gMSkge1xyXG4gICAgICAgIGV2ZW50LnJhaXNlRXZlbnQoXCJ1aV9tb3VzZW1vdmVhbmRkb3duQ2FudmFzXCIsIGUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZSkgPT4ge1xyXG4gICAgICBldmVudC5yYWlzZUV2ZW50KFwidWlfbW91c2V1cENhbnZhc1wiLCBlKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBleHBvcnQgZnVuY3Rpb24gdG9nZ2xlZnVsbFNjcmVlbihlOk1vdXNlRXZlbnQpIHtcclxuICAgIGlmICghZC5pc0Z1bGxzY3JlZW5UcmF5KSB7XHJcbiAgICAgIGNsb3NlSW5zcGVjdG9yKCk7XHJcbiAgICAgIG1vdmUoXCIucGxhLWZvb3RlclwiKS5zZXQoXCJoZWlnaHRcIiwgXCIxMDAlXCIpLmR1cmF0aW9uKFwiMC41c1wiKS5lbmQoKTtcclxuICAgICAgKDxIVE1MRWxlbWVudD5lLnRhcmdldCkudGV4dENvbnRlbnQgPSBcIuKGk1wiO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbW92ZShcIi5wbGEtZm9vdGVyXCIpLnNldChcImhlaWdodFwiLCBcIjUwcHhcIikuZHVyYXRpb24oXCIwLjVzXCIpLmVuZCgpO1xyXG4gICAgICAoPEhUTUxFbGVtZW50PmUudGFyZ2V0KS50ZXh0Q29udGVudCA9IFwi4oaRXCI7XHJcbiAgICB9XHJcbiAgICBkLmlzRnVsbHNjcmVlblRyYXkgPSAhZC5pc0Z1bGxzY3JlZW5UcmF5O1xyXG4gIH1cclxuICBcclxuICBleHBvcnQgZnVuY3Rpb24gY2xvc2VJbnNwZWN0b3IoKSB7XHJcbiAgICBpZiAoIWQuaXNTaG93SW5zcGVjdG9yKSByZXR1cm47XHJcbiAgICBkLmlzU2hvd0luc3BlY3RvciA9IGZhbHNlO1xyXG4gICAgbW92ZShcIi5wbGEtaW5zcGVjdG9yXCIpXHJcbiAgICAgIC5zZXQoXCJsZWZ0XCIsIFwiMTAwJVwiKVxyXG4gICAgICAuZHVyYXRpb24oXCIwLjVzXCIpXHJcbiAgICAgIC5lbmQoKTtcclxuICB9XHJcbiAgZXhwb3J0IGZ1bmN0aW9uIHNob3dJbnNwZWN0b3IoaW5zcGVjdG9yTmFtZTpzdHJpbmcpIHtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5zLWFydGljbGUtYWN0aXZlXCIpICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5zLWFydGljbGUtYWN0aXZlXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJpbnMtYXJ0aWNsZS1hY3RpdmVcIik7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlucy1cIiArIGluc3BlY3Rvck5hbWUpLmNsYXNzTGlzdC5hZGQoXCJpbnMtYXJ0aWNsZS1hY3RpdmVcIik7XHJcbiAgICBpZiAoZC5pc1Nob3dJbnNwZWN0b3IpIHJldHVybjtcclxuICAgIGQuaXNTaG93SW5zcGVjdG9yID0gdHJ1ZTtcclxuICAgIG1vdmUoXCIucGxhLWluc3BlY3RvclwiKVxyXG4gICAgICAuc2V0KFwibGVmdFwiLCBcIjgwJVwiKVxyXG4gICAgICAuZHVyYXRpb24oXCIwLjVzXCIpXHJcbiAgICAgIC5lbmQoKTtcclxuICB9XHJcbiAgXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGNsaWNrRXhwb3J0KCkge1xyXG4gICAgKDxIVE1MVGV4dEFyZWFFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxhLWlvXCIpKS52YWx1ZSA9IHBsYW5ldC5leHBvcnRUZXh0KCk7XHJcbiAgfVxyXG4gIGV4cG9ydCBmdW5jdGlvbiBjbGlja0ltcG9ydCgpIHtcclxuICAgIHZhciBlZmZlY3RzID0gcGxhbmV0LmltcG9ydFRleHQoKDxIVE1MVGV4dEFyZWFFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxhLWlvXCIpKS52YWx1ZSk7XHJcbiAgICBzdGFnZS5zdGFnZUVmZmVjdHMgPSBlZmZlY3RzO1xyXG4gICAgY29uc29sZS5sb2coZWZmZWN0cy5za3lib3gpO1xyXG4gICAgc2V0U2t5Ym94KGQucGFjay5za3lib3hlcy5nZXQoZWZmZWN0cy5za3lib3gpLmRhdGEuZmlsZW5hbWUpO1xyXG4gICAgc3RhZ2UucmVuZGVyU3RhZ2UoKTtcclxuICB9XHJcbiAgXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGNsaWNrSW5zU2hvd0J0bihlOk1vdXNlRXZlbnQpIHtcclxuICAgIHNob3dJbnNwZWN0b3IoKDxIVE1MRWxlbWVudD5lLnRhcmdldCkuZGF0YXNldFtcImluc1wiXSk7XHJcbiAgfVxyXG4gIFxyXG4gIGV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VIZWFkZXJvckZvb3RlclZhbHVlKGU6TW91c2VFdmVudCkge1xyXG4gICAgdmFyIGVsZW0gPSA8SFRNTFRleHRBcmVhRWxlbWVudD5lLnRhcmdldDtcclxuICAgIGlmIChlbGVtLmlkID09PSBcImlvLWhlYWRlclwiKSB7XHJcbiAgICAgIHBsYW5ldC5oZWFkZXIgPSBlbGVtLnZhbHVlO1xyXG4gICAgfSBlbHNlIGlmIChlbGVtLmlkID09PSBcImlvLWZvb3RlclwiKSB7XHJcbiAgICAgIHBsYW5ldC5mb290ZXIgPSBlbGVtLnZhbHVlO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBleHBvcnQgZnVuY3Rpb24gY2xpY2tUcmF5VG9vbChlOk1vdXNlRXZlbnQpIHtcclxuICAgIHZhciBlbGVtID0gPEhUTUxFbGVtZW50PmUudGFyZ2V0O1xyXG4gICAgaWYgKGVsZW0ubm9kZU5hbWUgPT09IFwiSVwiKSB7XHJcbiAgICAgIGVsZW0gPSBlbGVtLnBhcmVudEVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBpZiAoZWxlbS5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sLWJ0blwiKSkge1xyXG4gICAgICBldmVudC5yYWlzZUV2ZW50KFwiY2xpY2tUcmF5VG9vbGJ0blwiLCBlbGVtLmRhdGFzZXRbXCJ0b29sbmFtZVwiXSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgICg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRvb2wtYWN0aXZlXCIpWzBdKS5jbGFzc0xpc3QucmVtb3ZlKFwidG9vbC1hY3RpdmVcIik7XHJcbiAgICBlbGVtLmNsYXNzTGlzdC5hZGQoXCJ0b29sLWFjdGl2ZVwiKTtcclxuICAgIGQuYWN0aXZlVG9vbE5hbWUgPSBlbGVtLmRhdGFzZXRbXCJ0b29sbmFtZVwiXTtcclxuICB9XHJcbiAgXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIHNldFNreWJveChmaWxlTmFtZTpzdHJpbmcpIHtcclxuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gYHVybCgnJHtmaWxlTmFtZX0nKWA7IFxyXG4gIH1cclxuICBcclxuICBleHBvcnQgZnVuY3Rpb24gaW5pdFRyYXlCbG9jaygpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICB2YXIgYmxvY2tzID0gZC5wYWNrLmJsb2Nrcy5nZXRBbGwoKTtcclxuICAgICAgdmFyIHVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRyYXktaXRlbXNcIilbMF07XHJcbiAgICAgIHZhciBsaXN0ID0gT2JqZWN0LmtleXMoYmxvY2tzKTtcclxuICAgICAgdmFyIGFzeW5jID0gKGk6IG51bWJlcikgPT4ge1xyXG4gICAgICAgIHZhciBpdGVtID0gbGlzdFtpXTtcclxuICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJ0cmF5LWxpc3RcIiwgXCJ0cmF5LWxpc3QtYmxvY2tcIik7XHJcbiAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7IGV2ZW50LnJhaXNlRXZlbnQoXCJ1aV9jbGlja1RyYXlcIiwgZSk7IH0pO1xyXG4gICAgICAgIHZhciBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xyXG4gICAgICAgIGltZy5zcmMgPSBwYWNrTWFuYWdlci5nZXRQYWNrUGF0aChkLmRlZmF1bHRQYWNrTmFtZSkgKyBkLnBhY2suYmxvY2tzLmdldChpdGVtKS5kYXRhLmZpbGVuYW1lO1xyXG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICBpbWcuYWx0ID0gZC5wYWNrLmJsb2Nrcy5nZXQoaXRlbSkuZGF0YS5iTmFtZTtcclxuICAgICAgICAgIGltZy5kYXRhc2V0W1wiYmxvY2tcIl0gPSBpdGVtO1xyXG4gICAgICAgICAgbGkuYXBwZW5kQ2hpbGQoaW1nKTtcclxuICAgICAgICAgIHVsLmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICAgIGlmIChpID09PSBsaXN0Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2hhbmdlTG9hZGluZ1N0YXR1cyhcImxvYWRpbmcgdHJheSA6IFwiICsgaS50b1N0cmluZygpICsgXCIgLyBcIiArIChsaXN0Lmxlbmd0aCAtIDEpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICBhc3luYyhpICsgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICBhc3luYygwKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBleHBvcnQgZnVuY3Rpb24gaW5pdFRyYXlPYmooKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgdmFyIG9ianMgPSBkLnBhY2sub2Jqcy5nZXRBbGwoKTtcclxuICAgICAgdmFyIHVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRyYXktaXRlbXNcIilbMF07XHJcbiAgICAgIHZhciBsaXN0ID0gT2JqZWN0LmtleXMob2Jqcyk7XHJcbiAgICAgIHZhciBhc3luYyA9IChpOiBudW1iZXIpID0+IHtcclxuICAgICAgICB2YXIgaXRlbSA9IGxpc3RbaV07XHJcbiAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKFwidHJheS1saXN0XCIsIFwidHJheS1saXN0LW9ialwiKTtcclxuICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHsgZXZlbnQucmFpc2VFdmVudChcInVpX2NsaWNrVHJheVwiLCBlKTsgfSk7XHJcbiAgICAgICAgdmFyIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XHJcbiAgICAgICAgaW1nLnNyYyA9IHBhY2tNYW5hZ2VyLmdldFBhY2tQYXRoKGQuZGVmYXVsdFBhY2tOYW1lKSArIGQucGFjay5vYmpzLmdldChpdGVtKS5kYXRhLmZpbGVuYW1lO1xyXG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICBpbWcuYWx0ID0gZC5wYWNrLm9ianMuZ2V0KGl0ZW0pLmRhdGEub05hbWU7XHJcbiAgICAgICAgICBpbWcuZGF0YXNldFtcImJsb2NrXCJdID0gaXRlbTtcclxuICAgICAgICAgIGxpLnN0eWxlLndpZHRoID0gaW1nLnN0eWxlLndpZHRoID1cclxuICAgICAgICAgICAgZC5wYWNrLm9ianMuZ2V0KGl0ZW0pLmRhdGEud2lkdGggLyAoZC5wYWNrLm9ianMuZ2V0KGl0ZW0pLmRhdGEuaGVpZ2h0IC8gNTApICsgXCJweFwiO1xyXG4gICAgICAgICAgbGkuc3R5bGUuaGVpZ2h0ID0gaW1nLnN0eWxlLmhlaWdodCA9IFwiNTBweFwiO1xyXG4gICAgICAgICAgbGkuYXBwZW5kQ2hpbGQoaW1nKTtcclxuICAgICAgICAgIHVsLmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICAgIGlmIChpID09PSBsaXN0Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgLy9ldi5yYWlzZUV2ZW50KFwiaW5pdGVkVHJheVwiLCBudWxsKTtcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2hhbmdlTG9hZGluZ1N0YXR1cyhcImxvYWRpbmcgdHJheS1vYmogOiBcIiArIGkudG9TdHJpbmcoKSArIFwiIC8gXCIgKyAobGlzdC5sZW5ndGggLSAxKS50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgYXN5bmMoaSArIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBhc3luYygwKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBleHBvcnQgZnVuY3Rpb24gY2hhbmdlTG9hZGluZ1N0YXR1cyhzdGF0dXM6c3RyaW5nKSB7XHJcbiAgICAoPEhUTUxFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJsb2FkaW5nXCIpWzBdKS5pbm5lckhUTUwgPSBcIkxvYWRpbmcuLi48YnIgLz5cIiArIHN0YXR1cztcclxuICB9XHJcbiAgXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGhpZGVMb2FkaW5nKCkge1xyXG4gICAgdmFyIGVsZW0gPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImxvYWRpbmdcIilbMF07XHJcbiAgICBtb3ZlKFwiLmxvYWRpbmdcIilcclxuICAgICAgLnNldChcIm9wYWNpdHlcIiwgMClcclxuICAgICAgLmR1cmF0aW9uKFwiMXNcIilcclxuICAgICAgLnRoZW4oKVxyXG4gICAgICAuc2V0KFwiZGlzcGxheVwiLCBcIm5vbmVcIilcclxuICAgICAgLnBvcCgpXHJcbiAgICAgIC5lbmQoKTtcclxuICB9XHJcbiAgXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGNoYW5nZUFjdGl2ZUJsb2NrKGJsb2NrTmFtZTpzdHJpbmcpIHtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudHJheS1hY3RpdmVcIikgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50cmF5LWFjdGl2ZVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwidHJheS1hY3RpdmVcIik7XHJcbiAgICAoPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWJsb2NrPVwiJHtibG9ja05hbWV9XCJdYCkpLmNsYXNzTGlzdC5hZGQoXCJ0cmF5LWFjdGl2ZVwiKTtcclxuICB9XHJcbiBcclxuICBldmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tUcmF5VG9vbGJ0blwiLCAobmFtZTpzdHJpbmcpID0+IHtcclxuICAgIHZhciBidG5OYW1lMkluc3BlY3Rvck5hbWU6b0kgPSB7XHJcbiAgICAgIFwiaW9cIjogXCJpb1wiLFxyXG4gICAgICBcInNldHRpbmdcIjogXCJpbnNwZWN0b3JcIlxyXG4gICAgfTtcclxuICAgIHVpLnNob3dJbnNwZWN0b3IoYnRuTmFtZTJJbnNwZWN0b3JOYW1lW25hbWVdKTtcclxuICB9KTtcclxuICBcclxuICBleHBvcnQgZnVuY3Rpb24gc3RhcnRVSVdhaXRNb2RlKCkge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGEtY2FudmFzXCIpLnN0eWxlLmN1cnNvciA9IFwid2FpdFwiO1xyXG4gIH1cclxuICBleHBvcnQgZnVuY3Rpb24gZW5kVUlXYWl0TW9kZSgpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxhLWNhbnZhc1wiKS5zdHlsZS5jdXJzb3IgPSBcImNyb3NzaGFpclwiO1xyXG4gIH1cclxuICBcclxuICBleHBvcnQgZnVuY3Rpb24gY2hhbmdlU2t5Ym94KGU6RXZlbnQpIHtcclxuICAgIHN0YWdlLnN0YWdlRWZmZWN0cy5za3lib3ggPSAoPEhUTUxTZWxlY3RFbGVtZW50PmUudGFyZ2V0KS52YWx1ZTtcclxuICAgIHNldFNreWJveChkLnBhY2suc2t5Ym94ZXMuZ2V0KHN0YWdlLnN0YWdlRWZmZWN0cy5za3lib3gpLmRhdGEuZmlsZW5hbWUpO1xyXG4gIH1cclxuICBpbml0KCk7XHJcbn1cclxuZXhwb3J0ID0gdWk7XHJcbiIsIm1vZHVsZSB1dGlsIHtcclxuICBpbnRlcmZhY2Ugb0kge1xyXG4gICAgW2luZGV4OiBzdHJpbmddOmFueTtcclxuICB9XHJcbiAgZXhwb3J0IGZ1bmN0aW9uIG9iajJTZWxlY3RFbGVtKG9iajpvSSkge1xyXG4gICAgdmFyIHJlc3VsdDpBcnJheTxzdHJpbmc+ID0gW107XHJcbiAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goaSA9PiB7XHJcbiAgICAgIGlmIChvYmpbaV0uY29uc3RydWN0b3IgPT09IHt9LmNvbnN0cnVjdG9yKSB7XHJcbiAgICAgICAgcmVzdWx0LnB1c2goJzxvcHRncm91cCBsYWJlbD1cIicgKyBpICsgJ1wiPicpO1xyXG4gICAgICAgIHJlc3VsdC5wdXNoKG9iajJTZWxlY3RFbGVtKDxvST5vYmpbaV0pKTtcclxuICAgICAgICByZXN1bHQucHVzaCgnPC9vcHRncm91cD4nKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXN1bHQucHVzaCgnPG9wdGlvbiB2YWx1ZT1cIicgKyBvYmpbaV0gKyAnXCI+JyArIGkgKyAnPC9vcHRpb24+Jyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlc3VsdC5qb2luKFwiXFxuXCIpO1xyXG4gIH1cclxufVxyXG5leHBvcnQgPSB1dGlsOyIsImNsYXNzIFZlY3RvcjIge1xyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB4Om51bWJlciwgcHVibGljIHk6bnVtYmVyKSB7IH07XHJcbiAgc3RhdGljIGdldCB6ZXJvKCkge1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKDAsIDApO1xyXG4gIH1cclxufVxyXG5leHBvcnQgPSBWZWN0b3IyO1xyXG4iXX0=
