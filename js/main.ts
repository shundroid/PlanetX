import ui = require("./modules/ui");
import initDOM = require("./modules/initDOM");
import packLoader = require("./modules/packLoader");
import packManager = require("./modules/packManager");
import preferences = require("./modules/preferences");
import event = require("./modules/event");
module main {
  initDOM(() => {
    packLoader(preferences.defaultPackName).then(i => {
      packManager.defaultPack = new packManager.packModule(i);
      event.raiseEvent("packLoaded", null);
      preferences.stage.stageEffects.skybox = packManager.defaultPack.editor.defaultSkybox;
    });
  });
}
export = main;