import image = require("./image");
import TrayBlockDetails = require("./classes/trayBlockDetails");
import d = require("./data");
import uiWaitMode = require("./uiWaitMode");

module tray {
  export function updateActiveBlock(blockName:string, fileName:string, label:string, width?:number, height?:number) {
    console.log(d);
    var w = width || d.defaultBlockSize;
    var h = height || d.defaultBlockSize;
    d.selectBlock = new TrayBlockDetails(blockName, fileName, label, w, h);
    console.log(d.defaultBlockSize);
  }
  export function updateSelectImage() {
    d.selectImage = image(d.trayItemDataURLs.get(d.selectBlock.blockName));
    uiWaitMode.start();
    d.selectImage.onload = () => {
      uiWaitMode.end();
    }
  }
}
export = tray;