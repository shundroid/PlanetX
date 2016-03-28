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
} ();
