import d = require("./data");
import list = require("./list");
import packManager = require("./packUtil/packManager");
function makeDataUrl() {
  var result = new list<string>();
  var blockList = d.pack.blocks.getAll();
  Object.keys(blockList).forEach(i => {
    result.push(i, util.makeNoJaggyURL(packManager.getPackPath(d.defaultPackName) + d.pack.blocks.get(i).data.filename, new p.Vector2(d.defaultGridSize, d.defaultGridSize)));
  });
  var objList = d.pack.objs.getAll();
  Object.keys(objList).forEach(i => {
    var item = d.pack.objs.get(i).data;
    result.push(i, util.makeNoJaggyURL(packManager.getPackPath(d.defaultPackName) + item.filename, new p.Vector2(item.width, item.height)));
  });
  return result;
}
export = makeDataUrl;