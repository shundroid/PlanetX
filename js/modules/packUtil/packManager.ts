import list = require("./../list");
module pack {
  export function getPackPath(packName:string) {
    return "pack/" + packName + "/";
  }
  
  export class packModule {
    pack: packInfo;
    blocks: list<blockInfo>;
    objs: list<objInfo>;
    descriptions: list<desInfo>;
    abilities:abilityInfo;
    skyboxes:skyboxInfoList;
    editor:packEditorInfo;
    constructor(data:Object) {
      this.pack = new packInfo((<any>data)["pack"]);
      this.blocks = new list<blockInfo>();
      Object.keys((<any>data)["blocks"]).forEach(i => {
        this.blocks.push(i, new blockInfo({ bName: (<any>data)["blocks"][i]["name"], filename: (<any>data)["blocks"][i]["filename"] }));
      });
      this.objs = new list<objInfo>();
      Object.keys((<any>data)["objs"]).forEach(i => {
        var cur = (<any>data)["objs"][i];
        if (cur["hidden"]) {
          this.objs.push(i, new objInfo({ oName: cur["name"], filename: cur["filename"], width: cur["width"], height: cur["height"], type: cur["type"]}));
        } else {
          this.objs.push(i, new objInfo({ oName: cur["name"], filename: cur["filename"], width: cur["width"], height: cur["height"], type: cur["type"], hidden: cur["hidden"] }));
        }
      });
      this.descriptions = new list<desInfo>();
      Object.keys((<any>data)["descriptions"]).forEach(i => {
        var cur = (<any>data)["descriptions"][i];
        this.descriptions.push(i, new desInfo(cur));
      });
      var a1 = new list<string>();
      Object.keys((<any>data)["abilities"]["selectelement"]).forEach(i => {
        a1.push(i, (<any>data)["abilities"]["selectelement"][i]);
      });
      var a2 = new list<string>();
      Object.keys((<any>data)["abilities"]["keys"]).forEach(i => {
        a2.push(i, (<any>data)["abilities"]["keys"][i]);
      });
      var a3 = new list<string>();
      Object.keys((<any>data)["abilities"]["types"]).forEach(i => {
        a3.push(i, (<any>data)["abilities"]["keys"][i]);
      });
      this.abilities = new abilityInfo({selectelement: a1, keys: a2, types: a3});
      this.skyboxes = new skyboxInfoList();
      Object.keys((<any>data)["skyboxes"]).forEach(i => {
        this.skyboxes.push(i, new skyboxInfo((<any>data)["skyboxes"][i]));
      })
      this.editor = new packEditorInfo((<any>data)["editor"]["defaultSkybox"]);
    }
  }
  export class packEditorInfo {
    constructor(public defaultSkybox:string) {}
  }
  export class packInfo {
    pName:string;
    version:string;
    author:string;
    exportType:string;
    constructor(data:Object) {
      this.pName = (<any>data)["name"];
      this.version = (<any>data)["version"];
      this.author = (<any>data)["author"];
      this.exportType = (<any>data)["exportType"];
    }
  }
  export class packItem<T> {
    data:T;
    constructor(p:T) {
      this.data = p;
    }
  }
  export interface IBlockInfo {
    bName:string;
    filename:string;
  }
  export class blockInfo extends packItem<IBlockInfo> { }
  export interface IObjInfo {
    oName:string;
    filename:string;
    type:string;
    width:number;
    height:number;
    hidden?:boolean;
  }
  export class objInfo extends packItem<IObjInfo> { }
  export interface IDesInfo {
    description:string;
    type:string;
  }
  export class desInfo extends packItem<IDesInfo> { }
  export interface IAblityInfo {
    selectelement: list<string>;
    keys: list<string>;
    types: list<string>;
  }
  export class abilityInfo extends packItem<IAblityInfo> { }
  export interface ISkyboxInfo {
    filename: string;
    label: string;
  }
  export class skyboxInfo extends packItem<ISkyboxInfo> {  }
  export class skyboxInfoList extends list<skyboxInfo> {
    constructor() {
      super();
    }
    toSimple():Object {
      var result = {};
      Object.keys(this.getAll()).forEach(i => {
        (<any>result)[this.get(i).data.label] = i;
      });
      return result;
    }
  }
}
export = pack;