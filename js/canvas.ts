///<reference path="classes.ts" />
/**
 * Canvas.ts (Planet)
 * (c) 2015-2016 shundroid. all rights reserved.
 */
module Canvas {
  var canvas:HTMLCanvasElement;
  var ctx:CanvasRenderingContext2D;
  document.addEventListener("DOMContentLoaded", () => {
    pImageList = new p.List<pRect>();
    canvas = <HTMLCanvasElement>document.getElementById("pla-canvas");
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
  var pImageList:p.List<pRect>;
  export class pImgLstCtrlr {
    private static maxIndex = 0;
    static getIndex():number {
      var result = this.maxIndex;
      this.maxIndex++;
      return result;
    }
  }
  export function render(img:HTMLImageElement, rect:pRect):number {
    ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    var index = pImgLstCtrlr.getIndex();
    pImageList.push(index.toString(), rect);
    return index;
  }
  export function clear(index:number) {
    var rect = pImageList.get(index.toString());
    ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
    pImageList.remove(index.toString());
  }
  export interface pRect {
    x:number;
    y:number;
    width:number;
    height:number;
  }
}