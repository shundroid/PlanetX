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
        d.pack = new packManager.packModule({});
        d.defaultGridSize = 25;
        d.defaultBlockSize = 50;
        d.activeToolName = "pencil";
    }
    init();
    initDOM(function () {
        packLoader(d.defaultPackName).then(function (i) {
            d.pack = new packManager.packModule(i);
            event.raiseEvent("packLoaded", null);
            stage.stageEffects.skybox = d.pack.editor.defaultSkybox;
            ui.setSkybox(packManager.getPackPath(d.defaultPackName) + d.pack.skyboxes.get(d.pack.editor.defaultSkybox).data.filename);
            ui.initUI();
            event.raiseEvent("initedUI", null);
            ui.initTrayBlock().then(function () {
                ui.initTrayObj();
                event.raiseEvent("initedTray", null);
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
        event.addEventListener("packLoaded", function () {
        });
        event.addEventListener("resize", function () {
        });
        event.addEventListener("clickTrayToolbtn", function () {
        });
    });
})(main || (main = {}));
module.exports = main;
},{"./modules/canvas":2,"./modules/data":3,"./modules/event":4,"./modules/grid":5,"./modules/initDOM":7,"./modules/list":8,"./modules/makePrefabDataUrls":9,"./modules/packUtil/packLoader":10,"./modules/packUtil/packManager":11,"./modules/prefab":12,"./modules/rect":13,"./modules/stage":14,"./modules/tray":15,"./modules/ui":16,"./modules/vector2":17}],2:[function(require,module,exports){
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
},{"./initDOM":7}],3:[function(require,module,exports){
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
},{"./grid":5,"./tray":15}],4:[function(require,module,exports){
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
},{"./list":8}],5:[function(require,module,exports){
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
},{"./data":3,"./rect":13,"./stage":14}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{"./data":3,"./image":6,"./list":8,"./packUtil/packManager":11,"./vector2":17}],10:[function(require,module,exports){
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
},{"./packManager":11}],11:[function(require,module,exports){
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
},{"./../list":8}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
var list = require("./list");
var canvas = require("./canvas");
var grid = require("./grid");
var image = require("./image");
var d = require("./data");
var rect = require("./rect");
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
})(stage || (stage = {}));
module.exports = stage;
},{"./canvas":2,"./data":3,"./grid":5,"./image":6,"./list":8,"./rect":13}],15:[function(require,module,exports){
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
},{"./data":3}],16:[function(require,module,exports){
/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
var initDOM = require("./initDOM");
var ui;
(function (ui) {
    function init() {
        onBtnClickhandlerList = new Array();
    }
    var onBtnClickhandlerList;
    function onBtnClick(fn) {
        onBtnClickhandlerList.push(fn);
    }
    ui.onBtnClick = onBtnClick;
    initDOM(function () {
        var elems = document.querySelectorAll(".ui-btn");
        for (var i = 0; i < elems.length; i++) {
            elems.item(i).addEventListener("click", function (e) {
                onBtnClickhandlerList.forEach(function (j) {
                    j(elems.item(i), e);
                });
            });
        }
    });
    function setSkybox(fileName) {
        document.body.style.backgroundImage = "url('" + fileName + "')";
    }
    ui.setSkybox = setSkybox;
    function initUI() {
    }
    ui.initUI = initUI;
    function initTrayBlock() {
        return new Promise(function () {
        });
    }
    ui.initTrayBlock = initTrayBlock;
    function initTrayObj() {
        return new Promise(function () {
        });
    }
    ui.initTrayObj = initTrayObj;
    function changeLoadingStatus(status) {
    }
    ui.changeLoadingStatus = changeLoadingStatus;
    function hideLoading() {
    }
    ui.hideLoading = hideLoading;
    function changeActiveBlock(blockName) {
    }
    ui.changeActiveBlock = changeActiveBlock;
    init();
})(ui || (ui = {}));
module.exports = ui;
},{"./initDOM":7}],17:[function(require,module,exports){
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
},{}]},{},[1,2,3,4,5,6,7,8,9,12,13,14,15,16,17]);
