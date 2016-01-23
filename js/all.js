(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ui = require("./ui");
var initDOM = require("./modules/initDOM");
var packLoader = require("./modules/packUtil/packLoader");
var packManager = require("./modules/packUtil/packManager");
var event = require("./modules/event");
var list = require("./modules/classes/list");
var stage = require("./modules/stage");
var d = require("./modules/data");
var makeDataUrl = require("./modules/makePrefabDataUrls");
var tray = require("./modules/tray");
var prefab = require("./modules/prefab");
var Vector2 = require("./modules/classes/vector2");
var Rect = require("./modules/classes/rect");
var canvas = require("./modules/canvas");
var editBlock = require("./modules/editBlock");
var fGuide = require("./modules/ui/focusGuide");
var main;
(function (main) {
    function init() {
        d.trayItemDataURLs = new list();
        d.defaultPackName = "oa";
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
        ui.setupCanvas();
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
            var item = d.pack.blocks.get(d.pack.editor.defaultBlock);
            tray.updateActiveBlock(d.pack.editor.defaultBlock, item.data.filename, item.data.bName);
            ui.changeLoadingStatus("Are you ready?");
            event.raiseEvent("ready", null);
        });
        event.addEventListener("ready", function () {
            ui.hideLoading();
        });
        event.addEventListener("gridCanvas", function (e) {
            var pre = new prefab(e.gridPos.x, e.gridPos.y, d.selectBlock.fileName, d.selectBlock.blockName, stage.toGridPos(d.selectBlock.width), stage.toGridPos(d.selectBlock.height));
            var detail = stage.getPrefabFromGrid(new Vector2(pre.gridX, pre.gridY));
            var rect = stage.toDrawRect(new Rect(pre.gridX, pre.gridY, pre.gridW, pre.gridH));
            fGuide.hide();
            switch (d.activeToolName) {
                case "pencil":
                    if (e.eventName === "down") {
                        if (!detail.contains) {
                            canvas.render(d.selectImage, rect);
                            stage.items.push(stage.getId(), pre);
                        }
                        else {
                            stage.items.remove(detail.id);
                            stage.renderStage();
                        }
                    }
                    else if (e.eventName === "hovering") {
                        fGuide.focus(new Vector2(rect.x, rect.y), new Vector2(rect.width, rect.height), detail.contains ? "rgba(240,0,0,0.6)" : "rgba(0,240,0,0.6)");
                    }
                    break;
                case "choice":
                    if (e.eventName === "down") {
                        // オブジェクトに対応させる
                        if (detail.prefab) {
                            if (d.pack.objs.contains(detail.prefab.blockName)) {
                                var oData = d.pack.objs.get(detail.prefab.blockName);
                                tray.updateActiveBlock(detail.prefab.blockName, oData.data.oName, packManager.getPackPath(d.defaultPackName) + oData.data.filename, oData.data.width, oData.data.height);
                            }
                            else {
                                var bData = d.pack.blocks.get(detail.prefab.blockName);
                                tray.updateActiveBlock(detail.prefab.blockName, bData.data.bName, packManager.getPackPath(d.defaultPackName) + bData.data.filename);
                            }
                            ui.changeActiveBlock(detail.prefab.blockName);
                        }
                    }
                    break;
                case "hand":
                    if (e.eventName === "move") {
                        stage.scrollX += e.mousePos.x - stage.scrollBeforeX;
                        stage.scrollY += e.mousePos.y - stage.scrollBeforeY;
                        stage.renderStage();
                    }
                    stage.scrollBeforeX = e.mousePos.x;
                    stage.scrollBeforeY = e.mousePos.y;
                    break;
                case "edit":
                    if (e.eventName === "down" && detail.contains) {
                        ui.showInspector("edit-block");
                        d.editingBlockId = detail.id;
                        editBlock.updateEditBlock(new editBlock.EditBlock(detail.prefab.blockName, new Vector2(detail.prefab.gridX, detail.prefab.gridY), detail.id));
                    }
                    break;
                default:
                    if (e.eventName === "move" || e.eventName === "down") {
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
},{"./modules/canvas":2,"./modules/classes/list":6,"./modules/classes/rect":8,"./modules/classes/vector2":10,"./modules/data":12,"./modules/editBlock":13,"./modules/event":16,"./modules/initDOM":19,"./modules/makePrefabDataUrls":21,"./modules/packUtil/packLoader":23,"./modules/packUtil/packManager":24,"./modules/prefab":26,"./modules/stage":27,"./modules/tray":28,"./modules/ui/focusGuide":31,"./ui":34}],2:[function(require,module,exports){
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
},{"./initDOM":19}],3:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var list = require("./../list");
var attrList = (function (_super) {
    __extends(attrList, _super);
    function attrList() {
        _super.apply(this, arguments);
    }
    attrList.prototype.toSimple = function () {
        var _this = this;
        var list = this.getAll();
        var result = {};
        Object.keys(list).forEach(function (i) {
            result[_this.get(i).label] = i;
        });
        return result;
    };
    return attrList;
})(list);
module.exports = attrList;
},{"./../list":6}],4:[function(require,module,exports){
var attribute = (function () {
    function attribute(label, type, placeholder, defaultValue) {
        this.label = label;
        this.type = type;
        this.placeholder = placeholder;
        this.defaultValue = defaultValue;
    }
    return attribute;
})();
module.exports = attribute;
},{}],5:[function(require,module,exports){
var blockAttributes = (function () {
    function blockAttributes(blockId, attr, attrValue // 結局はstringになる。
        ) {
        this.blockId = blockId;
        this.attr = attr;
        this.attrValue = attrValue;
    }
    return blockAttributes;
})();
module.exports = blockAttributes;
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
var prefabMini = (function () {
    function prefabMini(x, y, blockName) {
        this.x = x;
        this.y = y;
        this.blockName = blockName;
    }
    ;
    return prefabMini;
})();
module.exports = prefabMini;
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
module.exports = TrayBlockDetails;
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
var list = require("./classes/list");
var prefabMini = require("./classes/prefabMini");
var stage = require("./stage");
var d = require("./data");
var jsonPlanet = require("./jsonPlanet");
var version = require("./version");
var compiler;
(function (compiler) {
    function getLangAuto(oneLine) {
        switch (oneLine) {
            case "//:csv":
                return compileLangs.CSV;
                break;
        }
        return compileLangs.unknown;
    }
    compiler.getLangAuto = getLangAuto;
    (function (compileLangs) {
        compileLangs[compileLangs["CSV"] = 0] = "CSV";
        compileLangs[compileLangs["JsWithPla"] = 1] = "JsWithPla";
        compileLangs[compileLangs["yaml"] = 2] = "yaml";
        compileLangs[compileLangs["unknown"] = 3] = "unknown";
        compileLangs[compileLangs["auto"] = 4] = "auto";
    })(compiler.compileLangs || (compiler.compileLangs = {}));
    var compileLangs = compiler.compileLangs;
    var centerLang = (function () {
        function centerLang(prefabList, header, footer, effects, attrList) {
            this.prefabList = prefabList;
            this.header = header;
            this.footer = footer;
            this.effects = effects;
            this.attrList = attrList;
        }
        ;
        return centerLang;
    })();
    compiler.centerLang = centerLang;
    function toCenterLang(mode, text) {
        switch (mode) {
            case compileLangs.CSV:
                return CSV2CenterLang(text);
                break;
        }
        return null;
    }
    compiler.toCenterLang = toCenterLang;
    function CSV2CenterLang(text) {
        var lines = text.replace(/;/g, "").split("\n");
        var result = new list();
        var header = [];
        var footer = [];
        var effects = new stage.StageEffects();
        var mode = 0; // 0: normal, 1: header, 2: footer
        var attrs = new list();
        // Attr setup
        var l = d.pack.attributes.getAll();
        var attrFormatList = [];
        Object.keys(l).forEach(function (i) {
            var formatListItem = [];
            attrFormatList.push(formatListItem.join(","));
        });
        lines.forEach(function (i) {
            if (mode === 0) {
                if (i === "//:header") {
                    mode = 1;
                }
                else if (i === "//:footer") {
                    mode = 2;
                }
                else {
                    i = i.replace(/ /g, "");
                    if (i === "")
                        return;
                    if (i.substring(0, 2) === "//")
                        return;
                    var items = i.split(",");
                    if (items[0].substring(0, 1) === "*") {
                        if (items[0] === "*skybox") {
                            effects.skybox = items[1];
                        }
                        else {
                            if (Object.keys(d.pack.attributes.getAll()).indexOf(items[1]) !== -1) {
                                var lst;
                                if (attrs.contains(items[2])) {
                                    lst = attrs.get(items[2]);
                                }
                                else {
                                    lst = new list();
                                }
                                lst.push(items[1], items[3]);
                                attrs.push(items[2], lst);
                            }
                        }
                        return;
                    }
                    result.push(i, new prefabMini(parseInt(items[1]), parseInt(items[2]), items[0]));
                }
            }
            else if (mode === 1) {
                if (i === "//:/header") {
                    mode = 0;
                    return;
                }
                header.push(i);
            }
            else if (mode === 2) {
                if (i === "//:/footer") {
                    mode = 0;
                    return;
                }
                footer.push(i);
            }
        });
        return new centerLang(result, header.join("\n"), footer.join("\n"), effects, attrs);
    }
    compiler.CSV2CenterLang = CSV2CenterLang;
    function old2CSV(old) {
        var lines = old.split("\n");
        var result = [];
        var id = 0;
        var mode = -1; // -1: system_header, 0: header, 1: normal, 2: footer, 3: return
        var count = 0;
        result.push("//:csv");
        lines.forEach(function (i) {
            if (i === "")
                return;
            if (mode === -1) {
                count++;
                if (count === 5) {
                    mode++;
                }
            }
            else if (mode === 0) {
                if (count === 5 && i === "// stageCTRL::edit not_header") {
                    mode++;
                }
                else if (count === 5) {
                    result.push("//:header");
                    result.push(i);
                    count++;
                }
                else {
                    if (i === "// stageCTRL::edit /header") {
                        result.push("//:/header");
                        mode++;
                    }
                    else {
                        result.push(i);
                    }
                }
            }
            else if (mode === 1) {
                if (i === "// stageCTRL::edit footer") {
                    mode++;
                    count = 10;
                    return;
                }
                else if (i === "// stageCTRL::edit not_footer") {
                    mode += 2;
                    return;
                }
                if (i.substring(0, 1) === "*") {
                    if (i.indexOf("*skybox,") !== -1) {
                        result.push(i);
                    }
                    else {
                        result.push(i); //TODO
                    }
                    return;
                }
                if (i.substring(0, 1) === ":")
                    return;
                i = i.replace(/ /g, "");
                if (i.substring(0, 2) === "//")
                    return;
                i = i.split("=")[0];
                var items = i.split(",");
                items[2] = (-parseInt(items[2])).toString();
                result.push([[items[0], items[1], items[2]].join(","), id++].join("="));
            }
            else if (mode === 2) {
                if (count === 10) {
                    count++;
                    result.push("//:footer");
                    result.push(i);
                }
                else {
                    if (i === "// stageCTRL::edit /footer") {
                        result.push("//:/footer");
                        mode++;
                    }
                    else {
                        result.push(i);
                    }
                }
            }
        });
        return result.join("\n");
    }
    compiler.old2CSV = old2CSV;
    function csv2Json(csv) {
        var result = new jsonPlanet.jsonPlanet(version.jsonPlanetVersion);
        var lines = csv.split("\n");
        lines.forEach(function (i) {
            if (i === "") {
                return;
            }
            if (i.substring(0, 1) === "*") {
                return;
            }
            if (i.substring(0, 2) === "//") {
                return;
            }
            var nameAndblock = i.split("=");
            var items = nameAndblock[0].split(",");
            result.Stage.push(new jsonPlanet.jsonBlockItem(items[0], parseInt(items[1]), parseInt(items[2]), nameAndblock[1]));
        });
        return result;
    }
    compiler.csv2Json = csv2Json;
})(compiler || (compiler = {}));
module.exports = compiler;
},{"./classes/list":6,"./classes/prefabMini":7,"./data":12,"./jsonPlanet":20,"./stage":27,"./version":33}],12:[function(require,module,exports){
var data = (function () {
    function data() {
    }
    return data;
})();
module.exports = data;
},{}],13:[function(require,module,exports){
var d = require("./data");
var stage = require("./stage");
var editBlock;
(function (editBlock_1) {
    var EditBlock = (function () {
        function EditBlock(blockName, blockPos, blockId) {
            this.blockName = blockName;
            this.blockPos = blockPos;
            this.blockId = blockId;
        }
        return EditBlock;
    })();
    editBlock_1.EditBlock = EditBlock;
    var currentEditBlock;
    /**
     * 関数内でupdateEditBlockUI()を呼び出します。
     */
    function updateEditBlock(editBlock) {
        currentEditBlock = editBlock;
        updateEditBlockUI();
    }
    editBlock_1.updateEditBlock = updateEditBlock;
    function getCurrentEditBlock() {
        return currentEditBlock;
    }
    editBlock_1.getCurrentEditBlock = getCurrentEditBlock;
    function updateEditBlockUI() {
        document.getElementById("ed-name").textContent = "Name: " + currentEditBlock.blockName;
        document.getElementById("ed-pos").textContent = "Pos: " + currentEditBlock.blockPos.x + ", " + currentEditBlock.blockPos.y;
        document.getElementById("ed-id").textContent = "ID: " + currentEditBlock.blockId;
        document.getElementsByClassName("ed-attr-view")[0].innerHTML = "";
        if (stage.blockAttrs.containsBlock(d.editingBlockId)) {
            var l = stage.blockAttrs.getBlock(d.editingBlockId).getAll();
            Object.keys(l).forEach(function (i) {
                renderAttributeUI(i, stage.blockAttrs.getAttr(d.editingBlockId, i));
            });
        }
    }
    editBlock_1.updateEditBlockUI = updateEditBlockUI;
    function renderAttributeUI(attrName, inputValue) {
        var addAttr = d.pack.attributes.get(attrName);
        var addElem = document.createElement("section");
        addElem.id = "ed-attr-field-" + attrName;
        var addInput = document.createElement("input");
        addInput.type = addAttr.type;
        addInput.id = "ed-attr-" + attrName;
        if (typeof addAttr.placeholder !== "undefined") {
            addInput.placeholder = addAttr.placeholder;
        }
        if (typeof inputValue !== "undefined") {
            console.log("hoge");
            addInput.value = inputValue;
        }
        else if (typeof addAttr.defaultValue !== "undefined") {
            addInput.value = addAttr.defaultValue;
        }
        else if (addInput.type === "number") {
            addInput.value = "0";
        }
        addInput.addEventListener("change", changeAttrInput);
        var addLabel = document.createElement("label");
        addLabel.htmlFor = addInput.id;
        addLabel.textContent = " " + addAttr.label + ": ";
        var removeButton = document.createElement("button");
        removeButton.innerHTML = '<i class="fa fa-minus"></i>';
        removeButton.classList.add("pla-btn");
        removeButton.id = "ed-attr-remove-" + attrName;
        removeButton.addEventListener("click", clickRemoveAttr);
        addElem.appendChild(removeButton);
        addElem.appendChild(addLabel);
        addElem.appendChild(addInput);
        document.getElementsByClassName("ed-attr-view")[0].appendChild(addElem);
    }
    editBlock_1.renderAttributeUI = renderAttributeUI;
    function changeAttrInput(e) {
        stage.blockAttrs.update(d.editingBlockId, e.target.id.replace("ed-attr-", ""), e.target.value);
    }
    editBlock_1.changeAttrInput = changeAttrInput;
    function clickRemoveAttr(e) {
        var attrName = e.target.id.replace("ed-attr-remove-", "");
        stage.blockAttrs.removeAttr(d.editingBlockId, attrName);
        document.getElementsByClassName("ed-attr-view")[0].removeChild(document.getElementById("ed-attr-field-" + attrName));
    }
    editBlock_1.clickRemoveAttr = clickRemoveAttr;
})(editBlock || (editBlock = {}));
module.exports = editBlock;
},{"./data":12,"./stage":27}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
var el = require("./elem");
var evElems;
(function (evElems) {
    function set(listenerNamespace) {
        el.forEachforQuery(".ev-btn", function (i) {
            i.addEventListener("click", listenerNamespace[i.dataset["listener"]]);
        });
        el.forEachforQuery(".ev-input", function (i) {
            var elem = i;
            if (typeof elem.dataset["default"] !== "undefined") {
                elem.value = elem.dataset["default"];
            }
        });
    }
    evElems.set = set;
})(evElems || (evElems = {}));
module.exports = evElems;
},{"./elem":14}],16:[function(require,module,exports){
var list = require("./classes/list");
var event;
(function (event) {
    var eventHandlers = new list();
    function addEventListener(eventName, fn) {
        if (eventName.indexOf("|") !== -1) {
            eventName.split("|").forEach(function (i) {
                addEventListener(i, fn);
            });
        }
        else {
            if (eventHandlers.contains(eventName)) {
                eventHandlers.get(eventName).push(fn);
            }
            else {
                eventHandlers.push(eventName, [fn]);
            }
        }
    }
    event.addEventListener = addEventListener;
    function raiseEvent(eventName, params) {
        if (eventHandlers.contains(eventName)) {
            eventHandlers.get(eventName).forEach(function (i) {
                i(params, eventName);
            });
        }
    }
    event.raiseEvent = raiseEvent;
})(event || (event = {}));
module.exports = event;
},{"./classes/list":6}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
function importJS(src) {
    var elem = document.createElement("script");
    elem.src = src;
    return elem;
}
module.exports = importJS;
},{}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
var version = require("./version");
/**
 * 構造化した、jsonPlanet関連を提供します。
 */
var jsonPlanet;
(function (jsonPlanet_1) {
    var jsonBlockAttr = (function () {
        function jsonBlockAttr(blockMode) {
            this.blockMode = blockMode;
        }
        jsonBlockAttr.prototype.toJson = function () {
            var result = {};
            if (typeof this.blockMode !== "undefined") {
                result["blockMode"] = this.blockMode;
            }
            return result;
        };
        return jsonBlockAttr;
    })();
    jsonPlanet_1.jsonBlockAttr = jsonBlockAttr;
    var jsonBlockItem = (function () {
        function jsonBlockItem(blockName, posX, posY, name, attr) {
            this.blockName = blockName;
            this.posX = posX;
            this.posY = posY;
            this.name = name;
            this.attr = attr;
        }
        jsonBlockItem.prototype.toArray = function () {
            var result = [this.blockName, this.posX, this.posY];
            if (typeof this.name !== "undefined") {
                result.push(this.name);
            }
            else {
                result.push("");
            }
            if (typeof this.attr !== "undefined") {
                result.push(this.attr.toJson());
            }
            return result;
        };
        jsonBlockItem.fromArray = function (ar) {
            var result = new jsonBlockItem(ar[0], ar[1], ar[2], ar[3]);
            // Todo: Attr
            return result;
        };
        return jsonBlockItem;
    })();
    jsonPlanet_1.jsonBlockItem = jsonBlockItem;
    var jsonPlanet = (function () {
        function jsonPlanet(JsonPlanetVersion, Stage) {
            if (Stage === void 0) { Stage = []; }
            this.JsonPlanetVersion = JsonPlanetVersion;
            this.Stage = Stage;
        }
        jsonPlanet.prototype.exportJson = function () {
            var result = {};
            result["JsonPlanetVersion"] = this.JsonPlanetVersion;
            result["Stage"] = [];
            this.Stage.forEach(function (i) {
                result["Stage"].push(i.toArray());
            });
            return result;
        };
        jsonPlanet.importJson = function (json) {
            var result = new jsonPlanet(json["JsonPlanetVersion"] || version.jsonPlanetVersion);
            json["Stage"].forEach(function (i) {
                result.Stage.push(jsonBlockItem.fromArray(i));
            });
            return result;
        };
        return jsonPlanet;
    })();
    jsonPlanet_1.jsonPlanet = jsonPlanet;
})(jsonPlanet || (jsonPlanet = {}));
module.exports = jsonPlanet;
},{"./version":33}],21:[function(require,module,exports){
var d = require("./data");
var list = require("./classes/list");
var packManager = require("./packUtil/packManager");
var Vector2 = require("./classes/vector2");
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
},{"./classes/list":6,"./classes/vector2":10,"./data":12,"./image":17,"./packUtil/packManager":24}],22:[function(require,module,exports){

},{}],23:[function(require,module,exports){
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
},{"./packManager":24}],24:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var list = require("./../classes/list");
var attrList = require("./../classes/blockAttr/attrList");
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
            this.attributes = new attrList();
            Object.keys(data["attributes"]).forEach(function (i) {
                var cur = data["attributes"][i];
                _this.attributes.push(i, cur);
            });
            this.skyboxes = new skyboxInfoList();
            Object.keys(data["skyboxes"]).forEach(function (i) {
                _this.skyboxes.push(i, new skyboxInfo(data["skyboxes"][i]));
            });
            this.editor = data["editor"];
        }
        return packModule;
    })();
    pack.packModule = packModule;
    var packEditorInfo = (function () {
        function packEditorInfo(defaultSkybox, defaultBlock, skyboxMode, skyboxSize) {
            this.defaultSkybox = defaultSkybox;
            this.defaultBlock = defaultBlock;
            this.skyboxMode = skyboxMode;
            this.skyboxSize = skyboxSize;
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
},{"./../classes/blockAttr/attrList":3,"./../classes/list":6}],25:[function(require,module,exports){
var stage = require("./stage");
var prefab = require("./prefab");
var compiler = require("./compiler");
var d = require("./data");
var jsonPlanet = require("./jsonPlanet");
var version = require("./version");
/**
 * stageから、compilerを利用して、外部形式へ入出力する機能を提供します。
 */
var planet;
(function (planet) {
    /**
     * stageを、jsonPlanetへ変換します。
     * jsonPlanetから、jsonに変換するのには、jsonPlanet.exportJson()を利用してください。
     */
    function toJsonPlanet() {
        var result = new jsonPlanet.jsonPlanet(version.jsonPlanetVersion);
        var items = stage.items.getAll();
        Object.keys(items).forEach(function (i) {
            var item = stage.items.get(parseInt(i));
            result.Stage.push(new jsonPlanet.jsonBlockItem(item.blockName, item.gridX, item.gridY, i));
        });
        return result;
    }
    planet.toJsonPlanet = toJsonPlanet;
    /**
     * jsonPlanetを、stageへ変換します。
     * 内部で、stage.itemsをクリアし、新しくpushします。
     */
    function fromJsonPlanet(jsonPla) {
        stage.items.clear();
        stage.resetId();
        jsonPla.Stage.forEach(function (i) {
            if (d.pack.objs.contains(i.blockName)) {
                var objData = d.pack.objs.get(i.blockName);
                stage.items.push(stage.getId(), new prefab(i.posX, i.posY, objData.data.filename, i.blockName, stage.toGridPos(objData.data.width), stage.toGridPos(objData.data.height)));
            }
            else {
                var blockData = d.pack.blocks.get(i.blockName);
                stage.items.push(stage.getId(), new prefab(i.posX, i.posY, blockData.data.filename, i.blockName, stage.toGridPos(d.defaultBlockSize), stage.toGridPos(d.defaultBlockSize)));
            }
        });
        var result = new stage.StageEffects();
        // Todo: StageEffect
        return result;
    }
    planet.fromJsonPlanet = fromJsonPlanet;
    /**
     * 非推奨
     */
    function exportText() {
        var result = [];
        result.push("//:csv");
        // header
        if (stage.header.replace(/ /g, "").replace(/\n/g, "") !== "") {
            result.push("//:header");
            var hLines = stage.header.split("\n");
            hLines.forEach(function (i) {
                result.push(i);
            });
            result.push("//:/header");
        }
        // effects
        result.push(["*skybox", stage.stageEffects.skybox].join(","));
        // blocks
        var items = stage.items.getAll();
        Object.keys(items).forEach(function (i) {
            var item = stage.items.get(parseInt(i));
            result.push([[item.blockName, item.gridX, item.gridY].join(","), i].join("="));
        });
        // attributes
        var atts = stage.blockAttrs.getAll();
        if (atts) {
            Object.keys(atts).forEach(function (i) {
                var attr = stage.blockAttrs.getBlock(parseInt(i)).getAll();
                Object.keys(attr).forEach(function (j) {
                    result.push(["*custom", j, i, stage.blockAttrs.getBlock(parseInt(i)).get(j)].join(","));
                });
            });
        }
        // footer
        if (stage.footer.replace(/ /g, "").replace(/\n/g, "") !== "") {
            result.push("//:footer");
            var fLines = stage.footer.split("\n");
            fLines.forEach(function (i) {
                result.push(i);
            });
            result.push("//:/footer");
        }
        return result.join("\n");
    }
    planet.exportText = exportText;
    /**
     * 非推奨
     */
    function importText(file) {
        stage.items.clear();
        stage.resetId();
        var centerLang = compiler.toCenterLang(compiler.getLangAuto(file.split("\n")[0]), file);
        stage.header = centerLang.header;
        stage.footer = centerLang.footer;
        var clang = centerLang.prefabList.getAll();
        var result = centerLang.effects;
        Object.keys(clang).forEach(function (i) {
            var item = centerLang.prefabList.get(i);
            if (d.pack.objs.contains(item.blockName)) {
                var objData = d.pack.objs.get(item.blockName);
                stage.items.push(stage.getId(), new prefab(item.x, item.y, objData.data.filename, item.blockName, stage.toGridPos(objData.data.width), stage.toGridPos(objData.data.height)));
            }
            else {
                var blockData = d.pack.blocks.get(item.blockName);
                stage.items.push(stage.getId(), new prefab(item.x, item.y, blockData.data.filename, item.blockName, stage.toGridPos(d.defaultBlockSize), stage.toGridPos(d.defaultBlockSize)));
            }
        });
        stage.blockAttrs.setAll(centerLang.attrList);
        return result;
    }
    planet.importText = importText;
})(planet || (planet = {}));
module.exports = planet;
},{"./compiler":11,"./data":12,"./jsonPlanet":20,"./prefab":26,"./stage":27,"./version":33}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
var list = require("./classes/list");
var canvas = require("./canvas");
var image = require("./image");
var d = require("./data");
var rect = require("./classes/rect");
var event = require("./event");
var Vector2 = require("./classes/vector2");
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
    var blockAttrsList;
    var blockAttrs;
    (function (blockAttrs) {
        function setAll(lst) {
            blockAttrsList = lst;
        }
        blockAttrs.setAll = setAll;
        function push(blockId, attrName, value) {
            var l;
            if (containsBlock(blockId)) {
                l = getBlock(blockId);
            }
            else {
                l = new list();
            }
            l.push(attrName, value);
            blockAttrsList.push(blockId.toString(), l);
        }
        blockAttrs.push = push;
        function update(blockId, attrName, value) {
            var l = getBlock(blockId);
            l.update(attrName, value);
            blockAttrsList.update(blockId.toString(), l);
        }
        blockAttrs.update = update;
        function containsAttr(blockId, attrName) {
            if (containsBlock(blockId)) {
                var l = getBlock(blockId);
                return l.contains(attrName);
            }
            else {
                return false;
            }
        }
        blockAttrs.containsAttr = containsAttr;
        function containsBlock(blockId) {
            return blockAttrsList.contains(blockId.toString());
        }
        blockAttrs.containsBlock = containsBlock;
        function removeAttr(blockId, attrName) {
            var l = getBlock(blockId);
            l.remove(attrName);
            blockAttrsList.update(blockId.toString(), l);
        }
        blockAttrs.removeAttr = removeAttr;
        function removeBlock(blockId) {
            blockAttrsList.remove(blockId.toString());
        }
        blockAttrs.removeBlock = removeBlock;
        function getBlock(blockId) {
            return blockAttrsList.get(blockId.toString());
        }
        blockAttrs.getBlock = getBlock;
        function getAttr(blockId, attrName) {
            return blockAttrsList.get(blockId.toString()).get(attrName);
        }
        blockAttrs.getAttr = getAttr;
        function getAll() {
            var l = blockAttrsList.getAll();
            var result = {};
            Object.keys(l).forEach(function (i) {
                result[i] = blockAttrsList.get(i).getAll();
            });
            return result;
        }
        blockAttrs.getAll = getAll;
    })(blockAttrs = stage.blockAttrs || (stage.blockAttrs = {}));
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
        blockAttrsList = new list();
        stage.header = "";
        stage.footer = "";
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
    stage.resetId = resetId;
    function renderStage() {
        canvas.clear();
        var l = items.getAll();
        Object.keys(l).forEach(function (i) {
            var item = items.get(parseInt(i));
            var x = stage.scrollX + stage.getMousePosFromCenterAndSize(stage.toMousePos(item.gridX), stage.toMousePos(item.gridW));
            var y = stage.scrollY + stage.getMousePosFromCenterAndSize(stage.toMousePos(item.gridY), stage.toMousePos(item.gridH));
            var width = stage.toMousePos(item.gridW);
            var height = stage.toMousePos(item.gridH);
            // 画面内に入っているか
            if (x + width >= 0 && x <= canvas.canvasRect.width &&
                y + height >= 0 && y <= canvas.canvasRect.height) {
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
    var gridDetail = (function () {
        function gridDetail(gridPos, eventName, mousePos) {
            this.gridPos = gridPos;
            this.eventName = eventName;
            this.mousePos = mousePos;
        }
        return gridDetail;
    })();
    stage.gridDetail = gridDetail;
    function getMousePosFromCenterAndSize(center, size) {
        return center - ((size - d.defaultGridSize) / 2);
    }
    stage.getMousePosFromCenterAndSize = getMousePosFromCenterAndSize;
    stage.scrollX = 0;
    stage.scrollY = 0;
    stage.scrollBeforeX = 0;
    stage.scrollBeforeY = 0;
    function getGridPosFromMousePos(mousePos) {
        var cX = mousePos.x - stage.scrollX;
        var cY = mousePos.y - stage.scrollY;
        var eX = cX - (cX % d.defaultGridSize);
        var eY = cY - (cY % d.defaultGridSize);
        var gridX = eX / d.defaultGridSize;
        var gridY = eY / d.defaultGridSize;
        return new Vector2(gridX, gridY);
    }
    stage.getGridPosFromMousePos = getGridPosFromMousePos;
    var getPrefabFromGridDetails = (function () {
        function getPrefabFromGridDetails(contains, id, prefab) {
            this.contains = contains;
            this.id = id;
            this.prefab = prefab;
        }
        return getPrefabFromGridDetails;
    })();
    stage.getPrefabFromGridDetails = getPrefabFromGridDetails;
    function getPrefabFromGrid(grid) {
        var result = new getPrefabFromGridDetails(false, -1, null);
        var breakException = {};
        // breakするため
        try {
            Object.keys(items.getAll()).forEach(function (i) {
                var item = items.get(parseInt(i));
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
    stage.getPrefabFromGrid = getPrefabFromGrid;
    function toMousePos(gridPos) {
        return gridPos * d.defaultGridSize;
    }
    stage.toMousePos = toMousePos;
    function toGridPos(mousePos) {
        return (mousePos - (mousePos % d.defaultGridSize)) / d.defaultGridSize;
    }
    stage.toGridPos = toGridPos;
    /**
     * すべてgridPosで指定された4点のrectを、描画領域に変換します。
     */
    function toDrawRect(gridRect) {
        return new rect(stage.scrollX + getMousePosFromCenterAndSize(toMousePos(gridRect.x), toMousePos(gridRect.width)), stage.scrollY + getMousePosFromCenterAndSize(toMousePos(gridRect.y), toMousePos(gridRect.height)), toMousePos(gridRect.width), toMousePos(gridRect.height));
    }
    stage.toDrawRect = toDrawRect;
})(stage || (stage = {}));
module.exports = stage;
},{"./canvas":2,"./classes/list":6,"./classes/rect":8,"./classes/vector2":10,"./data":12,"./event":16,"./image":17}],28:[function(require,module,exports){
var image = require("./image");
var TrayBlockDetails = require("./classes/trayBlockDetails");
var d = require("./data");
var uiWaitMode = require("./uiWaitMode");
var event = require("./event");
var packManager = require("./packUtil/packManager");
/**
 * pla:module
 * | [x] ui
 * | [x] controller
 */
var tray;
(function (tray) {
    function updateActiveBlock(blockName, fileName, label, width, height) {
        var w = width || d.defaultBlockSize;
        var h = height || d.defaultBlockSize;
        d.selectBlock = new TrayBlockDetails(blockName, fileName, label, w, h);
        updateSelectImage();
    }
    tray.updateActiveBlock = updateActiveBlock;
    function updateSelectImage() {
        d.selectImage = image(d.trayItemDataURLs.get(d.selectBlock.blockName));
        uiWaitMode.start();
        d.selectImage.onload = function () {
            uiWaitMode.end();
        };
    }
    tray.updateSelectImage = updateSelectImage;
    function initTrayBlock(finishedOne) {
        return new Promise(function (resolve) {
            var list = Object.keys(d.pack.blocks.getAll());
            var result = [];
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
                    result.push(li);
                    if (i === list.length - 1) {
                        resolve(result);
                    }
                    else {
                        finishedOne(i, list.length - 1);
                        async(i + 1);
                    }
                };
            };
            async(0);
        });
    }
    tray.initTrayBlock = initTrayBlock;
    function initTrayObj(finishedOne) {
        return new Promise(function (resolve) {
            var list = Object.keys(d.pack.objs.getAll());
            var result = [];
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
                    result.push(li);
                    if (i === list.length - 1) {
                        resolve(result);
                    }
                    else {
                        finishedOne(i, list.length - 1);
                        async(i + 1);
                    }
                };
            };
            async(0);
        });
    }
    tray.initTrayObj = initTrayObj;
})(tray || (tray = {}));
module.exports = tray;
},{"./classes/trayBlockDetails":9,"./data":12,"./event":16,"./image":17,"./packUtil/packManager":24,"./uiWaitMode":29}],29:[function(require,module,exports){
var uiWaitMode;
(function (uiWaitMode) {
    function start() {
        document.getElementById("pla-canvas").style.cursor = "wait";
    }
    uiWaitMode.start = start;
    function end() {
        document.getElementById("pla-canvas").style.cursor = "crosshair";
    }
    uiWaitMode.end = end;
})(uiWaitMode || (uiWaitMode = {}));
module.exports = uiWaitMode;
},{}],30:[function(require,module,exports){
/// <reference path="../../definitely/move.d.ts" />
var anim;
(function (anim) {
    function showTrayFull() {
        move(".pla-footer").set("height", "100%").duration("0.5s").end();
    }
    anim.showTrayFull = showTrayFull;
    function hideTrayFull() {
        move(".pla-footer").set("height", "50px").duration("0.5s").end();
    }
    anim.hideTrayFull = hideTrayFull;
    function showInspector() {
        move(".pla-inspector")
            .set("left", "80%")
            .duration("0.5s")
            .end();
    }
    anim.showInspector = showInspector;
    function hideInspector() {
        move(".pla-inspector")
            .set("left", "100%")
            .duration("0.5s")
            .end();
    }
    anim.hideInspector = hideInspector;
    function hideLoading() {
        move(".loading")
            .set("opacity", 0)
            .duration("1s")
            .then()
            .set("display", "none")
            .pop()
            .end();
    }
    anim.hideLoading = hideLoading;
})(anim || (anim = {}));
module.exports = anim;
},{}],31:[function(require,module,exports){
var initDOM = require("./../initDOM");
var focusGuide;
(function (focusGuide) {
    var guideElement;
    initDOM(function () {
        guideElement = document.createElement("div");
        guideElement.id = "guide";
        guideElement.style.position = "fixed";
        guideElement.style.backgroundColor = "rgba(240,0,0,0.6)";
        guideElement.style.pointerEvents = "none";
        document.body.appendChild(guideElement);
    });
    function focus(screenPos, size, color) {
        guideElement.style.visibility = "visible";
        guideElement.style.left = screenPos.x + "px";
        guideElement.style.top = screenPos.y + "px";
        guideElement.style.width = size.x + "px";
        guideElement.style.height = size.y + "px";
        guideElement.style.backgroundColor = color;
    }
    focusGuide.focus = focus;
    function hide() {
        guideElement.style.visibility = "hidden";
    }
    focusGuide.hide = hide;
})(focusGuide || (focusGuide = {}));
module.exports = focusGuide;
},{"./../initDOM":19}],32:[function(require,module,exports){
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
},{}],33:[function(require,module,exports){
var version;
(function (version_1) {
    version_1.version = "v1.0";
    version_1.author = "shundroid";
    version_1.jsonPlanetVersion = 0.1;
})(version || (version = {}));
module.exports = version;
},{}],34:[function(require,module,exports){
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="definitely/move.d.ts" />
var d = require("./modules/data");
var initDOM = require("./modules/initDOM");
var event = require("./modules/event");
var el = require("./modules/elem");
var compiler = require("./modules/compiler");
var importJS = require("./modules/importJS");
var u = require("./modules/util");
var Vector2 = require("./modules/classes/vector2");
var tray = require("./modules/tray");
var packManager = require("./modules/packUtil/packManager");
var planet = require("./modules/planet");
var stage = require("./modules/stage");
var v = require("./modules/version");
var evElems = require("./modules/evElems");
var anim = require("./modules/ui/anim");
var editBlock = require("./modules/editBlock");
var jsonPlanet = require("./modules/jsonPlanet");
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
        event.addEventListener("ui_downCanvas|ui_moveCanvas|ui_upCanvas|ui_hoveringCanvas", function (e, eventName) {
            var g = stage.getGridPosFromMousePos(new Vector2(e.clientX, e.clientY));
            event.raiseEvent("gridCanvas", new stage.gridDetail(g, eventName.replace("ui_", "").replace("Canvas", ""), new Vector2(e.clientX, e.clientY)));
        });
        event.addEventListener("initedPack", function () {
            // SkyboxMode
            if (typeof d.pack.editor.skyboxMode !== "undefined") {
                if (d.pack.editor.skyboxMode === "repeat") {
                    document.body.style.backgroundRepeat = "repeat";
                    if (typeof d.pack.editor.skyboxSize !== "undefined") {
                        document.body.style.backgroundSize = d.pack.editor.skyboxSize;
                    }
                    else {
                        document.body.style.backgroundSize = "auto";
                    }
                }
            }
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
            document.getElementById("stg-skybox").value = d.pack.editor.defaultSkybox;
        });
    }
    initDOM(function () {
        evElems.set(ui);
        document.getElementById("pla-ver").innerHTML = "Planet " + v.version + " by " + v.author;
        el.addEventListenerforQuery(".ins-show-btn", "click", clickInsShowBtn);
        el.addEventListenerforQuery(".io-hf", "change", changeHeaderorFooterValue);
        el.addEventListenerforQuery(".tray-list-tool", "click", clickTrayTool);
        document.head.appendChild(importJS("bower_components/move.js/move.js"));
        window.onbeforeunload = function (event) {
            event.returnValue = "ページを移動しますか？";
        };
        event.raiseEvent("initDom", null);
    });
    function setupCanvas() {
        ui.canvas = document.getElementById("pla-canvas");
        ui.canvas.addEventListener("mousedown", function (e) {
            event.raiseEvent("ui_downCanvas", e);
        });
        ui.canvas.addEventListener("mousemove", function (e) {
            if (e.buttons === 1) {
                event.raiseEvent("ui_moveCanvas", e);
            }
            else {
                event.raiseEvent("ui_hoveringCanvas", e);
            }
        });
        ui.canvas.addEventListener("mouseup", function (e) {
            event.raiseEvent("ui_upCanvas", e);
        });
    }
    ui.setupCanvas = setupCanvas;
    function togglefullScreen(e) {
        if (!d.isFullscreenTray) {
            closeInspector();
            anim.showTrayFull();
            e.target.textContent = "↓";
        }
        else {
            anim.hideTrayFull();
            e.target.textContent = "↑";
        }
        d.isFullscreenTray = !d.isFullscreenTray;
    }
    ui.togglefullScreen = togglefullScreen;
    function closeInspector() {
        if (!d.isShowInspector)
            return;
        d.isShowInspector = false;
        anim.hideInspector();
    }
    ui.closeInspector = closeInspector;
    function showInspector(inspectorName) {
        document.querySelector(".ins-article-active") && document.querySelector(".ins-article-active").classList.remove("ins-article-active");
        document.getElementById("ins-" + inspectorName).classList.add("ins-article-active");
        if (d.isShowInspector)
            return;
        d.isShowInspector = true;
        anim.showInspector();
    }
    ui.showInspector = showInspector;
    function clickExport() {
        document.getElementById("pla-io").value = JSON.stringify(planet.toJsonPlanet().exportJson());
    }
    ui.clickExport = clickExport;
    function clickImport() {
        //var effects = planet.importText((<HTMLTextAreaElement>document.getElementById("pla-io")).value);
        var effects = planet.fromJsonPlanet(jsonPlanet.jsonPlanet.importJson(JSON.parse(document.getElementById("pla-io").value)));
        stage.stageEffects = effects;
        setSkybox(packManager.getPackPath(d.defaultPackName) + d.pack.skyboxes.get(effects.skybox).data.filename);
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
            stage.header = elem.value;
        }
        else if (elem.id === "io-footer") {
            stage.footer = elem.value;
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
            tray.initTrayBlock(function (numerator, denominator) {
                changeLoadingStatus("loading tray-block : " + numerator.toString() + " / " + denominator.toString());
            }).then(function (ul) {
                ul.forEach(function (i) {
                    document.getElementsByClassName("tray-items")[0].appendChild(i);
                });
                resolve();
            });
        });
    }
    ui.initTrayBlock = initTrayBlock;
    function initTrayObj() {
        return new Promise(function (resolve) {
            tray.initTrayObj(function (numerator, denominator) {
                changeLoadingStatus("loading tray-obj : " + numerator.toString() + " / " + denominator.toString());
            }).then(function (ul) {
                ul.forEach(function (i) {
                    document.getElementsByClassName("tray-items")[0].appendChild(i);
                });
                resolve();
            });
        });
    }
    ui.initTrayObj = initTrayObj;
    function changeLoadingStatus(status) {
        document.getElementsByClassName("loading")[0].innerHTML = "Loading...<br />" + status;
    }
    ui.changeLoadingStatus = changeLoadingStatus;
    function hideLoading() {
        var elem = document.getElementsByClassName("loading")[0];
        anim.hideLoading();
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
    function clickConvertOldFile() {
        document.getElementById("conv-new").value =
            JSON.stringify(compiler.csv2Json(document.getElementById("conv-old").value).exportJson());
    }
    ui.clickConvertOldFile = clickConvertOldFile;
    function changeSkybox(e) {
        stage.stageEffects.skybox = e.target.value;
        setSkybox(packManager.getPackPath(d.defaultPackName) + d.pack.skyboxes.get(stage.stageEffects.skybox).data.filename);
    }
    ui.changeSkybox = changeSkybox;
    function clickAddAttr() {
        var attrKey = document.getElementsByClassName("ed-attr")[0].value;
        if (!stage.blockAttrs.containsAttr(d.editingBlockId, attrKey)) {
            editBlock.renderAttributeUI(attrKey);
            stage.blockAttrs.push(d.editingBlockId, attrKey, "");
        }
    }
    ui.clickAddAttr = clickAddAttr;
    function changeAttrInput(e) {
        stage.blockAttrs.update(d.editingBlockId, e.target.id.replace("ed-attr-", ""), e.target.value);
    }
    ui.changeAttrInput = changeAttrInput;
    init();
})(ui || (ui = {}));
module.exports = ui;
},{"./modules/classes/vector2":10,"./modules/compiler":11,"./modules/data":12,"./modules/editBlock":13,"./modules/elem":14,"./modules/evElems":15,"./modules/event":16,"./modules/importJS":18,"./modules/initDOM":19,"./modules/jsonPlanet":20,"./modules/packUtil/packManager":24,"./modules/planet":25,"./modules/stage":27,"./modules/tray":28,"./modules/ui/anim":30,"./modules/util":32,"./modules/version":33}]},{},[1,2,4,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,30,31,29,32,33,34]);
