import TrayBlockDetails from "./../classes/trayBlockDetails";

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