/// <reference path="main.ts" />
/// <reference path="planet.ts" />
/// <reference path="lib/util.ts" />
/// <reference path="definitely/web-anim.d.ts" />
/// <reference path="definitely/move.d.ts" />
/**
 * UIへのアクセスをします。
 */
var ui;
(function (ui) {
    function init() {
        document.addEventListener("DOMContentLoaded", loadDOM);
        window.addEventListener("resize", resize);
        ev.addPlaEventListener("ui_clickTray", clickTray);
        ev.addPlaEventListener("ui_mousedownCanvas|ui_mousemoveanddownCanvas|ui_mouseupCanvas", mouseCanvas);
        ev.addPlaEventListener("initedUI", initedUI);
    }
    function loadDOM() {
        document.getElementById("tray-fullscreen").addEventListener("click", togglefullScreen);
        document.getElementById("ins-close").addEventListener("click", closeInspector);
        document.getElementById("io-export").addEventListener("click", clickExport);
        document.getElementById("io-import").addEventListener("click", clickImport);
        util.addEventListenerforQuery(".ins-show-btn", "click", clickInsShowBtn);
        util.addEventListenerforQuery(".io-hf", "change", changeHeaderorFooterValue);
        document.getElementById("conv-new").value = "";
        document.getElementById("conv-old").value = "";
        document.getElementById("conv").addEventListener("click", function () {
            document.getElementById("conv-new").value =
                main.convertOldFile(document.getElementById("conv-old").value);
        });
        document.getElementById("pla-io").value = "";
        var tools = document.getElementsByClassName("tray-list-tool");
        for (var i = 0; i < tools.length; i++) {
            tools.item(i).addEventListener("click", clickTrayTool);
        }
        var move_js = document.createElement("script");
        move_js.src = "bower_components/move.js/move.js";
        document.head.appendChild(move_js);
        ev.raiseEvent("initDom", null);
    }
    function initedUI() {
        document.getElementById("stg-skybox").value = main.packModule.editor.defaultSkybox;
    }
    ui.initedUI = initedUI;
    function setupCanvas() {
        ui.canvas = document.getElementById("pla-canvas");
        ui.canvas.addEventListener("mousedown", function (e) {
            ev.raiseEvent("ui_mousedownCanvas", e);
        });
        ui.canvas.addEventListener("mousemove", function (e) {
            if (e.buttons === 1) {
                ev.raiseEvent("ui_mousemoveanddownCanvas", e);
            }
        });
        ui.canvas.addEventListener("mouseup", function (e) {
            ev.raiseEvent("ui_mouseupCanvas", e);
        });
    }
    ui.setupCanvas = setupCanvas;
    function hideLoading() {
        var elem = document.getElementsByClassName("loading")[0];
        move('.loading')
            .set('opacity', 0)
            .duration('1s')
            .then()
            .set("display", "none")
            .pop()
            .end();
    }
    ui.hideLoading = hideLoading;
    /**
     * ui.ts以外のファイルは、このメソッドを通して、リスナーを使用します。
     */
    function attachListenerUI(elem, eventName, listener) {
        elem.addEventListener(eventName, listener);
    }
    ui.attachListenerUI = attachListenerUI;
    function get(id) { return document.getElementById(id); }
    ui.get = get;
    function q(query) { return document.querySelector(query); }
    ui.q = q;
    function qAll(query) { return document.querySelectorAll(query); }
    ui.qAll = qAll;
    function mouseCanvas(e) {
        var grid = main.clientPos2Grid(new p.Vector2(e.clientX, e.clientY));
        ev.raiseEvent("gridCanvas", new main.gridDetail(grid, e.type, new p.Vector2(e.clientX, e.clientY)));
    }
    function clickTray(e) {
        var target = e.target;
        main.isActiveObj = target.parentElement.classList.contains("tray-list-obj");
        if (!main.isActiveObj) {
            var item = main.packModule.blocks.get(target.dataset["block"]).data;
            main.updateSelectedBlock(target.dataset["block"], item.filename, item.bName);
        }
        else {
            var item = main.packModule.objs.get(target.dataset["block"]).data;
            main.updateSelectedBlockForObj(target.dataset["block"], item.filename, item.oName, item.width, item.height);
        }
        changeUIActiveBlock(target.dataset["block"]);
    }
    function changeUIActiveBlock(blockName) {
        document.querySelector(".tray-active") && document.querySelector(".tray-active").classList.remove("tray-active");
        document.querySelector("[data-block=\"" + blockName + "\"]").classList.add("tray-active");
    }
    ui.changeUIActiveBlock = changeUIActiveBlock;
    function initTray() {
        return new Promise(function (resolve) {
            var blocks = main.packModule.blocks.getAll();
            var ul = document.getElementsByClassName("tray-items")[0];
            var list = Object.keys(blocks);
            var async = function (i) {
                var item = list[i];
                var li = document.createElement("div");
                li.classList.add("tray-list", "tray-list-block");
                li.addEventListener("click", function (e) { ev.raiseEvent("ui_clickTray", e); });
                var img = document.createElement("img");
                img.src = main.getPackPath(main.packName) + main.packModule.blocks.get(item).data.filename;
                img.onload = function () {
                    img.alt = main.packModule.blocks.get(item).data.bName;
                    img.dataset["block"] = item;
                    li.appendChild(img);
                    ul.appendChild(li);
                    if (i === list.length - 1) {
                        resolve();
                    }
                    else {
                        loadingStatus("loading tray : " + i.toString() + " / " + (list.length - 1).toString());
                        async(i + 1);
                    }
                };
            };
            async(0);
        });
    }
    ui.initTray = initTray;
    function initObjforTray() {
        var objs = main.packModule.objs.getAll();
        var ul = document.getElementsByClassName("tray-items")[0];
        var list = Object.keys(objs);
        var async = function (i) {
            var item = list[i];
            var li = document.createElement("div");
            li.classList.add("tray-list", "tray-list-obj");
            li.addEventListener("click", function (e) { ev.raiseEvent("ui_clickTray", e); });
            var img = document.createElement("img");
            img.src = main.getPackPath(main.packName) + main.packModule.objs.get(item).data.filename;
            img.onload = function () {
                img.alt = main.packModule.objs.get(item).data.oName;
                img.dataset["block"] = item;
                li.style.width = img.style.width =
                    main.packModule.objs.get(item).data.width / (main.packModule.objs.get(item).data.height / 50) + "px";
                li.style.height = img.style.height = "50px";
                li.appendChild(img);
                ul.appendChild(li);
                if (i === list.length - 1) {
                    ev.raiseEvent("initedTray", null);
                }
                else {
                    loadingStatus("loading tray-obj : " + i.toString() + " / " + (list.length - 1).toString());
                    async(i + 1);
                }
            };
        };
        async(0);
    }
    ui.initObjforTray = initObjforTray;
    function loadingStatus(text) {
        document.getElementsByClassName("loading")[0].innerHTML = "Loading...<br />" + text;
    }
    ui.loadingStatus = loadingStatus;
    function startUIWaitMode() {
        document.getElementById("pla-canvas").style.cursor = "wait";
    }
    ui.startUIWaitMode = startUIWaitMode;
    function endUIWaitMode() {
        document.getElementById("pla-canvas").style.cursor = "crosshair";
    }
    ui.endUIWaitMode = endUIWaitMode;
    function togglefullScreen(e) {
        if (!main.isFullscreen) {
            closeInspector();
            move(".pla-footer").set("height", "100%").duration("0.5s").end();
            e.target.textContent = "↓";
        }
        else {
            move(".pla-footer").set("height", "50px").duration("0.5s").end();
            e.target.textContent = "↑";
        }
        main.isFullscreen = !main.isFullscreen;
    }
    ui.togglefullScreen = togglefullScreen;
    function clickTrayTool(e) {
        var elem = e.target;
        if (elem.nodeName === "I") {
            elem = elem.parentElement;
        }
        if (elem.classList.contains("tool-btn")) {
            ev.raiseEvent("clickTrayToolbtn", elem.dataset["toolname"]);
            return;
        }
        document.getElementsByClassName("tool-active")[0].classList.remove("tool-active");
        elem.classList.add("tool-active");
        main.activeToolName = elem.dataset["toolname"];
    }
    ui.clickTrayTool = clickTrayTool;
    function resize() {
        ev.raiseEvent("resize", null);
    }
    function showInspector(mode) {
        document.querySelector(".ins-article-active") && document.querySelector(".ins-article-active").classList.remove("ins-article-active");
        document.getElementById("ins-" + mode).classList.add("ins-article-active");
        if (main.isShowInspector)
            return;
        main.isShowInspector = true;
        move(".pla-inspector")
            .set("left", "80%")
            .duration("0.5s")
            .end();
    }
    ui.showInspector = showInspector;
    function closeInspector() {
        if (!main.isShowInspector)
            return;
        main.isShowInspector = false;
        move(".pla-inspector")
            .set("left", "100%")
            .duration("0.5s")
            .end();
    }
    ui.closeInspector = closeInspector;
    function clickExport() {
        document.getElementById("pla-io").value = planet.exportText();
    }
    ui.clickExport = clickExport;
    function clickImport() {
        var effects = planet.importText(document.getElementById("pla-io").value);
        main.stageSettings = effects;
        console.log(effects.skybox);
        setSkybox(main.packModule.skyboxes.get(effects.skybox).data.filename);
        main.renderByPlanet();
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
    function setSkybox(skyboxName) {
        document.body.style.backgroundImage = "url('" + main.getPackPath(main.packName) + skyboxName + "')";
    }
    ui.setSkybox = setSkybox;
    function initSelectElems() {
        document.querySelectorAll(".pack-select").forEach(function (i) {
            var elem = i;
            elem.innerHTML = util.pack2SelectElem(main.packModule[elem.dataset["items"]].toSimple());
            if (elem.dataset["change"]) {
                elem.addEventListener("change", ui[elem.dataset["change"]]);
            }
            if (elem.dataset["default"]) {
                elem.value = elem.dataset["default"];
            }
        });
    }
    ui.initSelectElems = initSelectElems;
    function changeSkybox(e) {
        main.stageSettings.skybox = e.target.value;
        setSkybox(main.packModule.skyboxes.get(main.stageSettings.skybox).data.filename);
    }
    ui.changeSkybox = changeSkybox;
    init();
})(ui || (ui = {}));
