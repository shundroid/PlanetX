import list = require("./classes/list");
import packManager = require("./packUtil/packManager");
import TrayBlockDetails = require("./classes/trayBlockDetails");

class data {
  private static datas:any = {};
  static get trayItemDataURLs() {
    return <list<string>>this.datas["trayItemDataURLs"];
  }
  static set trayItemDataURLs(val: list<string>) {
    this.datas["trayItemDataURLs"] = val;
  }
  static get defaultPackName() {
    return <string>this.datas["defaultPackName"];
  }
  static set defaultPackName(val: string) {
    this.datas["defaultPackName"] = val;
  }
  static get pack() {
    return <packManager.packModule>this.datas["pack"];
  }
  static set pack(val: packManager.packModule) {
    this.datas["pack"] = val;
  }
  static get defaultGridSize() {
    return <number>this.datas["defaultGridSize"];
  }
  static set defaultGridSize(val: number) {
    this.datas["defaultGridSize"] = val;
  }
  static get defaultBlockSize() {
    return <number>this.datas["defaultBlockSize"];
  }
  static set defaultBlockSize(val: number) {
    this.datas["pack"] = val;
  }
  static get selectBlock() {
    return <TrayBlockDetails>this.datas["selectBlock"];
  }
  static set selectBlock(val: TrayBlockDetails) {
    this.datas["pack"] = val;
  }
  static get activeToolName() {
    return <string>this.datas["activeToolName"];
  }
  static set activeToolName(val: string) {
    this.datas["pack"] = val;
  }
  static get selectImage() {
    return <HTMLImageElement>this.datas["selectImage"];
  }
  static set selectImage(val: HTMLImageElement) {
    this.datas["pack"] = val;
  }
  static get isObjMode() {
    return <boolean>this.datas["isObjMode"];
  }
  static set isObjMode(val: boolean) {
    this.datas["pack"] = val;
  }
  static get isFullscreenTray() {
    return <boolean>this.datas["isFullscreenTray"];
  }
  static set isFullscreenTray(val: boolean) {
    this.datas["pack"] = val;
  }
  static get isShowInspector() {
    return <boolean>this.datas["isShowInspector"];
  }
  static set isShowInspector(val: boolean) {
    this.datas["pack"] = val;
  }
}
export = data;