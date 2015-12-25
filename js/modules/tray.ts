import d = require("./data");
module tray {
  export class TrayBlockDetails {
    constructor(
      public blockName:string,
      public fileName:string,
      public label:string, // 表示するときのブロック名
      public width:number,
      public height:number
    ) { }
  }
  export function updateActiveBlock(blockName:string, fileName:string, label:string, width?:number, height?:number) {
    if (!width) width = d.defaultBlockSize;
    if (!height) height = d.defaultBlockSize;
    d.selectBlock = new TrayBlockDetails(blockName, fileName, label, width, height);
  }
}
export = tray;