import {getPackPath} from "./pack";
import {pack as packName} from "./editor-config";

var trayModule = {
  makeDataUrl: function (blocks, objs, grid) {
    let urls = {};
    let blockList = Object.keys(blocks);
    blockList.forEach(item => {
      urls[item] = image(getPackPath(packName, blocks[item].filename), true, { x: grid, y: grid }).src;
    });
    let objList = Object.keys(objs);
    objList.forEach(itemName => {
      let item = objs[itemName];
      urls[itemName] = image(getPackPath(packName, item.filename), true, { x: item.width, y: item.height });
    });
    return urls;
  },
  updateActiveBlock: function (blockName, fileName, label, width, height, grid) {
    let w = width || grid * 2;
    let h = height || grid * 2;
    return { blockName, fileName, label, w, h };
  }
};
function image(url, isNoJaggy, size) {
  let a = new Image();
  a.src = url;
  if (isNoJaggy) {
    let width = (a.width + size.x) / 2;
    let height = (a.height + size.y) / 2;
    let newC = document.createElement("canvas");
    newC.width = width;
    newC.height = height;
    let ctx = newC.getContext("2d");
    ctx.drawImage(a, 0, 0, width, height);
    return image(newC.toDataURL("image/png"));
  } else {
    return a;
  }
}

module.exports = trayModule;
