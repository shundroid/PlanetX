import list = require("./list");
import packManager = require("./packUtil/packManager");
import tray = require("./tray");
import grid = require("./grid");

class data {
  static trayItemDataURLs:list<string>;
  static defaultPackName:string;
  static pack:packManager.packModule;
  static defaultGridSize:number;
  static defaultBlockSize:number;
  static selectBlock:tray.TrayBlockDetails;
  static activeToolName:string;
  static selectImage:HTMLImageElement;
  /**
   * alias (grid.scrollX)
   */
  static get scrollX() {
    return grid.scrollX;
  } 
  /**
   * alias (grid.scrollY)
   */
  static get scrollY() {
    return grid.scrollY;
  }
  /**
   * alias (tray.updateSelectImage)
   */
  static updateSelectImage() {
    tray.updateSelectImage();
  }
}
export = data;