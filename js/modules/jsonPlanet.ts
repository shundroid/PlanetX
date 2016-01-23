import list = require("./classes/list");
import version = require("./version");

/**
 * 構造化した、jsonPlanet関連を提供します。
 */
module jsonPlanet {
  export class jsonBlockAttr {
    constructor(
      public blockMode?:string
    ) {}
    toJson() {
      var result:any = {};
      if (typeof this.blockMode !== "undefined") {
        result["blockMode"] = this.blockMode;
      }
      return result;
    }
  }
  export class jsonBlockItem {
    constructor(
      public blockName:string,
      public posX:number,
      public posY:number,
      public name?:string,
      public attr?:jsonBlockAttr
    ) {}
    toArray() {
      var result:Array<any> = [this.blockName, this.posX, this.posY];
      if (typeof this.name !== "undefined") {
        result.push(this.name);
      } else {
        result.push("");
      }
      if (typeof this.attr !== "undefined") {
        result.push(this.attr.toJson());
      }
      return result;
    }
    static fromArray(ar:Array<any>) {
      var result = new jsonBlockItem(<string>ar[0], <number>ar[1], <number>ar[2], <string>ar[3]);
      // Todo: Attr
      return result;
    }
  }
  export class jsonPlanet {
    constructor(
      public JsonPlanetVersion:number,
      public Stage:Array<jsonBlockItem> = []
    ) {}
    exportJson() {
      var result:any = {};
      result["JsonPlanetVersion"] = this.JsonPlanetVersion;
      result["Stage"] = [];
      this.Stage.forEach(i => {
        (<Array<any>>result["Stage"]).push(i.toArray());
      });
      return result;
    }
    static importJson(json:any) {
      var result = new jsonPlanet(json["JsonPlanetVersion"] || version.jsonPlanetVersion);
      (<Array<any>>json["Stage"]).forEach(i => {
        result.Stage.push(jsonBlockItem.fromArray(i));
      });
      return result;
    }
  }
}
export = jsonPlanet;