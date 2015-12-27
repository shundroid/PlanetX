/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
import initDOM = require("./initDOM");
module ui {
  function init() {
    onBtnClickhandlerList = new Array<(target:Node,e:MouseEvent)=>void>();
  }
  var onBtnClickhandlerList:Array<(target:Node,e:MouseEvent)=>void>;
  export function onBtnClick(fn:(target:Node,e:MouseEvent)=>void) {
    onBtnClickhandlerList.push(fn);
  }
  initDOM(() => {
    var elems = document.querySelectorAll(".ui-btn");
    for (var i = 0; i < elems.length; i++) {
      (<Node>elems.item(i)).addEventListener("click", (e:MouseEvent) => {
        onBtnClickhandlerList.forEach(j => {
          j(elems.item(i), e);
        });
      });
    }
  });
  export function setSkybox(fileName:string) {
    document.body.style.backgroundImage = `url('${fileName}')`; 
  }
  export function initUI() {
    
  }
  export function initTrayBlock() {
    return new Promise(() => {
      
    });
  }
  export function initTrayObj() {
    return new Promise(() => {
      
    });
  }
  export function changeLoadingStatus(status:string) {
    
  }
  
  export function hideLoading() {
    
  }
  
  export function changeActiveBlock(blockName:string) {
    
  }
  init();
}
export = ui;
