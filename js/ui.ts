/// <reference path="main.ts" />
/// <reference path="lib/util.ts" />
/// <reference path="definitely/web-anim.d.ts" />
/**
 * UIへのアクセスをします。
 */
module ui {
  function init() {
    document.addEventListener("DOMContentLoaded", loadDOM);
    ev.addPlaEventListener("ui_clickTray", clickTray);
    ev.addPlaEventListener("ui_mousedownCanvas", clickCanvas);
  }

  export var canvas:HTMLCanvasElement;
  function loadDOM() {
    ev.raiseEvent("initDom", null);
  }
  export function setupCanvas() {
    canvas = <HTMLCanvasElement>document.getElementById("pla-canvas");
    canvas.addEventListener("mousedown", (e) => {
      ev.raiseEvent("ui_mousedownCanvas", e);
    });
  }
  
  export function hideLoading() {
    var elem = <HTMLElement>document.getElementsByClassName("loading")[0];
    elem.style.opacity = "0";
    elem.animate([
      { opacity: 1},
      { opacity: 0 }
    ], {
      direction: 'alternate',
      duration: 500
    });
    setTimeout(function() {
      elem.style.display = "none";
    }, 550);
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
  
  function clickCanvas(e:MouseEvent) {
    var grid = util.clientPos2Grid(new p.Vector2(e.clientX, e.clientY));
    ev.raiseEvent("gridCanvas", grid);
  }
  
  function clickTray(e:MouseEvent) {
    var target = <HTMLImageElement>e.target;
    main.updateSelectedBlock(target.dataset["block"], target.src, target.alt);
    document.querySelector(".tray-active") && document.querySelector(".tray-active").classList.remove("tray-active");
    (<HTMLElement>e.target).classList.add("tray-active");
  }

  export function initTray() {
    var blocks = main.packModule.blocks.getAll();
    var ul = document.getElementsByClassName("tray-ul")[0];
    var list = Object.keys(blocks);
    var index = 0;
    var async = (i:number) => {
      return new Promise(() => {
        var item = list[i];
        var li = document.createElement("li");
        li.className = "tray-list";
        li.addEventListener("click", (e) => { ev.raiseEvent("ui_clickTray", e); });
        var img = document.createElement("img");
        img.src = "pack/" + main.packName + "/" + main.packModule.blocks.get(item).data.filename;
        img.onload = () => {
          img.alt = main.packModule.blocks.get(item).data.bName;
          img.dataset["block"] = item;
          li.appendChild(img);
          ul.appendChild(li);
          if (i === list.length - 1) {
            ev.raiseEvent("initedTray", null);
          } else {
            loadingStatus("loading tray : " + i.toString() + " / " + (list.length - 1).toString()):
            async(i + 1);
          }
        };
      });
    }
    async(0);
  }
  export function loadingStatus(text) {
    (<HTMLElement>document.getElementsByClassName("loading")[0]).innerHTML = "Loading...<br />" + text;
  }
  init();
}