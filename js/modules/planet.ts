import stage = require("./stage");
import {stageEffects, StageEffects} from "./model/stageEffectsModel";
import * as stageItems from "./model/stageItemsModel";
import * as stageAttrs from "./model/stageAttrsModel";
import prefab from "./classes/prefab";
import {data as d} from "./data";
import {jsonPlanet, jsonBlockItem} from "./jsonPlanet";
import {jsonPlanetVersion} from "./version";
import {setActiveStageLayer} from "./model/editorModel";
import {pack} from "./model/packModel";
import {defaultBlockSize} from "./model/preferencesModel";

// stageから、compilerを利用して、外部形式へ入出力する機能を提供します。

/**
 * stageを、jsonPlanetへ変換します。
 * jsonPlanetから、jsonに変換するのには、jsonPlanet.exportJson()を利用してください。
 */
export function toJsonPlanet() {
  var result = new jsonPlanet(jsonPlanetVersion);
  Object.keys(stageEffects.skyboxes).forEach(i => {
    result.skyboxes.push(stageEffects.skyboxes[parseInt(i)]);
  });
  var items = stageItems.getAllLayer();
  for (var i = 0; i < items.length; i++) {
    result.stage[i] = [];
    items[i].forEach(j => {
      var item = stageItems.get(j);
      if (stageAttrs.containsBlock(j)) {
        // attrがあるとき
        var attr: { [key: string]: string } = {};
        var attrs = stageAttrs.getBlock(j);
        Object.keys(attrs).forEach(k => {
          attr[attrs[parseInt(k)].attrName] = attrs[parseInt(k)].attrVal;
        });
        result.stage[i].push(new jsonBlockItem(item.blockName, item.gridX, item.gridY, j.toString(), attr));
      } else {
        result.stage[i].push(new jsonBlockItem(item.blockName, item.gridX, item.gridY, j.toString()));
      }
    });
  }
  return result;
}

/**
 * jsonPlanetを、stageへ変換します。
 * 内部で、stage.itemsをクリアし、新しくpushします。
 */
export function fromJsonPlanet(jsonPla: jsonPlanet) {
  stageItems.clear();
  stageAttrs.clear();
  stageItems.resetId();
  for (var i = 0; i < jsonPla.stage.length; i++) {
    jsonPla.stage[i].forEach(j => {
      var id = stageItems.getId();
      if (pack.objs.contains(j.blockName)) {
        let objData = pack.objs.get(j.blockName);
        stageItems.push(id, new prefab(j.posX, j.posY, objData.data.filename, j.blockName, stage.toGridPos(objData.data.width), stage.toGridPos(objData.data.height)), i);
      } else {
        let blockData = pack.blocks.get(j.blockName);
        stageItems.push(id, new prefab(j.posX, j.posY, blockData.data.filename, j.blockName, stage.toGridPos(defaultBlockSize), stage.toGridPos(defaultBlockSize)), i);
      }
      if (typeof j.attr !== "undefined") {
        Object.keys(j.attr).forEach(k => {
          stageAttrs.push(id, stageAttrs.getMaxAttrId(id), new stageAttrs.Attr(k, j.attr[k]));
        });
      }
    });
  }
  setActiveStageLayer(0);
  var result = new StageEffects();
  // skyboxes
  result.skyboxes = jsonPla.skyboxes;

  return result;
}
