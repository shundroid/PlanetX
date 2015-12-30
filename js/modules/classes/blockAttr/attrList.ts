import attribute = require("./attribute");
import list = require("./../list");
import oI = require("./../../objIndex");
class attrList extends list<attribute> {
  toSimple() {
    var list = this.getAll();
    var result:oI = {};
    Object.keys(list).forEach(i => {
      result[this.get(i).label] = i;
    });
    return result;
  }
}
export = attrList;