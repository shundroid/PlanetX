/**
 * アプリで使用するPack(=ブロックなどのデータ)の名前を取得します。
 */
export var currentPackName: string;
export function setCurrentPackName(packName: string) {
  currentPackName = packName;
}

/**
 * 何ピクセルで座標1つ分かを取得します。
 */
export var defaultGridSize: number;
export function setDefaultGridSize(gridSize: number) {
  defaultGridSize = gridSize;
}

/**
 * 何ピクセルで 1x1のブロックの幅になるかを取得します。  
 * Todo: 必要性。`defaultGridSize * 2` でよくない？
 */
export var defaultBlockSize: number;
export function setDefaultBlockSize(blockSize: number) {
  defaultBlockSize = blockSize;
}

/**
  * PreferencesModelのフィールドに、デフォルトの値を設定します。
 */
export function setDefaultValues() {
  // ココらへんの値、jsonからとりたい。
  currentPackName = "oa";
  defaultGridSize = 25;
  defaultBlockSize = 50;
}