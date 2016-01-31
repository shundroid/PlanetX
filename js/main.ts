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
import prefab = require("./modules/classes/prefab");
import Vector2 = require("./modules/classes/vector2");
import Rect = require("./modules/classes/rect");
import canvas = require("./modules/canvas");
import editBlock = require("./modules/editBlock");
import fGuide = require("./modules/ui/focusGuide");

/**
 * メインとなる処理を行います
 */
module main {

  function init() {
    d.dataInit();
  }
  init();
  
  initDOM(() => {
    ui.setupCanvas();
    packLoader(d.defaultPackName).then((i:any) => {
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
      var detail = stage.getPrefabFromGrid(new Vector2(pre.gridX, pre.gridY), d.activeStageLayer);
      var rect = stage.toDrawRect(new Rect(pre.gridX, pre.gridY, pre.gridW, pre.gridH));
      fGuide.hide();
      switch (d.activeToolName) {
        case "pencil":
          if (e.eventName === "down") {
            if (!detail.contains) {
              canvas.render(d.selectImage, rect);
              stage.items.push(stage.getId(), pre, d.activeStageLayer);
            } else {
              stage.items.remove(detail.id, d.activeStageLayer);
              stage.renderStage(d.activeStageLayer);
            }
          } else if (e.eventName === "hovering") {
            fGuide.focus(new Vector2(rect.x, rect.y), new Vector2(rect.width, rect.height), detail.contains ? "rgba(240,0,0,0.6)" : "rgba(0,240,0,0.6)");
          }
          break;
        case "choice":
          if (e.eventName === "down") {
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
          if (e.eventName === "move") {
            stage.scrollX += e.mousePos.x - stage.scrollBeforeX;
            stage.scrollY += e.mousePos.y - stage.scrollBeforeY;
            stage.renderStage(d.activeStageLayer);
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
                stage.items.remove(detail.id, d.activeStageLayer);
                stage.renderStage(d.activeStageLayer);
              }
              if (!detail.contains) {
                canvas.render(d.selectImage, rect);
                stage.items.push(stage.getId(), pre, d.activeStageLayer);
              }
            } else if (d.activeToolName === "erase" && detail.contains) {
              stage.items.remove(detail.id, d.activeStageLayer);
              stage.renderStage(d.activeStageLayer);
            }
          }
          break;
      }
    });
  });
}
export = main;