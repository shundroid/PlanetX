/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="definitely/move.d.ts" />
var d = require("./modules/data");
var initDOM = require("./modules/initDOM");
var event = require("./modules/event");
var el = require("./modules/elem");
var compiler = require("./modules/compiler");
var importJS = require("./modules/importJS");
var u = require("./modules/util");
var grid = require("./modules/grid");
var Vector2 = require("./modules/vector2");
var tray = require("./modules/tray");
var packManager = require("./modules/packUtil/packManager");
var planet = require("./modules/planet");
var stage = require("./modules/stage");
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
