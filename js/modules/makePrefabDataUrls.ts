import {data as d} from "./data";
import list from "./classes/list";
import {packManager} from "./packUtil/packManager";
import Vector2 from "./classes/vector2";
import image = require("./image");

/**
 * Todo: 必要性 -> image.tsとの統合
 */
function makeDataUrl() {
  var result = new list<string>();
  var blockList = d.pack.blocks.getAll();
  Object.keys(blockList).forEach(i => {
    result.push(i, image(packManager.getPackPath(d.defaultPackName) + d.pack.blocks.get(i).data.filename, true, new Vector2(d.defaultGridSize, d.defaultGridSize)).src);
  });
  var objList = d.pack.objs.getAll();
  Object.keys(objList).forEach(i => {
    var item = d.pack.objs.get(i).data;
    result.push(i, image(packManager.getPackPath(d.defaultPackName) + item.filename, true, new Vector2(item.width, item.height)).src);
  });
  return result;
}
export = makeDataUrl;