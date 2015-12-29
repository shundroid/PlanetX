import image = require("./image");
import TrayBlockDetails = require("./classes/trayBlockDetails");
import d = require("./data");
module tray {
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