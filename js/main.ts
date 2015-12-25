import ui = require("./modules/ui");
import initDOM = require("./modules/initDOM");
import packLoader = require("./modules/packUtil/packLoader");
import packManager = require("./modules/packUtil/packManager");
import event = require("./modules/event");
import list = require("./modules/list");
import stage = require("./modules/stage");
import d = require("./modules/data");
import makeDataUrl = require("./modules/makePrefabDataUrls");
import tray = require("./modules/tray");
import grid = require("./modules/grid");
import prefab = require("./modules/prefab");
import Vector2 = require("./modules/vector2");
import Rect = require("./modules/rect");
import canvas = require("./modules/canvas");

module main {

  function init() {
    d.trayItemDataURLs = new list<string>();
    d.defaultPackName = "halstar";
    d.pack = new packManager.packModule({});
    d.defaultGridSize = 25;
    d.defaultBlockSize = 50;
    d.activeToolName = "pencil";
  }
  init();
  
  initDOM(() => {
    packLoader(d.defaultPackName).then(i => {
      d.pack = new packManager.packModule(i);
      event.raiseEvent("packLoaded", null);
      stage.stageEffects.skybox = d.pack.editor.defaultSkybox;
      ui.setSkybox(packManager.getPackPath(d.defaultPackName) + d.pack.skyboxes.get(d.pack.editor.defaultSkybox).data.filename);
      ui.initUI();
      event.raiseEvent("initedUI", null);
      ui.initTrayBlock().then(() => {
        ui.initTrayObj();
        event.raiseEvent("initedTray", null);
      });
    });
    event.addEventListener("initedTray", () => {
      ui.changeLoadingStatus("making DataURL");
      d.trayItemDataURLs = makeDataUrl();
      tray.updateActiveBlock("w1/block2", "pack/halstar/images/mapicons/w1block2-2.png", "W1草付ブロック");
      ui.changeLoadingStatus("Are you ready?");
      event.raiseEvent("ready", null);
    });
    event.addEventListener("ready", () => {
      ui.hideLoading();
    });
    event.addEventListener("gridCanvas", (e:grid.gridDetail) => {
      var pre = new prefab(e.gridPos.x, e.gridPos.y, d.selectBlock.fileName, d.selectBlock.blockName, grid.toGridPos(d.selectBlock.width), grid.toGridPos(d.selectBlock.height));
      var detail = grid.getPrefabFromGrid(new Vector2(pre.gridX, pre.gridY));
      var rect = grid.toDrawRect(new Rect(pre.gridX, pre.gridY, pre.gridW, pre.gridH));
      switch (d.activeToolName) {
        case "pencil":
          if (e.eventName === "mousedown") {
            if (!detail.contains) {
              // begin to
              // canvas....
              stage.items.push(stage.getId(), pre);
            } else {
              stage.items.remove(detail.id);
              // renderbyplanet()
            }
          }
      }
    });
    event.addEventListener("packLoaded", () => {
      
    });
    event.addEventListener("resize", () => {
      
    });
    event.addEventListener("clickTrayToolbtn", () => {
      
    });
  });

}
export = main;