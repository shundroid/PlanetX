/// <reference path="classes.ts" />
/**
 * 簡潔に書くためのUtility
 */

module util {
  /**
   * 面倒くさい処理をせず、簡潔にHTMLImageElementインスタンスを生成します。
   */
  export function QuickImage(filename:string, size:p.Vector2):HTMLImageElement {
    var a = new Image(size.x, size.y)
    a.src = filename;
    return a;
  }
  /**
   * いっぺんにたくさんのlogを飛ばせるが、飛ばした元関数がわかりにくくなるのが欠点。
   */
  export function log(...logs:any[]) {
    logs.forEach(i => {
      console.log(i);
    });
  }
  export function clientPos2Grid(clientPos:p.Vector2):p.Vector2 {
    var blockSize = 50;
    var eX = clientPos.x - (clientPos.x % blockSize);
    var eY = clientPos.y - (clientPos.y % blockSize);
    var gridX = eX / blockSize;
    var gridY = eY / blockSize;
    return new p.Vector2(gridX, gridY);
  }
}