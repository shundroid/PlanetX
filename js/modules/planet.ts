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
    var items = stage.items.getAllLayer();
    for (var i = 0; i < items.length; i++)  {
      result.Stage[i] = [];
      items[i].forEach(j => {
        var item = stage.items.get(j);
        if (stage.blockAttrs.containsBlock(j)) {
          // attrがあるとき
          var attr:{ [key: string]: string } = {};
          var attrs = stage.blockAttrs.getBlock(j);
          Object.keys(attrs).forEach(k => {
            attr[attrs[parseInt(k)].attrName] = attrs[parseInt(k)].attrVal;
          });
          result.Stage[i].push(new jsonPlanet.jsonBlockItem(item.blockName, item.gridX, item.gridY, j.toString(), attr));          
        } else {
          result.Stage[i].push(new jsonPlanet.jsonBlockItem(item.blockName, item.gridX, item.gridY, j.toString()));
        }
      });
    }
    return result;
  }
  
  /**
   * jsonPlanetを、stageへ変換します。
   * 内部で、stage.itemsをクリアし、新しくpushします。
   */
  export function fromJsonPlanet(jsonPla: jsonPlanet.jsonPlanet) {
    stage.items.clear();
    stage.resetId();
    for (var i = 0; i < jsonPla.Stage.length; i++) {
      jsonPla.Stage[i].forEach(j => {
        if (d.pack.objs.contains(j.blockName)) {
          let objData = d.pack.objs.get(j.blockName);
          stage.items.push(stage.getId(), new prefab(j.posX, j.posY, objData.data.filename, j.blockName, stage.toGridPos(objData.data.width), stage.toGridPos(objData.data.height)), i);
        } else {
          let blockData = d.pack.blocks.get(j.blockName);
          stage.items.push(stage.getId(), new prefab(j.posX, j.posY, blockData.data.filename, j.blockName, stage.toGridPos(d.defaultBlockSize), stage.toGridPos(d.defaultBlockSize)), i);
        }        
      });
    }
    d.activeStageLayer = 0;
    var result = new stage.StageEffects();
    result.skybox = "sky";
    // Todo: StageEffect
    return result;
  }
  
}
export = planet;