import * as ui from "./ui";
import initDOM from "./modules/initDOM";
import packLoader from "./modules/packUtil/packLoader";
import * as packManager from "./modules/packUtil/packManager";
import * as event from "./modules/event";
import list from "./modules/classes/list";
import stage = require("./modules/stage");
import {stageEffects} from "./modules/model/stageEffectsModel";
import * as stageItems from "./modules/model/stageItemsModel";
import {data as d} from "./modules/data";
import makeDataUrl from "./modules/makePrefabDataUrls";
import {updateActiveBlock} from "./modules/tray";
import prefab from "./modules/classes/prefab";
import Vector2 from "./modules/classes/vector2";
import Rect from "./modules/classes/rect";
import * as canvas from "./modules/canvas";
import {EditBlock, updateEditBlock} from "./modules/editBlock";
import * as fGuide from "./modules/ui/focusGuide";
import * as editorModel from "./modules/model/editorModel";
import renderStage from "./modules/view/stageRenderView";
import {pack, setPack} from "./modules/model/packModel";
import {activeBlock, activeBlockImage} from "./modules/model/trayModel";
import {currentPackName} from "./modules/model/preferencesModel";

/**
 * メインとなる処理を行います
 */
namespace main {

  function init() {
    d.dataInit();
  }
  init();

  initDOM(() => {
    ui.setupCanvas();
    packLoader(currentPackName).then((i: any) => {
      setPack(new packManager.packModule(i));
      event.raiseEvent("packLoaded", null);
      stageEffects.skyboxes = [pack.editor.defaultSkybox];
      ui.setSkybox(packManager.getPackPath(currentPackName) + pack.skyboxes.get(pack.editor.defaultSkybox).data.filename);
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
      var item = pack.blocks.get(pack.editor.defaultBlock);
      updateActiveBlock(pack.editor.defaultBlock, item.data.filename, item.data.bName);
      ui.changeLoadingStatus("Are you ready?");
      event.raiseEvent("ready", null);
    });
    event.addEventListener("ready", () => {
      ui.hideLoading();
    });
    event.addEventListener("gridCanvas", (e: stage.gridDetail) => {
      var pre = new prefab(e.gridPos.x, e.gridPos.y, activeBlock.fileName, activeBlock.blockName, stage.toGridPos(activeBlock.width), stage.toGridPos(activeBlock.height));
      var detail = stage.getPrefabFromGrid(new Vector2(pre.gridX, pre.gridY), editorModel.activeStageLayerInEditor);
      var rect = stage.toDrawRect(new Rect(pre.gridX, pre.gridY, pre.gridW, pre.gridH));
      fGuide.hide();
      switch (d.activeToolName) {
        case "pencil":
          if (e.eventName === "down") {
            if (!detail.contains) {
              canvas.render(activeBlockImage, rect);
              stageItems.push(stageItems.getId(), pre, editorModel.activeStageLayerInEditor);
            } else {
              stageItems.remove(detail.id, editorModel.activeStageLayerInEditor);
              renderStage(editorModel.activeStageLayerInEditor);
            }
          } else if (e.eventName === "hovering") {
            fGuide.focus(new Vector2(rect.x, rect.y), new Vector2(rect.width, rect.height), detail.contains ? "rgba(240,0,0,0.6)" : "rgba(0,240,0,0.6)");
          }
          break;
        case "choice":
          if (e.eventName === "down") {
            // オブジェクトに対応させる
            if (detail.prefab) {
              if (pack.objs.contains(detail.prefab.blockName)) {
                let oData = pack.objs.get(detail.prefab.blockName);
                updateActiveBlock(detail.prefab.blockName, oData.data.oName, packManager.getPackPath(currentPackName) + oData.data.filename, oData.data.width, oData.data.height);
              } else {
                let bData = pack.blocks.get(detail.prefab.blockName);
                updateActiveBlock(detail.prefab.blockName, bData.data.bName, packManager.getPackPath(currentPackName) + bData.data.filename);
              }
              ui.changeActiveBlock(detail.prefab.blockName);
            }
          }
          break;
        case "hand":
          if (e.eventName === "move") {
            stage.scrollX += e.mousePos.x - stage.scrollBeforeX;
            stage.scrollY += e.mousePos.y - stage.scrollBeforeY;
            renderStage(editorModel.activeStageLayerInEditor);
          }
          stage.scrollBeforeX = e.mousePos.x;
          stage.scrollBeforeY = e.mousePos.y;
          break;
        case "edit":
          if (e.eventName === "down" && detail.contains) {
            ui.showInspector("edit-block");
            d.editingBlockId = detail.id;
            updateEditBlock(new EditBlock(detail.prefab.blockName, new Vector2(detail.prefab.gridX, detail.prefab.gridY), detail.id));
          }
          break;
        default:
          if (e.eventName === "move" || e.eventName === "down") {
            if (d.activeToolName === "brush") {
              if (detail.contains && detail.prefab.blockName !== activeBlock.blockName) {
                stageItems.remove(detail.id, editorModel.activeStageLayerInEditor);
                renderStage(editorModel.activeStageLayerInEditor);
              }
              if (!detail.contains) {
                canvas.render(activeBlockImage, rect);
                stageItems.push(stageItems.getId(), pre, editorModel.activeStageLayerInEditor);
              }
            } else if (d.activeToolName === "erase" && detail.contains) {
              stageItems.remove(detail.id, editorModel.activeStageLayerInEditor);
              renderStage(editorModel.activeStageLayerInEditor);
            }
          }
          break;
      }
    });
  });
}
export = main;