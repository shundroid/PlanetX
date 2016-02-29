import {data as d} from "./data";
import list from "./classes/list";
import {getPackPath} from "./packUtil/packManager";
import Vector2 from "./classes/vector2";
import image from "./image";
import {pack} from "./model/packModel";
import {currentPackName, defaultGridSize} from "./model/preferencesModel";

/**
 * Todo: 必要性 -> image.tsとの統合
 */
export default function makeDataUrl() {
  var result = new list<string>();
  var blockList = pack.blocks.getAll();
  Object.keys(blockList).forEach(i => {
    result.push(i, image(getPackPath(currentPackName) + pack.blocks.get(i).data.filename, true, new Vector2(defaultGridSize, defaultGridSize)).src);
  });
  var objList = pack.objs.getAll();
  Object.keys(objList).forEach(i => {
    var item = pack.objs.get(i).data;
    result.push(i, image(getPackPath(currentPackName) + item.filename, true, new Vector2(item.width, item.height)).src);
  });
  return result;
}
