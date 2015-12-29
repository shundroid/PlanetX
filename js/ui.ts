/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="definitely/move.d.ts" />
import d = require("./modules/data");
import initDOM = require("./modules/initDOM");
import event = require("./modules/event");
import oI = require("./modules/objIndex");
import el = require("./modules/elem");
import compiler = require("./modules/compiler");
import importJS = require("./modules/importJS");
import u = require("./modules/util");
import list = require("./modules/classes/list");
import Vector2 = require("./modules/classes/vector2");
import tray = require("./modules/tray");
import packManager = require("./modules/packUtil/packManager");
import planet = require("./modules/planet");
import stage = require("./modules/stage");

module ui {
  export var canvas: HTMLCanvasElement; 
  function init() {
    window.addEventListener("resize", () => {
      event.raiseEvent("resize", null);
    });
    event.addEventListener("ui_clickTray", (e:MouseEvent) => {
      var target = <HTMLImageElement>e.target;
      d.isObjMode = target.parentElement.classList.contains("tray-list-obj");
      if (!d.isObjMode) {
        let item = d.pack.blocks.get(target.dataset["block"]).data;
        tray.updateActiveBlock(target.dataset["block"], item.filename, item.bName);
      } else {
        let item = d.pack.objs.get(target.dataset["block"]).data;
        tray.updateActiveBlock(target.dataset["block"], item.filename, item.oName);
      }
      changeActiveBlock(target.dataset["block"]);
    });
    event.addEventListener("ui_mousedownCanvas|ui_mousemoveanddownCanvas|ui_mouseupCanvas", (e:MouseEvent) => {
      var g = stage.getGridPosFromMousePos(new Vector2(e.clientX, e.clientY));
      event.raiseEvent("gridCanvas", new stage.gridDetail(g, e.type, new Vector2(e.clientX, e.clientY)));
    });
    event.addEventListener("initedPack", () => {
      (<HTMLSelectElement>document.getElementById("stg-skybox")).value = d.pack.editor.defaultSkybox;
      el.forEachforQuery(".pack-select", (i) => {
        var elem = <HTMLSelectElement>i;
        elem.innerHTML = u.obj2SelectElem((<list<any>>(<any>d.pack)[elem.dataset["items"]]).toSimple());
        if (elem.dataset["change"]) {
          elem.addEventListener("change", (<any>ui)[elem.dataset["change"]]);
        }
        if (elem.dataset["default"]) {
          elem.value = elem.dataset["default"];
        }
      });
    });
    // onBtnClickhandlerList = new Array<(target:Node,e:MouseEvent)=>void>();
  }
  // var onBtnClickhandlerList:Array<(target:Node,e:MouseEvent)=>void>;
  // export function onBtnClick(fn:(target:Node,e:MouseEvent)=>void) {
  //   onBtnClickhandlerList.push(fn);
  // }
  initDOM(() => {
    document.getElementById("tray-fullscreen").addEventListener("click", togglefullScreen);
    document.getElementById("ins-close").addEventListener("click", closeInspector);
    document.getElementById("io-export").addEventListener("click", clickExport);
    document.getElementById("io-import").addEventListener("click", clickImport);
    el.addEventListenerforQuery(".ins-show-btn", "click", clickInsShowBtn);
    el.addEventListenerforQuery(".io-hf", "change", changeHeaderorFooterValue);
    (<HTMLTextAreaElement>document.getElementById("conv-new")).value = "";
    (<HTMLTextAreaElement>document.getElementById("conv-old")).value = "";
    document.getElementById("conv").addEventListener("click", () => {
      (<HTMLTextAreaElement>document.getElementById("conv-new")).value = 
        compiler.convertOldFile((<HTMLTextAreaElement>document.getElementById("conv-old")).value);
    });
    (<HTMLTextAreaElement>document.getElementById("pla-io")).value = "";
    el.addEventListenerforQuery(".tray-list-tool", "click", clickTrayTool);
    
    document.head.appendChild(importJS("bower_components/move.js/move.js"));
    
    event.raiseEvent("initDom", null);
    // var elems = document.querySelectorAll(".ui-btn");
    // for (var i = 0; i < elems.length; i++) {
    //   (<Node>elems.item(i)).addEventListener("click", (e:MouseEvent) => {
    //     onBtnClickhandlerList.forEach(j => {
    //       j(elems.item(i), e);
    //     });
    //   });
    // }
  });
  
  export function setupCanvas() {
    canvas = <HTMLCanvasElement>document.getElementById("pla-canvas");
    canvas.addEventListener("mousedown", (e) => {
      event.raiseEvent("ui_mousedownCanvas", e);
    });
    canvas.addEventListener("mousemove", (e) => {
      if (e.buttons === 1) {
        event.raiseEvent("ui_mousemoveanddownCanvas", e);
      }
    });
    canvas.addEventListener("mouseup", (e) => {
      event.raiseEvent("ui_mouseupCanvas", e);
    });
  }
  export function togglefullScreen(e:MouseEvent) {
    if (!d.isFullscreenTray) {
      closeInspector();
      move(".pla-footer").set("height", "100%").duration("0.5s").end();
      (<HTMLElement>e.target).textContent = "↓";
    } else {
      move(".pla-footer").set("height", "50px").duration("0.5s").end();
      (<HTMLElement>e.target).textContent = "↑";
    }
    d.isFullscreenTray = !d.isFullscreenTray;
  }
  
  export function closeInspector() {
    if (!d.isShowInspector) return;
    d.isShowInspector = false;
    move(".pla-inspector")
      .set("left", "100%")
      .duration("0.5s")
      .end();
  }
  export function showInspector(inspectorName:string) {
    document.querySelector(".ins-article-active") && document.querySelector(".ins-article-active").classList.remove("ins-article-active");
    document.getElementById("ins-" + inspectorName).classList.add("ins-article-active");
    if (d.isShowInspector) return;
    d.isShowInspector = true;
    move(".pla-inspector")
      .set("left", "80%")
      .duration("0.5s")
      .end();
  }
  
  export function clickExport() {
    (<HTMLTextAreaElement>document.getElementById("pla-io")).value = planet.exportText();
  }
  export function clickImport() {
    var effects = planet.importText((<HTMLTextAreaElement>document.getElementById("pla-io")).value);
    stage.stageEffects = effects;
    console.log(effects.skybox);
    setSkybox(d.pack.skyboxes.get(effects.skybox).data.filename);
    stage.renderStage();
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
  
  export function clickTrayTool(e:MouseEvent) {
    var elem = <HTMLElement>e.target;
    if (elem.nodeName === "I") {
      elem = elem.parentElement;
    }
    if (elem.classList.contains("tool-btn")) {
      event.raiseEvent("clickTrayToolbtn", elem.dataset["toolname"]);
      return;
    }
    (<HTMLElement>document.getElementsByClassName("tool-active")[0]).classList.remove("tool-active");
    elem.classList.add("tool-active");
    d.activeToolName = elem.dataset["toolname"];
  }
  
  export function setSkybox(fileName:string) {
    document.body.style.backgroundImage = `url('${fileName}')`; 
  }
  
  export function initTrayBlock() {
    return new Promise((resolve) => {
      var blocks = d.pack.blocks.getAll();
      var ul = document.getElementsByClassName("tray-items")[0];
      var list = Object.keys(blocks);
      var async = (i: number) => {
        var item = list[i];
        var li = document.createElement("div");
        li.classList.add("tray-list", "tray-list-block");
        li.addEventListener("click", (e) => { event.raiseEvent("ui_clickTray", e); });
        var img = document.createElement("img");
        img.src = packManager.getPackPath(d.defaultPackName) + d.pack.blocks.get(item).data.filename;
        img.onload = () => {
          img.alt = d.pack.blocks.get(item).data.bName;
          img.dataset["block"] = item;
          li.appendChild(img);
          ul.appendChild(li);
          if (i === list.length - 1) {
            resolve();
          } else {
            changeLoadingStatus("loading tray : " + i.toString() + " / " + (list.length - 1).toString());
            async(i + 1);
          }
        };
      }
      async(0);
    });
  }
  export function initTrayObj() {
    return new Promise((resolve) => {
      var objs = d.pack.objs.getAll();
      var ul = document.getElementsByClassName("tray-items")[0];
      var list = Object.keys(objs);
      var async = (i: number) => {
        var item = list[i];
        var li = document.createElement("div");
        li.classList.add("tray-list", "tray-list-obj");
        li.addEventListener("click", (e) => { event.raiseEvent("ui_clickTray", e); });
        var img = document.createElement("img");
        img.src = packManager.getPackPath(d.defaultPackName) + d.pack.objs.get(item).data.filename;
        img.onload = () => {
          img.alt = d.pack.objs.get(item).data.oName;
          img.dataset["block"] = item;
          li.style.width = img.style.width =
            d.pack.objs.get(item).data.width / (d.pack.objs.get(item).data.height / 50) + "px";
          li.style.height = img.style.height = "50px";
          li.appendChild(img);
          ul.appendChild(li);
          if (i === list.length - 1) {
            //ev.raiseEvent("initedTray", null);
            resolve();
          } else {
            changeLoadingStatus("loading tray-obj : " + i.toString() + " / " + (list.length - 1).toString());
            async(i + 1);
          }
        }
      }
      async(0);
    });
  }
  
  export function changeLoadingStatus(status:string) {
    (<HTMLElement>document.getElementsByClassName("loading")[0]).innerHTML = "Loading...<br />" + status;
  }
  
  export function hideLoading() {
    var elem = <HTMLElement>document.getElementsByClassName("loading")[0];
    move(".loading")
      .set("opacity", 0)
      .duration("1s")
      .then()
      .set("display", "none")
      .pop()
      .end();
  }
  
  export function changeActiveBlock(blockName:string) {
    document.querySelector(".tray-active") && document.querySelector(".tray-active").classList.remove("tray-active");
    (<HTMLElement>document.querySelector(`[data-block="${blockName}"]`)).classList.add("tray-active");
  }
 
  event.addEventListener("clickTrayToolbtn", (name:string) => {
    var btnName2InspectorName:oI = {
      "io": "io",
      "setting": "inspector"
    };
    ui.showInspector(btnName2InspectorName[name]);
  });
  

  export function changeSkybox(e:Event) {
    stage.stageEffects.skybox = (<HTMLSelectElement>e.target).value;
    setSkybox(d.pack.skyboxes.get(stage.stageEffects.skybox).data.filename);
  }
  init();
}
export = ui;
