import {getPackPath} from "./pack";
import * as on from "./on";
import {pack as packName} from "./editor-config";
import {ui as tempUI} from "./temp-datas";

var guideElement;
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
    Array.prototype.forEach.call(document.querySelector(".ins-show-btn"), elem => {
      elem.addEventListener("click", (e) => {
        on.on("clickInspectorShowButton", e);
      });
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
  initilizeTray: function (blocks, objs) {
    var initializeTrayObserve = function (nextCallback, completedCallback) {
      let blockList = Object.keys(blocks);
      let objList = Object.keys(objs);
      let isModeObj = false;
      let appendTrayItem = (i) => {
        let blockName = isModeObj ? objList[i] : blockList[i];
        let packItem = isModeObj ? objs[blockName] : blocks[blockName];
        uiModule.makeTrayItem(isModeObj ? "obj" : "block", packItem, blockName, (trayItem) => {
          if (isModeObj && i === objList.length - 1) {
            completedCallback();
          } else if (!isModeObj && i === blockList.length - 1) {
            isModeObj = true;
            appendTrayItem(0);
          } else {
            let maxLength =
              isModeObj ? objList.length - 1 : blockList.length - 1;
            nextCallback({ numerator: i, denominator: maxLength, mode: isModeObj ? "obj" : "block", item: trayItem });
            appendTrayItem(i + 1);
          }
        });
      };
      appendTrayItem(0);
    } ((conf) => {
      uiModule.changeLoadingStatusUI(`Loading Tray(${conf.mode}) : ${conf.numerator} / ${conf.denominator}`);
      document.querySelector(".tray-items").appendChild(conf.item);
    }, () => {
      on.raise("initializedTray", null);
    });
  },
  makeTrayItem: (mode, packItem, blockName, onloadCallback) => {
    let trayItem = document.createElement("div");
    trayItem.classList.add("tray-list", `tray-list-${mode}`);
    trayItem.addEventListener("mousedown", e => void on.raise("clickedTrayItem", e));
    let trayItemThumbnail = document.createElement("img");
    trayItemThumbnail.src = getPackPath(packName, packItem.filename);
    trayItemThumbnail.alt = packItem.name;
    trayItemThumbnail.dataset["block"] = blockName;
    trayItemThumbnail.onload = () => {
      if (mode === "obj") {
        trayItem.style.width = trayItemThumbnail.style.width =
          `${packItem.width / (packItem.height / 50)}px`;
        trayItem.style.height = trayItemThumbnail.style.height = "50px";
        trayItem.appendChild(trayItemThumbnail);
      }
      onloadCallback(trayItem);
    };
    trayItem.appendChild(trayItemThumbnail);
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
  initializeGuide: () => {
    guideElement = document.createElement("div");
    guideElement.id = "guide";
    guideElement.style.position = "fixed";
    guideElement.style.backgroundColor = "rgba(240,0,0,0.6)";
    guideElement.style.pointerEvents = "none";
    document.body.appendChild(guideElement);
  },
  showGuide: (screenPos, size, color) => {
    guideElement.style.visibility = "visible";
    guideElement.style.left = `${screenPos.x}px`;
    guideElement.style.top = `${screenPos.y}px`;
    guideElement.style.width = `${size.x}px`;
    guideElement.style.height = `${size.y}px`;
    guideElement.style.backgroundColor = color;
  },
  hideGuide: () => {
    guideElement.style.visibility = "hidden";
  },
  initializeVersionUI: (version, author) => {
    document.getElementById("pla-ver").innerHTML = `Planet ${version} by ${author}`;
  },
  showInspector: (articleName) => {
    // active な article がすでにある場合は削除する
    document.querySelector(".ins-article-active") && document.querySelector(".ins-article-active").classList.remove("ins-article-active");
    document.getElementById("ins-" + articleName).classList.add("ins-article-active");
    if (!tempUI.isShowInspector) {
      tempUI.isShowInspector = true;
      
      // animation
      let inspector = document.querySelector(".pla-inspector");
      inspector.classList.add("pla-inspector-animate-showing");
      setTimeout(function() {
        inspector.classList.remove("pla-inspector-animate-showing");
      }, 1000);
    }
  }
};
module.exports = uiModule;