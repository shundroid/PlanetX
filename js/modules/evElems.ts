import {forEachforQuery} from "./elem";

/**
 * .ev-XXと定義された要素に、イベントをつけます。
 */
export default function set(listenerNamespace:any) {
  forEachforQuery(".ev-btn", (i) => {
    i.addEventListener("click", listenerNamespace[(<HTMLElement>i).dataset["listener"]]);
  })
  forEachforQuery(".ev-input", (i) => {
    var elem = <HTMLInputElement>i;
    if (typeof elem.dataset["default"] !== "undefined") {
      elem.value = elem.dataset["default"];
    }
    if (typeof elem.dataset["change"] !== "undefined") {
      elem.addEventListener("change", listenerNamespace[elem.dataset["change"]]);
    }
  });
}
