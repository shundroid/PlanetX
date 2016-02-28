import list from "./classes/list";
import prefab from "./classes/prefab";
import * as canvas from "./canvas";
import image from "./image";
import {data as d} from "./data";
import rect from "./classes/rect";
import {addEventListener} from "./event";
import Vector2 from "./classes/vector2";
import {init as stageAttrsInit} from "./model/stageAttrsModel";
import * as stageItems from "./model/stageItemsModel";

/**
 * 現在のStage情報を保存します。
 */
namespace stage {

  /**
   * アクティブなstageLayerを変えるほか、画面の切り替えも行います。
   */
  export function changeActiveStageLayer(stageLayer:number) {
    d.activeStageLayer = stageLayer;
    // 描画
    renderStage(stageLayer);
  }
  
  var maxId:number;
  function init() {
    stageItems.init();
    stageAttrsInit();
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
    var l = stageItems.getLayerItems(renderStageLayer).getAll();
    Object.keys(l).forEach(i => {
      var item = stageItems.get(parseInt(i));
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
  addEventListener("resize", () => {
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
      Object.keys(stageItems.getLayerItems(stageLayer).getAll()).forEach(i => {
        var item = stageItems.get(parseInt(i));
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