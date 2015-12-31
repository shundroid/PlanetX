import stage = require("./stage");
import prefab = require("./prefab");
import compiler = require("./compiler");
import d = require("./data");

module planet {
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