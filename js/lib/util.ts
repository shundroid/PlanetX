/// <reference path="classes.ts" />
/**
 * 簡潔に書くためのUtility
 */

module util {
  /**
   * 面倒くさい処理をせず、簡潔にHTMLImageElementインスタンスを生成します。
   */
  export function QuickImage(filename:string):HTMLImageElement {
    var a = new Image()
    a.src = filename;
    return a;
  }
  export function makeNoJaggyURL(filename:string, size:p.Vector2) {
    var a = new Image();
    a.src = filename;
    var width = (a.width + size.x) / 2;
    var height = (a.height + size.y) / 2;
    var newC:HTMLCanvasElement, ctx:CanvasRenderingContext2D;
    var saveURL:string;
    newC = document.createElement("canvas");
    newC.width = width;
    newC.height = height;
    ctx = newC.getContext("2d");
    ctx.drawImage(a, 0, 0, width, height);
    return newC.toDataURL("image/png");
  }
  /**
   * いっぺんにたくさんのlogを飛ばせるが、飛ばした元関数がわかりにくくなるのが欠点。
   */
  export function log(...logs:any[]) {
    logs.forEach(i => {
      console.log(i);
    });
  }
}