(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ui = require("./ui");
var initDOM_1 = require("./modules/initDOM");
var packLoader_1 = require("./modules/packUtil/packLoader");
var packManager = require("./modules/packUtil/packManager");
var event = require("./modules/event");
var stage = require("./modules/stage");
var stageEffectsModel_1 = require("./modules/model/stageEffectsModel");
var stageItems = require("./modules/model/stageItemsModel");
var data_1 = require("./modules/data");
var makePrefabDataUrls_1 = require("./modules/makePrefabDataUrls");
var tray_1 = require("./modules/tray");
var prefab_1 = require("./modules/classes/prefab");
var vector2_1 = require("./modules/classes/vector2");
var rect_1 = require("./modules/classes/rect");
var canvas = require("./modules/canvas");
var editBlock_1 = require("./modules/editBlock");
var fGuide = require("./modules/ui/focusGuide");
var editorModel = require("./modules/model/editorModel");
var stageRenderView_1 = require("./modules/view/stageRenderView");
var packModel_1 = require("./modules/model/packModel");
var trayModel_1 = require("./modules/model/trayModel");
var preferencesModel_1 = require("./modules/model/preferencesModel");
/**
 * メインとなる処理を行います
 */
var main;
(function (main) {
    function init() {
        data_1.data.dataInit();
    }
    init();
    initDOM_1.default(function () {
        ui.setupCanvas();
        packLoader_1.default(preferencesModel_1.currentPackName).then(function (i) {
            packModel_1.setPack(new packManager.packModule(i));
            event.raiseEvent("packLoaded", null);
            stageEffectsModel_1.stageEffects.skyboxes = [packModel_1.pack.editor.defaultSkybox];
            ui.setSkybox(packManager.getPackPath(preferencesModel_1.currentPackName) + packModel_1.pack.skyboxes.get(packModel_1.pack.editor.defaultSkybox).data.filename);
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
            trayModel_1.setTrayBlockDataUrls(makePrefabDataUrls_1.default());
            var item = packModel_1.pack.blocks.get(packModel_1.pack.editor.defaultBlock);
            tray_1.updateActiveBlock(packModel_1.pack.editor.defaultBlock, item.data.filename, item.data.bName);
            ui.changeLoadingStatus("Are you ready?");
            event.raiseEvent("ready", null);
        });
        event.addEventListener("ready", function () {
            ui.hideLoading();
        });
        event.addEventListener("gridCanvas", function (e) {
            var pre = new prefab_1.default(e.gridPos.x, e.gridPos.y, trayModel_1.activeBlock.fileName, trayModel_1.activeBlock.blockName, stage.toGridPos(trayModel_1.activeBlock.width), stage.toGridPos(trayModel_1.activeBlock.height));
            var detail = stage.getPrefabFromGrid(new vector2_1.default(pre.gridX, pre.gridY), editorModel.activeStageLayerInEditor);
            var rect = stage.toDrawRect(new rect_1.default(pre.gridX, pre.gridY, pre.gridW, pre.gridH));
            fGuide.hide();
            switch (trayModel_1.activeToolName) {
                case "pencil":
                    if (e.eventName === "down") {
                        if (!detail.contains) {
                            canvas.render(trayModel_1.activeBlockImage, rect);
                            stageItems.push(stageItems.getId(), pre, editorModel.activeStageLayerInEditor);
                        }
                        else {
                            stageItems.remove(detail.id, editorModel.activeStageLayerInEditor);
                            stageRenderView_1.default(editorModel.activeStageLayerInEditor);
                        }
                    }
                    else if (e.eventName === "hovering") {
                        fGuide.focus(new vector2_1.default(rect.x, rect.y), new vector2_1.default(rect.width, rect.height), detail.contains ? "rgba(240,0,0,0.6)" : "rgba(0,240,0,0.6)");
                    }
                    break;
                case "choice":
                    if (e.eventName === "down") {
                        // オブジェクトに対応させる
                        if (detail.prefab) {
                            if (packModel_1.pack.objs.contains(detail.prefab.blockName)) {
                                var oData = packModel_1.pack.objs.get(detail.prefab.blockName);
                                tray_1.updateActiveBlock(detail.prefab.blockName, oData.data.oName, packManager.getPackPath(preferencesModel_1.currentPackName) + oData.data.filename, oData.data.width, oData.data.height);
                            }
                            else {
                                var bData = packModel_1.pack.blocks.get(detail.prefab.blockName);
                                tray_1.updateActiveBlock(detail.prefab.blockName, bData.data.bName, packManager.getPackPath(preferencesModel_1.currentPackName) + bData.data.filename);
                            }
                            ui.changeActiveBlock(detail.prefab.blockName);
                        }
                    }
                    break;
                case "hand":
                    if (e.eventName === "move") {
                        stage.scrollX += e.mousePos.x - stage.scrollBeforeX;
                        stage.scrollY += e.mousePos.y - stage.scrollBeforeY;
                        stageRenderView_1.default(editorModel.activeStageLayerInEditor);
                    }
                    stage.scrollBeforeX = e.mousePos.x;
                    stage.scrollBeforeY = e.mousePos.y;
                    break;
                case "edit":
                    if (e.eventName === "down" && detail.contains) {
                        ui.showInspector("edit-block");
                        editorModel.setEditingBlockId(detail.id);
                        editBlock_1.updateEditBlock(new editBlock_1.EditBlock(detail.prefab.blockName, new vector2_1.default(detail.prefab.gridX, detail.prefab.gridY), detail.id));
                    }
                    break;
                default:
                    if (e.eventName === "move" || e.eventName === "down") {
                        if (trayModel_1.activeToolName === "brush") {
                            if (detail.contains && detail.prefab.blockName !== trayModel_1.activeBlock.blockName) {
                                stageItems.remove(detail.id, editorModel.activeStageLayerInEditor);
                                stageRenderView_1.default(editorModel.activeStageLayerInEditor);
                            }
                            if (!detail.contains) {
                                canvas.render(trayModel_1.activeBlockImage, rect);
                                stageItems.push(stageItems.getId(), pre, editorModel.activeStageLayerInEditor);
                            }
                        }
                        else if (trayModel_1.activeToolName === "erase" && detail.contains) {
                            stageItems.remove(detail.id, editorModel.activeStageLayerInEditor);
                            stageRenderView_1.default(editorModel.activeStageLayerInEditor);
                        }
                    }
                    break;
            }
        });
    });
})(main || (main = {}));
module.exports = main;
},{"./modules/canvas":2,"./modules/classes/prefab":4,"./modules/classes/rect":5,"./modules/classes/vector2":7,"./modules/data":8,"./modules/editBlock":9,"./modules/event":12,"./modules/initDOM":14,"./modules/makePrefabDataUrls":16,"./modules/model/editorModel":17,"./modules/model/packModel":18,"./modules/model/preferencesModel":19,"./modules/model/stageEffectsModel":21,"./modules/model/stageItemsModel":22,"./modules/model/trayModel":23,"./modules/packUtil/packLoader":24,"./modules/packUtil/packManager":25,"./modules/stage":27,"./modules/tray":28,"./modules/ui/focusGuide":30,"./modules/view/stageRenderView":33,"./ui":34}],2:[function(require,module,exports){
/// <reference path="../definitely/canvasRenderingContext2D.d.ts" />
var initDOM_1 = require("./initDOM");
/**
 * Canvasへの描画に関係する処理を行います。
 * (#43) Viewに入れる
 */
var canvas;
var ctx;
initDOM_1.default(function () {
    canvas = document.getElementById("pla-canvas");
    exports.canvasRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    resizeCanvas();
    if (canvas && canvas.getContext) {
        ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
    }
});
window.addEventListener("resize", resizeCanvas);
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    exports.canvasRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
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
exports.render = render;
/**
 * 指定された四角形の範囲をclearRectします。
 */
function clearByRect(rect) {
    ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
}
exports.clearByRect = clearByRect;
/**
 * Canvas 全体をclearRectします。
 */
function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
exports.clear = clear;
},{"./initDOM":14}],3:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = List;
},{}],4:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = prefab;
},{}],5:[function(require,module,exports){
var rect = (function () {
    function rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    return rect;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rect;
},{}],6:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TrayBlockDetails;
},{}],7:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Vector2;
},{}],8:[function(require,module,exports){
var editorModel_1 = require("./model/editorModel");
var preferencesModel_1 = require("./model/preferencesModel");
var trayModel_1 = require("./model/trayModel");
/**
 * Planetの情報を保存します。
 */
var data = (function () {
    function data() {
    }
    /**
     * 全ての Data メンバーを、初期化します。
     */
    data.dataInit = function () {
        preferencesModel_1.setDefaultValues();
        editorModel_1.setDefaultValues();
        trayModel_1.setDefaultValues();
        editorModel_1.setActiveStageLayer(0);
    };
    return data;
})();
exports.data = data;
},{"./model/editorModel":17,"./model/preferencesModel":19,"./model/trayModel":23}],9:[function(require,module,exports){
var stageAttrs = require("./model/stageAttrsModel");
var editorModel_1 = require("./model/editorModel");
/*
 * Inspector内、EditBlockのデータ化
 * (#43) Viewになる。
 * AttributeのUIの部分は分けたい。
 * - React への対応
 */
var EditBlock = (function () {
    function EditBlock(blockName, blockPos, blockId) {
        this.blockName = blockName;
        this.blockPos = blockPos;
        this.blockId = blockId;
    }
    return EditBlock;
})();
exports.EditBlock = EditBlock;
var currentEditBlock;
/**
 * 関数内でupdateEditBlockUI()を呼び出します。
 */
function updateEditBlock(editBlock) {
    currentEditBlock = editBlock;
    updateEditBlockUI();
}
exports.updateEditBlock = updateEditBlock;
function getCurrentEditBlock() {
    return currentEditBlock;
}
exports.getCurrentEditBlock = getCurrentEditBlock;
/**
 * editingのblockが変わった時など、InspectorのEditBlockを更新する必要があるときに呼び出してください。
 * UIを変更します。
 */
function updateEditBlockUI() {
    document.getElementById("ed-name").textContent = "Name: " + currentEditBlock.blockName;
    document.getElementById("ed-pos").textContent = "Pos: " + currentEditBlock.blockPos.x + ", " + currentEditBlock.blockPos.y;
    document.getElementById("ed-id").textContent = "ID: " + currentEditBlock.blockId;
    document.getElementsByClassName("ed-attr-view")[0].innerHTML = "";
    if (stageAttrs.containsBlock(editorModel_1.editingBlockIdByInspector)) {
        var l = stageAttrs.getBlock(editorModel_1.editingBlockIdByInspector);
        Object.keys(l).forEach(function (i) {
            var attr = stageAttrs.getAttr(editorModel_1.editingBlockIdByInspector, parseInt(i));
            renderAttributeUI(parseInt(i), attr.attrName, attr.attrVal);
        });
    }
}
exports.updateEditBlockUI = updateEditBlockUI;
// Todo: [x] attrNameをattrIdに変える
// Todo: オーバーロード export function renderAttributeUI(attrId: number, attr: stage.Attr);
function renderAttributeUI(attrId, inputName, inputValue) {
    // Attrをグループ化しておく
    var elemGroup = document.createElement("section");
    elemGroup.id = "ed-attr-field-" + attrId;
    // attrのNameを指定するInput (途中)
    var nameElem = document.createElement("input");
    nameElem.type = "text";
    nameElem.id = "ed-attr-name-" + attrId;
    nameElem.classList.add("ed-attr-name");
    nameElem.placeholder = "name";
    if (typeof inputName !== "undefined") {
        nameElem.value = inputName;
    }
    nameElem.addEventListener("keydown", changeAttrName);
    // valueに当たるInput
    var valElem = document.createElement("input");
    valElem.type = "text";
    valElem.id = "ed-attr-" + attrId;
    valElem.classList.add("ed-attr-val");
    valElem.placeholder = "value";
    if (typeof inputValue !== "undefined") {
        valElem.value = inputValue;
    }
    valElem.addEventListener("keydown", changeAttrVal);
    // attrの削除
    var removeButton = document.createElement("button");
    removeButton.innerHTML = '<i class="fa fa-minus"></i>';
    removeButton.classList.add("pla-btn");
    removeButton.id = "ed-attr-remove-" + attrId;
    removeButton.addEventListener("click", clickRemoveAttr);
    // elemGroupへ追加。順番に注意!
    elemGroup.appendChild(removeButton);
    elemGroup.appendChild(nameElem);
    elemGroup.appendChild(document.createTextNode(":"));
    elemGroup.appendChild(valElem);
    // 最後にattr-viewにすべて追加
    document.getElementsByClassName("ed-attr-view")[0].appendChild(elemGroup);
}
exports.renderAttributeUI = renderAttributeUI;
function changeAttrVal(e) {
    console.log("hg!!");
    // Todo: [x] stageAttrsで、inputNameかinputValかどちらかを変えられるように、オーバーロードを作る
    stageAttrs.update(editorModel_1.editingBlockIdByInspector, parseInt(e.target.id.replace("ed-attr-", "")), { attrVal: e.target.value });
}
exports.changeAttrVal = changeAttrVal;
function changeAttrName(e) {
    stageAttrs.update(editorModel_1.editingBlockIdByInspector, parseInt(e.target.id.replace("ed-attr-name-", "")), { attrName: e.target.value });
}
exports.changeAttrName = changeAttrName;
function clickRemoveAttr(e) {
    var attrId = parseInt(e.target.id.replace("ed-attr-remove-", ""));
    stageAttrs.removeAttr(editorModel_1.editingBlockIdByInspector, attrId);
    document.getElementsByClassName("ed-attr-view")[0].removeChild(document.getElementById("ed-attr-field-" + attrId));
}
exports.clickRemoveAttr = clickRemoveAttr;
},{"./model/editorModel":17,"./model/stageAttrsModel":20}],10:[function(require,module,exports){
/**
 * (#41) lodashとかでかぶ~~るかな・・~~らない
 */
function addEventListenerforQuery(query, eventName, listener) {
    forEachforQuery(query, function (i) {
        i.addEventListener(eventName, listener);
    });
}
exports.addEventListenerforQuery = addEventListenerforQuery;
function forEachforQuery(query, listener) {
    Array.prototype.forEach.call(document.querySelectorAll(query), listener);
}
exports.forEachforQuery = forEachforQuery;
},{}],11:[function(require,module,exports){
var elem_1 = require("./elem");
/**
 * .ev-XXと定義された要素に、イベントをつけます。
 */
function set(listenerNamespace) {
    elem_1.forEachforQuery(".ev-btn", function (i) {
        i.addEventListener("click", listenerNamespace[i.dataset["listener"]]);
    });
    elem_1.forEachforQuery(".ev-input", function (i) {
        var elem = i;
        if (typeof elem.dataset["default"] !== "undefined") {
            elem.value = elem.dataset["default"];
        }
        if (typeof elem.dataset["change"] !== "undefined") {
            elem.addEventListener("change", listenerNamespace[elem.dataset["change"]]);
        }
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = set;
},{"./elem":10}],12:[function(require,module,exports){
var list_1 = require("./classes/list");
/**
 * 廃止の方向で・・
 * - どの関数が呼ばれているのかなどがわかりにくい
 * - observe？
 */
var eventHandlers = new list_1.default();
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
exports.addEventListener = addEventListener;
function raiseEvent(eventName, params) {
    if (eventHandlers.contains(eventName)) {
        eventHandlers.get(eventName).forEach(function (i) {
            i(params, eventName);
        });
    }
}
exports.raiseEvent = raiseEvent;
},{"./classes/list":3}],13:[function(require,module,exports){
/**
 * 画像処理系はここにまとめたい。(makePrefabDataUrls.ts)
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = image;
},{}],14:[function(require,module,exports){
var handlerList = new Array();
/**
 * DOMContentLoadedのタイミングで呼ばれます。
 */
function add(fn) {
    handlerList.push(fn);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = add;
document.addEventListener('DOMContentLoaded', function () {
    handlerList.forEach(function (i) {
        i();
    });
});
},{}],15:[function(require,module,exports){
var version_1 = require("./version");
/**
 * 構造化した、jsonPlanet関連を提供します。
 */
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
            result.push(this.attr);
        }
        return result;
    };
    jsonBlockItem.fromArray = function (ar) {
        var result = new jsonBlockItem(ar[0], ar[1], ar[2], ar[3]);
        // Todo: Attr
        if (typeof ar[4] !== "undefined") {
            // attrが存在する場合
            result.attr = ar[4];
        }
        return result;
    };
    return jsonBlockItem;
})();
exports.jsonBlockItem = jsonBlockItem;
var jsonPlanet = (function () {
    function jsonPlanet(jsonPlanetVersion, stage, skyboxes) {
        if (stage === void 0) { stage = []; }
        if (skyboxes === void 0) { skyboxes = []; }
        this.jsonPlanetVersion = jsonPlanetVersion;
        this.stage = stage;
        this.skyboxes = skyboxes;
    }
    jsonPlanet.prototype.exportJson = function () {
        var result = {};
        result["jsonPlanetVersion"] = this.jsonPlanetVersion;
        if (this.skyboxes !== []) {
            result["skyboxes"] = this.skyboxes;
        }
        result["stage"] = [];
        for (var i = 0; i < this.stage.length; i++) {
            result["stage"][i] = [];
            this.stage[i].forEach(function (j) {
                result["stage"][i].push(j.toArray());
            });
        }
        ;
        return result;
    };
    jsonPlanet.importJson = function (json) {
        var result = new jsonPlanet(json["jsonPlanetVersion"] || version_1.jsonPlanetVersion);
        // stage
        var stage = json["stage"];
        for (var i = 0; i < stage.length; i++) {
            result.stage[i] = [];
            stage[i].forEach(function (j) {
                result.stage[i].push(jsonBlockItem.fromArray(j));
            });
        }
        ;
        // skyboxes
        var skyboxes = json["skyboxes"];
        var skyboxCounter = 0;
        skyboxes.forEach(function (i) {
            result.skyboxes[skyboxCounter++] = i;
        });
        return result;
    };
    /**
     * 昔はCSVを使っていたものです・・
     */
    jsonPlanet.fromCSV = function (csv) {
        var result = new jsonPlanet(version_1.jsonPlanetVersion, [[]]);
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
            result.stage[0].push(new jsonBlockItem(items[0], parseInt(items[1]), parseInt(items[2]), nameAndblock[1]));
        });
        return result;
    };
    return jsonPlanet;
})();
exports.jsonPlanet = jsonPlanet;
},{"./version":32}],16:[function(require,module,exports){
var packManager_1 = require("./packUtil/packManager");
var vector2_1 = require("./classes/vector2");
var image_1 = require("./image");
var packModel_1 = require("./model/packModel");
var preferencesModel_1 = require("./model/preferencesModel");
/**
 * Todo: 必要性 -> image.tsとの統合
 */
function makeDataUrl() {
    var result;
    var blockList = packModel_1.pack.blocks.getAll();
    Object.keys(blockList).forEach(function (i) {
        result[i] = image_1.default(packManager_1.getPackPath(preferencesModel_1.currentPackName) + packModel_1.pack.blocks.get(i).data.filename, true, new vector2_1.default(preferencesModel_1.defaultGridSize, preferencesModel_1.defaultGridSize)).src;
    });
    var objList = packModel_1.pack.objs.getAll();
    Object.keys(objList).forEach(function (i) {
        var item = packModel_1.pack.objs.get(i).data;
        result[i] = image_1.default(packManager_1.getPackPath(preferencesModel_1.currentPackName) + item.filename, true, new vector2_1.default(item.width, item.height)).src;
    });
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeDataUrl;
},{"./classes/vector2":7,"./image":13,"./model/packModel":18,"./model/preferencesModel":19,"./packUtil/packManager":25}],17:[function(require,module,exports){
/**
 * (#43) Controllerにしたい
 * でも、export var が readonlyになっちゃうんだよねー。
 * だから、ModelとControllerを共存させてしまっている
 */
function setActiveStageLayer(layerIndex) {
    exports.activeStageLayerInEditor = layerIndex;
}
exports.setActiveStageLayer = setActiveStageLayer;
function setIsTrayFullscreen(isFullscreen) {
    exports.isTrayFullscreen = isFullscreen;
}
exports.setIsTrayFullscreen = setIsTrayFullscreen;
function setIsVisibleInspector(isVisible) {
    exports.isVisibleInspector = isVisible;
}
exports.setIsVisibleInspector = setIsVisibleInspector;
function setEditingBlockId(blockId) {
    exports.editingBlockIdByInspector = blockId;
}
exports.setEditingBlockId = setEditingBlockId;
function setIsObjMode(isObjMode) {
    exports.isObjModeInEditor = isObjMode;
}
exports.setIsObjMode = setIsObjMode;
/**
 * EditorModelのフィールドに、デフォルトの値を設定します。
 */
function setDefaultValues() {
    exports.activeStageLayerInEditor = 0;
    exports.isTrayFullscreen = false;
    exports.isObjModeInEditor = false;
    exports.isVisibleInspector = false;
}
exports.setDefaultValues = setDefaultValues;
},{}],18:[function(require,module,exports){
function setPack(p) {
    exports.pack = p;
}
exports.setPack = setPack;
},{}],19:[function(require,module,exports){
function setCurrentPackName(packName) {
    exports.currentPackName = packName;
}
exports.setCurrentPackName = setCurrentPackName;
function setDefaultGridSize(gridSize) {
    exports.defaultGridSize = gridSize;
}
exports.setDefaultGridSize = setDefaultGridSize;
function setDefaultBlockSize(blockSize) {
    exports.defaultBlockSize = blockSize;
}
exports.setDefaultBlockSize = setDefaultBlockSize;
/**
  * PreferencesModelのフィールドに、デフォルトの値を設定します。
 */
function setDefaultValues() {
    // ココらへんの値、jsonからとりたい。
    exports.currentPackName = "oa";
    exports.defaultGridSize = 25;
    exports.defaultBlockSize = 50;
}
exports.setDefaultValues = setDefaultValues;
},{}],20:[function(require,module,exports){
// Todo: このクラスを分離
var Attr = (function () {
    function Attr(attrName, attrVal) {
        if (attrName === void 0) { attrName = ""; }
        if (attrVal === void 0) { attrVal = ""; }
        this.attrName = attrName;
        this.attrVal = attrVal;
    }
    return Attr;
})();
exports.Attr = Attr;
// Attrをブロックごとに管理
var blockAttrsList;
function setAll(lst) {
    blockAttrsList = lst;
}
exports.setAll = setAll;
function push(blockId, attrId, value) {
    if (typeof blockAttrsList[blockId] === "undefined") {
        blockAttrsList[blockId] = {};
    }
    blockAttrsList[blockId][attrId] = value;
}
exports.push = push;
function update(blockId, attrId, attr) {
    if (attr instanceof Attr) {
        // attrNameをAttrで指定するとき
        blockAttrsList[blockId][attrId] = attr;
    }
    else {
        // attrName、attrValで指定するとき
        var cur = blockAttrsList[blockId][attrId];
        if (typeof attr["attrName"] !== "undefined") {
            cur.attrName = attr["attrName"];
        }
        if (typeof attr["attrVal"] !== "undefined") {
            cur.attrVal = attr["attrVal"];
        }
        blockAttrsList[blockId][attrId] = cur;
    }
}
exports.update = update;
function containsAttr(blockId, attrId) {
    // blockIdがundefinedのときは、エラーが出ないよう、falseを返しておく。
    if (typeof blockAttrsList[blockId] === "undefined") {
        return false;
    }
    else {
        return typeof blockAttrsList[blockId][attrId] !== "undefined";
    }
}
exports.containsAttr = containsAttr;
function containsBlock(blockId) {
    return typeof blockAttrsList[blockId] !== "undefined";
}
exports.containsBlock = containsBlock;
function removeAttr(blockId, attrId) {
    delete blockAttrsList[blockId][attrId];
}
exports.removeAttr = removeAttr;
function removeBlock(blockId) {
    delete blockAttrsList[blockId];
}
exports.removeBlock = removeBlock;
function getBlock(blockId) {
    return blockAttrsList[blockId];
}
exports.getBlock = getBlock;
function getAttr(blockId, attrId) {
    return blockAttrsList[blockId][attrId];
}
exports.getAttr = getAttr;
function getAll() {
    return blockAttrsList;
}
exports.getAll = getAll;
function clear() {
    blockAttrsList = {};
}
exports.clear = clear;
// attrId関係
function getMaxAttrId(blockId) {
    if (typeof blockAttrsList[blockId] === "undefined") {
        return 0;
    }
    else {
        return Object.keys(blockAttrsList[blockId]).length;
    }
}
exports.getMaxAttrId = getMaxAttrId;
function init() {
    blockAttrsList = {};
}
exports.init = init;
},{}],21:[function(require,module,exports){
var StageEffects = (function () {
    function StageEffects() {
        this.skyboxes = [""];
    }
    return StageEffects;
})();
exports.StageEffects = StageEffects;
exports.stageEffects = new StageEffects();
function setStageEffects(effect) {
    exports.stageEffects = effect;
}
exports.setStageEffects = setStageEffects;
},{}],22:[function(require,module,exports){
var list_1 = require("./../classes/list");
/**
 * ステージ上のすべてのPrefabのリスト
 */
var prefabList;
/**
 * stageLayer別のIdを格納
 */
var prefabLayer;
/**
 * 内部でpushStageLayerを呼び出します
 */
function push(id, p, stageLayer) {
    if (stageLayer === void 0) { stageLayer = 0; }
    prefabList[id] = p;
    pushStageLayer(stageLayer, id);
}
exports.push = push;
function all() {
    return prefabList;
}
exports.all = all;
function remove(id, stageLayer) {
    prefabLayer[stageLayer].splice(prefabLayer[stageLayer].indexOf(id), 1);
    delete prefabList[id];
}
exports.remove = remove;
function clear() {
    prefabList = {};
}
exports.clear = clear;
function get(id) {
    return prefabList[id];
}
exports.get = get;
/**
 * レイヤーごとにItemを取得
 */
function getLayerItems(stageLayer) {
    var ids = getLayerIds(stageLayer);
    var result = new list_1.default();
    ids.forEach(function (i) {
        result.push(i.toString(), get(i));
    });
    return result;
}
exports.getLayerItems = getLayerItems;
function pushStageLayer(stageLayer, id) {
    if (typeof prefabLayer[stageLayer] === "undefined") {
        prefabLayer[stageLayer] = [];
    }
    prefabLayer[stageLayer].push(id);
}
exports.pushStageLayer = pushStageLayer;
function getLayerIds(stageLayer) {
    if (typeof prefabLayer[stageLayer] === "undefined") {
        prefabLayer[stageLayer] = [];
    }
    return prefabLayer[stageLayer];
}
exports.getLayerIds = getLayerIds;
function getAllLayer() {
    return prefabLayer;
}
exports.getAllLayer = getAllLayer;
var maxId;
function getId() {
    return maxId++;
}
exports.getId = getId;
function resetId() {
    maxId = 0;
}
exports.resetId = resetId;
function init() {
    prefabList = {};
    prefabLayer = new Array();
    maxId = 0;
}
exports.init = init;
},{"./../classes/list":3}],23:[function(require,module,exports){
function setActiveBlock(trayBlockDetails) {
    exports.activeBlock = trayBlockDetails;
}
exports.setActiveBlock = setActiveBlock;
function setActiveBlockImage(image) {
    exports.activeBlockImage = image;
}
exports.setActiveBlockImage = setActiveBlockImage;
function setActiveToolName(toolName) {
}
exports.setActiveToolName = setActiveToolName;
function setTrayBlockDataUrls(dataUrls) {
}
exports.setTrayBlockDataUrls = setTrayBlockDataUrls;
/**
 * TrayModelのフィールドに、デフォルトの値を設定します。
 */
function setDefaultValues() {
    exports.activeToolName = "pencil";
    exports.trayBlockDataUrls = {};
}
exports.setDefaultValues = setDefaultValues;
},{}],24:[function(require,module,exports){
/// <reference path="../../../typings/es6-promise/es6-promise.d.ts" />
var packManager_1 = require("./../packUtil/packManager");
function load(packName) {
    return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", packManager_1.getPackPath(packName) + "packinfo.json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            }
        };
        xhr.send(null);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = load;
},{"./../packUtil/packManager":25}],25:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var list_1 = require("./../classes/list");
function getPackPath(packName) {
    return "pack/" + packName + "/";
}
exports.getPackPath = getPackPath;
var packModule = (function () {
    function packModule(data) {
        var _this = this;
        this.pack = new packInfo(data["pack"]);
        this.blocks = new list_1.default();
        Object.keys(data["blocks"]).forEach(function (i) {
            _this.blocks.push(i, new blockInfo({ bName: data["blocks"][i]["name"], filename: data["blocks"][i]["filename"] }));
        });
        this.objs = new list_1.default();
        Object.keys(data["objs"]).forEach(function (i) {
            var cur = data["objs"][i];
            if (cur["hidden"]) {
                _this.objs.push(i, new objInfo({ oName: cur["name"], filename: cur["filename"], width: cur["width"], height: cur["height"], type: cur["type"] }));
            }
            else {
                _this.objs.push(i, new objInfo({ oName: cur["name"], filename: cur["filename"], width: cur["width"], height: cur["height"], type: cur["type"], hidden: cur["hidden"] }));
            }
        });
        this.descriptions = new list_1.default();
        Object.keys(data["descriptions"]).forEach(function (i) {
            var cur = data["descriptions"][i];
            _this.descriptions.push(i, new desInfo(cur));
        });
        this.skyboxes = new skyboxInfoList();
        Object.keys(data["skyboxes"]).forEach(function (i) {
            _this.skyboxes.push(i, new skyboxInfo(data["skyboxes"][i]));
        });
        this.editor = data["editor"];
    }
    return packModule;
})();
exports.packModule = packModule;
var packEditorInfo = (function () {
    function packEditorInfo(defaultSkybox, defaultBlock, skyboxMode, skyboxSize) {
        this.defaultSkybox = defaultSkybox;
        this.defaultBlock = defaultBlock;
        this.skyboxMode = skyboxMode;
        this.skyboxSize = skyboxSize;
    }
    return packEditorInfo;
})();
exports.packEditorInfo = packEditorInfo;
var packInfo = (function () {
    function packInfo(data) {
        this.pName = data["name"];
        this.version = data["version"];
        this.author = data["author"];
        this.exportType = data["exportType"];
    }
    return packInfo;
})();
exports.packInfo = packInfo;
var packItem = (function () {
    function packItem(p) {
        this.data = p;
    }
    return packItem;
})();
exports.packItem = packItem;
var blockInfo = (function (_super) {
    __extends(blockInfo, _super);
    function blockInfo() {
        _super.apply(this, arguments);
    }
    return blockInfo;
})(packItem);
exports.blockInfo = blockInfo;
var objInfo = (function (_super) {
    __extends(objInfo, _super);
    function objInfo() {
        _super.apply(this, arguments);
    }
    return objInfo;
})(packItem);
exports.objInfo = objInfo;
var desInfo = (function (_super) {
    __extends(desInfo, _super);
    function desInfo() {
        _super.apply(this, arguments);
    }
    return desInfo;
})(packItem);
exports.desInfo = desInfo;
var skyboxInfo = (function (_super) {
    __extends(skyboxInfo, _super);
    function skyboxInfo() {
        _super.apply(this, arguments);
    }
    return skyboxInfo;
})(packItem);
exports.skyboxInfo = skyboxInfo;
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
})(list_1.default);
exports.skyboxInfoList = skyboxInfoList;
},{"./../classes/list":3}],26:[function(require,module,exports){
var stage = require("./stage");
var stageEffectsModel_1 = require("./model/stageEffectsModel");
var stageItems = require("./model/stageItemsModel");
var stageAttrs = require("./model/stageAttrsModel");
var prefab_1 = require("./classes/prefab");
var jsonPlanet_1 = require("./jsonPlanet");
var version_1 = require("./version");
var editorModel_1 = require("./model/editorModel");
var packModel_1 = require("./model/packModel");
var preferencesModel_1 = require("./model/preferencesModel");
// stageから、compilerを利用して、外部形式へ入出力する機能を提供します。
/**
 * stageを、jsonPlanetへ変換します。
 * jsonPlanetから、jsonに変換するのには、jsonPlanet.exportJson()を利用してください。
 */
function toJsonPlanet() {
    var result = new jsonPlanet_1.jsonPlanet(version_1.jsonPlanetVersion);
    Object.keys(stageEffectsModel_1.stageEffects.skyboxes).forEach(function (i) {
        result.skyboxes.push(stageEffectsModel_1.stageEffects.skyboxes[parseInt(i)]);
    });
    var items = stageItems.getAllLayer();
    for (var i = 0; i < items.length; i++) {
        result.stage[i] = [];
        items[i].forEach(function (j) {
            var item = stageItems.get(j);
            if (stageAttrs.containsBlock(j)) {
                // attrがあるとき
                var attr = {};
                var attrs = stageAttrs.getBlock(j);
                Object.keys(attrs).forEach(function (k) {
                    attr[attrs[parseInt(k)].attrName] = attrs[parseInt(k)].attrVal;
                });
                result.stage[i].push(new jsonPlanet_1.jsonBlockItem(item.blockName, item.gridX, item.gridY, j.toString(), attr));
            }
            else {
                result.stage[i].push(new jsonPlanet_1.jsonBlockItem(item.blockName, item.gridX, item.gridY, j.toString()));
            }
        });
    }
    return result;
}
exports.toJsonPlanet = toJsonPlanet;
/**
 * jsonPlanetを、stageへ変換します。
 * 内部で、stage.itemsをクリアし、新しくpushします。
 */
function fromJsonPlanet(jsonPla) {
    stageItems.clear();
    stageAttrs.clear();
    stageItems.resetId();
    for (var i = 0; i < jsonPla.stage.length; i++) {
        jsonPla.stage[i].forEach(function (j) {
            var id = stageItems.getId();
            if (packModel_1.pack.objs.contains(j.blockName)) {
                var objData = packModel_1.pack.objs.get(j.blockName);
                stageItems.push(id, new prefab_1.default(j.posX, j.posY, objData.data.filename, j.blockName, stage.toGridPos(objData.data.width), stage.toGridPos(objData.data.height)), i);
            }
            else {
                var blockData = packModel_1.pack.blocks.get(j.blockName);
                stageItems.push(id, new prefab_1.default(j.posX, j.posY, blockData.data.filename, j.blockName, stage.toGridPos(preferencesModel_1.defaultBlockSize), stage.toGridPos(preferencesModel_1.defaultBlockSize)), i);
            }
            if (typeof j.attr !== "undefined") {
                Object.keys(j.attr).forEach(function (k) {
                    stageAttrs.push(id, stageAttrs.getMaxAttrId(id), new stageAttrs.Attr(k, j.attr[k]));
                });
            }
        });
    }
    editorModel_1.setActiveStageLayer(0);
    var result = new stageEffectsModel_1.StageEffects();
    // skyboxes
    result.skyboxes = jsonPla.skyboxes;
    return result;
}
exports.fromJsonPlanet = fromJsonPlanet;
},{"./classes/prefab":4,"./jsonPlanet":15,"./model/editorModel":17,"./model/packModel":18,"./model/preferencesModel":19,"./model/stageAttrsModel":20,"./model/stageEffectsModel":21,"./model/stageItemsModel":22,"./stage":27,"./version":32}],27:[function(require,module,exports){
var rect_1 = require("./classes/rect");
var event_1 = require("./event");
var vector2_1 = require("./classes/vector2");
var stageAttrsModel_1 = require("./model/stageAttrsModel");
var stageItems = require("./model/stageItemsModel");
var editorModel_1 = require("./model/editorModel");
var stageRenderView_1 = require("./view/stageRenderView");
var preferencesModel_1 = require("./model/preferencesModel");
/**
 * 現在のStage情報を保存します。
 */
var stage;
(function (stage) {
    /**
     * アクティブなstageLayerを変えるほか、画面の切り替えも行います。
     */
    function changeActiveStageLayer(stageLayer) {
        editorModel_1.setActiveStageLayer(stageLayer);
        // 描画
        stageRenderView_1.default(stageLayer);
    }
    stage.changeActiveStageLayer = changeActiveStageLayer;
    function init() {
        stageItems.init();
        stageAttrsModel_1.init();
    }
    init();
    var isResizeRequest = false;
    var resizeTimerId;
    event_1.addEventListener("resize", function () {
        if (isResizeRequest) {
            clearTimeout(resizeTimerId);
        }
        isResizeRequest = true;
        resizeTimerId = setTimeout(function () {
            isResizeRequest = false;
            stageRenderView_1.default(editorModel_1.activeStageLayerInEditor);
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
        return center - ((size - preferencesModel_1.defaultGridSize) / 2);
    }
    stage.getMousePosFromCenterAndSize = getMousePosFromCenterAndSize;
    stage.scrollX = 0;
    stage.scrollY = 0;
    stage.scrollBeforeX = 0;
    stage.scrollBeforeY = 0;
    function getGridPosFromMousePos(mousePos) {
        var cX = mousePos.x - stage.scrollX;
        var cY = mousePos.y - stage.scrollY;
        var eX = cX - (cX % preferencesModel_1.defaultGridSize);
        var eY = cY - (cY % preferencesModel_1.defaultGridSize);
        var gridX = eX / preferencesModel_1.defaultGridSize;
        var gridY = eY / preferencesModel_1.defaultGridSize;
        return new vector2_1.default(gridX, gridY);
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
    function getPrefabFromGrid(grid, stageLayer) {
        var result = new getPrefabFromGridDetails(false, -1, null);
        var breakException = {};
        // breakするため
        try {
            Object.keys(stageItems.getLayerItems(stageLayer).getAll()).forEach(function (i) {
                var item = stageItems.get(parseInt(i));
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
        return gridPos * preferencesModel_1.defaultGridSize;
    }
    stage.toMousePos = toMousePos;
    function toGridPos(mousePos) {
        return (mousePos - (mousePos % preferencesModel_1.defaultGridSize)) / preferencesModel_1.defaultGridSize;
    }
    stage.toGridPos = toGridPos;
    /**
     * すべてgridPosで指定された4点のrectを、描画領域に変換します。
     */
    function toDrawRect(gridRect) {
        return new rect_1.default(stage.scrollX + getMousePosFromCenterAndSize(toMousePos(gridRect.x), toMousePos(gridRect.width)), stage.scrollY + getMousePosFromCenterAndSize(toMousePos(gridRect.y), toMousePos(gridRect.height)), toMousePos(gridRect.width), toMousePos(gridRect.height));
    }
    stage.toDrawRect = toDrawRect;
})(stage || (stage = {}));
module.exports = stage;
},{"./classes/rect":5,"./classes/vector2":7,"./event":12,"./model/editorModel":17,"./model/preferencesModel":19,"./model/stageAttrsModel":20,"./model/stageItemsModel":22,"./view/stageRenderView":33}],28:[function(require,module,exports){
var image_1 = require("./image");
var trayBlockDetails_1 = require("./classes/trayBlockDetails");
var event_1 = require("./event");
var packManager_1 = require("./packUtil/packManager");
var packModel_1 = require("./model/packModel");
var trayModel = require("./model/trayModel");
var preferencesModel_1 = require("./model/preferencesModel");
/**
 * Tray（UI下部分）のUI、Controllerを構成します。
 */
function updateActiveBlock(blockName, fileName, label, width, height) {
    var w = width || preferencesModel_1.defaultBlockSize;
    var h = height || preferencesModel_1.defaultBlockSize;
    trayModel.setActiveBlock(new trayBlockDetails_1.default(blockName, fileName, label, w, h));
    updateSelectImage();
}
exports.updateActiveBlock = updateActiveBlock;
function updateSelectImage() {
    trayModel.setActiveBlockImage(image_1.default(trayModel.trayBlockDataUrls[trayModel.activeBlock.blockName]));
}
exports.updateSelectImage = updateSelectImage;
function initTrayBlock(finishedOne) {
    return new Promise(function (resolve) {
        var list = Object.keys(packModel_1.pack.blocks.getAll());
        var result = [];
        var async = function (i) {
            var item = list[i];
            var li = document.createElement("div");
            li.classList.add("tray-list", "tray-list-block");
            li.addEventListener("mousedown", function (e) { event_1.raiseEvent("ui_clickTray", e); });
            var img = document.createElement("img");
            img.src = packManager_1.getPackPath(preferencesModel_1.currentPackName) + packModel_1.pack.blocks.get(item).data.filename;
            img.onload = function () {
                img.alt = packModel_1.pack.blocks.get(item).data.bName;
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
exports.initTrayBlock = initTrayBlock;
function initTrayObj(finishedOne) {
    return new Promise(function (resolve) {
        var list = Object.keys(packModel_1.pack.objs.getAll());
        var result = [];
        var async = function (i) {
            var item = list[i];
            var li = document.createElement("div");
            li.classList.add("tray-list", "tray-list-obj");
            li.addEventListener("click", function (e) { event_1.raiseEvent("ui_clickTray", e); });
            var img = document.createElement("img");
            img.src = packManager_1.getPackPath(preferencesModel_1.currentPackName) + packModel_1.pack.objs.get(item).data.filename;
            img.onload = function () {
                img.alt = packModel_1.pack.objs.get(item).data.oName;
                img.dataset["block"] = item;
                li.style.width = img.style.width =
                    packModel_1.pack.objs.get(item).data.width / (packModel_1.pack.objs.get(item).data.height / 50) + "px";
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
exports.initTrayObj = initTrayObj;
},{"./classes/trayBlockDetails":6,"./event":12,"./image":13,"./model/packModel":18,"./model/preferencesModel":19,"./model/trayModel":23,"./packUtil/packManager":25}],29:[function(require,module,exports){
/// <reference path="../../definitely/move.d.ts" />
function showTrayFull() {
    move(".pla-footer").set("height", "100%").duration("0.5s").end();
}
exports.showTrayFull = showTrayFull;
function hideTrayFull() {
    move(".pla-footer").set("height", "50px").duration("0.5s").end();
}
exports.hideTrayFull = hideTrayFull;
function showInspector() {
    move(".pla-inspector")
        .set("left", "80%")
        .duration("0.5s")
        .end();
}
exports.showInspector = showInspector;
function hideInspector() {
    move(".pla-inspector")
        .set("left", "100%")
        .duration("0.5s")
        .end();
}
exports.hideInspector = hideInspector;
function hideLoading() {
    move(".loading")
        .set("opacity", 0)
        .duration("1s")
        .then()
        .set("display", "none")
        .pop()
        .end();
}
exports.hideLoading = hideLoading;
},{}],30:[function(require,module,exports){
var initDOM_1 = require("./../initDOM");
var guideElement;
initDOM_1.default(function () {
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
exports.focus = focus;
function hide() {
    guideElement.style.visibility = "hidden";
}
exports.hide = hide;
},{"./../initDOM":14}],31:[function(require,module,exports){
/**
 * Todo: 必要性
 * - react?
 * - packManager.ts の viewに当たる？
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = obj2SelectElem;
},{}],32:[function(require,module,exports){
/**
 * Planetのバージョン情報
 */
exports.version = "v1.0";
exports.author = "shundroid";
exports.jsonPlanetVersion = 0.1;
},{}],33:[function(require,module,exports){
var stage = require("./../stage");
var canvas = require("./../canvas");
var stageItems = require("./../model/stageItemsModel");
var image_1 = require("./../image");
var rect_1 = require("./../classes/rect");
var trayModel_1 = require("./../model/trayModel");
/**
 * ステージをstageLayerに基づき描画します。
 */
function renderStage(renderStageLayer) {
    if (renderStageLayer === void 0) { renderStageLayer = 0; }
    canvas.clear();
    var l = stageItems.getLayerItems(renderStageLayer).getAll();
    Object.keys(l).forEach(function (i) {
        var item = stageItems.get(parseInt(i));
        var x = stage.scrollX + stage.getMousePosFromCenterAndSize(stage.toMousePos(item.gridX), stage.toMousePos(item.gridW));
        var y = stage.scrollY + stage.getMousePosFromCenterAndSize(stage.toMousePos(item.gridY), stage.toMousePos(item.gridH));
        var width = stage.toMousePos(item.gridW);
        var height = stage.toMousePos(item.gridH);
        // 画面内に入っているか
        if (x + width >= 0 && x <= canvas.canvasRect.width &&
            y + height >= 0 && y <= canvas.canvasRect.height) {
            canvas.render(image_1.default(trayModel_1.trayBlockDataUrls[item.blockName]), new rect_1.default(x, y, width, height));
        }
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = renderStage;
},{"./../canvas":2,"./../classes/rect":5,"./../image":13,"./../model/stageItemsModel":22,"./../model/trayModel":23,"./../stage":27}],34:[function(require,module,exports){
var initDOM_1 = require("./modules/initDOM");
var event = require("./modules/event");
var elem_1 = require("./modules/elem");
var util_1 = require("./modules/util");
var vector2_1 = require("./modules/classes/vector2");
var tray = require("./modules/tray");
var packManager_1 = require("./modules/packUtil/packManager");
var planet_1 = require("./modules/planet");
var stage = require("./modules/stage");
var stageEffectsModel_1 = require("./modules/model/stageEffectsModel");
var stageAttrs = require("./modules/model/stageAttrsModel");
var v = require("./modules/version");
var evElems_1 = require("./modules/evElems");
var anim = require("./modules/ui/anim");
var editBlock_1 = require("./modules/editBlock");
var jsonPlanet_1 = require("./modules/jsonPlanet");
var editorModel = require("./modules/model/editorModel");
var stageRenderView_1 = require("./modules/view/stageRenderView");
var packModel_1 = require("./modules/model/packModel");
var preferencesModel_1 = require("./modules/model/preferencesModel");
var trayModel_1 = require("./modules/model/trayModel");
/**
 * UIに関する処理を行います。
 */
var ui;
(function (ui) {
    function init() {
        window.addEventListener("resize", function () {
            event.raiseEvent("resize", null);
        });
        event.addEventListener("ui_clickTray", function (e) {
            var target = e.target;
            editorModel.setIsObjMode(target.parentElement.classList.contains("tray-list-obj"));
            if (!editorModel.isObjModeInEditor) {
                var item = packModel_1.pack.blocks.get(target.dataset["block"]).data;
                tray.updateActiveBlock(target.dataset["block"], item.filename, item.bName);
            }
            else {
                var item = packModel_1.pack.objs.get(target.dataset["block"]).data;
                tray.updateActiveBlock(target.dataset["block"], item.filename, item.oName, item.width, item.height);
            }
            changeActiveBlock(target.dataset["block"]);
        });
        event.addEventListener("ui_downCanvas|ui_moveCanvas|ui_upCanvas|ui_hoveringCanvas", function (e, eventName) {
            var g = stage.getGridPosFromMousePos(new vector2_1.default(e.clientX, e.clientY));
            event.raiseEvent("gridCanvas", new stage.gridDetail(g, eventName.replace("ui_", "").replace("Canvas", ""), new vector2_1.default(e.clientX, e.clientY)));
        });
        event.addEventListener("initedPack", function () {
            // SkyboxMode
            if (typeof packModel_1.pack.editor.skyboxMode !== "undefined") {
                if (packModel_1.pack.editor.skyboxMode === "repeat") {
                    document.body.style.backgroundRepeat = "repeat";
                    if (typeof packModel_1.pack.editor.skyboxSize !== "undefined") {
                        document.body.style.backgroundSize = packModel_1.pack.editor.skyboxSize;
                    }
                    else {
                        document.body.style.backgroundSize = "auto";
                    }
                }
            }
            elem_1.forEachforQuery(".pack-select", function (i) {
                var elem = i;
                elem.innerHTML = util_1.default(packModel_1.pack[elem.dataset["items"]].toSimple());
            });
            document.getElementById("stg-skybox").value = packModel_1.pack.editor.defaultSkybox;
        });
    }
    initDOM_1.default(function () {
        evElems_1.default(ui);
        document.getElementById("pla-ver").innerHTML = "Planet " + v.version + " by " + v.author;
        elem_1.addEventListenerforQuery(".ins-show-btn", "click", clickInsShowBtn);
        elem_1.addEventListenerforQuery(".tray-list-tool", "mousedown", clickTrayTool);
        // movejsを読む
        var movejs = document.createElement("script");
        movejs.src = "bower_components/move.js/move.js";
        document.head.appendChild(movejs);
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
        if (!editorModel.isTrayFullscreen) {
            closeInspector();
            anim.showTrayFull();
            e.target.textContent = "↓";
        }
        else {
            anim.hideTrayFull();
            e.target.textContent = "↑";
        }
        editorModel.setIsTrayFullscreen(!editorModel.isTrayFullscreen);
    }
    ui.togglefullScreen = togglefullScreen;
    function closeInspector() {
        if (!editorModel.isVisibleInspector)
            return;
        editorModel.setIsVisibleInspector(false);
        anim.hideInspector();
    }
    ui.closeInspector = closeInspector;
    function showInspector(inspectorName) {
        document.querySelector(".ins-article-active") && document.querySelector(".ins-article-active").classList.remove("ins-article-active");
        document.getElementById("ins-" + inspectorName).classList.add("ins-article-active");
        if (editorModel.isVisibleInspector)
            return;
        editorModel.setIsVisibleInspector(true);
        anim.showInspector();
    }
    ui.showInspector = showInspector;
    function clickExport() {
        document.getElementById("pla-io").value = JSON.stringify(planet_1.toJsonPlanet().exportJson());
    }
    ui.clickExport = clickExport;
    function clickImport() {
        // fromJSONPlanet内で、editorModel.activeStageLayerは0になる。
        var effects = planet_1.fromJsonPlanet(jsonPlanet_1.jsonPlanet.importJson(JSON.parse(document.getElementById("pla-io").value)));
        stageEffectsModel_1.setStageEffects(effects);
        setSkybox(packManager_1.getPackPath(preferencesModel_1.currentPackName) + packModel_1.pack.skyboxes.get(effects.skyboxes[0]).data.filename);
        stageRenderView_1.default(0);
    }
    ui.clickImport = clickImport;
    function clickInsShowBtn(e) {
        showInspector(e.target.dataset["ins"]);
    }
    ui.clickInsShowBtn = clickInsShowBtn;
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
        trayModel_1.setActiveToolName(elem.dataset["toolname"]);
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
            JSON.stringify(jsonPlanet_1.jsonPlanet.fromCSV(document.getElementById("conv-old").value).exportJson());
    }
    ui.clickConvertOldFile = clickConvertOldFile;
    function changeSkybox(e) {
        stageEffectsModel_1.stageEffects.skyboxes[editorModel.activeStageLayerInEditor] = e.target.value;
        setSkybox(packManager_1.getPackPath(preferencesModel_1.currentPackName) + packModel_1.pack.skyboxes.get(stageEffectsModel_1.stageEffects.skyboxes[editorModel.activeStageLayerInEditor]).data.filename);
    }
    ui.changeSkybox = changeSkybox;
    function clickAddAttr() {
        var attrId = stageAttrs.getMaxAttrId(editorModel.editingBlockIdByInspector);
        stageAttrs.push(editorModel.editingBlockIdByInspector, attrId, new stageAttrs.Attr());
        editBlock_1.renderAttributeUI(attrId);
    }
    ui.clickAddAttr = clickAddAttr;
    //  export function changeAttrInput(e:Event) {
    //    stage.blockAttrs.update(editorModel.editingBlockIdByInspector, parseInt((<HTMLElement>e.target).id.replace("ed-attr-", "")), (<HTMLInputElement>e.target).value);
    //  }
    function changeActiveStageLayer(e) {
        stage.changeActiveStageLayer(parseInt(e.target.value));
        if (typeof stageEffectsModel_1.stageEffects.skyboxes[editorModel.activeStageLayerInEditor] === "undefined") {
            stageEffectsModel_1.stageEffects.skyboxes[editorModel.activeStageLayerInEditor] = packModel_1.pack.editor.defaultSkybox;
        }
        setSkybox(packManager_1.getPackPath(preferencesModel_1.currentPackName) + packModel_1.pack.skyboxes.get(stageEffectsModel_1.stageEffects.skyboxes[editorModel.activeStageLayerInEditor]).data.filename);
        document.getElementById("stg-skybox").value = stageEffectsModel_1.stageEffects.skyboxes[editorModel.activeStageLayerInEditor];
    }
    ui.changeActiveStageLayer = changeActiveStageLayer;
    init();
})(ui || (ui = {}));
module.exports = ui;
},{"./modules/classes/vector2":7,"./modules/editBlock":9,"./modules/elem":10,"./modules/evElems":11,"./modules/event":12,"./modules/initDOM":14,"./modules/jsonPlanet":15,"./modules/model/editorModel":17,"./modules/model/packModel":18,"./modules/model/preferencesModel":19,"./modules/model/stageAttrsModel":20,"./modules/model/stageEffectsModel":21,"./modules/model/trayModel":23,"./modules/packUtil/packManager":25,"./modules/planet":26,"./modules/stage":27,"./modules/tray":28,"./modules/ui/anim":29,"./modules/util":31,"./modules/version":32,"./modules/view/stageRenderView":33}]},{},[1]);
