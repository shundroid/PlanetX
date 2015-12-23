///<reference path="classes.ts" />
/**
 * Canvasへの描画 ユーティリティーです。
 * Canvas.ts (Planet)
 * (c) 2015-2016 shundroid. all rights reserved.
 */
module Canvas {
  var canvas:HTMLCanvasElement;
  var ctx:CanvasRenderingContext2D;
  export var canvasRect:pRect;
  document.addEventListener("DOMContentLoaded", () => {
    // pImageList = new p.List<pRect>();
    canvas = <HTMLCanvasElement>document.getElementById("pla-canvas");
    canvasRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    resizeCanvas();
    if (canvas && canvas.getContext) {
      ctx = canvas.getContext("2d");
    }
  });
  window.addEventListener("resize", resizeCanvas);
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
  }
  // var pImageList:p.List<pRect>;
  /**
   * 指定された画像を描画します。
   * @param {HTMLImageElement} img - 描画する画像
   * @param {pRect} rect - 描画する部分(x, y, width, height)
   * @return {number} 画像を消すなどするときに、判別するID
   */
  export function render(img:HTMLImageElement, rect:pRect):void {
    ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
  }
  // export function clear(index:number) {
  //   var rect = pImageList.get(index.toString());
  //   var rect:pRect = p
  //   ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
  //   // pImageList.remove(index.toString());
  // }
  export function clearByRect(rect:pRect) {
    ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
  }
  
  export function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  export interface pRect {
    x:number;
    y:number;
    width:number;
    height:number;
  }
}