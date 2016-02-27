import image = require("./image");
import TrayBlockDetails from "./classes/trayBlockDetails";
import {data as d} from "./data";
import event = require("./event");
import {packManager} from "./packUtil/packManager";

/**
 * Tray（UI下部分）のUI、Controllerを構成します。
 */
namespace tray {
  export function updateActiveBlock(blockName:string, fileName:string, label:string, width?:number, height?:number) {
    var w = width || d.defaultBlockSize;
    var h = height || d.defaultBlockSize;
    d.selectBlock = new TrayBlockDetails(blockName, fileName, label, w, h);
    updateSelectImage();
  }
  export function updateSelectImage() {
    d.selectImage = image(d.trayItemDataURLs.get(d.selectBlock.blockName));
  }
  export function initTrayBlock(finishedOne:(numerator: number, denominator: number)=>void) {
    return new Promise(resolve => {
      var list = Object.keys(d.pack.blocks.getAll());
      var result:Array<HTMLDivElement> = [];
      var async = (i: number) => {
        var item = list[i];
        var li = document.createElement("div");
        li.classList.add("tray-list", "tray-list-block");
        li.addEventListener("mousedown", (e) => { event.raiseEvent("ui_clickTray", e); });
        var img = document.createElement("img");
        img.src = packManager.getPackPath(d.defaultPackName) + d.pack.blocks.get(item).data.filename;
        img.onload = () => {
          img.alt = d.pack.blocks.get(item).data.bName;
          img.dataset["block"] = item;
          li.appendChild(img);
          result.push(li);
          if (i === list.length - 1) {
            resolve(result);
          } else {
            finishedOne(i, list.length - 1);
            async(i + 1);
          }
        };
      };
      async(0);
    });
  }
  export function initTrayObj(finishedOne:(numerator: number, denominator: number)=>void) {
    return new Promise((resolve) => {
      var list = Object.keys(d.pack.objs.getAll());
      var result:Array<HTMLDivElement> = [];
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
          result.push(li);
          if (i === list.length - 1) {
            resolve(result);
          } else {
            finishedOne(i, list.length - 1);
            async(i + 1);
          }
        }
      }
      async(0);
    });
  }
}
export = tray;