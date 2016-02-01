import stage = require("./stage");
import prefab = require("./classes/prefab");
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
    Object.keys(stage.stageEffects.skyboxes).forEach(i => {
      result.skyboxes.push(stage.stageEffects.skyboxes[parseInt(i)]);
    });
    var items = stage.items.getAllLayer();
    for (var i = 0; i < items.length; i++)  {
      result.stage[i] = [];
      items[i].forEach(j => {
        var item = stage.items.get(j);
        if (stage.blockAttrs.containsBlock(j)) {
          // attrがあるとき
          var attr:{ [key: string]: string } = {};
          var attrs = stage.blockAttrs.getBlock(j);
          Object.keys(attrs).forEach(k => {
            attr[attrs[parseInt(k)].attrName] = attrs[parseInt(k)].attrVal;
          });
          result.stage[i].push(new jsonPlanet.jsonBlockItem(item.blockName, item.gridX, item.gridY, j.toString(), attr));          
        } else {
          result.stage[i].push(new jsonPlanet.jsonBlockItem(item.blockName, item.gridX, item.gridY, j.toString()));
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
    stage.blockAttrs.clear();
    stage.resetId();
    for (var i = 0; i < jsonPla.stage.length; i++) {
      jsonPla.stage[i].forEach(j => {
        var id = stage.getId();
        if (d.pack.objs.contains(j.blockName)) {
          let objData = d.pack.objs.get(j.blockName);
          stage.items.push(id, new prefab(j.posX, j.posY, objData.data.filename, j.blockName, stage.toGridPos(objData.data.width), stage.toGridPos(objData.data.height)), i);
        } else {
          let blockData = d.pack.blocks.get(j.blockName);
          stage.items.push(id, new prefab(j.posX, j.posY, blockData.data.filename, j.blockName, stage.toGridPos(d.defaultBlockSize), stage.toGridPos(d.defaultBlockSize)), i);
        }
        if (typeof j.attr !== "undefined") {
          Object.keys(j.attr).forEach(k => {
            stage.blockAttrs.push(id, stage.blockAttrs.getMaxAttrId(id), new stage.Attr(k, j.attr[k]));
          });
        }
      });
    }
    d.activeStageLayer = 0;
    var result = new stage.StageEffects();
    result.skyboxes[0] = d.pack.editor.defaultSkybox;
    // Todo: StageEffect
    return result;
  }
  
}
export = planet;