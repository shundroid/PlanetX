import list = require("./list");
import prefab = require("./prefab");
import canvas = require("./canvas");
import grid = require("./grid");
import image = require("./image");
import d = require("./data");
import rect = require("./rect");
import event = require("./event");

module stage {
  export class StageEffects {
    public skybox:string;
    constructor() {
      this.skybox = "";
    }
  }
  export var stageEffects:StageEffects = new StageEffects();
  
  var prefabList:list<prefab>;
  export module items {
    /**
     * alias (push)
     */
    export function add(id:number, p:prefab) { push(id, p); }
    export function push(id:number, p:prefab) {
      prefabList.push(id.toString(), p);
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
  }
  var maxId:number;
  function init() {
    prefabList = new list<prefab>();
    maxId = 0;
  }
  init();
  
  export function getId() {
    return maxId++;
  }
  function resetId() {
    maxId = 0;
  }
  
  export function renderStage() {
    canvas.clear();
    var l = items.getAll();
    Object.keys(l).forEach(i => {
      var item = items.get(parseInt(i));
      var x = grid.scrollX + grid.getMousePosFromCenterAndSize(grid.toMousePos(item.gridX), grid.toMousePos(item.gridW));
      var y = grid.scrollY + grid.getMousePosFromCenterAndSize(grid.toMousePos(item.gridY), grid.toMousePos(item.gridH));
      var width = grid.toMousePos(item.gridW);
      var height = grid.toMousePos(item.gridH);
      // 画面内に入っているか
      if (x + width >= 0 && x <= canvas.canvasRect.width &&
      y + height >= 0 && x <= canvas.canvasRect.height) {
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
}
export = stage;