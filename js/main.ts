import ui = require("./ui");
import initDOM = require("./modules/initDOM");
import packLoader = require("./modules/packUtil/packLoader");
import packManager = require("./modules/packUtil/packManager");
import event = require("./modules/event");
import list = require("./modules/classes/list");
import stage = require("./modules/stage");
import d = require("./modules/data");
import makeDataUrl = require("./modules/makePrefabDataUrls");
import tray = require("./modules/tray");
import prefab = require("./modules/prefab");
import Vector2 = require("./modules/classes/vector2");
import Rect = require("./modules/classes/rect");
import canvas = require("./modules/canvas");
import editBlock = require("./modules/editBlock");

module main {

  function init() {
    d.trayItemDataURLs = new list<string>();
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
  
  initDOM(() => {
    ui.setupCanvas();
    packLoader(d.defaultPackName).then(i => {
      d.pack = new packManager.packModule(i);
      event.raiseEvent("packLoaded", null);
      stage.stageEffects.skybox = d.pack.editor.defaultSkybox;
      ui.setSkybox(packManager.getPackPath(d.defaultPackName) + d.pack.skyboxes.get(d.pack.editor.defaultSkybox).data.filename);
      event.raiseEvent("initedPack", null);
      event.raiseEvent("initedUI", null);
      ui.initTrayBlock().then(() => {
        ui.initTrayObj().then(() => {
          event.raiseEvent("initedTray", null);
        });
      });
    });
    event.addEventListener("initedTray", () => {
      ui.changeLoadingStatus("making DataURL");
      d.trayItemDataURLs = makeDataUrl();
      var item = d.pack.blocks.get(d.pack.editor.defaultBlock);
      tray.updateActiveBlock(d.pack.editor.defaultBlock, item.data.filename, item.data.bName);
      ui.changeLoadingStatus("Are you ready?");
      event.raiseEvent("ready", null);
    });
    event.addEventListener("ready", () => {
      ui.hideLoading();
    });
    event.addEventListener("gridCanvas", (e:stage.gridDetail) => {
      var pre = new prefab(e.gridPos.x, e.gridPos.y, d.selectBlock.fileName, d.selectBlock.blockName, stage.toGridPos(d.selectBlock.width), stage.toGridPos(d.selectBlock.height));
      var detail = stage.getPrefabFromGrid(new Vector2(pre.gridX, pre.gridY));
      var rect = stage.toDrawRect(new Rect(pre.gridX, pre.gridY, pre.gridW, pre.gridH));
      switch (d.activeToolName) {
        case "pencil":
          if (e.eventName === "mousedown") {
            if (!detail.contains) {
              canvas.render(d.selectImage, rect);
              stage.items.push(stage.getId(), pre);
            } else {
              stage.items.remove(detail.id);
              stage.renderStage();
            }
          }
          break;
        case "choice":
          if (e.eventName === "mousedown") {
            // オブジェクトに対応させる
            if (detail.prefab) {
              if (d.pack.objs.contains(detail.prefab.blockName)) {
                let oData = d.pack.objs.get(detail.prefab.blockName);
                tray.updateActiveBlock(detail.prefab.blockName, oData.data.oName, packManager.getPackPath(d.defaultPackName) + oData.data.filename, oData.data.width, oData.data.height);
              } else {
                let bData = d.pack.blocks.get(detail.prefab.blockName);
                tray.updateActiveBlock(detail.prefab.blockName, bData.data.bName, packManager.getPackPath(d.defaultPackName) + bData.data.filename);
              }
              ui.changeActiveBlock(detail.prefab.blockName);
            }
          }
          break;
        case "hand":
          if (e.eventName === "mousemove") {
            stage.scrollX += e.mousePos.x - stage.scrollBeforeX;
            stage.scrollY += e.mousePos.y - stage.scrollBeforeY;
            stage.renderStage();
          }
          stage.scrollBeforeX = e.mousePos.x;
          stage.scrollBeforeY = e.mousePos.y;
          break;
        case "edit":
          if (e.eventName === "mousedown" && detail.contains) {
            ui.showInspector("edit-block");
            d.editingBlockId = detail.id;
            editBlock.updateEditBlock(new editBlock.EditBlock(detail.prefab.blockName, new Vector2(detail.prefab.gridX, detail.prefab.gridY), detail.id));
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
            } else if (d.activeToolName === "erase" && detail.contains) {
              stage.items.remove(detail.id);
              stage.renderStage();
            }
          }
          break;
      }
    });
  });
}
export = main;