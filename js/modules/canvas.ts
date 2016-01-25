/// <reference path="../definitely/canvasRenderingContext2D.d.ts" />
import initDOM = require("./initDOM");
import Rect = require("./classes/rect");

module canvas {
  var canvas:HTMLCanvasElement;
  var ctx:CanvasRenderingContext2D;
  export var canvasRect:Rect;
  initDOM(() => {
    canvas = <HTMLCanvasElement>document.getElementById("pla-canvas");
    canvasRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    resizeCanvas();
    if (canvas && canvas.getContext) {
      ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;
    }
  });
  window.addEventListener("resize", resizeCanvas);
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
  }
  /**
   * 指定された画像を描画します。
   * @param {HTMLImageElement} img - 描画する画像
   * @param {pRect} rect - 描画する部分(x, y, width, height)
   * @return {number} 画像を消すなどするときに、判別するID
   */
  export function render(img:HTMLImageElement, rect:Rect):void {
    ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
  }
  
  /**
   * 指定された四角形の範囲をclearRectします。
   */
  export function clearByRect(rect:Rect) {
    ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
  }
  
  /**
   * Canvas 全体をclearRectします。
   */
  export function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
export = canvas;