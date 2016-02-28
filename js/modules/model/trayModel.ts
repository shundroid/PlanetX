import TrayBlockDetails from "./../classes/trayBlockDetails";

/**
 * Tray で選択されているブロックの情報を取得します。
 */
export var activeBlock: TrayBlockDetails;
export function setActiveBlock(trayBlockDetails: TrayBlockDetails) {
  activeBlock = trayBlockDetails;
}

/**
 * Todo:  
 * - TrayBlockDetails クラスの中に、HTMLImageElement型のフィールドを定義し、そこに移行する
 */
export var activeBlockImage: HTMLImageElement;
export function setActiveBlockImage(image: HTMLImageElement) {
  activeBlockImage = image;
}

/**
 * Todo: Enumで定義したい！  
 * Trayでアクティブになっているツールの名前を取得します。
 */
export var activeToolName: string;
export function setActiveToolName(toolName: string) {
  
}

/**
 * Tray にあるブロックの、Base64Urlを取得します。
 */
export var trayBlockDataUrls: {[index: string]: string};
export function setTrayBlockDataUrls(dataUrls: {[index: string]: string}) {
  
}

/**
 * TrayModelのフィールドに、デフォルトの値を設定します。
 */
export function setDefaultValues() {
  activeToolName = "pencil";
  trayBlockDataUrls = {};
}