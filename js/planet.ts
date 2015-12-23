/// <reference path="lib/classes.ts" />
/// <reference path="main.ts" />
/// <reference path="lib/compiler.ts" />
/**
 * Planetのデータを管理します。
 */
module planet {
  function init() {
    list = new p.List<Prefab>();
    header = "";
    footer = "";
  }
  var maxId = 0;
  export function getId() {
    var result = maxId;
    maxId++;
    return result;
  }
  function initId() {
    maxId = 0;
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
  export function clear() {
    list.clear();
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
  export function exportText():string {
    var result = [];
    result.push("//:csv");
    // header
    if (header.replace(/ /g, "").replace(/\n/g, "") !== "") {
      result.push("//:header");
      var hLines = header.split("\n");
      hLines.forEach(i => {
        result.push(i);
      });
      result.push("//:/header");
    }
    // effects
    result.push(["*skybox", main.stageSettings.skybox].join(","));
    
    // blocks
    var items = list.getAll();
    Object.keys(items).forEach(i => {
      var item = <Prefab>items[i];
      result.push([[item.blockName, item.gridX, item.gridY].join(","), i].join("="));
    });
    
    // footer
    if (footer.replace(/ /g, "").replace(/\n/g, "") !== "") {
      result.push("//:footer");
      var fLines = footer.split("\n");
      fLines.forEach(i => {
        result.push(i);
      });
      result.push("//:/footer");
    }
    return result.join("\n");
  }
  export function importText(file:string) {
    clear();
    initId();
    var centerLang = compiler.toCenterLang(compiler.getLangAuto(file.split("\n")[0]), file);
    header = centerLang.header; footer = centerLang.footer;
    var clang = centerLang.prefabList.getAll();
    var result = centerLang.effects;
    Object.keys(clang).forEach(i => {
      var item = centerLang.prefabList.get(i);
      if (main.packModule.objs.contains(item.blockName)) {
        let objData = main.packModule.objs.get(item.blockName);
        add(getId(), { gridX: item.x, gridY: item.y, blockName: item.blockName, filename: objData.data.filename, gridW: objData.data.width / main.defaultGridSize, gridH: objData.data.height / main.defaultGridSize });
      } else {
        let blockData = main.packModule.blocks.get(item.blockName);
        add(getId(), { gridX: item.x, gridY: item.y, blockName: item.blockName, filename: blockData.data.filename, gridW: 2, gridH: 2 });
      }
    });
    return result;
  }
  export var header:string;
  export var footer:string;
  init();
}