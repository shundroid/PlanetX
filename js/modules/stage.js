import * as config from "./editor-config";
import {ui as tempUI} from "./temp-datas";

var stage = {};
stage.skyboxes = [];
stage.getGridPosFromMousePos = function (mousePos) {
  // absolute ・・ scroll の値を引いた、stage の絶対的な座標
  var absoluteX = mousePos.x - tempUI.scrollX;
  var absoluteY = mousePos.y - tempUI.scrollY;
  var cleanX = absoluteX - (absoluteX % config.grid);
  var cleanY = absoluteY - (absoluteY % config.grid);
  return { x: cleanX / config.grid, y: cleanY / config.grid };
};
stage.toGridDistance = function (displayDistance) {
  return displayDistance / config.grid;
};
stage.getPrefabFromActiveBlock = function (activeBlock, gridX, gridY) {
  return { x: gridX, y: gridY, fileName: activeBlock.fileName, blockName: activeBlock.blockName, width: stage.toGridDistance(activeBlock.width), height: stage.toGridDistance(activeBlock.height) };
};
stage.getGridDetails = function(gridPos) {
  
};
module.exports = stage;