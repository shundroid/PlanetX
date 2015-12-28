var Vector2 = require("./vector2");
var d = require("./data");
var stage = require("./stage");
var rect = require("./rect");
/**
 * 座標系。ひえーー
 */
var grid;
(function (grid_1) {
    var gridDetail = (function () {
        function gridDetail(gridPos, eventName, mousePos) {
            this.gridPos = gridPos;
            this.eventName = eventName;
            this.mousePos = mousePos;
        }
        return gridDetail;
    })();
    grid_1.gridDetail = gridDetail;
    function getMousePosFromCenterAndSize(center, size) {
        return center - ((size - d.defaultGridSize) / 2);
    }
    grid_1.getMousePosFromCenterAndSize = getMousePosFromCenterAndSize;
    grid_1.scrollX = 0;
    grid_1.scrollY = 0;
    grid_1.scrollBeforeX = 0;
    grid_1.scrollBeforeY = 0;
    function getGridPosFromMousePos(mousePos) {
        var cX = mousePos.x - grid_1.scrollX;
        var cY = mousePos.y - grid_1.scrollY;
        var eX = cX - (cX % d.defaultGridSize);
        var eY = cY - (cY % d.defaultGridSize);
        var gridX = eX / d.defaultGridSize;
        var gridY = eY / d.defaultGridSize;
        return new Vector2(gridX, gridY);
    }
    grid_1.getGridPosFromMousePos = getGridPosFromMousePos;
    var getPrefabFromGridDetails = (function () {
        function getPrefabFromGridDetails(contains, id, prefab) {
            this.contains = contains;
            this.id = id;
            this.prefab = prefab;
        }
        return getPrefabFromGridDetails;
    })();
    grid_1.getPrefabFromGridDetails = getPrefabFromGridDetails;
    function getPrefabFromGrid(grid) {
        var result = new getPrefabFromGridDetails(false, -1, null);
        var breakException = {};
        // breakするため
        try {
            Object.keys(stage.items.getAll()).forEach(function (i) {
                var item = stage.items.get(parseInt(i));
                if (grid.x >= item.gridX && grid.x < item.gridX + item.gridW &&
                    grid.y >= item.gridY && grid.y < item.gridY + item.gridH) {
                    result = new getPrefabFromGridDetails(true, parseInt(i), item);
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
    grid_1.getPrefabFromGrid = getPrefabFromGrid;
    function toMousePos(gridPos) {
        return gridPos * d.defaultGridSize;
    }
    grid_1.toMousePos = toMousePos;
    function toGridPos(mousePos) {
        return (mousePos - (mousePos % d.defaultGridSize)) / d.defaultGridSize;
    }
    grid_1.toGridPos = toGridPos;
    /**
     * すべてgridPosで指定された4点のrectを、描画領域に変換します。
     */
    function toDrawRect(gridRect) {
        return new rect(grid_1.scrollX + getMousePosFromCenterAndSize(toMousePos(gridRect.x), toMousePos(gridRect.width)), grid_1.scrollY + getMousePosFromCenterAndSize(toMousePos(gridRect.y), toMousePos(gridRect.height)), toMousePos(gridRect.width), toMousePos(gridRect.height));
    }
    grid_1.toDrawRect = toDrawRect;
})(grid || (grid = {}));
module.exports = grid;
