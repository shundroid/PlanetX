import * as stage from "./../stage";
import * as canvas from "./../canvas";
import * as stageItems from "./../model/stageItemsModel";
import {data as d} from "./../data";
import image from "./../image";
import rect from "./../classes/rect";

/**
 * ステージをstageLayerに基づき描画します。
 */
export default function renderStage(renderStageLayer: number = 0) {
  canvas.clear();
  var l = stageItems.getLayerItems(renderStageLayer).getAll();
  Object.keys(l).forEach(i => {
    var item = stageItems.get(parseInt(i));
    var x = stage.scrollX + stage.getMousePosFromCenterAndSize(stage.toMousePos(item.gridX), stage.toMousePos(item.gridW));
    var y = stage.scrollY + stage.getMousePosFromCenterAndSize(stage.toMousePos(item.gridY), stage.toMousePos(item.gridH));
    var width = stage.toMousePos(item.gridW);
    var height = stage.toMousePos(item.gridH);
    // 画面内に入っているか
    if (x + width >= 0 && x <= canvas.canvasRect.width &&
      y + height >= 0 && y <= canvas.canvasRect.height) {
      canvas.render(image(d.trayItemDataURLs.get(item.blockName)), new rect(x, y, width, height));
    }
  });
}
