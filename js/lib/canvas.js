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
        resizeCanvas();
        if (canvas && canvas.getContext) {
            ctx = canvas.getContext("2d");
        }
    });
    window.addEventListener("resize", resizeCanvas);
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    // var pImageList:p.List<pRect>;
    var pImgLstCtrlr = (function () {
        function pImgLstCtrlr() {
        }
        pImgLstCtrlr.getIndex = function () {
            var result = this.maxIndex;
            this.maxIndex++;
            return result;
        };
        pImgLstCtrlr.maxIndex = 0;
        return pImgLstCtrlr;
    })();
    Canvas.pImgLstCtrlr = pImgLstCtrlr;
    /**
     * 指定された画像を描画します。
     * @param {HTMLImageElement} img - 描画する画像
     * @param {pRect} rect - 描画する部分(x, y, width, height)
     * @return {number} 画像を消すなどするとき \に、判別するID
     */
    function render(img, rect) {
        ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
        var index = pImgLstCtrlr.getIndex();
        // pImageList.push(index.toString(), rect);
        return index;
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
})(Canvas || (Canvas = {}));
