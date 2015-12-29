var ui = require("./ui");
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
            console.log(d.defaultBlockSize);
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
