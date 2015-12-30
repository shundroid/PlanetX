import attribute = require("./attribute");
class blockAttributes<attrValueType> {
  constructor(
    public blockId:number,
    public attr:attribute,
    public attrValue:attrValueType
  ) { }
}
export = blockAttributes;