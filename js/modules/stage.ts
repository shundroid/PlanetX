import list from "./classes/list";
import prefab from "./classes/prefab";
import canvas = require("./canvas");
import image = require("./image");
import {data as d} from "./data";
import rect from "./classes/rect";
import event = require("./event");
import Vector2 from "./classes/vector2";

/**
 * 現在のStage情報を保存します。
 */
namespace stage {
  
  // StageEffect
  export class StageEffects {
    public skyboxes:string[];
    constructor() {
      this.skyboxes = [ "" ];
    }
  }
  export var stageEffects:StageEffects = new StageEffects();
  
  // Todo: このクラスを分離
  export class Attr {
    constructor(
      public attrName: string = "",
      public attrVal: string = ""
    ) { }
  }
  
  // Attrをブロックごとに管理
  var blockAttrsList:{[key: number]: {[key: number]: Attr}};
  export namespace blockAttrs {
    export function setAll(lst:{[key: string]: {[key: number]: Attr}}) {
      blockAttrsList = lst;
    }
    export function push(blockId: number, attrId: number, value:Attr) {
      if (typeof blockAttrsList[blockId] === "undefined") {
        blockAttrsList[blockId] = {};
      }
      blockAttrsList[blockId][attrId] = value;
    }
    
    export function update(blockId: number, attrId: number, attr:{[key: string]: string}): void;
    export function update(blockId: number, attrId: number, attr:Attr): void;
    
    export function update(blockId: number, attrId: number, attr:any): void {
      if (attr instanceof Attr) {
        // attrNameをAttrで指定するとき
        blockAttrsList[blockId][attrId] = <Attr>attr;
      } else {
        // attrName、attrValで指定するとき
        var cur = blockAttrsList[blockId][attrId];
        if (typeof attr["attrName"] !== "undefined") {
          cur.attrName = attr["attrName"];
        }
        if (typeof attr["attrVal"] !== "undefined") {
          cur.attrVal = attr["attrVal"];
        }
        blockAttrsList[blockId][attrId] = cur;
      }
    }
    
    export function containsAttr(blockId: number, attrId: number) {
      // blockIdがundefinedのときは、エラーが出ないよう、falseを返しておく。
      if (typeof blockAttrsList[blockId] === "undefined") {
        return false;
      } else {
        return typeof blockAttrsList[blockId][attrId] !== "undefined";
      }
    }
    export function containsBlock(blockId: number) {
      return typeof blockAttrsList[blockId] !== "undefined";
    }
    export function removeAttr(blockId: number, attrId: number) {
      delete blockAttrsList[blockId][attrId];
    }
    export function removeBlock(blockId: number) {
      delete blockAttrsList[blockId];
    }
    export function getBlock(blockId: number) {
      return blockAttrsList[blockId];
    }
    export function getAttr(blockId: number, attrId: number) {
      return blockAttrsList[blockId][attrId];
    }
    export function getAll() {
      return blockAttrsList;
    }
    export function clear() {
      blockAttrsList = {};
    }
    
    // attrId関係
    export function getMaxAttrId(blockId: number) {
      if (typeof blockAttrsList[blockId] === "undefined") {
        return 0;
      } else {
        return Object.keys(blockAttrsList[blockId]).length;
      }
    }
  }
  
  /**
   * ステージ上のすべてのPrefabのリスト
   */
  var prefabList:{[key: number]: prefab};
  
  /**
   * stageLayer別のIdを格納
   */
  var prefabLayer:number[][];
  
  /**
   * アクティブなstageLayerを変えるほか、画面の切り替えも行います。
   */
  export function changeActiveStageLayer(stageLayer:number) {
    d.activeStageLayer = stageLayer;
    // 描画
    renderStage(stageLayer);
  }
  
  export namespace items {
    
    /**
     * 内部でpushStageLayerを呼び出します
     */
    export function push(id:number, p:prefab, stageLayer:number=0) {
      prefabList[id] =  p;
      pushStageLayer(stageLayer, id);
    }
    export function all() {
      return prefabList;
    }
    export function remove(id:number, stageLayer: number) {
      prefabLayer[stageLayer].splice(prefabLayer[stageLayer].indexOf(id), 1);
      delete prefabList[id];
    }
    export function clear() {
      prefabList = {};
    }
    export function get(id:number) {
      return prefabList[id];
    }
    /**
     * レイヤーごとにItemを取得
     */
    export function getLayerItems(stageLayer:number) {
      var ids = getLayerIds(stageLayer);
      var result = new list<prefab>();
      ids.forEach(i => {
        result.push(i.toString(), get(i));
      });
      return result;
    }
    export function pushStageLayer(stageLayer: number, id: number) {
      if (typeof prefabLayer[stageLayer] === "undefined") {
        prefabLayer[stageLayer] = [];
      }
      prefabLayer[stageLayer].push(id);
    }
    export function getLayerIds(stageLayer: number) {
      if (typeof prefabLayer[stageLayer] === "undefined") {
        prefabLayer[stageLayer] = [];
      }
      return prefabLayer[stageLayer];
    }
    export function getAllLayer() {
      return prefabLayer;
    }
  }
  var maxId:number;
  function init() {
    prefabList = {};
    blockAttrsList = {};
    prefabLayer = new Array<Array<number>>();
    maxId = 0;
  }
  init();
  
  export function getId() {
    return maxId++;
  }
  export function resetId() {
    maxId = 0;
  }
  
  /**
   * ステージをstageLayerに基づき描画します。
   */
  export function renderStage(renderStageLayer: number = 0) {
    canvas.clear();
    var l = items.getLayerItems(renderStageLayer).getAll();
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
      renderStage(d.activeStageLayer);
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
  export function getPrefabFromGrid(grid:Vector2, stageLayer: number) {
    var result = new getPrefabFromGridDetails(false, -1, null);
    var breakException = {};
    // breakするため
    try {
      Object.keys(items.getLayerItems(stageLayer).getAll()).forEach(i => {
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