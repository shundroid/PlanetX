import list from "./classes/list";
import {packModule} from "./packUtil/packManager";
import TrayBlockDetails from "./classes/trayBlockDetails";
import {setActiveStageLayer} from "./model/editorModel";
import {setDefaultValues as setDefaultValuesForPreferences} from "./model/preferencesModel";

/**
 * Planetの情報を保存します。
 */
class data {
  
  static trayItemDataURLs: list<string>; // [ ] trayModel
  
  static activeToolName: string; // [x] trayModel
  static isObjMode: boolean; // [x] editorModel
  static isFullscreenTray: boolean; // [x] editorModel
  static isShowInspector: boolean; // [x] editorModel
  static editingBlockId: number; // [x] editorModel

  /**
   * 全ての Data メンバーを、初期化します。
   */
  static dataInit() {
    
    // インスタンスの初期化
    this.trayItemDataURLs = new list<string>();

    setDefaultValuesForPreferences();
    
    // デフォの値を指定する
    this.activeToolName = "pencil";
    this.isObjMode = false;
    this.isFullscreenTray = false;
    this.isShowInspector = false;
    setActiveStageLayer(0);
    
  }
}
export { data };