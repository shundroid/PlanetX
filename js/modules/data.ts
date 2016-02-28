import list from "./classes/list";
import {packModule} from "./packUtil/packManager";
import TrayBlockDetails from "./classes/trayBlockDetails";
import {setActiveStageLayer} from "./model/editorModel";

/**
 * Planetの情報を保存します。
 */
class data {
  
  static trayItemDataURLs: list<string>; // [ ] trayModel
  
  // ココらへんはエディタの環境設定になる
  static defaultPackName: string; // [ ] preferencesModel
  static defaultGridSize: number; // [ ] preferencesModel
  static defaultBlockSize: number; // [ ] preferencesModel
  static setPreferences() {
    this.defaultPackName = "oa";
    this.defaultGridSize = 25;
    this.defaultBlockSize = 50;
  }
  
  static activeToolName: string; // [ ] trayModel
  static isObjMode: boolean; // [ ] trayModel
  static isFullscreenTray: boolean; // [x] editorModel
  static isShowInspector: boolean; // [x] editorModel
  static editingBlockId: number; // [x] editorModel

  /**
   * 全ての Data メンバーを、初期化します。
   */
  static dataInit() {
    
    // インスタンスの初期化
    this.trayItemDataURLs = new list<string>();

    this.setPreferences();
    
    // デフォの値を指定する
    this.activeToolName = "pencil";
    this.isObjMode = false;
    this.isFullscreenTray = false;
    this.isShowInspector = false;
    setActiveStageLayer(0);
    
  }
}
export { data };