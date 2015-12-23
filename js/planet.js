/// <reference path="lib/classes.ts" />
/// <reference path="main.ts" />
/// <reference path="lib/compiler.ts" />
/**
 * Planetのデータを管理します。
 */
var planet;
(function (planet) {
    function init() {
        list = new p.List();
        planet.header = "";
        planet.footer = "";
    }
    var maxId = 0;
    function getId() {
        var result = maxId;
        maxId++;
        return result;
    }
    planet.getId = getId;
    function initId() {
        maxId = 0;
    }
    var list;
    function add(id, p) {
        list.push(id.toString(), p);
    }
    planet.add = add;
    function get(id) {
        return list.get(id.toString());
    }
    planet.get = get;
    function all() {
        return list.getAll();
    }
    planet.all = all;
    function remove(id) {
        list.remove(id.toString());
    }
    planet.remove = remove;
    function clear() {
        list.clear();
    }
    planet.clear = clear;
    function getFromGrid(grid) {
        var l = list.getAll();
        var result = { prefab: null, id: -1, contains: false };
        var breakException = {};
        // breakするための try
        try {
            Object.keys(l).forEach(function (i) {
                if (grid.x >= l[i]["gridX"] && grid.x < l[i]["gridX"] + l[i]["gridW"] &&
                    grid.y >= l[i]["gridY"] && grid.y < l[i]["gridY"] + l[i]["gridH"]) {
                    result = { prefab: l[i], id: parseInt(i), contains: true };
                    throw breakException;
                }
            });
        }
        catch (e) {
            if (e !== breakException)
                throw e;
        }
        return result;
    }
    planet.getFromGrid = getFromGrid;
    function exportText() {
        var result = [];
        result.push("//:csv");
        if (planet.header.replace(/ /g, "").replace(/\n/g, "") !== "") {
            result.push("//:header");
            var hLines = planet.header.split("\n");
            hLines.forEach(function (i) {
                result.push(i);
            });
            result.push("//:/header");
        }
        var items = list.getAll();
        Object.keys(items).forEach(function (i) {
            var item = items[i];
            result.push([[item.blockName, item.gridX, item.gridY].join(","), i].join("="));
        });
        if (planet.footer.replace(/ /g, "").replace(/\n/g, "") !== "") {
            result.push("//:footer");
            var fLines = planet.footer.split("\n");
            fLines.forEach(function (i) {
                result.push(i);
            });
            result.push("//:/footer");
        }
        return result.join("\n");
    }
    planet.exportText = exportText;
    function importText(file) {
        clear();
        initId();
        var centerLang = compiler.toCenterLang(compiler.getLangAuto(file.split("\n")[0]), file);
        planet.header = centerLang.header;
        planet.footer = centerLang.footer;
        var clang = centerLang.prefabList.getAll();
        Object.keys(clang).forEach(function (i) {
            var item = centerLang.prefabList.get(i);
            if (main.packModule.objs.contains(item.blockName)) {
                var objData = main.packModule.objs.get(item.blockName);
                add(getId(), { gridX: item.x, gridY: item.y, blockName: item.blockName, filename: objData.data.filename, gridW: objData.data.width / main.defaultGridSize, gridH: objData.data.height / main.defaultGridSize });
            }
            else {
                var blockData = main.packModule.blocks.get(item.blockName);
                add(getId(), { gridX: item.x, gridY: item.y, blockName: item.blockName, filename: blockData.data.filename, gridW: 2, gridH: 2 });
            }
        });
    }
    planet.importText = importText;
    init();
})(planet || (planet = {}));
