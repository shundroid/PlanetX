import * as stage from "./stage";
import * as config from "./editor-config";
import * as on from "./on";
import * as temp from "./temp-datas";
import * as canvas from "./canvas";
import Rx from "rx";

+function () {
  let pack;

  document.addEventListener("DOMContentLoaded", function () {
    canvas.initialize();
    loadPack(config.pack).then(packObject => {
      pack = packObject;
      stage.skyboxes.push(pack.editor.defaultSkybox);
      setEditorBackground(getPackPath(config.pack, pack.skyboxes[pack.editor.defaultSkybox].filename));
      on.raise("initializedPack", null);
      initilizeTray();
    });
  });
  on.on("initializedTray", () => {
    changeLoadingStatusUI("making DataUrl");
    temp.tray.dataUrls = makeDataUrl();
    let defaultItem = pack.blocks[pack.editor.defaultBlock];
    updateActiveBlock(pack.editor.defaultBlock, defaultItem.filename, defaultItem.bName);
    hideLoadingUI();
    on.raise("ready", null);
  });

  // stage 関係

  // tray 関係
  function makeDataUrl() {
    let urls = {};
    let blockList = Object.keys(pack.blocks);
    blockList.forEach(item => {
      urls[item] = image(getPackPath(config.pack, pack.blocks[item].filename), true, { x: config.grid, y: config.grid }).src;
    });
    let objList = Object.keys(pack.objs);
    objList.forEach(itemName => {
      let item = pack.objs[itemName];
      urls[itemName] = image(getPackPath(config.pack, item.filename), true, { x: item.width, y: item.height });
    });
    return urls;
  }
  function image(url, isNoJaggy, size) {
    let a = new Image();
    a.src = url;
    if (isNoJaggy) {
      let width = (a.width + size.x) / 2;
      let height = (a.height + size.y) / 2;
      let newC = document.createElement("canvas");
      newC.width = width;
      newC.height = height;
      let ctx = newC.getContext("2d");
      ctx.drawImage(a, 0, 0, width, height);
      return image(newC.toDataURL("image/png"));
    } else {
      return a;
    }
  }
  function updateActiveBlock(blockName, fileName, label, width, height) {
    let w = width || config.grid * 2;
    let h = height || config.grid * 2;
    temp.tray.activeBlock = { blockName, fileName, label, w, h };
  }

  // ui 関係
  function setEditorBackground(path) {
    document.body.style.backgroundImage = `url(${path})`;
  }
  function changeLoadingStatusUI(status) {
    document.querySelector(".loading").innerHTML = `Loading...<br />${status}`;
  }
  function hideLoadingUI() {
    document.querySelector(".loading").classList.add("loading-closing");
    setTimeout(() => {
      document.querySelector(".loading").style.display = "none";
    }, 1000);
  }
  function initilizeTray() {
    getInitializeTrayObserve().subscribe(
      (conf) => {
        changeLoadingStatusUI(`Loading Tray(${conf.mode}) : ${conf.numerator} / ${conf.denominator}`);
        document.querySelector(".tray-items").appendChild(conf.item);
      }, err => {
        console.log("Tray Observe Error: " + err);
      }, () => {
        on.raise("initializedTray", null);
      }
    );
  }
  on.on("initializedPack", () => {
    // ui での pack の配置方法を決める
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
  });
  function getInitializeTrayObserve() {
    return Rx.Observable.create(function (observer) {
      let blockList = Object.keys(pack.blocks);
      let objList = Object.keys(pack.objs);
      let isModeObj = false;
      let appendTrayItem = (i) => {
        let item = isModeObj ? objList[i] : blockList[i];
        let trayItem = document.createElement("div");
        if (!isModeObj) {
          trayItem.classList.add("tray-list", "tray-list-block");
        } else {
          trayItem.classList.add("tray-list", "tray-list-obj");
        }
        trayItem.addEventListener("mousedown", (e) => { on.raise("clickedTray", e) });
        let trayItemThumbnail = document.createElement("img");
        let packItem = isModeObj ? pack.objs[item] : pack.blocks[item];
        trayItemThumbnail.src = getPackPath(config.pack, packItem.filename);
        trayItemThumbnail.alt = packItem.bName;
        trayItemThumbnail.dataset["block"] = item;
        trayItemThumbnail.onload = () => {
          if (isModeObj) {
            trayItem.style.width = trayItemThumbnail.style.width =
              `${pack.objs[item].width / (pack.objs[item].height / 50)}px`;
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

    });
  }

  // pack 関係
  function loadPack(packName) {
    return new Promise(resolve => {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", getPackPath(packName, "packinfo.json"));
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        }
      }
      xhr.send(null);
    });
  }
  function getPackPath(packName, file) {
    return `pack/${packName}/${file}`;
  }
} ();
