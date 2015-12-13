/// <reference path="lib/classes.ts" />
/// <reference path="lib/canvas.ts" />
/// <reference path="ui.ts" />
/// <reference path="lib/util.ts" />
/// <reference path="planet.ts" />
/**
 * Planetのメイン処理を行います。
 * UIとは直接かかわりません。
 */
module main {
  function attachThisListeners() {
    ui.addPlaEventListener("clickCanvas", clickCanvasGrid);
  }
  function clickCanvasGrid(e:ui.clickCanvasEvent) {
    var prefab:planet.Prefab = {
      gridX: e.pos.x * 50,
      gridY: e.pos.y * 50,
      filename: "pack/halstar/images/mapicons/magma.png"
    }
    var detail = planet.getFromGrid(new p.Vector2(prefab.gridX, prefab.gridY));
    if (!detail.contains) {
      var id = Canvas.render(util.QuickImage(prefab.filename, new p.Vector2(50, 50)), {x: prefab.gridX, y: prefab.gridY, width: 50, height: 50});
      planet.add(id, prefab);
    } else {
      Canvas.clearByRect({x: prefab.gridX, y: prefab.gridY, width: 50, height: 50});
      planet.remove(detail.id)
    }
  }
  attachThisListeners();
}