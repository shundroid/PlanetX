import d = require("./data");
import list from "./classes/list";
import packManager = require("./packUtil/packManager");
import Vector2 from "./classes/vector2";
import image from "./image";
import {packModel} from "./model/pack";

/**
 * Todo: 必要性 -> image.tsとの統合
 */
function makeDataUrl() {
  var result = new list<string>();
  var blockList = packModel.blocks.getAll();
  Object.keys(blockList).forEach(i => {
    result.push(i, image(packManager.getPackPath(d.defaultPackName) + packModel.blocks.get(i).data.filename, true, new Vector2(d.defaultGridSize, d.defaultGridSize)).src);
  });
  var objList = packModel.objs.getAll();
  Object.keys(objList).forEach(i => {
    var item = packModel.objs.get(i).data;
    result.push(i, image(packManager.getPackPath(d.defaultPackName) + item.filename, true, new Vector2(item.width, item.height)).src);
  });
  return result;
}
export = makeDataUrl;