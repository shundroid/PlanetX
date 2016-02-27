import list from "./classes/list";
import packManager = require("./packUtil/packManager");
import TrayBlockDetails from "./classes/trayBlockDetails";

/**
 * Planetの情報を保存します。
 */
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
  static editingBlockId:number;
  static activeStageLayer:number;
  
  /**
   * 全ての Data メンバーを、初期化します。
   */
  static dataInit() {
    this.trayItemDataURLs = new list<string>();
    this.defaultPackName = "oa";
    //this.pack = new packManager.packModule({});
    this.defaultGridSize = 25;
    this.defaultBlockSize = 50;
    this.activeToolName = "pencil";
    this.isObjMode = false;
    this.isFullscreenTray = false;
    this.isShowInspector = false;
    this.activeStageLayer = 0;
  }
}
export { data };