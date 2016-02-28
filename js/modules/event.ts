import list from "./classes/list";

/**
 * 廃止の方向で・・
 * - どの関数が呼ばれているのかなどがわかりにくい
 * - observe？
 */
var eventHandlers = new list<Array<(e:any, eventName:string)=>void>>();
export function addEventListener(eventName:string, fn:(e:any, eventName:string)=>void) {
  if (eventName.indexOf("|") !== -1) {
    eventName.split("|").forEach(i => {
      addEventListener(i, fn);
    });
  } else {
    if (eventHandlers.contains(eventName)) {
      eventHandlers.get(eventName).push(fn);
    } else {
      eventHandlers.push(eventName, [fn]);
    }
  }
}
export function raiseEvent(eventName:string, params:any) {
  if (eventHandlers.contains(eventName)) {
    eventHandlers.get(eventName).forEach(i => {
      i(params, eventName);
    });
  }
}
