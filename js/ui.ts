/// <reference path="main.ts" />
/// <reference path="lib/util.ts" />
/**
 * UIへのアクセスをします。
 */
module ui {
  function init() {
    document.addEventListener("DOMContentLoaded", loadDOM);
    uiEvents = new p.List<((ev: p.plaEvent) => any)[]>();
  }
  export var canvas:HTMLCanvasElement;
  function loadDOM() {
    canvas = <HTMLCanvasElement>document.getElementById("pla-canvas");
    canvas.addEventListener("mousedown", clickCanvas);
    raiseEvent("init", p.plaEvent.empty());
  }
  /**
   * ui.ts以外のファイルは、このメソッドを通して、リスナーを使用します。
   */
  export function attachListenerUI(elem:HTMLElement, eventName:string, listener: (ev: UIEvent) => any) {
    elem.addEventListener(eventName, listener);
  }
  export function get(id:string):HTMLElement { return document.getElementById(id); }
  export function q(query:string):HTMLElement { return <HTMLElement>document.querySelector(query); }
  export function qAll(query:string):NodeListOf<Element> { return document.querySelectorAll(query); }
  
  var uiEvents:p.List<((ev: p.plaEvent) => any)[]>;
  export function addPlaEventListener(eventName:string, listener: (ev: p.plaEvent) => any) {
    if (uiEvents.contains(eventName)) {
      var a = uiEvents.get(eventName);
      a.push(listener);
      uiEvents.update(eventName, a);
    } else {
      uiEvents.push(eventName, [listener]);
    }
  }
  function raiseEvent(eventName:string, e:p.plaEvent) {
    if (uiEvents.contains(eventName)) {
      uiEvents.get(eventName).forEach(i => {
        // i.call(e); だとeがundefinedで渡されてしまう
        i(e);
      });
    }
  }
  export class clickCanvasEvent extends p.plaEvent {
    constructor(data:p.Vector2) {
      super();
      this.pos = data;
    }
    pos:p.Vector2;
  }
  function clickCanvas(e:MouseEvent) {
    var grid = util.clientPos2Grid(new p.Vector2(e.clientX, e.clientY));
    raiseEvent("clickCanvas", new clickCanvasEvent(grid);
  }
  init();
}