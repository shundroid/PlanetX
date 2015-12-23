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
  export function addEventListenerforQuery(query:string, event:string, listener:(ev:any)=>any) {
    var elems = document.querySelectorAll(query);
    for (var i = 0; i < elems.length; i++) {
      elems[i].addEventListener(event, listener);
    }
  }
  export function pack2SelectElem(pack:Object):string {
    var result = [];
    Object.keys(pack).forEach(i => {
      if (pack[i].constructor === {}.constructor) {
        result.push('<optgroup label="' + i + '">');
        result.push(pack2SelectElem(pack[i]));
        result.push('</optgroup>');
      } else {
        result.push('<option value="' + pack[i] + '">' + i + '</option>');
      }
    });
    return result.join("\n");
  }
}

interface NodeList {
  forEach(fn:(i:Node)=>void);
}
NodeList.prototype.forEach = function (fn:(i:Node)=>void) {
  Array.prototype.forEach.call(this, fn);
}

