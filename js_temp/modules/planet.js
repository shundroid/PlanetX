var stage = require("./stage");
var planet;
(function (planet) {
    function exportText() {
        return "";
    }
    planet.exportText = exportText;
    function importText(file) {
        return new stage.StageEffects();
    }
    planet.importText = importText;
})(planet || (planet = {}));
module.exports = planet;
