var tray = require("./tray");
var grid = require("./grid");
var data = (function () {
    function data() {
    }
    Object.defineProperty(data, "trayItemDataURLs", {
        get: function () {
            return this.datas["trayItemDataURLs"];
        },
        set: function (val) {
            this.datas["trayItemDataURLs"] = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "defaultPackName", {
        get: function () {
            return this.datas["defaultPackName"];
        },
        set: function (val) {
            this.datas["defaultPackName"] = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "pack", {
        get: function () {
            return this.datas["pack"];
        },
        set: function (val) {
            this.datas["pack"] = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "defaultGridSize", {
        get: function () {
            return this.datas["defaultGridSize"];
        },
        set: function (val) {
            this.datas["defaultGridSize"] = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "defaultBlockSize", {
        get: function () {
            return this.datas["defaultBlockSize"];
        },
        set: function (val) {
            this.datas["pack"] = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "selectBlock", {
        get: function () {
            return this.datas["selectBlock"];
        },
        set: function (val) {
            this.datas["pack"] = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "activeToolName", {
        get: function () {
            return this.datas["activeToolName"];
        },
        set: function (val) {
            this.datas["pack"] = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "selectImage", {
        get: function () {
            return this.datas["selectImage"];
        },
        set: function (val) {
            this.datas["pack"] = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "isObjMode", {
        get: function () {
            return this.datas["isObjMode"];
        },
        set: function (val) {
            this.datas["pack"] = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "isFullscreenTray", {
        get: function () {
            return this.datas["isFullscreenTray"];
        },
        set: function (val) {
            this.datas["pack"] = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "isShowInspector", {
        get: function () {
            return this.datas["isShowInspector"];
        },
        set: function (val) {
            this.datas["pack"] = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "scrollX", {
        /**
         * alias (grid.scrollX)
         */
        get: function () {
            console.log("this is alias");
            return grid.scrollX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(data, "scrollY", {
        /**
         * alias (grid.scrollY)
         */
        get: function () {
            console.log("this is alias");
            return grid.scrollY;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * alias (tray.updateSelectImage)
     */
    data.updateSelectImage = function () {
        console.log("this is alias");
        tray.updateSelectImage();
    };
    data.hogehogeho = "hoge";
    data.datas = {};
    return data;
})();
module.exports = data;
