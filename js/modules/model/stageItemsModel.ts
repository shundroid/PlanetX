import prefab from "./../classes/prefab";
import list from "./../classes/list";

/**
 * ステージ上のすべてのPrefabのリスト
 */
var prefabList:{[key: number]: prefab};

/**
 * stageLayer別のIdを格納
 */
var prefabLayer:number[][];

/**
 * 内部でpushStageLayerを呼び出します
 */
export function push(id:number, p:prefab, stageLayer:number=0) {
  prefabList[id] =  p;
  pushStageLayer(stageLayer, id);
}
export function all() {
  return prefabList;
}
export function remove(id:number, stageLayer: number) {
  prefabLayer[stageLayer].splice(prefabLayer[stageLayer].indexOf(id), 1);
  delete prefabList[id];
}
export function clear() {
  prefabList = {};
}
export function get(id:number) {
  return prefabList[id];
}
/**
 * レイヤーごとにItemを取得
 */
export function getLayerItems(stageLayer:number) {
  var ids = getLayerIds(stageLayer);
  var result = new list<prefab>();
  ids.forEach(i => {
    result.push(i.toString(), get(i));
  });
  return result;
}
export function pushStageLayer(stageLayer: number, id: number) {
  if (typeof prefabLayer[stageLayer] === "undefined") {
    prefabLayer[stageLayer] = [];
  }
  prefabLayer[stageLayer].push(id);
}
export function getLayerIds(stageLayer: number) {
  if (typeof prefabLayer[stageLayer] === "undefined") {
    prefabLayer[stageLayer] = [];
  }
  return prefabLayer[stageLayer];
}
export function getAllLayer() {
  return prefabLayer;
}

export function init() {
  prefabList = {};
  prefabLayer = new Array<Array<number>>();
}