import list = require("./list");
import prefab = require("./prefab");
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
}
export = stage;