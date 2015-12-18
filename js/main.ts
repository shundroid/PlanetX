/// <reference path="lib/classes.ts" />
/// <reference path="lib/canvas.ts" />
/// <reference path="ui.ts" />
/// <reference path="lib/util.ts" />
/// <reference path="planet.ts" />
/// <reference path="definitely/es6-promise.d.ts" />
/**
 * Planetのメイン処理を行います。
 * UIとは直接かかわりません。
 */
module main {
  function attachListeners() {
    ev.addPlaEventListener("initDom", init);
    ev.addPlaEventListener("gridCanvas", gridCanvas);
    ev.addPlaEventListener("ready", ready);
    ev.addPlaEventListener("packLoaded", initTray);
    activeToolName = "pencil";
  }
  function init() {
    packName = "halstar";
    trayIconURLs = new p.List<string>();
    isFullscreen = false;
    isActiveObj = false;
    defaultGridSize = 25;
    defaultBlockSize = 50;
    ui.setupCanvas();
    loadPack(packName).then((obj) => {
      packModule = new pack.pPackModule(obj);
      ev.raiseEvent("packloaded", null);
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
    constructor(public gridPos:p.Vector2, public eventName:string) {}
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
      { x: getCenterPos(prefab.gridX * defaultGridSize, prefab.gridW * defaultGridSize), y: getCenterPos(prefab.gridY * defaultGridSize, prefab.gridH * defaultGridSize), 
        width: prefab.gridW * defaultGridSize, height: prefab.gridH * defaultGridSize };
    if (main.activeToolName === "pencil" && e.eventName === "mousedown") {
      if (!detail.contains) {
        var id = Canvas.render(selectedImage, rect);
        planet.add(id, prefab);
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
    } else if (e.eventName === "mousemove" || e.eventName === "mousedown") {
      if (main.activeToolName === "brush") {
        if (detail.contains && detail.prefab.blockName !== selectedBlock.blockName) {
          planet.remove(detail.id);
          renderByPlanet();
        }
        if (!detail.contains) {
          var id = Canvas.render(selectedImage, rect);
          planet.add(id, prefab);
        }
      } else if (main.activeToolName === "erase" && detail.contains) {
        planet.remove(detail.id);
        renderByPlanet();
      }
    }
  }
  export var packModule: pack.pPackModule;
  export var packName: string;
  export var trayIconURLs: p.List<string>;
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
  export var selectedBlock:TrayBlockDetails;
  var selectedImage:HTMLImageElement;
  export var isActiveObj:boolean;
  
  export var isFullscreen:boolean;
  
  export var activeToolName:string;
  
  export var defaultGridSize:number;
  export var defaultBlockSize:number;
  export function getCenterPos(center:number,size:number):number {
    return center - ((size - defaultGridSize) / 2);
  }
  export function clientPos2Grid(clientPos:p.Vector2):p.Vector2 {
    var eX = clientPos.x - (clientPos.x % defaultGridSize);
    var eY = clientPos.y - (clientPos.y % defaultGridSize);
    var gridX = eX / defaultGridSize;
    var gridY = eY / defaultGridSize;
    return new p.Vector2(gridX, gridY);
  }
  
  export function renderByPlanet() {
    Canvas.clear();
    var list = planet.all();
    Object.keys(list).forEach(i => {
      var item = <planet.Prefab>list[i];
      Canvas.render(util.QuickImage(trayIconURLs.get(item.blockName)), {
        x: getCenterPos(item.gridX * defaultGridSize, item.gridW * defaultGridSize),
        y: getCenterPos(item.gridY * defaultGridSize, item.gridH * defaultGridSize),
        width: item.gridW * defaultGridSize,
        height: item.gridH * defaultGridSize
      });
    });
  }
  attachListeners();
}