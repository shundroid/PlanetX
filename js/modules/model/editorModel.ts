/**
 * ページ内でアクティブになっている StageLayer を取得します。
 */
export var activeStageLayerInEditor: number;

/**
 * (#43) Controllerにしたい  
 * でも、export var が readonlyになっちゃうんだよねー。  
 * だから、ModelとControllerを共存させてしまっている
 */
export function setActiveStageLayer(layerIndex: number) {
  activeStageLayerInEditor = layerIndex;
}

/**
 * Trayが全画面で表示されているかを取得します。
 */
export var isTrayFullscreen: boolean;
export function setIsTrayFullscreen(isFullscreen: boolean) {
  isTrayFullscreen = isFullscreen;
}

/**
 * Inspectorが表示されているかを取得します。
 */
export var isVisibleInspector: boolean;
export function setIsVisibleInspector(isVisible: boolean) {
  isVisibleInspector = isVisible;
}

/**
 * 編集中のブロックのIdを取得します。
 */
export var editingBlockIdByInspector: number;
export function setEditingBlockId(blockId: number) {
  editingBlockIdByInspector = blockId;
}