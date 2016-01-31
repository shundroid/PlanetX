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
    /**
     * 昔はCSVを使っていたものです・・
     */
    static fromCSV(csv:string):jsonPlanet {
      var result = new jsonPlanet(version.jsonPlanetVersion);
      var lines = csv.split("\n");
      lines.forEach(i => {
        if (i === "") {
          return;
        }
        if (i.substring(0, 1) === "*") {
          return;
        }
        if (i.substring(0, 2) === "//") {
          return;
        }
        var nameAndblock = i.split("=");
        var items = nameAndblock[0].split(",");
        result.Stage[0].push(new jsonBlockItem(items[0], parseInt(items[1]), parseInt(items[2]), nameAndblock[1]));
      });
      return result;
    }
  }
}
export = jsonPlanet;