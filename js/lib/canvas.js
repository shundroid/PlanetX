///<reference path="classes.ts" />
/**
 * Canvasへの描画 ユーティリティーです。
 * Canvas.ts (Planet)
 * (c) 2015-2016 shundroid. all rights reserved.
 */
var Canvas;
(function (Canvas) {
    var canvas;
    var ctx;
    document.addEventListener("DOMContentLoaded", function () {
        // pImageList = new p.List<pRect>();
        canvas = document.getElementById("pla-canvas");
        Canvas.canvasRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
        resizeCanvas();
        if (canvas && canvas.getContext) {
            ctx = canvas.getContext("2d");
        }
    });
    window.addEventListener("resize", resizeCanvas);
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        Canvas.canvasRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    }
    // var pImageList:p.List<pRect>;
    /**
     * 指定された画像を描画します。
     * @param {HTMLImageElement} img - 描画する画像
     * @param {pRect} rect - 描画する部分(x, y, width, height)
     * @return {number} 画像を消すなどするときに、判別するID
     */
    function render(img, rect) {
        ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    }
    Canvas.render = render;
    // export function clear(index:number) {
    //   var rect = pImageList.get(index.toString());
    //   var rect:pRect = p
    //   ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
    //   // pImageList.remove(index.toString());
    // }
    function clearByRect(rect) {
        ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
    }
    Canvas.clearByRect = clearByRect;
    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    Canvas.clear = clear;
})(Canvas || (Canvas = {}));
