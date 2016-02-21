import attribute = require("./attribute");
import list from "./../list";
class attrList extends list<attribute> {
  toSimple() {
    var list = this.getAll();
    var result:{[key: string]: string} = {};
    Object.keys(list).forEach(i => {
      result[this.get(i).label] = i;
    });
    return result;
  }
}
export = attrList;