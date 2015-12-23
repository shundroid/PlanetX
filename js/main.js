/// <reference path="lib/classes.ts" />
/// <reference path="lib/canvas.ts" />
/// <reference path="ui.ts" />
/// <reference path="lib/util.ts" />
/// <reference path="lib/compiler.ts" />
/// <reference path="planet.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/**
 * Planetのメイン処理を行います。
 * UIとは直接かかわりません。
 */
var main;
(function (main) {
    function attachListeners() {
        ev.addPlaEventListener("initDom", init);
        ev.addPlaEventListener("gridCanvas", gridCanvas);
        ev.addPlaEventListener("ready", ready);
        ev.addPlaEventListener("packLoaded", initTray);
        ev.addPlaEventListener("resize", resize);
        ev.addPlaEventListener("clickTrayToolbtn", clickTrayToolbtn);
        main.activeToolName = "pencil";
    }
    function init() {
        main.packName = "halstar";
        main.trayIconURLs = new p.List();
        main.isFullscreen = false;
        main.isActiveObj = false;
        main.defaultGridSize = 25;
        main.defaultBlockSize = 50;
        isResizeRequest = false;
        main.isShowInspector = false;
        ui.setupCanvas();
        loadPack(main.packName).then(function (obj) {
            main.packModule = new pack.pPackModule(obj);
            ev.raiseEvent("packloaded", null);
            ui.initTray().then(function () {
                ui.initObjforTray();
            });
        });
        ev.addPlaEventListener("initedTray", function () {
            makeDataURL();
            updateSelectedBlock("w1/block2", "pack/halstar/images/mapicons/w1block2-2.png", "W1草付ブロック");
            ui.loadingStatus("Are you ready?");
            ev.raiseEvent("ready", null);
        });
    }
    function makeDataURL() {
        ui.loadingStatus("making DataURL");
        var blockList = main.packModule.blocks.getAll();
        Object.keys(blockList).forEach(function (i) {
            main.trayIconURLs.push(i, util.makeNoJaggyURL(getPackPath(main.packName) + main.packModule.blocks.get(i).data.filename, new p.Vector2(main.defaultGridSize, main.defaultGridSize)));
        });
        var objList = main.packModule.objs.getAll();
        Object.keys(objList).forEach(function (i) {
            var item = main.packModule.objs.get(i).data;
            main.trayIconURLs.push(i, util.makeNoJaggyURL(getPackPath(main.packName) + item.filename, new p.Vector2(item.width, item.height)));
        });
    }
    function getPackPath(packName) {
        return "pack/" + packName + "/";
    }
    main.getPackPath = getPackPath;
    function loadPack(packname) {
        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", getPackPath(main.packName) + "packinfo.json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                }
            };
            xhr.send(null);
        });
    }
    function ready() {
        ui.hideLoading();
    }
    function initTray() {
        ui.initTray();
        ev.raiseEvent("initedTray", null);
    }
    var gridDetail = (function () {
        function gridDetail(gridPos, eventName, mousePos) {
            this.gridPos = gridPos;
            this.eventName = eventName;
            this.mousePos = mousePos;
        }
        return gridDetail;
    })();
    main.gridDetail = gridDetail;
    var scrollX = 0;
    var scrollY = 0;
    var scrollPrevX = -1;
    var scrollPrevY = -1;
    function gridCanvas(e) {
        var prefab = {
            gridX: e.gridPos.x,
            gridY: e.gridPos.y,
            filename: main.selectedBlock.fileName,
            blockName: main.selectedBlock.blockName,
            gridW: main.selectedBlock.width / main.defaultGridSize,
            gridH: main.selectedBlock.height / main.defaultGridSize
        };
        var detail = planet.getFromGrid(new p.Vector2(prefab.gridX, prefab.gridY));
        var rect = { x: scrollX + getCenterPos(prefab.gridX * main.defaultGridSize, prefab.gridW * main.defaultGridSize), y: scrollY + getCenterPos(prefab.gridY * main.defaultGridSize, prefab.gridH * main.defaultGridSize),
            width: prefab.gridW * main.defaultGridSize, height: prefab.gridH * main.defaultGridSize };
        if (main.activeToolName === "pencil" && e.eventName === "mousedown") {
            if (!detail.contains) {
                Canvas.render(selectedImage, rect);
                planet.add(planet.getId(), prefab);
            }
            else {
                planet.remove(detail.id);
                renderByPlanet();
            }
        }
        else if (e.eventName === "mousedown" && main.activeToolName === "choice") {
            if (detail.prefab) {
                var bData = main.packModule.blocks.get(detail.prefab.blockName);
                updateSelectedBlock(detail.prefab.blockName, bData.data.bName, getPackPath(main.packName) + bData.data.filename);
                ui.changeUIActiveBlock(detail.prefab.blockName);
            }
        }
        else if (main.activeToolName === "hand") {
            if (e.eventName === "mousedown") {
                scrollPrevX = e.mousePos.x;
                scrollPrevY = e.mousePos.y;
            }
            else if (e.eventName === "mousemove") {
                scrollX += e.mousePos.x - scrollPrevX;
                scrollY += e.mousePos.y - scrollPrevY;
                renderByPlanet();
                scrollPrevX = e.mousePos.x;
                scrollPrevY = e.mousePos.y;
            }
        }
        else if (e.eventName === "mousemove" || e.eventName === "mousedown") {
            if (main.activeToolName === "brush") {
                if (detail.contains && detail.prefab.blockName !== main.selectedBlock.blockName) {
                    planet.remove(detail.id);
                    renderByPlanet();
                }
                if (!detail.contains) {
                    Canvas.render(selectedImage, rect);
                    planet.add(planet.getId(), prefab);
                }
            }
            else if (main.activeToolName === "erase" && detail.contains) {
                planet.remove(detail.id);
                renderByPlanet();
            }
        }
    }
    function updateSelectedBlock(blockName, fileName, showName) {
        main.selectedBlock = new TrayBlockDetails(blockName, fileName, showName, main.defaultBlockSize, main.defaultBlockSize);
        updateSelectedImage();
    }
    main.updateSelectedBlock = updateSelectedBlock;
    function updateSelectedBlockForObj(blockName, fileName, showName, width, height) {
        main.selectedBlock = new TrayBlockDetails(blockName, fileName, showName, width, height);
        updateSelectedImage();
    }
    main.updateSelectedBlockForObj = updateSelectedBlockForObj;
    function updateSelectedImage() {
        selectedImage = util.QuickImage(main.trayIconURLs.get(main.selectedBlock.blockName));
        ui.startUIWaitMode();
        selectedImage.onload = function () {
            ui.endUIWaitMode();
        };
    }
    main.updateSelectedImage = updateSelectedImage;
    var TrayBlockDetails = (function () {
        function TrayBlockDetails(blockName, fileName, 
            // 表示するときのブロック名
            showBlockName, width, height) {
            this.blockName = blockName;
            this.fileName = fileName;
            this.showBlockName = showBlockName;
            this.width = width;
            this.height = height;
        }
        ;
        return TrayBlockDetails;
    })();
    main.TrayBlockDetails = TrayBlockDetails;
    var selectedImage;
    function getCenterPos(center, size) {
        return center - ((size - main.defaultGridSize) / 2);
    }
    main.getCenterPos = getCenterPos;
    function clientPos2Grid(clientPos) {
        var cX = clientPos.x - scrollX;
        var cY = clientPos.y - scrollY;
        var eX = cX - (cX % main.defaultGridSize);
        var eY = cY - (cY % main.defaultGridSize);
        var gridX = eX / main.defaultGridSize;
        var gridY = eY / main.defaultGridSize;
        return new p.Vector2(gridX, gridY);
    }
    main.clientPos2Grid = clientPos2Grid;
    function clientPos2BlockSizeGrid(clientPos) {
        var eX = clientPos.x - (clientPos.x % main.defaultBlockSize);
        var eY = clientPos.y - (clientPos.y % main.defaultBlockSize);
        var gridX = eX / main.defaultBlockSize;
        var gridY = eY / main.defaultBlockSize;
        return new p.Vector2(gridX * 2, gridY * 2);
    }
    main.clientPos2BlockSizeGrid = clientPos2BlockSizeGrid;
    function renderByPlanet() {
        Canvas.clear();
        var list = planet.all();
        Object.keys(list).forEach(function (i) {
            var item = list[i];
            var x = scrollX + getCenterPos(item.gridX * main.defaultGridSize, item.gridW * main.defaultGridSize);
            var y = scrollY + getCenterPos(item.gridY * main.defaultGridSize, item.gridH * main.defaultGridSize);
            var width = item.gridW * main.defaultGridSize;
            var height = item.gridH * main.defaultGridSize;
            if (x + width >= Canvas.canvasRect.x && x <= Canvas.canvasRect.width &&
                y + height >= Canvas.canvasRect.y && y <= Canvas.canvasRect.height) {
                Canvas.render(util.QuickImage(main.trayIconURLs.get(item.blockName)), {
                    x: x,
                    y: y,
                    width: width,
                    height: height
                });
            }
        });
    }
    main.renderByPlanet = renderByPlanet;
    var isResizeRequest;
    var resizeTimerId;
    function resize() {
        if (isResizeRequest) {
            clearTimeout(resizeTimerId);
        }
        isResizeRequest = true;
        resizeTimerId = setTimeout(function () {
            isResizeRequest = false;
            main.renderByPlanet();
        }, 100);
    }
    function clickTrayToolbtn(name) {
        if (name === "io") {
            ui.showInspector("io");
        }
        else if (name === "setting") {
            ui.showInspector("inspector");
        }
    }
    function convertOldFile(oldFile) {
        return compiler.old2CSV(oldFile);
    }
    main.convertOldFile = convertOldFile;
    attachListeners();
})(main || (main = {}));
