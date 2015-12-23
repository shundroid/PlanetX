var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * PlanetでTypescriptを活用するためのクラスを提供します。
 */
var p;
(function (p) {
    var List = (function () {
        function List() {
            this.data = {};
        }
        List.prototype.push = function (index, item) {
            this.data[index] = item;
        };
        List.prototype.update = function (index, item) {
            this.data[index] = item;
        };
        List.prototype.get = function (index) {
            return this.data[index];
        };
        List.prototype.getAll = function () {
            return this.data;
        };
        List.prototype.remove = function (index) {
            delete this.data[index];
        };
        List.prototype.clear = function () {
            this.data = {};
        };
        List.prototype.contains = function (index) {
            return this.data.hasOwnProperty(index);
        };
        List.prototype.toSimple = function () {
            return this.data;
        };
        return List;
    })();
    p.List = List;
    var Vector2 = (function () {
        function Vector2(x, y) {
            this.x = x;
            this.y = y;
        }
        return Vector2;
    })();
    p.Vector2 = Vector2;
    var prefabLite = (function () {
        function prefabLite(x, y, blockName) {
            this.x = x;
            this.y = y;
            this.blockName = blockName;
        }
        ;
        return prefabLite;
    })();
    p.prefabLite = prefabLite;
})(p || (p = {}));
var pack;
(function (pack) {
    var pPackModule = (function () {
        function pPackModule(data) {
            var _this = this;
            this.pack = new pPackInfo(data["pack"]);
            this.blocks = new p.List();
            Object.keys(data["blocks"]).forEach(function (i) {
                _this.blocks.push(i, new pBlockInfo({ bName: data["blocks"][i]["name"], filename: data["blocks"][i]["filename"] }));
            });
            this.objs = new p.List();
            Object.keys(data["objs"]).forEach(function (i) {
                var cur = data["objs"][i];
                if (cur["hidden"]) {
                    _this.objs.push(i, new pObjInfo({ oName: cur["name"], filename: cur["filename"], width: cur["width"], height: cur["height"], type: cur["type"] }));
                }
                else {
                    _this.objs.push(i, new pObjInfo({ oName: cur["name"], filename: cur["filename"], width: cur["width"], height: cur["height"], type: cur["type"], hidden: cur["hidden"] }));
                }
            });
            this.descriptions = new p.List();
            Object.keys(data["descriptions"]).forEach(function (i) {
                var cur = data["descriptions"][i];
                _this.descriptions.push(i, new pDesInfo(cur));
            });
            var a1 = new p.List();
            Object.keys(data["abilities"]["selectelement"]).forEach(function (i) {
                a1.push(i, data["abilities"]["selectelement"][i]);
            });
            var a2 = new p.List();
            Object.keys(data["abilities"]["keys"]).forEach(function (i) {
                a2.push(i, data["abilities"]["keys"][i]);
            });
            var a3 = new p.List();
            Object.keys(data["abilities"]["types"]).forEach(function (i) {
                a3.push(i, data["abilities"]["keys"][i]);
            });
            this.abilities = new pAbilityInfo({ selectelement: a1, keys: a2, types: a3 });
            this.skyboxes = new pSkyboxInfoList();
            Object.keys(data["skyboxes"]).forEach(function (i) {
                _this.skyboxes.push(i, new pSkyboxInfo(data["skyboxes"][i]));
            });
            this.editor = new pPackEditorInfo(data["editor"]["defaultSkybox"]);
        }
        return pPackModule;
    })();
    pack.pPackModule = pPackModule;
    var pPackEditorInfo = (function () {
        function pPackEditorInfo(defaultSkybox) {
            this.defaultSkybox = defaultSkybox;
        }
        return pPackEditorInfo;
    })();
    pack.pPackEditorInfo = pPackEditorInfo;
    var pPackInfo = (function () {
        function pPackInfo(data) {
            this.pName = data["name"];
            this.version = data["version"];
            this.author = data["author"];
            this.exportType = data["exportType"];
        }
        return pPackInfo;
    })();
    pack.pPackInfo = pPackInfo;
    var pInfo = (function () {
        function pInfo(p) {
            this.data = p;
        }
        return pInfo;
    })();
    pack.pInfo = pInfo;
    var pBlockInfo = (function (_super) {
        __extends(pBlockInfo, _super);
        function pBlockInfo() {
            _super.apply(this, arguments);
        }
        return pBlockInfo;
    })(pInfo);
    pack.pBlockInfo = pBlockInfo;
    var pObjInfo = (function (_super) {
        __extends(pObjInfo, _super);
        function pObjInfo() {
            _super.apply(this, arguments);
        }
        return pObjInfo;
    })(pInfo);
    pack.pObjInfo = pObjInfo;
    var pDesInfo = (function (_super) {
        __extends(pDesInfo, _super);
        function pDesInfo() {
            _super.apply(this, arguments);
        }
        return pDesInfo;
    })(pInfo);
    pack.pDesInfo = pDesInfo;
    var pAbilityInfo = (function (_super) {
        __extends(pAbilityInfo, _super);
        function pAbilityInfo() {
            _super.apply(this, arguments);
        }
        return pAbilityInfo;
    })(pInfo);
    pack.pAbilityInfo = pAbilityInfo;
    var pSkyboxInfo = (function (_super) {
        __extends(pSkyboxInfo, _super);
        function pSkyboxInfo() {
            _super.apply(this, arguments);
        }
        return pSkyboxInfo;
    })(pInfo);
    pack.pSkyboxInfo = pSkyboxInfo;
    var pSkyboxInfoList = (function (_super) {
        __extends(pSkyboxInfoList, _super);
        function pSkyboxInfoList() {
            _super.apply(this, arguments);
        }
        pSkyboxInfoList.prototype.toSimple = function () {
            var _this = this;
            var result = {};
            Object.keys(this.getAll()).forEach(function (i) {
                result[_this.get(i).data.label] = i;
            });
            return result;
        };
        return pSkyboxInfoList;
    })(p.List);
    pack.pSkyboxInfoList = pSkyboxInfoList;
})(pack || (pack = {}));
var ev;
(function (ev_1) {
    var events = new p.List();
    function addPlaEventListener(eventName, listener) {
        if (eventName.indexOf("|") !== -1) {
            eventName.split("|").forEach(function (i) {
                addPlaEventListener(i, listener);
            });
        }
        else {
            if (events.contains(eventName)) {
                var a = events.get(eventName);
                a.push(listener);
                events.update(eventName, a);
            }
            else {
                events.push(eventName, [listener]);
            }
        }
    }
    ev_1.addPlaEventListener = addPlaEventListener;
    function raiseEvent(eventName, e) {
        if (events.contains(eventName)) {
            events.get(eventName).forEach(function (i) {
                // i.call(e); だとeがundefinedで渡されてしまう
                i(e);
            });
        }
    }
    ev_1.raiseEvent = raiseEvent;
})(ev || (ev = {}));
