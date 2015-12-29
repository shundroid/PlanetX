/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var ui = __webpack_require__(1);
	var initDOM = __webpack_require__(3);
	var packLoader = __webpack_require__(22);
	var packManager = __webpack_require__(19);
	var event = __webpack_require__(4);
	var list = __webpack_require__(5);
	var stage = __webpack_require__(9);
	var d = __webpack_require__(2);
	var makeDataUrl = __webpack_require__(23);
	var tray = __webpack_require__(16);
	var prefab = __webpack_require__(21);
	var Vector2 = __webpack_require__(13);
	var Rect = __webpack_require__(12);
	var canvas = __webpack_require__(10);
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
	            tray.updateActiveBlock("w1/block2", "pack/halstar/images/mapicons/w1block2-2.png", "W1草付ブロック");
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
	                        scrollX += e.mousePos.x - stage.scrollBeforeX;
	                        scrollY += e.mousePos.y - stage.scrollBeforeY;
	                        stage.renderStage();
	                    }
	                    if (e.eventName !== "mouseup") {
	                        stage.scrollBeforeX = e.mousePos.x;
	                        stage.scrollBeforeY = e.mousePos.y;
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
	/// <reference path="definitely/move.d.ts" />
	var d = __webpack_require__(2);
	var initDOM = __webpack_require__(3);
	var event = __webpack_require__(4);
	var el = __webpack_require__(6);
	var compiler = __webpack_require__(7);
	var importJS = __webpack_require__(14);
	var u = __webpack_require__(15);
	var Vector2 = __webpack_require__(13);
	var tray = __webpack_require__(16);
	var packManager = __webpack_require__(19);
	var planet = __webpack_require__(20);
	var stage = __webpack_require__(9);
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
	            var g = stage.getGridPosFromMousePos(new Vector2(e.clientX, e.clientY));
	            event.raiseEvent("gridCanvas", new stage.gridDetail(g, e.type, new Vector2(e.clientX, e.clientY)));
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
	                compiler.old2CSV(document.getElementById("conv-old").value);
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
	    function changeSkybox(e) {
	        stage.stageEffects.skybox = e.target.value;
	        setSkybox(d.pack.skyboxes.get(stage.stageEffects.skybox).data.filename);
	    }
	    ui.changeSkybox = changeSkybox;
	    init();
	})(ui || (ui = {}));
	module.exports = ui;


/***/ },
/* 2 */
/***/ function(module, exports) {

	var data = (function () {
	    function data() {
	    }
	    return data;
	})();
	module.exports = data;


/***/ },
/* 3 */
/***/ function(module, exports) {

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


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var list = __webpack_require__(5);
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
	                i(params);
	            });
	        }
	    }
	    event.raiseEvent = raiseEvent;
	})(event || (event = {}));
	module.exports = event;


/***/ },
/* 5 */
/***/ function(module, exports) {

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


/***/ },
/* 6 */
/***/ function(module, exports) {

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


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var list = __webpack_require__(5);
	var prefabMini = __webpack_require__(8);
	var stage = __webpack_require__(9);
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
	        function centerLang(prefabList, header, footer, effects) {
	            this.prefabList = prefabList;
	            this.header = header;
	            this.footer = footer;
	            this.effects = effects;
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
	        return new centerLang(result, header.join("\n"), footer.join("\n"), effects);
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
	})(compiler || (compiler = {}));
	module.exports = compiler;


/***/ },
/* 8 */
/***/ function(module, exports) {

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


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var list = __webpack_require__(5);
	var canvas = __webpack_require__(10);
	var image = __webpack_require__(11);
	var d = __webpack_require__(2);
	var rect = __webpack_require__(12);
	var event = __webpack_require__(4);
	var Vector2 = __webpack_require__(13);
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


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var initDOM = __webpack_require__(3);
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


/***/ },
/* 11 */
/***/ function(module, exports) {

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


/***/ },
/* 12 */
/***/ function(module, exports) {

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


/***/ },
/* 13 */
/***/ function(module, exports) {

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


/***/ },
/* 14 */
/***/ function(module, exports) {

	function importJS(src) {
	    var elem = document.createElement("script");
	    elem.src = src;
	    return elem;
	}
	module.exports = importJS;


/***/ },
/* 15 */
/***/ function(module, exports) {

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


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var image = __webpack_require__(11);
	var TrayBlockDetails = __webpack_require__(17);
	var d = __webpack_require__(2);
	var uiWaitMode = __webpack_require__(18);
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
	})(tray || (tray = {}));
	module.exports = tray;


/***/ },
/* 17 */
/***/ function(module, exports) {

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


/***/ },
/* 18 */
/***/ function(module, exports) {

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


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var list = __webpack_require__(5);
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


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var stage = __webpack_require__(9);
	var prefab = __webpack_require__(21);
	var compiler = __webpack_require__(7);
	var d = __webpack_require__(2);
	var planet;
	(function (planet) {
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
	        return result;
	    }
	    planet.importText = importText;
	})(planet || (planet = {}));
	module.exports = planet;


/***/ },
/* 21 */
/***/ function(module, exports) {

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


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../../typings/es6-promise/es6-promise.d.ts" />
	var packManager = __webpack_require__(19);
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


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var d = __webpack_require__(2);
	var list = __webpack_require__(5);
	var packManager = __webpack_require__(19);
	var Vector2 = __webpack_require__(13);
	var image = __webpack_require__(11);
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


/***/ }
/******/ ]);