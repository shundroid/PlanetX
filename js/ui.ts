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
import v = require("./modules/version");
import evElems = require("./modules/evElems");
import anim = require("./modules/ui/anim");
import editBlock = require("./modules/editBlock");

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
        tray.updateActiveBlock(target.dataset["block"], item.filename, item.oName, item.width, item.height);
      }
      changeActiveBlock(target.dataset["block"]);
    });
    event.addEventListener("ui_mousedownCanvas|ui_mousemoveanddownCanvas|ui_mouseupCanvas", (e:MouseEvent) => {
      var g = stage.getGridPosFromMousePos(new Vector2(e.clientX, e.clientY));
      event.raiseEvent("gridCanvas", new stage.gridDetail(g, e.type, new Vector2(e.clientX, e.clientY)));
    });
    event.addEventListener("initedPack", () => {
      // SkyboxMode
      if (typeof d.pack.editor.skyboxMode !== "undefined") {
        if (d.pack.editor.skyboxMode === "repeat") {
          document.body.style.backgroundRepeat = "repeat";
          if (typeof d.pack.editor.skyboxSize !== "undefined") {
            document.body.style.backgroundSize = d.pack.editor.skyboxSize; 
          } else {
            document.body.style.backgroundSize = "auto";
          }
        }
      }
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
      (<HTMLSelectElement>document.getElementById("stg-skybox")).value = d.pack.editor.defaultSkybox;
    });
  }
  initDOM(() => {
    evElems.set(ui);
    document.getElementById("pla-ver").innerHTML = `Planet ${v.version} by ${v.author}`;
    el.addEventListenerforQuery(".ins-show-btn", "click", clickInsShowBtn);
    el.addEventListenerforQuery(".io-hf", "change", changeHeaderorFooterValue);
    el.addEventListenerforQuery(".tray-list-tool", "click", clickTrayTool);
    document.head.appendChild(importJS("bower_components/move.js/move.js"));
    window.onbeforeunload = (event) => {
      event.returnValue = "ページを移動しますか？";
    };
    event.raiseEvent("initDom", null);
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
    console.log(d.isFullscreenTray);
    if (!d.isFullscreenTray) {
      closeInspector();
      anim.showTrayFull();
      (<HTMLElement>e.target).textContent = "↓";
    } else {
      anim.hideTrayFull();
      (<HTMLElement>e.target).textContent = "↑";
    }
    d.isFullscreenTray = !d.isFullscreenTray;
  }
  
  export function closeInspector() {
    if (!d.isShowInspector) return;
    d.isShowInspector = false;
    anim.hideInspector();
  }
  export function showInspector(inspectorName:string) {
    document.querySelector(".ins-article-active") && document.querySelector(".ins-article-active").classList.remove("ins-article-active");
    document.getElementById("ins-" + inspectorName).classList.add("ins-article-active");
    if (d.isShowInspector) return;
    d.isShowInspector = true;
    anim.showInspector();
  }
  
  export function clickExport() {
    (<HTMLTextAreaElement>document.getElementById("pla-io")).value = planet.exportText();
  }
  export function clickImport() {
    var effects = planet.importText((<HTMLTextAreaElement>document.getElementById("pla-io")).value);
    stage.stageEffects = effects;
    setSkybox(packManager.getPackPath(d.defaultPackName) + d.pack.skyboxes.get(effects.skybox).data.filename);
    stage.renderStage();
  }
  
  export function clickInsShowBtn(e:MouseEvent) {
    showInspector((<HTMLElement>e.target).dataset["ins"]);
  }
  
  export function changeHeaderorFooterValue(e:MouseEvent) {
    var elem = <HTMLTextAreaElement>e.target;
    if (elem.id === "io-header") {
      stage.header = elem.value;
    } else if (elem.id === "io-footer") {
      stage.footer = elem.value;
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
      tray.initTrayBlock((numerator, denominator) => {
        changeLoadingStatus(`loading tray-block : ${numerator.toString()} / ${denominator.toString()}`);
      }).then((ul) => {
        (<Array<HTMLDivElement>>ul).forEach(i => {
          document.getElementsByClassName("tray-items")[0].appendChild(i);
        });
        resolve();
      });
    });
  }
  export function initTrayObj() {
    return new Promise((resolve) => {
      tray.initTrayObj((numerator, denominator) => {
        changeLoadingStatus(`loading tray-obj : ${numerator.toString()} / ${denominator.toString()}`);
      }).then((ul) => {
        (<Array<HTMLDivElement>>ul).forEach(i => {
          document.getElementsByClassName("tray-items")[0].appendChild(i);
        });
        resolve();
      });
    });
  }
  
  export function changeLoadingStatus(status:string) {
    (<HTMLElement>document.getElementsByClassName("loading")[0]).innerHTML = "Loading...<br />" + status;
  }
  
  export function hideLoading() {
    var elem = <HTMLElement>document.getElementsByClassName("loading")[0];
    anim.hideLoading();
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
  
  export function clickConvertOldFile() {
    (<HTMLTextAreaElement>document.getElementById("conv-new")).value = 
      compiler.old2CSV((<HTMLTextAreaElement>document.getElementById("conv-old")).value);
  }
  
  export function changeSkybox(e:Event) {
    stage.stageEffects.skybox = (<HTMLSelectElement>e.target).value;
    setSkybox(packManager.getPackPath(d.defaultPackName) + d.pack.skyboxes.get(stage.stageEffects.skybox).data.filename);
  }
  
  export function clickAddAttr() {
    var attrKey = (<HTMLSelectElement>document.getElementsByClassName("ed-attr")[0]).value;
    if (!stage.blockAttrs.containsAttr(d.editingBlockId, attrKey)) {
      editBlock.renderAttributeUI(attrKey);
      stage.blockAttrs.push(d.editingBlockId, attrKey, "");
    }
  }
  export function changeAttrInput(e:Event) {
    stage.blockAttrs.update(d.editingBlockId, (<HTMLElement>e.target).id.replace("ed-attr-", ""), (<HTMLInputElement>e.target).value);
  }
  init();
}
export = ui;
