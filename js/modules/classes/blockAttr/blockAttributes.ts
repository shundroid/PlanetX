import attribute = require("./attribute");
class blockAttributes {
  constructor(
    public blockId:number,
    public attr:attribute,
    public attrValue:string // 結局はstringになる。
  ) { }
}
export = blockAttributes;