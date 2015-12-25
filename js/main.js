var initDOM = require("./modules/initDOM");
var packLoader = require("./modules/packLoader");
var packManager = require("./modules/packManager");
var preferences = require("./modules/preferences");
var event = require("./modules/event");
var main;
(function (main) {
    initDOM(function () {
        packLoader(preferences.defaultPackName).then(function (i) {
            packManager.defaultPack = new packManager.packModule(i);
            event.raiseEvent("packLoaded", null);
            preferences.stage.stageEffects.skybox = packManager.defaultPack.editor.defaultSkybox;
        });
    });
})(main || (main = {}));
module.exports = main;
