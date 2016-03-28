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
  });
  on.on("initializedTray", () => {
    ui.changeLoadingStatusUI("making DataUrl");
    temp.tray.dataUrls = tray.makeDataUrl(pack.blocks, pack.objs, config.grid);
    let defaultItem = pack.blocks[pack.editor.defaultBlock];
    temp.tray.updateActiveBlock = tray.updateActiveBlock(pack.editor.defaultBlock, defaultItem.filename, defaultItem.bName, config.grid);
    ui.hideLoadingUI();
    on.raise("ready", null);
  });
} ();
