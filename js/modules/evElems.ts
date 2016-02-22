import el = require("./elem");

/**
 * .ev-XXと定義された要素に、イベントをつけます。
 */
namespace evElems { 
  export function set(listenerNamespace:any) {
    el.forEachforQuery(".ev-btn", (i) => {
      i.addEventListener("click", listenerNamespace[(<HTMLElement>i).dataset["listener"]]);
    })
    el.forEachforQuery(".ev-input", (i) => {
      var elem = <HTMLInputElement>i;
      if (typeof elem.dataset["default"] !== "undefined") {
        elem.value = elem.dataset["default"];
      }
      if (typeof elem.dataset["change"] !== "undefined") {
        elem.addEventListener("change", listenerNamespace[elem.dataset["change"]]);
      }
    });
  }
}
export = evElems;