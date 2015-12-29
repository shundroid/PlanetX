import stage = require("./stage");
import prefab = require("./prefab");

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
    return new stage.StageEffects();
  }
}
export = planet;