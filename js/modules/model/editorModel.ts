export var activeStageLayer:number;

/**
 * (#43) Controllerにしたい  
 * でも、export var が readonlyになっちゃうんだよねー。  
 * だから、ModelとControllerを共存させてしまっている
 */
export function setActiveStageLayer(layerIndex:number) {
  activeStageLayer = layerIndex;
}