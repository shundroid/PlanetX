import TrayBlockDetails from "./../classes/trayBlockDetails";
import image from "./../image";
import d = require("./../data");

/**
 * Trayで選択中のブロック
 */
export var activeBlock:TrayBlockDetails;
export function setActiveBlock(trayBlockDetails:TrayBlockDetails) {
  activeBlock = trayBlockDetails;
  activeImage = image(d.trayItemDataURLs.get(activeBlock.blockName));
}

/**
 * Trayで選択中のブロックの画像
 */
export var activeImage:HTMLImageElement;
export function setActiveImage(imageElem:HTMLImageElement) {
  activeImage = imageElem;
}
