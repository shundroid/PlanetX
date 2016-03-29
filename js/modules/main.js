import * as stage from "./stage";
import * as config from "./editor-config";
import * as on from "./on";
import * as temp from "./temp-datas";
import * as canvas from "./canvas";
import * as ui from "./ui";
import {getPackPath, loadPack} from "./pack";
import * as tray from "./tray";

+function () {
  let pack;

  document.addEventListener("DOMContentLoaded", function () {
    canvas.initialize();
    loadPack(config.pack).then(packObject => {
      pack = packObject;
      stage.skyboxes.push(pack.editor.defaultSkybox);
      ui.setEditorBackground(getPackPath(config.pack, pack.skyboxes[pack.editor.defaultSkybox].filename));
      ui.setEditorBackgroundMode(pack.editor);
      ui.initilizeTray(pack.blocks, pack.objs);
    });
    ui.setListeners();
    ui.initializeGuide();
    ui.initializeVersionUI();

  });
  on.on("initializedTray", () => {
    ui.changeLoadingStatusUI("making DataUrl");
    temp.tray.dataUrls = tray.makeDataUrls(pack.blocks, pack.objs, config.grid);
    let defaultItem = pack.blocks[pack.editor.defaultBlock];
    temp.tray.activeBlock = tray.updateActiveBlock(pack.editor.defaultBlock, defaultItem.filename, defaultItem.name, config.grid);
    ui.hideLoadingUI();
    on.raise("ready", null);
  });
  on.on("clickInspectorShowButton", (e) => {
    ui.showInspector();
  });
  on.on("clickedTrayItem", (e) => {
    temp.tray.isObjMode = ui.isTrayItemObj(e.target);
    let blockName = e.target.dataset["block"];
    if (!temp.tray.isObjMode) {
      let block = pack.blocks[blockName];
      tray.updateActiveBlock(blockName, block.filename, block.name, config.grid);
    } else {
      let block = pack.objs[blockName];
      tray.updateActiveBlock(blockName, block.filename, block.name, { width: block.width, height: block.height });
    }
    ui.changeActiveBlockUI(blockName);
  });
  on.on("clickedToggleFullscreen", event => {
    if (!temp.ui.isFullscreenTray) {
      ui.showTrayFullscreen();
    } else {
      ui.hideTrayFullscreen();
    }
    temp.ui.isFullscreenTray = !temp.ui.isFullscreenTray;
  });
  on.on("clickedTrayTool", event => {
    let elem = event.target;
    if (elem.nodeName === "I") {
      elem = elem.parentElement;
    }
    let toolName = elem.dataset["toolname"];
    // Tool (pencil, erase など) でなく、Tool-btn (save, seting) の場合
    if (elem.classList.contains("tool-btn")) {
      on.raise("clickTrayToolBtn", toolName);
    } else {
      ui.setActiveToolUI(toolName);
      temp.tray.activeToolName = toolName;
    }
  });
  on.on(["mousedownCanvas", "mousemoveCanvas", "mouseupCanvas", "hoverCanvas"], function (event) {
    let targetGridPos = stage.getGridPosFromMousePos({ x: event.clientX, y: event.clientY });
    let gridDetails = stage.getGridDetails(targetGridPos.x, targetGridPos.y);
    let prefab = stage.getPrefabFromActiveBlock(temp.tray.activeBlock, targetGridPos.x, targetGridPos.y);
    ui.hideGuide();
    switch (temp.tray.activeToolName) {
      case "pencil":
        if (this.eventName === "mousedownCanvas") {
          
        }
    }
  });
} ();
