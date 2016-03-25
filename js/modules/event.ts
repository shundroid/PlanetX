import list from "./classes/list";

/**
 * 廃止の方向で・・
 * - どの関数が呼ばれているのかなどがわかりにくい
 * - observe？
 */
var eventHandlers = new list<Array<(e:any, eventName:string)=>void>>();
export function addEventListener(eventName:string, fn:(e:any, eventName:string)=>void):void;
export function addEventListener(eventName:Array<string>, fn:(e:any, eventName:string)=>void):void; 
export function addEventListener(eventName:any, fn:(e:any, eventName:string)=>void):void {
  if (eventName instanceof Array) {
    (<Array<string>>eventName).forEach(event => {
      addEventListener(event, fn);
    });
  } else if (typeof eventName === "string") {
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
