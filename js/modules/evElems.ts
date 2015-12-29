import initDOM = require("./initDOM");
import el = require("./elem");
import ui = require("./../ui");
module evElems {
  initDOM(() => {
    el.forEachforQuery(".ev-btn", (i) => {
      i.addEventListener("click", (<any>ui)[(<HTMLElement>i).dataset["listener"]]);
    })
    el.forEachforQuery(".ev-input", (i) => {
      var elem = <HTMLInputElement>i;
      if (typeof elem.dataset["default"] !== "undefined") {
        elem.value = elem.dataset["default"];
      }
    });
  });
}