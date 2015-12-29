import list = require("./classes/list");
import packManager = require("./packUtil/packManager");
import TrayBlockDetails = require("./classes/trayBlockDetails");

class data {
  static trayItemDataURLs:list<string>;
  static defaultPackName:string;
  static pack:packManager.packModule;
  static defaultGridSize:number;
  static defaultBlockSize:number;
  static selectBlock:TrayBlockDetails;
  static activeToolName:string;
  static selectImage:HTMLImageElement;
  static isObjMode:boolean;
  static isFullscreenTray:boolean;
  static isShowInspector:boolean;
}
export = data;