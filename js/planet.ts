/// <reference path="lib/classes.ts" />
/**
 * Planetのデータを管理します。
 */
module planet {
  function init() {
    list = new p.List<Prefab>();
  }
  export interface Prefab {
    gridX:number;
    gridY:number;
    filename:string;
    blockName:string;
    gridW:number;
    gridH:number;
  }
  var list:p.List<Prefab>;
  export function add(id:number, p:Prefab) {
    list.push(id.toString(), p);
  }
  export function get(id:number):Prefab {
    return list.get(id.toString());
  }
  export function all() {
    return list.getAll();
  }
  export function remove(id:number) {
    list.remove(id.toString());
  }
  export interface getFromGridDetails {
    contains:boolean;
    id:number;
    prefab:Prefab;
  }
  export function getFromGrid(grid:p.Vector2):getFromGridDetails {
    var l = list.getAll();
    var result:getFromGridDetails = { prefab: null, id: -1, contains: false};
    var breakException = {};
    // breakするための try
    try {
      Object.keys(l).forEach(i => {
        if (grid.x >= l[i]["gridX"] && grid.x < l[i]["gridX"] + l[i]["gridW"] && 
          grid.y >= l[i]["gridY"] && grid.y < l[i]["gridY"] + l[i]["gridH"]) {
          result = { prefab: l[i], id: parseInt(i), contains: true };
          throw breakException;
        }
      });
    } catch (e) {
      if (e !== breakException) throw e;
    }
    return result;
  }
  init();
}