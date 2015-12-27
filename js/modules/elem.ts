module elem {
  export function addEventListenerforQuery(query:string, eventName:string, listener:(...param:any[])=>void) {
    forEachforQuery(query, (i) => {
      i.addEventListener(eventName, listener);
    });
  }
  export function forEachforQuery(query:string, listener:(i:Element)=>void) {
    Array.prototype.forEach.call(document.querySelectorAll(query), listener);
  }
}
export = elem;