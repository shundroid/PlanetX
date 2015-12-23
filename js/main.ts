/// <reference path="lib/classes.ts" />
/// <reference path="lib/canvas.ts" />
/// <reference path="ui.ts" />
/// <reference path="lib/util.ts" />
/// <reference path="lib/compiler.ts" />
/// <reference path="planet.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/**
 * Planetのメイン処理を行います。
 * UIとは直接かかわりません。
 */
module main {
  export var isShowInspector;
  export var packModule: pack.pPackModule;
  export var packName: string;
  export var trayIconURLs: p.List<string>;
  var scrollX = 0;
  var scrollY = 0;
  var scrollPrevX = -1;
  var scrollPrevY = -1;
  export var selectedBlock:TrayBlockDetails;
  var selectedImage:HTMLImageElement;
  export var isActiveObj:boolean;
  export var isFullscreen:boolean;
  export var activeToolName:string;
  export var defaultGridSize:number;
  export var defaultBlockSize:number;
  var isResizeRequest:boolean;
  var resizeTimerId:number;
  export var stageSettings:p.stageSettings;
  function attachListeners() {
    ev.addPlaEventListener("initDom", init);
    ev.addPlaEventListener("gridCanvas", gridCanvas);
    ev.addPlaEventListener("ready", ready);
    ev.addPlaEventListener("packLoaded", initTray);
    ev.addPlaEventListener("resize", resize);
    ev.addPlaEventListener("clickTrayToolbtn", clickTrayToolbtn);
    activeToolName = "pencil";
  }
  function init() {
    packName = "halstar";
    trayIconURLs = new p.List<string>();
    isFullscreen = false;
    isActiveObj = false;
    defaultGridSize = 25;
    defaultBlockSize = 50;
    isResizeRequest = false;
    isShowInspector = false;
    ui.setupCanvas();
    loadPack(packName).then((obj) => {
      packModule = new pack.pPackModule(obj);
      ev.raiseEvent("packloaded", null);
      stageSettings = new p.stageSettings();
      stageSettings.skybox = packModule.editor.defaultSkybox;
      ui.setSkybox(packModule.skyboxes.get(packModule.editor.defaultSkybox).data.filename);
      ui.initSelectElems();
      ev.raiseEvent("initedUI", null);
      ui.initTray().then(() => {
        ui.initObjforTray();
      });
    });
    ev.addPlaEventListener("initedTray", () => {
      makeDataURL();
      updateSelectedBlock("w1/block2", "pack/halstar/images/mapicons/w1block2-2.png", "W1草付ブロック");
      ui.loadingStatus("Are you ready?");
      ev.raiseEvent("ready", null);
    });
  }
  function makeDataURL() {
    ui.loadingStatus("making DataURL");
    var blockList = packModule.blocks.getAll();
    Object.keys(blockList).forEach(i => {
      trayIconURLs.push(i, util.makeNoJaggyURL(getPackPath(packName) + packModule.blocks.get(i).data.filename, new p.Vector2(defaultGridSize, defaultGridSize)));
    });
    var objList = packModule.objs.getAll();
    Object.keys(objList).forEach(i => {
      var item = packModule.objs.get(i).data;
      trayIconURLs.push(i, util.makeNoJaggyURL(getPackPath(packName) + item.filename, new p.Vector2(item.width, item.height)));
    });
  }
  
  export function getPackPath(packName:string) {
    return "pack/" + packName + "/";
  }
  
  function loadPack(packname:string) {
    return new Promise(resolve => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", getPackPath(packName) + "packinfo.json");
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        }
      };
      xhr.send(null);
    });
  }
  function ready() {
    ui.hideLoading();
  }
  function initTray() {
    ui.initTray();
    ev.raiseEvent("initedTray", null);
  }
  
  export class gridDetail {
    constructor(public gridPos:p.Vector2, public eventName:string, public mousePos:p.Vector2) {}
  }

  function gridCanvas(e:gridDetail) {
    var prefab:planet.Prefab = {
      gridX: e.gridPos.x,
      gridY: e.gridPos.y,
      filename: selectedBlock.fileName,
      blockName: selectedBlock.blockName,
      gridW: selectedBlock.width / defaultGridSize,
      gridH: selectedBlock.height / defaultGridSize
    };
    var detail = planet.getFromGrid(new p.Vector2(prefab.gridX, prefab.gridY));
    var rect:Canvas.pRect = 
      { x: scrollX + getCenterPos(prefab.gridX * defaultGridSize, prefab.gridW * defaultGridSize), y: scrollY + getCenterPos(prefab.gridY * defaultGridSize, prefab.gridH * defaultGridSize), 
        width: prefab.gridW * defaultGridSize, height: prefab.gridH * defaultGridSize };
    if (main.activeToolName === "pencil" && e.eventName === "mousedown") {
      if (!detail.contains) {
        Canvas.render(selectedImage, rect);
        planet.add(planet.getId(), prefab);
      } else {
        planet.remove(detail.id);
        renderByPlanet();
      }
    } else if (e.eventName === "mousedown" && main.activeToolName === "choice") {
      if (detail.prefab) {
        var bData = packModule.blocks.get(detail.prefab.blockName);
        updateSelectedBlock(detail.prefab.blockName, bData.data.bName, getPackPath(packName) + bData.data.filename);
        ui.changeUIActiveBlock(detail.prefab.blockName);
      }
    } else if (main.activeToolName === "hand") {
      if (e.eventName === "mousedown") {
        scrollPrevX = e.mousePos.x;
        scrollPrevY = e.mousePos.y;
      } else if (e.eventName === "mousemove") {
        scrollX +=  e.mousePos.x - scrollPrevX;
        scrollY +=  e.mousePos.y - scrollPrevY;
        renderByPlanet();
        scrollPrevX = e.mousePos.x;
        scrollPrevY = e.mousePos.y;
      }
    } else if (e.eventName === "mousemove" || e.eventName === "mousedown") {
      if (main.activeToolName === "brush") {
        if (detail.contains && detail.prefab.blockName !== selectedBlock.blockName) {
          planet.remove(detail.id);
          renderByPlanet();
        }
        if (!detail.contains) {
          Canvas.render(selectedImage, rect);
          planet.add(planet.getId(), prefab);
        }
      } else if (main.activeToolName === "erase" && detail.contains) {
        planet.remove(detail.id);
        renderByPlanet();
      }
    }
  }
  export function updateSelectedBlock(blockName:string, fileName:string, showName:string) {
    selectedBlock = new TrayBlockDetails(blockName, fileName, showName, defaultBlockSize, defaultBlockSize);
    updateSelectedImage();
  }
  export function updateSelectedBlockForObj(blockName:string, fileName:string, showName:string, width:number, height:number) {
    selectedBlock = new TrayBlockDetails(blockName, fileName, showName, width, height);
    updateSelectedImage();
  }
  export function updateSelectedImage() {
    selectedImage = util.QuickImage(trayIconURLs.get(selectedBlock.blockName));
    ui.startUIWaitMode();
    selectedImage.onload = () => {
      ui.endUIWaitMode();
    }
  }
  export class TrayBlockDetails {
    constructor (
      public blockName:string,
      public fileName:string,
      // 表示するときのブロック名
      public showBlockName:string,
      public width:number,
      public height:number) {};
  }

  export function getCenterPos(center:number,size:number):number {
    return center - ((size - defaultGridSize) / 2);
  }
  export function clientPos2Grid(clientPos:p.Vector2):p.Vector2 {
    var cX = clientPos.x - scrollX; var cY = clientPos.y - scrollY;
    var eX = cX - (cX % defaultGridSize);
    var eY = cY - (cY % defaultGridSize);
    var gridX = eX / defaultGridSize;
    var gridY = eY / defaultGridSize;
    return new p.Vector2(gridX, gridY);
  }
  export function clientPos2BlockSizeGrid(clientPos:p.Vector2):p.Vector2 {
    var eX = clientPos.x - (clientPos.x % defaultBlockSize);
    var eY = clientPos.y - (clientPos.y % defaultBlockSize);
    var gridX = eX / defaultBlockSize;
    var gridY = eY / defaultBlockSize;
    return new p.Vector2(gridX * 2, gridY * 2);
  }
  
  export function renderByPlanet() {
    Canvas.clear();
    var list = planet.all();
    Object.keys(list).forEach(i => {
      var item = <planet.Prefab>list[i];
      var x = scrollX + getCenterPos(item.gridX * defaultGridSize, item.gridW * defaultGridSize);
      var y = scrollY + getCenterPos(item.gridY * defaultGridSize, item.gridH * defaultGridSize);
      var width = item.gridW * defaultGridSize;
      var height = item.gridH * defaultGridSize;
      if (x + width >= Canvas.canvasRect.x && x <= Canvas.canvasRect.width &&
        y + height >= Canvas.canvasRect.y && y <= Canvas.canvasRect.height) {
        Canvas.render(util.QuickImage(trayIconURLs.get(item.blockName)), {
          x: x,
          y: y,
          width: width,
          height: height
        });
      }
    });
  }
  
  function resize() {
    if (isResizeRequest) {
      clearTimeout(resizeTimerId);
    }
    isResizeRequest = true;
    resizeTimerId = setTimeout(() => {
      isResizeRequest = false;
      main.renderByPlanet();
    }, 100);
  }
  function clickTrayToolbtn(name:string) {
    if (name === "io") {
      ui.showInspector("io");
    } else if (name === "setting") {
      ui.showInspector("inspector");
    }
  }
  export function convertOldFile(oldFile:string):string {
    return compiler.old2CSV(oldFile);
  }
  attachListeners();
}