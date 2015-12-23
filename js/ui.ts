/// <reference path="main.ts" />
/// <reference path="planet.ts" />
/// <reference path="lib/util.ts" />
/// <reference path="definitely/web-anim.d.ts" />
/// <reference path="definitely/move.d.ts" />
/**
 * UIへのアクセスをします。
 */
module ui {
  function init() {
    document.addEventListener("DOMContentLoaded", loadDOM);
    window.addEventListener("resize", resize);
    ev.addPlaEventListener("ui_clickTray", clickTray);
    ev.addPlaEventListener("ui_mousedownCanvas|ui_mousemoveanddownCanvas|ui_mouseupCanvas", mouseCanvas);
  }

  export var canvas: HTMLCanvasElement;
  function loadDOM() {
    ev.raiseEvent("initDom", null);
    document.getElementById("tray-fullscreen").addEventListener("click", togglefullScreen);
    document.getElementById("ins-close").addEventListener("click", closeInspector);
    document.getElementById("io-export").addEventListener("click", clickExport);
    document.getElementById("io-import").addEventListener("click", clickImport);
    util.addEventListenerforQuery(".ins-show-btn", "click", clickInsShowBtn);
    util.addEventListenerforQuery(".io-hf", "change", changeHeaderorFooterValue);
    (<HTMLTextAreaElement>document.getElementById("conv-new")).value = "";
    (<HTMLTextAreaElement>document.getElementById("conv-old")).value = "";
    document.getElementById("conv").addEventListener("click", () => {
      (<HTMLTextAreaElement>document.getElementById("conv-new")).value =
        main.convertOldFile((<HTMLTextAreaElement>document.getElementById("conv-old")).value);
    });
    (<HTMLTextAreaElement>document.getElementById("pla-io")).value = "";
    var tools = document.getElementsByClassName("tray-list-tool");
    for (var i = 0; i < tools.length; i++) {
      tools.item(i).addEventListener("click", clickTrayTool);
    }
    var move_js = document.createElement("script");
    move_js.src = "bower_components/move.js/move.js";
    document.head.appendChild(move_js);
  }
  export function setupCanvas() {
    canvas = <HTMLCanvasElement>document.getElementById("pla-canvas");
    canvas.addEventListener("mousedown", (e) => {
      ev.raiseEvent("ui_mousedownCanvas", e);
    });
    canvas.addEventListener("mousemove", (e) => {
      if (e.buttons === 1) {
        ev.raiseEvent("ui_mousemoveanddownCanvas", e);
      }
    });
    canvas.addEventListener("mouseup", (e) => {
      ev.raiseEvent("ui_mouseupCanvas", e);
    })
  }

  export function hideLoading() {
    var elem = <HTMLElement>document.getElementsByClassName("loading")[0];
    move('.loading')
      .set('opacity', 0)
      .duration('1s')
      .then()
      .set("display", "none")
      .pop()
      .end();
  }
  /**
   * ui.ts以外のファイルは、このメソッドを通して、リスナーを使用します。
   */
  export function attachListenerUI(elem: HTMLElement, eventName: string, listener: (ev: UIEvent) => any) {
    elem.addEventListener(eventName, listener);
  }
  export function get(id: string): HTMLElement { return document.getElementById(id); }
  export function q(query: string): HTMLElement { return <HTMLElement>document.querySelector(query); }
  export function qAll(query: string): NodeListOf<Element> { return document.querySelectorAll(query); }

  function mouseCanvas(e: MouseEvent) {
    var grid = main.clientPos2Grid(new p.Vector2(e.clientX, e.clientY));
    ev.raiseEvent("gridCanvas", new main.gridDetail(grid, e.type, new p.Vector2(e.clientX, e.clientY)));
  }

  function clickTray(e: MouseEvent) {
    var target = <HTMLImageElement>e.target;
    main.isActiveObj = target.parentElement.classList.contains("tray-list-obj");
    if (!main.isActiveObj) {
      let item = main.packModule.blocks.get(target.dataset["block"]).data;
      main.updateSelectedBlock(target.dataset["block"], item.filename, item.bName);
    }
    else {
      let item = main.packModule.objs.get(target.dataset["block"]).data;
      main.updateSelectedBlockForObj(target.dataset["block"], item.filename, item.oName, item.width, item.height);
    }
    changeUIActiveBlock(target.dataset["block"]);
  }

  export function changeUIActiveBlock(blockName: string) {
    document.querySelector(".tray-active") && document.querySelector(".tray-active").classList.remove("tray-active");
    (<HTMLElement>document.querySelector("[data-block=\"" + blockName + "\"]")).classList.add("tray-active");
  }

  export function initTray() {
    return new Promise(resolve => {
      var blocks = main.packModule.blocks.getAll();
      var ul = document.getElementsByClassName("tray-items")[0];
      var list = Object.keys(blocks);
      var async = (i: number) => {
        var item = list[i];
        var li = document.createElement("div");
        li.classList.add("tray-list", "tray-list-block");
        li.addEventListener("click", (e) => { ev.raiseEvent("ui_clickTray", e); });
        var img = document.createElement("img");
        img.src = main.getPackPath(main.packName) + main.packModule.blocks.get(item).data.filename;
        img.onload = () => {
          img.alt = main.packModule.blocks.get(item).data.bName;
          img.dataset["block"] = item;
          li.appendChild(img);
          ul.appendChild(li);
          if (i === list.length - 1) {
            resolve();
          } else {
            loadingStatus("loading tray : " + i.toString() + " / " + (list.length - 1).toString());
            async(i + 1);
          }
        };
      }
      async(0);
    });
  }
  export function initObjforTray() {
    var objs = main.packModule.objs.getAll();
    var ul = document.getElementsByClassName("tray-items")[0];
    var list = Object.keys(objs);
    var async = (i: number) => {
      var item = list[i];
      var li = document.createElement("div");
      li.classList.add("tray-list", "tray-list-obj");
      li.addEventListener("click", (e) => { ev.raiseEvent("ui_clickTray", e); });
      var img = document.createElement("img");
      img.src = main.getPackPath(main.packName) + main.packModule.objs.get(item).data.filename;
      img.onload = () => {
        img.alt = main.packModule.objs.get(item).data.oName;
        img.dataset["block"] = item;
        li.style.width = img.style.width =
          main.packModule.objs.get(item).data.width / (main.packModule.objs.get(item).data.height / 50) + "px";
        li.style.height = img.style.height = "50px";
        li.appendChild(img);
        ul.appendChild(li);
        if (i === list.length - 1) {
          ev.raiseEvent("initedTray", null);
        } else {
          loadingStatus("loading tray-obj : " + i.toString() + " / " + (list.length - 1).toString());
          async(i + 1);
        }
      }
    }
    async(0);
  }
  export function loadingStatus(text) {
    (<HTMLElement>document.getElementsByClassName("loading")[0]).innerHTML = "Loading...<br />" + text;
  }
  export function startUIWaitMode() {
    document.getElementById("pla-canvas").style.cursor = "wait";
  }
  export function endUIWaitMode() {
    document.getElementById("pla-canvas").style.cursor = "crosshair";
  }
  export function togglefullScreen(e: MouseEvent) {
    if (!main.isFullscreen) {
      closeInspector();
      move(".pla-footer").set("height", "100%").duration("0.5s").end();
      (<HTMLElement>e.target).textContent = "↓";
    } else {
      move(".pla-footer").set("height", "50px").duration("0.5s").end();
      (<HTMLElement>e.target).textContent = "↑";
    }
    main.isFullscreen = !main.isFullscreen;
  }
  export function clickTrayTool(e: MouseEvent) {
    var elem = <HTMLElement>e.target;
    if (elem.nodeName === "I") {
      elem = elem.parentElement;
    }
    if (elem.classList.contains("tool-btn")) {
      ev.raiseEvent("clickTrayToolbtn", elem.dataset["toolname"]);
      return;
    }
    (<HTMLElement>document.getElementsByClassName("tool-active")[0]).classList.remove("tool-active");
    elem.classList.add("tool-active");
    main.activeToolName = elem.dataset["toolname"];
  }

  function resize() {
    ev.raiseEvent("resize", null);
  }

  export function showInspector(mode) {
    document.querySelector(".ins-article-active") && document.querySelector(".ins-article-active").classList.remove("ins-article-active");
    document.getElementById("ins-" + mode).classList.add("ins-article-active");
    if (main.isShowInspector) return;
    main.isShowInspector = true;
    move(".pla-inspector")
      .set("left", "80%")
      .duration("0.5s")
      .end();
  }
  export function closeInspector() {
    if (!main.isShowInspector) return;
    main.isShowInspector = false;
    move(".pla-inspector")
      .set("left", "100%")
      .duration("0.5s")
      .end();
  }
  export function clickExport() {
    (<HTMLTextAreaElement>document.getElementById("pla-io")).value = planet.exportText();
  }
  export function clickImport() {
    planet.importText((<HTMLTextAreaElement>document.getElementById("pla-io")).value);
    main.renderByPlanet();
  }
  export function clickInsShowBtn(e:MouseEvent) {
    showInspector((<HTMLElement>e.target).dataset["ins"]);
  }
  export function changeHeaderorFooterValue(e:MouseEvent) {
    var elem = <HTMLTextAreaElement>e.target;
    if (elem.id === "io-header") {
      planet.header = elem.value;
    } else if (elem.id === "io-footer") {
      planet.footer = elem.value;
    }
  }
  init();
}