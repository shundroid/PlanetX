/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="definitely/move.d.ts" />
import {data as d} from "./modules/data";
import initDOM from "./modules/initDOM";
import * as event from "./modules/event";
import {addEventListenerforQuery, forEachforQuery} from "./modules/elem";
import obj2SelectElem from "./modules/util";
import list from "./modules/classes/list";
import Vector2 from "./modules/classes/vector2";
import * as tray from "./modules/tray";
import {getPackPath} from "./modules/packUtil/packManager";
import {toJsonPlanet, fromJsonPlanet} from "./modules/planet";
import stage = require("./modules/stage");
import {stageEffects, setStageEffects} from "./modules/model/stageEffectsModel";
import * as stageAttrs from "./modules/model/stageAttrsModel";
import * as v from "./modules/version";
import evElems from "./modules/evElems";
import * as anim from "./modules/ui/anim";
import {renderAttributeUI} from "./modules/editBlock";
import {jsonPlanet} from "./modules/jsonPlanet";
import * as editorModel from "./modules/model/editorModel";
import renderStage from "./modules/view/stageRenderView";
import {pack} from "./modules/model/packModel";
import {currentPackName} from "./modules/model/preferencesModel";

/**
 * UIに関する処理を行います。
 */
namespace ui {
  export var canvas: HTMLCanvasElement;
  function init() {
    window.addEventListener("resize", () => {
      event.raiseEvent("resize", null);
    });
    event.addEventListener("ui_clickTray", (e: MouseEvent) => {
      var target = <HTMLImageElement>e.target;
      d.isObjMode = target.parentElement.classList.contains("tray-list-obj");
      if (!d.isObjMode) {
        let item = pack.blocks.get(target.dataset["block"]).data;
        tray.updateActiveBlock(target.dataset["block"], item.filename, item.bName);
      } else {
        let item = pack.objs.get(target.dataset["block"]).data;
        tray.updateActiveBlock(target.dataset["block"], item.filename, item.oName, item.width, item.height);
      }
      changeActiveBlock(target.dataset["block"]);
    });
    event.addEventListener("ui_downCanvas|ui_moveCanvas|ui_upCanvas|ui_hoveringCanvas", function(e: MouseEvent, eventName: string) {
      var g = stage.getGridPosFromMousePos(new Vector2(e.clientX, e.clientY));
      event.raiseEvent("gridCanvas", new stage.gridDetail(g, eventName.replace("ui_", "").replace("Canvas", ""), new Vector2(e.clientX, e.clientY)));
    });
    event.addEventListener("initedPack", () => {
      // SkyboxMode
      if (typeof pack.editor.skyboxMode !== "undefined") {
        if (pack.editor.skyboxMode === "repeat") {
          document.body.style.backgroundRepeat = "repeat";
          if (typeof pack.editor.skyboxSize !== "undefined") {
            document.body.style.backgroundSize = pack.editor.skyboxSize;
          } else {
            document.body.style.backgroundSize = "auto";
          }
        }
      }
      forEachforQuery(".pack-select", (i) => {
        var elem = <HTMLSelectElement>i;
        elem.innerHTML = obj2SelectElem((<list<any>>(<any>pack)[elem.dataset["items"]]).toSimple());
      });
      (<HTMLSelectElement>document.getElementById("stg-skybox")).value = pack.editor.defaultSkybox;
    });
  }
  initDOM(() => {
    evElems(ui);
    document.getElementById("pla-ver").innerHTML = `Planet ${v.version} by ${v.author}`;
    addEventListenerforQuery(".ins-show-btn", "click", clickInsShowBtn);
    addEventListenerforQuery(".tray-list-tool", "mousedown", clickTrayTool);

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
  export function togglefullScreen(e: MouseEvent) {
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
  export function showInspector(inspectorName: string) {
    document.querySelector(".ins-article-active") && document.querySelector(".ins-article-active").classList.remove("ins-article-active");
    document.getElementById("ins-" + inspectorName).classList.add("ins-article-active");
    if (d.isShowInspector) return;
    d.isShowInspector = true;
    anim.showInspector();
  }

  export function clickExport() {
    (<HTMLTextAreaElement>document.getElementById("pla-io")).value = JSON.stringify(toJsonPlanet().exportJson());
  }
  export function clickImport() {
    // fromJSONPlanet内で、editorModel.activeStageLayerは0になる。
    var effects = fromJsonPlanet(jsonPlanet.importJson(JSON.parse((<HTMLTextAreaElement>document.getElementById("pla-io")).value)));
    setStageEffects(effects);
    setSkybox(getPackPath(currentPackName) + pack.skyboxes.get(effects.skyboxes[0]).data.filename);
    renderStage(0);
  }

  export function clickInsShowBtn(e: MouseEvent) {
    showInspector((<HTMLElement>e.target).dataset["ins"]);
  }

  export function clickTrayTool(e: MouseEvent) {
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

  export function setSkybox(fileName: string) {
    document.body.style.backgroundImage = `url('${fileName}')`;
  }

  export function initTrayBlock() {
    return new Promise((resolve: any) => {
      tray.initTrayBlock((numerator, denominator) => {
        changeLoadingStatus(`loading tray-block : ${numerator.toString()} / ${denominator.toString()}`);
      }).then((ul: any) => {
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

  export function changeLoadingStatus(status: string) {
    (<HTMLElement>document.getElementsByClassName("loading")[0]).innerHTML = "Loading...<br />" + status;
  }

  export function hideLoading() {
    anim.hideLoading();
  }

  export function changeActiveBlock(blockName: string) {
    document.querySelector(".tray-active") && document.querySelector(".tray-active").classList.remove("tray-active");
    (<HTMLElement>document.querySelector(`[data-block="${blockName}"]`)).classList.add("tray-active");
  }

  event.addEventListener("clickTrayToolbtn", (name: string) => {
    var btnName2InspectorName: { [key: string]: string } = {
      "io": "io",
      "setting": "inspector"
    };
    ui.showInspector(btnName2InspectorName[name]);
  });

  export function clickConvertOldFile() {
    (<HTMLTextAreaElement>document.getElementById("conv-new")).value =
      JSON.stringify(jsonPlanet.fromCSV((<HTMLTextAreaElement>document.getElementById("conv-old")).value).exportJson());
  }

  export function changeSkybox(e: Event) {
    stageEffects.skyboxes[editorModel.activeStageLayerInEditor] = (<HTMLSelectElement>e.target).value;
    setSkybox(getPackPath(currentPackName) + pack.skyboxes.get(stageEffects.skyboxes[editorModel.activeStageLayerInEditor]).data.filename);
  }

  export function clickAddAttr() {
    var attrId = stageAttrs.getMaxAttrId(d.editingBlockId);
    stageAttrs.push(d.editingBlockId, attrId, new stageAttrs.Attr());
    renderAttributeUI(attrId);
  }
  //  export function changeAttrInput(e:Event) {
  //    stage.blockAttrs.update(d.editingBlockId, parseInt((<HTMLElement>e.target).id.replace("ed-attr-", "")), (<HTMLInputElement>e.target).value);
  //  }
  export function changeActiveStageLayer(e: Event) {
    stage.changeActiveStageLayer(parseInt((<HTMLInputElement>e.target).value));
    if (typeof stageEffects.skyboxes[editorModel.activeStageLayerInEditor] === "undefined") {
      stageEffects.skyboxes[editorModel.activeStageLayerInEditor] = pack.editor.defaultSkybox;
    }
    setSkybox(getPackPath(currentPackName) + pack.skyboxes.get(stageEffects.skyboxes[editorModel.activeStageLayerInEditor]).data.filename);
    (<HTMLSelectElement>document.getElementById("stg-skybox")).value = stageEffects.skyboxes[editorModel.activeStageLayerInEditor];
  }
  init();
}
export = ui;
