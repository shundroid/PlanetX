import list from "./classes/list";
import {packModule} from "./packUtil/packManager";
import TrayBlockDetails from "./classes/trayBlockDetails";
import {setActiveStageLayer, setDefaultValues as setDefaultValuesForEditor} from "./model/editorModel";
import {setDefaultValues as setDefaultValuesForPreferences} from "./model/preferencesModel";
import {setDefaultValues as setDefaultValuesForTray} from "./model/trayModel";

/**
 * Planetの情報を保存します。
 */
class data {
  
  /**
   * 全ての Data メンバーを、初期化します。
   */
  static dataInit() {
    setDefaultValuesForPreferences();
    setDefaultValuesForEditor();
    setDefaultValuesForTray();
    setActiveStageLayer(0);
  }
}
export { data };