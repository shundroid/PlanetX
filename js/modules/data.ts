import list from "./classes/list";
import {packModule} from "./packUtil/packManager";
import TrayBlockDetails from "./classes/trayBlockDetails";
import {setActiveStageLayer} from "./model/editorModel";

/**
 * Planetの情報を保存します。
 */
class data {
  static trayItemDataURLs: list<string>;
  static defaultPackName: string;
  static defaultGridSize: number;
  static defaultBlockSize: number;
  static activeToolName: string;
  static isObjMode: boolean;
  static isFullscreenTray: boolean;
  static isShowInspector: boolean;
  static editingBlockId: number;

  /**
   * 全ての Data メンバーを、初期化します。
   */
  static dataInit() {
    this.trayItemDataURLs = new list<string>();
    this.defaultPackName = "oa";
    this.defaultGridSize = 25;
    this.defaultBlockSize = 50;
    this.activeToolName = "pencil";
    this.isObjMode = false;
    this.isFullscreenTray = false;
    this.isShowInspector = false;
    setActiveStageLayer(0);
  }
}
export { data };