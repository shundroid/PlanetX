import image from "./image";
import TrayBlockDetails from "./classes/trayBlockDetails";
import {data as d} from "./data";
import {raiseEvent} from "./event";
import {getPackPath} from "./packUtil/packManager";
import {pack} from "./model/packModel";
import * as trayModel from "./model/trayModel";
import {currentPackName, defaultBlockSize} from "./model/preferencesModel";

/**
 * Tray（UI下部分）のUI、Controllerを構成します。
 */

export function updateActiveBlock(blockName: string, fileName: string, label: string, width?: number, height?: number) {
  var w = width || defaultBlockSize;
  var h = height || defaultBlockSize;
  trayModel.setActiveBlock(new TrayBlockDetails(blockName, fileName, label, w, h));
  updateSelectImage();
}
export function updateSelectImage() {
  trayModel.setActiveBlockImage(image(d.trayItemDataURLs.get(trayModel.activeBlock.blockName)));
}
export function initTrayBlock(finishedOne: (numerator: number, denominator: number) => void) {
  return new Promise(resolve => {
    var list = Object.keys(pack.blocks.getAll());
    var result: Array<HTMLDivElement> = [];
    var async = (i: number) => {
      var item = list[i];
      var li = document.createElement("div");
      li.classList.add("tray-list", "tray-list-block");
      li.addEventListener("mousedown", (e) => { raiseEvent("ui_clickTray", e); });
      var img = document.createElement("img");
      img.src = getPackPath(currentPackName) + pack.blocks.get(item).data.filename;
      img.onload = () => {
        img.alt = pack.blocks.get(item).data.bName;
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
export function initTrayObj(finishedOne: (numerator: number, denominator: number) => void) {
  return new Promise((resolve) => {
    var list = Object.keys(pack.objs.getAll());
    var result: Array<HTMLDivElement> = [];
    var async = (i: number) => {
      var item = list[i];
      var li = document.createElement("div");
      li.classList.add("tray-list", "tray-list-obj");
      li.addEventListener("click", (e) => { raiseEvent("ui_clickTray", e); });
      var img = document.createElement("img");
      img.src = getPackPath(currentPackName) + pack.objs.get(item).data.filename;
      img.onload = () => {
        img.alt = pack.objs.get(item).data.oName;
        img.dataset["block"] = item;
        li.style.width = img.style.width =
          pack.objs.get(item).data.width / (pack.objs.get(item).data.height / 50) + "px";
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
