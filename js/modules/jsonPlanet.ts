import list = require("./classes/list");
import version = require("./version");

/**
 * 構造化した、jsonPlanet関連を提供します。
 */
module jsonPlanet {
  export class jsonBlockItem {
    constructor(
      public blockName:string,
      public posX:number,
      public posY:number,
      public name?:string,
      public attr?:{ [key: string]: string }
    ) {}
    toArray() {
      var result:Array<any> = [this.blockName, this.posX, this.posY];
      if (typeof this.name !== "undefined") {
        result.push(this.name);
      } else {
        result.push("");
      }
      if (typeof this.attr !== "undefined") {
        result.push(this.attr);
      }
      return result;
    }
    static fromArray(ar:Array<any>) {
      var result = new jsonBlockItem(<string>ar[0], <number>ar[1], <number>ar[2], <string>ar[3]);
      // Todo: Attr
      if (typeof ar[4] !== "undefined") {
        // attrが存在する場合
        result.attr = <{[key: string]: string}>ar[4];
      }
      return result;
    }
  }
  export class jsonPlanet {
    constructor(
      public JsonPlanetVersion:number,
      public Stage:Array<Array<jsonBlockItem>> = []
    ) {}
    exportJson() {
      var result:any = {};
      result["JsonPlanetVersion"] = this.JsonPlanetVersion;
      result["Stage"] = [];
      for (var i = 0; i < this.Stage.length; i++) {
        (<Array<any>>result["Stage"])[i] = [];
        this.Stage[i].forEach(j => {
          (<Array<any>>result["Stage"])[i].push(j.toArray());  
        });
      };
      return result;
    }
    static importJson(json:any) {
      var result = new jsonPlanet(json["JsonPlanetVersion"] || version.jsonPlanetVersion);
      var stage = (<Array<any>>json["Stage"]);
      for (var i = 0; i < stage.length; i++) {
        result.Stage[i] = [];
        (<Array<any>>stage[i]).forEach(j => {
          result.Stage[i].push(jsonBlockItem.fromArray(<Array<any>>j));          
        })
      };
      return result;
    }
  }
}
export = jsonPlanet;