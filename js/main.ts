/// <reference path="lib/classes.ts" />
/// <reference path="lib/canvas.ts" />
/// <reference path="ui.ts" />
/// <reference path="lib/util.ts" />
/// <reference path="planet.ts" />
/// <reference path="definitely/es6-promise.d.ts" />
/**
 * Planetのメイン処理を行います。
 * UIとは直接かかわりません。
 */
module main {
  function attachListeners() {
    ev.addPlaEventListener("initDom", init);
    ev.addPlaEventListener("gridCanvas", gridCanvas);
    ev.addPlaEventListener("ready", ready);
    ev.addPlaEventListener("packLoaded", initTray)
  }
  function init() {
    packName = "halstar";
    ui.setupCanvas();
    loadPack(packName).then((obj) => {
      packModule = new pack.pPackModule(obj);
      ev.raiseEvent("packloaded", null);
      ui.initTray();
    });
    ev.addPlaEventListener("initedTray", () => {
      updateSelectedBlock("w1/block2", "pack/halstar/images/mapicons/w1block2-2.png", "W1草付ブロック");
      ev.raiseEvent("ready", null);
    });
  }
  function loadPack(packname:string) {
    return new Promise(resolve => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "pack/" + packname + "/packinfo.json");
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        }
      };
      xhr.send(null);
    });
  }
  function ready() {
    ui.hideLoading();
  }
  function initTray() {
    ui.initTray();
    ev.raiseEvent("initedTray", null);
  }
  function gridCanvas(e:p.Vector2) {
    var prefab:planet.Prefab = {
      gridX: e.x * 50,
      gridY: e.y * 50,
      filename: selectedBlock.fileName
    }
    var detail = planet.getFromGrid(new p.Vector2(prefab.gridX, prefab.gridY));
    if (!detail.contains) {
      var id = Canvas.render(util.QuickImage(prefab.filename, new p.Vector2(50, 50)), {x: prefab.gridX, y: prefab.gridY, width: 50, height: 50});
      planet.add(id, prefab);
    } else {
      Canvas.clearByRect({x: prefab.gridX, y: prefab.gridY, width: 50, height: 50});
      planet.remove(detail.id);
    }
  }
  export var packModule: pack.pPackModule;
  export var packName: string;
  export function updateSelectedBlock(blockName, fileName, showName) {
    selectedBlock = { blockName: blockName, fileName: fileName, showBlockName: showName};
  }
  export interface TrayBlockDetails {
    blockName:string;
    fileName:string;
    // 表示するときのブロック名
    showBlockName:string;
  }
  export var selectedBlock:TrayBlockDetails;
  attachListeners();
}