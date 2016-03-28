import Rx from "rx";
import {getPackPath} from "./pack";
import * as on from "./on";

var uiModule = {
  setListeners: function () {
    Array.prototype.forEach.call(document.querySelectorAll(".ev-btn"), elem => {
      elem.addEventListener("click", uiModule[elem.dataset["listener"]]);
    });
    Array.prototype.forEach.call(document.querySelector(".ev-input"), elem => {
      if (typeof elem.dataset["default"] !== "undefined") {
        elem.value = elem.dataset["default"];
      }
      if (typeof elem.dataset["change"] !== "undefined") {
        elem.addEventListener("change", uiModule[elem.dataset["change"]]);
      }
    });
  },
  setEditorBackground: function (path) {
    document.body.style.backgroundImage = `url(${path})`;
  },
  changeLoadingStatusUI: function (status) {
    document.querySelector(".loading").innerHTML = `Loading...<br />${status}`;
  },
  hideLoadingUI: function () {
    document.querySelector(".loading").classList.add("loading-closing");
    setTimeout(() => {
      document.querySelector(".loading").style.display = "none";
    }, 1000);
  },
  initilizeTray: function (blocks, objs, packName) {
    Rx.Observable.create(function (observer) {
      let blockList = Object.keys(blocks);
      let objList = Object.keys(objs);
      let isModeObj = false;
      let appendTrayItem = (i) => {
        let item = isModeObj ? objList[i] : blockList[i];
        let trayItem = document.createElement("div");
        if (!isModeObj) {
          trayItem.classList.add("tray-list", "tray-list-block");
        } else {
          trayItem.classList.add("tray-list", "tray-list-obj");
        }
        trayItem.addEventListener("mousedown", e => void on.raise("clickedTray", e));
        let trayItemThumbnail = document.createElement("img");
        let packItem = isModeObj ? objs[item] : blocks[item];
        trayItemThumbnail.src = getPackPath(packName, packItem.filename);
        trayItemThumbnail.alt = packItem.bName;
        trayItemThumbnail.dataset["block"] = item;
        trayItemThumbnail.onload = () => {
          if (isModeObj) {
            trayItem.style.width = trayItemThumbnail.style.width =
              `${objs[item].width / (objs[item].height / 50)}px`;
            trayItem.style.height = trayItemThumbnail.style.height = "50px";
            trayItem.appendChild(trayItemThumbnail);
          }
          if (isModeObj && i === objList.length - 1) {
            observer.onCompleted();
          } else if (!isModeObj && i === blockList.length - 1) {
            isModeObj = true;
            appendTrayItem(0);
          } else {
            let maxLength =
              isModeObj ? objList.length - 1 : blockList.length - 1;
            observer.onNext({ numerator: i, denominator: maxLength, mode: isModeObj ? "obj" : "block", item: trayItem });
            appendTrayItem(i + 1);
          }
        };
        trayItem.appendChild(trayItemThumbnail);
      };
      appendTrayItem(0);
    }).subscribe(
      (conf) => {
        uiModule.changeLoadingStatusUI(`Loading Tray(${conf.mode}) : ${conf.numerator} / ${conf.denominator}`);
        document.querySelector(".tray-items").appendChild(conf.item);
      }, err => {
        console.log("Tray Observe Error: " + err);
      }, () => {
        on.raise("initializedTray", null);
      }
    );
  },
  setEditorBackgroundMode: (editor) => {
    // ui での pack の配置方法を決める
    // editor = pack.editor
    if (typeof editor.skyboxMode !== "undefined") {
      if (editor.skyboxMode === "repeat") {
        document.body.style.backgroundRepeat = "repeat";
        if (typeof editor.skyboxSize !== "undefined") {
          document.body.style.backgroundSize = editor.skyboxSize;
        } else {
          document.body.style.backgroundSize = "auto";
        }
      }
    }
  },
};
module.exports = uiModule;