var preferences;
(function (preferences) {
    preferences.defaultPackName = "halstar";
    var stage;
    (function (stage) {
        var StageEffects = (function () {
            function StageEffects() {
                this.skybox = "";
            }
            return StageEffects;
        })();
        stage.StageEffects = StageEffects;
        stage.stageEffects = new StageEffects();
    })(stage = preferences.stage || (preferences.stage = {}));
})(preferences || (preferences = {}));
module.exports = preferences;
