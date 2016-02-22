import list from "./classes/list";
import version = require("./version");

/**
 * 構造化した、jsonPlanet関連を提供します。
 */
namespace jsonPlanet {
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
      public jsonPlanetVersion:number,
      public stage:Array<Array<jsonBlockItem>> = [],
      public skyboxes: Array<string> = []
    ) {}
    exportJson() {
      var result:any = {};
      result["jsonPlanetVersion"] = this.jsonPlanetVersion;
      if (this.skyboxes !== []) {
        result["skyboxes"] = this.skyboxes;
      }
      result["stage"] = [];
      for (var i = 0; i < this.stage.length; i++) {
        (<Array<any>>result["stage"])[i] = [];
        this.stage[i].forEach(j => {
          (<Array<any>>result["stage"])[i].push(j.toArray());  
        });
      };
      return result;
    }
    static importJson(json:any) {
      var result = new jsonPlanet(json["jsonPlanetVersion"] || version.jsonPlanetVersion);
      
      // stage
      var stage = (<Array<any>>json["stage"]);
      for (var i = 0; i < stage.length; i++) {
        result.stage[i] = [];
        (<Array<any>>stage[i]).forEach(j => {
          result.stage[i].push(jsonBlockItem.fromArray(<Array<any>>j));          
        })
      };
      
      // skyboxes
      var skyboxes = (<Array<string>>json["skyboxes"]);
      var skyboxCounter = 0;
      skyboxes.forEach(i => {
        result.skyboxes[skyboxCounter++] = i;
      });
      return result;
    }
    /**
     * 昔はCSVを使っていたものです・・
     */
    static fromCSV(csv:string):jsonPlanet {
      var result = new jsonPlanet(version.jsonPlanetVersion, [[]]);
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
        result.stage[0].push(new jsonBlockItem(items[0], parseInt(items[1]), parseInt(items[2]), nameAndblock[1]));
      });
      return result;
    }
  }
}
export = jsonPlanet;