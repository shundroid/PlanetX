import stage = require("./stage");
import prefab = require("./prefab");
import compiler = require("./compiler");
import d = require("./data");
import jsonPlanet = require("./jsonPlanet");
import version = require("./version");

/**
 * stageから、compilerを利用して、外部形式へ入出力する機能を提供します。
 */
module planet {
  
  /**
   * stageを、jsonPlanetへ変換します。
   * jsonPlanetから、jsonに変換するのには、jsonPlanet.exportJson()を利用してください。
   */
  export function toJsonPlanet() {
    var result = new jsonPlanet.jsonPlanet(version.jsonPlanetVersion);
    var items:any = stage.items.getAll();
    Object.keys(items).forEach(i => {
      var item = stage.items.get(parseInt(i));
      result.Stage.push(new jsonPlanet.jsonBlockItem(item.blockName, item.gridX, item.gridY, i));
    });
    return result;
  }
  
  /**
   * jsonPlanetを、stageへ変換します。
   * 内部で、stage.itemsをクリアし、新しくpushします。
   */
  export function fromJsonPlanet(jsonPla: jsonPlanet.jsonPlanet) {
    stage.items.clear();
    stage.resetId();
    jsonPla.Stage.forEach(i => {
      if (d.pack.objs.contains(i.blockName)) {
        let objData = d.pack.objs.get(i.blockName);
        stage.items.push(stage.getId(), new prefab(i.posX, i.posY, objData.data.filename, i.blockName, stage.toGridPos(objData.data.width), stage.toGridPos(objData.data.height)));
      } else {
        let blockData = d.pack.blocks.get(i.blockName);
        stage.items.push(stage.getId(), new prefab(i.posX, i.posY, blockData.data.filename, i.blockName, stage.toGridPos(d.defaultBlockSize), stage.toGridPos(d.defaultBlockSize)));
      }
    });
    var result = new stage.StageEffects();
    // Todo: StageEffect
    return result;
  }
  
  /**
   * 非推奨
   */
  export function exportText():string {
    var result:Array<string> = [];
    result.push("//:csv");
    // header
    if (stage.header.replace(/ /g, "").replace(/\n/g, "") !== "") {
      result.push("//:header");
      var hLines = stage.header.split("\n");
      hLines.forEach(i => {
        result.push(i);
      });
      result.push("//:/header");
    }
    // effects
    result.push(["*skybox", stage.stageEffects.skybox].join(","));
    
    // blocks
    var items = stage.items.getAll();
    Object.keys(items).forEach(i => {
      var item = stage.items.get(parseInt(i));
      result.push([[item.blockName, item.gridX, item.gridY].join(","), i].join("="));
    });
    
    // attributes
    var atts = stage.blockAttrs.getAll();
    if (atts) {
      Object.keys(atts).forEach(i => {
        var attr = stage.blockAttrs.getBlock(parseInt(i)).getAll();
        Object.keys(attr).forEach(j => {
          result.push(["*custom", j, i, stage.blockAttrs.getBlock(parseInt(i)).get(j)].join(","));
        });
      });
    }
    // footer
    if (stage.footer.replace(/ /g, "").replace(/\n/g, "") !== "") {
      result.push("//:footer");
      var fLines = stage.footer.split("\n");
      fLines.forEach(i => {
        result.push(i);
      });
      result.push("//:/footer");
    }
    return result.join("\n");
  }
  
  /**
   * 非推奨
   */
  export function importText(file:string) {
    stage.items.clear();
    stage.resetId();
    var centerLang = compiler.toCenterLang(compiler.getLangAuto(file.split("\n")[0]), file);
    stage.header = centerLang.header;
    stage.footer = centerLang.footer;
    var clang = centerLang.prefabList.getAll();
    var result = centerLang.effects;
    Object.keys(clang).forEach(i => {
      var item = centerLang.prefabList.get(i);
      if (d.pack.objs.contains(item.blockName)) {
        let objData = d.pack.objs.get(item.blockName);
        stage.items.push(stage.getId(), new prefab(item.x, item.y, objData.data.filename, item.blockName, stage.toGridPos(objData.data.width), stage.toGridPos(objData.data.height)));
      } else {
        let blockData = d.pack.blocks.get(item.blockName);
        stage.items.push(stage.getId(), new prefab(item.x, item.y, blockData.data.filename, item.blockName, stage.toGridPos(d.defaultBlockSize), stage.toGridPos(d.defaultBlockSize)));
      }
    });
    stage.blockAttrs.setAll(centerLang.attrList);
    return result;
  }
}
export = planet;