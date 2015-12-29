import list = require("./classes/list");
module event {
  var eventHandlers = new list<Array<(e:any)=>void>>();
  export function addEventListener(eventName:string, fn:(e:any)=>void) {
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
        i(params);
      });
    }
  }
}
export = event;