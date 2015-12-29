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
  export function updateActiveBlock(blockName:string, fileName:string, label:string, width:number, height:number) {
    return new TrayBlockDetails(blockName, fileName, label, width, height);
  }
  export function updateSelectImage() {
    //d.selectImage = 
  }
}
export = tray;