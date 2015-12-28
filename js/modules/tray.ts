import d = require("./data");
import image = require("./image");

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
    console.log(d);
    var w = width || d.defaultBlockSize;
    var h = height || d.defaultBlockSize;
    d.selectBlock = new TrayBlockDetails(blockName, fileName, label, w, h);
    console.log(d.defaultBlockSize);
  }
  export function updateSelectImage() {
    //d.selectImage = 
  }
}
export = tray;