/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="definitely/move.d.ts" />
import d = require("./modules/data");
import initDOM = require("./modules/initDOM");
import event = require("./modules/event");
import el = require("./modules/elem");
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
import jsonPlanet = require("./modules/jsonPlanet");

/**
 * UIに関する処理を行います。
 */
namespace ui {
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
    event.addEventListener("ui_downCanvas|ui_moveCanvas|ui_upCanvas|ui_hoveringCanvas", function (e:MouseEvent, eventName:string) {
      var g = stage.getGridPosFromMousePos(new Vector2(e.clientX, e.clientY));
      event.raiseEvent("gridCanvas", new stage.gridDetail(g, eventName.replace("ui_", "").replace("Canvas", ""), new Vector2(e.clientX, e.clientY)));
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
        // ev-inputで実装
//        if (elem.dataset["change"]) {
//          elem.addEventListener("change", (<any>ui)[elem.dataset["change"]]);
//        }
//        if (elem.dataset["default"]) {
//          elem.value = elem.dataset["default"];
//        }
      });
      (<HTMLSelectElement>document.getElementById("stg-skybox")).value = d.pack.editor.defaultSkybox;
    });
  }
  initDOM(() => {
    evElems.set(ui);
    document.getElementById("pla-ver").innerHTML = `Planet ${v.version} by ${v.author}`;
    el.addEventListenerforQuery(".ins-show-btn", "click", clickInsShowBtn);
    el.addEventListenerforQuery(".tray-list-tool", "mousedown", clickTrayTool);
    
    // movejsを読む
    var movejs = document.createElement("script");
    movejs.src = "bower_components/move.js/move.js"
    document.head.appendChild(movejs);
    window.onbeforeunload = (event) => {
      event.returnValue = "ページを移動しますか？";
    };
    event.raiseEvent("initDom", null);
  });
  
  export function setupCanvas() {
    canvas = <HTMLCanvasElement>document.getElementById("pla-canvas");
    canvas.addEventListener("mousedown", (e) => {
      event.raiseEvent("ui_downCanvas", e);
    });
    canvas.addEventListener("mousemove", (e) => {
      if (e.buttons === 1) {
        event.raiseEvent("ui_moveCanvas", e);
      } else {
        event.raiseEvent("ui_hoveringCanvas", e);
      }
    });
    canvas.addEventListener("mouseup", (e) => {
      event.raiseEvent("ui_upCanvas", e);
    });
  }
  export function togglefullScreen(e:MouseEvent) {
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
    (<HTMLTextAreaElement>document.getElementById("pla-io")).value = JSON.stringify(planet.toJsonPlanet().exportJson());
  }
  export function clickImport() {
    // fromJSONPlanet内で、d.activeStageLayerは0になる。
    var effects = planet.fromJsonPlanet(jsonPlanet.jsonPlanet.importJson(JSON.parse((<HTMLTextAreaElement>document.getElementById("pla-io")).value)));
    stage.stageEffects = effects;
    setSkybox(packManager.getPackPath(d.defaultPackName) + d.pack.skyboxes.get(effects.skyboxes[0]).data.filename);
    stage.renderStage(0);
  }
  
  export function clickInsShowBtn(e:MouseEvent) {
    showInspector((<HTMLElement>e.target).dataset["ins"]);
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
    return new Promise((resolve:any) => {
      tray.initTrayBlock((numerator, denominator) => {
        changeLoadingStatus(`loading tray-block : ${numerator.toString()} / ${denominator.toString()}`);
      }).then((ul:any) => {
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
    anim.hideLoading();
  }
  
  export function changeActiveBlock(blockName:string) {
    document.querySelector(".tray-active") && document.querySelector(".tray-active").classList.remove("tray-active");
    (<HTMLElement>document.querySelector(`[data-block="${blockName}"]`)).classList.add("tray-active");
  }
 
  event.addEventListener("clickTrayToolbtn", (name:string) => {
    var btnName2InspectorName:{[key: string]: string} = {
      "io": "io",
      "setting": "inspector"
    };
    ui.showInspector(btnName2InspectorName[name]);
  });
  
  export function clickConvertOldFile() {
    (<HTMLTextAreaElement>document.getElementById("conv-new")).value = 
      JSON.stringify(jsonPlanet.jsonPlanet.fromCSV((<HTMLTextAreaElement>document.getElementById("conv-old")).value).exportJson());
  }
  
  export function changeSkybox(e:Event) {
    stage.stageEffects.skyboxes[d.activeStageLayer] = (<HTMLSelectElement>e.target).value;
    setSkybox(packManager.getPackPath(d.defaultPackName) + d.pack.skyboxes.get(stage.stageEffects.skyboxes[d.activeStageLayer]).data.filename);
  }
  
  export function clickAddAttr() {
    var attrId = stage.blockAttrs.getMaxAttrId(d.editingBlockId);
    stage.blockAttrs.push(d.editingBlockId, attrId, new stage.Attr());
    editBlock.renderAttributeUI(attrId);    
  }
//  export function changeAttrInput(e:Event) {
//    stage.blockAttrs.update(d.editingBlockId, parseInt((<HTMLElement>e.target).id.replace("ed-attr-", "")), (<HTMLInputElement>e.target).value);
//  }
  export function changeActiveStageLayer(e:Event) {
    stage.changeActiveStageLayer(parseInt((<HTMLInputElement>e.target).value));
    if (typeof stage.stageEffects.skyboxes[d.activeStageLayer] === "undefined") {
      stage.stageEffects.skyboxes[d.activeStageLayer] = d.pack.editor.defaultSkybox;
    }
    setSkybox(packManager.getPackPath(d.defaultPackName) + d.pack.skyboxes.get(stage.stageEffects.skyboxes[d.activeStageLayer]).data.filename); 
    (<HTMLSelectElement>document.getElementById("stg-skybox")).value = stage.stageEffects.skyboxes[d.activeStageLayer];
  }
  init();
}
export = ui;
