// Todo: このクラスを分離
export class Attr {
  constructor(
    public attrName: string = "",
    public attrVal: string = ""
  ) { }
}

// Attrをブロックごとに管理
var blockAttrsList:{[key: number]: {[key: number]: Attr}};

export function setAll(lst:{[key: string]: {[key: number]: Attr}}) {
  blockAttrsList = lst;
}
export function push(blockId: number, attrId: number, value:Attr) {
  if (typeof blockAttrsList[blockId] === "undefined") {
    blockAttrsList[blockId] = {};
  }
  blockAttrsList[blockId][attrId] = value;
}

export function update(blockId: number, attrId: number, attr:{[key: string]: string}): void;
export function update(blockId: number, attrId: number, attr:Attr): void;

export function update(blockId: number, attrId: number, attr:any): void {
  if (attr instanceof Attr) {
    // attrNameをAttrで指定するとき
    blockAttrsList[blockId][attrId] = <Attr>attr;
  } else {
    // attrName、attrValで指定するとき
    var cur = blockAttrsList[blockId][attrId];
    if (typeof attr["attrName"] !== "undefined") {
      cur.attrName = attr["attrName"];
    }
    if (typeof attr["attrVal"] !== "undefined") {
      cur.attrVal = attr["attrVal"];
    }
    blockAttrsList[blockId][attrId] = cur;
  }
}

export function containsAttr(blockId: number, attrId: number) {
  // blockIdがundefinedのときは、エラーが出ないよう、falseを返しておく。
  if (typeof blockAttrsList[blockId] === "undefined") {
    return false;
  } else {
    return typeof blockAttrsList[blockId][attrId] !== "undefined";
  }
}
export function containsBlock(blockId: number) {
  return typeof blockAttrsList[blockId] !== "undefined";
}
export function removeAttr(blockId: number, attrId: number) {
  delete blockAttrsList[blockId][attrId];
}
export function removeBlock(blockId: number) {
  delete blockAttrsList[blockId];
}
export function getBlock(blockId: number) {
  return blockAttrsList[blockId];
}
export function getAttr(blockId: number, attrId: number) {
  return blockAttrsList[blockId][attrId];
}
export function getAll() {
  return blockAttrsList;
}
export function clear() {
  blockAttrsList = {};
}

// attrId関係
export function getMaxAttrId(blockId: number) {
  if (typeof blockAttrsList[blockId] === "undefined") {
    return 0;
  } else {
    return Object.keys(blockAttrsList[blockId]).length;
  }
}

export function init() {
  blockAttrsList = {};
}