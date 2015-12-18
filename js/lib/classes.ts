/**
 * PlanetでTypescriptを活用するためのクラスを提供します。
 */
module p {
  export class List<list> {
    private data:Object;
    constructor() {
      this.data = {};
    }
    push(index:string, item:list) {
      this.data[index] = item;
    }
    update(index:string, item:list) {
      this.data[index] = item;
    }
    get(index:string):list {
      return this.data[index];
    }
    getAll():Object {
      return this.data;
    }
    remove(index:string) {
      delete this.data[index];
    }
    clear() {
      this.data = {};
    }
    contains(index:string):boolean {
      return this.data.hasOwnProperty(index);
    }
  }
  export class Vector2 {
    constructor(public x:number, public y:number) { }
  }

}
module pack {
  export class pPackModule {
    pack: pPackInfo;
    blocks: p.List<pBlockInfo>;
    objs: p.List<pObjInfo>;
    descriptions: p.List<pDesInfo>;
    abilities:pAbilityInfo;
    constructor(data:Object) {
      this.pack = new pPackInfo(data["pack"]);
      this.blocks = new p.List<pBlockInfo>();
      Object.keys(data["blocks"]).forEach(i => {
        this.blocks.push(i, new pBlockInfo({ bName: data["blocks"][i]["name"], filename: data["blocks"][i]["filename"] }));
      });
      this.objs = new p.List<pObjInfo>();
      Object.keys(data["objs"]).forEach(i => {
        var cur = data["objs"][i];
        if (cur["hidden"]) {
          this.objs.push(i, new pObjInfo({ oName: cur["name"], filename: cur["filename"], width: cur["width"], height: cur["height"], type: cur["type"]}));
        } else {
          this.objs.push(i, new pObjInfo({ oName: cur["name"], filename: cur["filename"], width: cur["width"], height: cur["height"], type: cur["type"], hidden: cur["hidden"] }));
        }
      });
      this.descriptions = new p.List<pDesInfo>();
      Object.keys(data["descriptions"]).forEach(i => {
        var cur = data["descriptions"][i];
        this.descriptions.push(i, new pDesInfo(cur));
      });
      var a1 = new p.List<string>();
      Object.keys(data["abilities"]["selectelement"]).forEach(i => {
        a1.push(i, data["abilities"]["selectelement"][i]);
      });
      var a2 = new p.List<string>();
      Object.keys(data["abilities"]["keys"]).forEach(i => {
        a2.push(i, data["abilities"]["keys"][i]);
      });
      var a3 = new p.List<string>();
      Object.keys(data["abilities"]["types"]).forEach(i => {
        a3.push(i, data["abilities"]["keys"][i]);
      });
      this.abilities = new pAbilityInfo({selectelement: a1, keys: a2, types: a3});
    }
  }
  export class pPackInfo {
    pName:string;
    version:string;
    author:string;
    exportType:string;
    constructor(data:Object) {
      this.pName = data["name"];
      this.version = data["version"];
      this.author = data["author"];
      this.exportType = data["exportType"];
    }
  }
  export class pInfo<T> {
    data:T;
    constructor(p:T) {
      this.data = p;
    }
  }
  export interface IpBlockInfo {
    bName:string;
    filename:string;
  }
  export class pBlockInfo extends pInfo<IpBlockInfo> { }
  export interface IpObjInfo {
    oName:string;
    filename:string;
    type:string;
    width:number;
    height:number;
    hidden?:boolean;
  }
  export class pObjInfo extends pInfo<IpObjInfo> { }
  export interface IpDesInfo {
    description:string;
    type:string;
  }
  export class pDesInfo extends pInfo<IpDesInfo> { }
  export interface IpAblityInfo {
    selectelement: p.List<string>;
    keys: p.List<string>;
    types: p.List<string>;
  }
  export class pAbilityInfo extends pInfo<IpAblityInfo> { }
}
module ev {
  var events:p.List<((ev: any) => any)[]> = new p.List<((ev: any) => any)[]>();
  export function addPlaEventListener(eventName:string, listener: (ev: any) => any) {
    if (eventName.indexOf("|") !== -1) {
      eventName.split("|").forEach(i => {
        addPlaEventListener(i, listener);
      });
    } else {
      if (events.contains(eventName)) {
        var a = events.get(eventName);
        a.push(listener);
        events.update(eventName, a);
      } else {
        events.push(eventName, [listener]);
      }
    }
  }
  export function raiseEvent(eventName:string, e:any) {
    if (events.contains(eventName)) {
      events.get(eventName).forEach(i => {
        // i.call(e); だとeがundefinedで渡されてしまう
        i(e);
      });
    }
  }
}