import list = require("./classes/list");
import prefab = require("./prefab");
import canvas = require("./canvas");
import image = require("./image");
import d = require("./data");
import rect = require("./classes/rect");
import event = require("./event");
import Vector2 = require("./classes/vector2");
import blockAttributes = require("./classes/blockAttr/blockAttributes");
import attribute = require("./classes/blockAttr/attribute");
module stage {
  export class StageEffects {
    public skybox:string;
    constructor() {
      this.skybox = "";
    }
  }
  export var stageEffects:StageEffects = new StageEffects();
  export var header:string;
  export var footer:string;
  
  var blockAttrsList:list<list<string>>;
  export module blockAttrs {
    export function setAll(lst:list<list<string>>) {
      blockAttrsList = lst;
    }
    export function push(blockId: number, attrName:string, value:string) {
      var l:list<string>;
      if (containsBlock(blockId)) {
        l = getBlock(blockId);
      } else {
        l = new list<string>();
      }
      l.push(attrName, value);
      blockAttrsList.push(blockId.toString(), l);
    }
    export function update(blockId: number, attrName:string, value:string) {
      var l = getBlock(blockId);
      l.update(attrName, value);
      blockAttrsList.update(blockId.toString(), l);
    }
    export function containsAttr(blockId: number, attrName:string) {
      if (containsBlock(blockId)) {
        var l = getBlock(blockId);
        return l.contains(attrName);
      } else {
        return false;
      }
    }
    export function containsBlock(blockId: number) {
      return blockAttrsList.contains(blockId.toString());
    }
    export function removeAttr(blockId: number, attrName:string) {
      var l = getBlock(blockId);
      l.remove(attrName);
      blockAttrsList.update(blockId.toString(), l);
    }
    export function removeBlock(blockId: number) {
      blockAttrsList.remove(blockId.toString());
    }
    export function getBlock(blockId: number) {
      return blockAttrsList.get(blockId.toString());
    }
    export function getAttr(blockId: number, attrName: string) {
      return blockAttrsList.get(blockId.toString()).get(attrName);
    }
    export function getAll() {
      var l = blockAttrsList.getAll();
      var result:any = {};
      Object.keys(l).forEach(i => {
        result[i] = blockAttrsList.get(i).getAll(); 
      });
      return result;
    }
  }
  
  /**
   * ステージ上のすべてのPrefabのリスト
   */
  var prefabList:list<prefab>;
  
  /**
   * stageLayer別のIdを格納
   */
  var prefabLayer:number[][];
  
  export module items {
    export function push(id:number, p:prefab, stageLayer:number=0) {
      prefabList.push(id.toString(), p);
      prefabLayer[stageLayer].push(id);
    }
    export function getAll() {
      return prefabList.getAll();
    }
    export function remove(id:number) {
      return prefabList.remove(id.toString());
    }
    export function clear() {
      prefabList.clear();
    }
    export function get(id:number) {
      return prefabList.get(id.toString());
    }
    /**
     * レイヤーごとにIdを取得
     */
    export function getLayer(stageLayer:number) {
      return prefabLayer[stageLayer];
    }
  }
  var maxId:number;
  function init() {
    prefabList = new list<prefab>();
    blockAttrsList = new list<list<string>>();
    header = "";
    footer = "";
    maxId = 0;
  }
  init();
  
  export function getId() {
    return maxId++;
  }
  export function resetId() {
    maxId = 0;
  }
  
  export function renderStage() {
    canvas.clear();
    var l = items.getAll();
    Object.keys(l).forEach(i => {
      var item = items.get(parseInt(i));
      var x = stage.scrollX + stage.getMousePosFromCenterAndSize(stage.toMousePos(item.gridX), stage.toMousePos(item.gridW));
      var y = stage.scrollY + stage.getMousePosFromCenterAndSize(stage.toMousePos(item.gridY), stage.toMousePos(item.gridH));
      var width = stage.toMousePos(item.gridW);
      var height = stage.toMousePos(item.gridH);
      // 画面内に入っているか
      if (x + width >= 0 && x <= canvas.canvasRect.width &&
      y + height >= 0 && y <= canvas.canvasRect.height) {
        canvas.render(image(d.trayItemDataURLs.get(item.blockName)), new rect(x, y, width, height));
      }
    });
  }
  
  var isResizeRequest = false;
  var resizeTimerId:number;
  event.addEventListener("resize", () => {
    if (isResizeRequest) {
      clearTimeout(resizeTimerId);
    }
    isResizeRequest = true;
    resizeTimerId = setTimeout(() => {
      isResizeRequest = false;
      renderStage();
    }, 100);
  });
  export class gridDetail {
    constructor(public gridPos:Vector2, public eventName:string, public mousePos:Vector2) { }
  }
  export function getMousePosFromCenterAndSize(center:number, size:number) {
    return center - ((size - d.defaultGridSize) / 2);
  }
  export var scrollX = 0;
  export var scrollY = 0;
  export var scrollBeforeX = 0;
  export var scrollBeforeY = 0;
  export function getGridPosFromMousePos(mousePos:Vector2) {
    var cX = mousePos.x - scrollX; var cY = mousePos.y - scrollY;
    var eX = cX - (cX % d.defaultGridSize);
    var eY = cY - (cY % d.defaultGridSize);
    var gridX = eX / d.defaultGridSize;
    var gridY = eY / d.defaultGridSize;
    return new Vector2(gridX, gridY);
  }
  export class getPrefabFromGridDetails {
    constructor(
      public contains: boolean,
      public id: number,
      public prefab: prefab
    ) { }
  }
  export function getPrefabFromGrid(grid:Vector2) {
    var result = new getPrefabFromGridDetails(false, -1, null);
    var breakException = {};
    // breakするため
    try {
      Object.keys(items.getAll()).forEach(i => {
        var item = items.get(parseInt(i));
        if (grid.x >= item.gridX && grid.x < item.gridX + item.gridW &&
          grid.y >= item.gridY && grid.y < item.gridY + item.gridH) {
          result = new getPrefabFromGridDetails(true, parseInt(i), item);
          throw breakException;
        }
      });
    } catch (e) {
      if (e !== breakException) throw e;
    }
    return result;
  }
  export function toMousePos(gridPos:number) {
    return gridPos * d.defaultGridSize;
  }
  export function toGridPos(mousePos:number) {
    return (mousePos - (mousePos % d.defaultGridSize)) / d.defaultGridSize;
  }
  /**
   * すべてgridPosで指定された4点のrectを、描画領域に変換します。
   */
  export function toDrawRect(gridRect:rect) {
    return new rect(
      scrollX + getMousePosFromCenterAndSize(toMousePos(gridRect.x), toMousePos(gridRect.width)),
      scrollY + getMousePosFromCenterAndSize(toMousePos(gridRect.y), toMousePos(gridRect.height)),
      toMousePos(gridRect.width),
      toMousePos(gridRect.height)
    );
  }
}
export = stage;