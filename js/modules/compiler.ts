import list = require("./classes/list");
import prefabMini = require("./classes/prefabMini")
import stage = require("./stage");
import d = require("./data");
import jsonPlanet = require("./jsonPlanet");
import version = require("./version");

module compiler {

  export function getLangAuto(oneLine:string):compileLangs {
    switch (oneLine) {
      case "//:csv":
        return compileLangs.CSV;
        break;
    }
    return compileLangs.unknown;
  }
  export enum compileLangs {
    CSV,
    JsWithPla,
    yaml,
    unknown,
    auto
  }
  export class centerLang {
    constructor(public prefabList:list<prefabMini>, public header:string, public footer:string, public effects:stage.StageEffects, public attrList:list<list<string>>) {};
  }
  export function toCenterLang(mode:compileLangs, text:string):centerLang {
    switch (mode) {
      case compileLangs.CSV:
        return CSV2CenterLang(text);
        break;
    }
    return null;
  }
  export function CSV2CenterLang(text:string) {
    var lines = text.replace(/;/g, "").split("\n");
    var result = new list<prefabMini>();
    var header:Array<string> = [];
    var footer:Array<string> = [];
    var effects = new stage.StageEffects();
    var mode = 0; // 0: normal, 1: header, 2: footer
    var attrs = new list<list<string>>();
    // Attr setup
    var l = d.pack.attributes.getAll();
    var attrFormatList:Array<string> = [];
    Object.keys(l).forEach(i => {
      var formatListItem:Array<string> = [];
      attrFormatList.push(formatListItem.join(","));
    });
    lines.forEach(i => {
      if (mode === 0) {
        if (i === "//:header") {
          mode = 1;
        } else if (i === "//:footer") {
          mode = 2;
        } else {
          i = i.replace(/ /g, "");
          if (i === "") return;
          if (i.substring(0, 2) === "//") return;
          var items = i.split(",");
          if (items[0].substring(0, 1) === "*") {
            if (items[0] === "*skybox") {
              effects.skybox = items[1];
            } else {
              if (Object.keys(d.pack.attributes.getAll()).indexOf(items[1]) !== -1) {
                var lst:list<string>;
                if (attrs.contains(items[2])) {
                  lst = attrs.get(items[2]);
                } else {
                  lst = new list<string>();
                }
                lst.push(items[1], items[3])
                attrs.push(items[2], lst);
              }
            }
            return;
          }
          result.push(i, new prefabMini(parseInt(items[1]), parseInt(items[2]), items[0]));
        }
      } else if (mode === 1) {
        if (i === "//:/header") { mode = 0; return; }
        header.push(i);
      } else if (mode === 2) {
        if (i === "//:/footer") { mode = 0; return; }
        footer.push(i);
      }
    });
    return new centerLang(result, header.join("\n"), footer.join("\n"), effects, attrs);
  }
  export function old2CSV(old:string):string {
    var lines = old.split("\n");
    var result:Array<string> = [];
    var id = 0;
    var mode = -1; // -1: system_header, 0: header, 1: normal, 2: footer, 3: return
    var count = 0;
    result.push("//:csv");
    lines.forEach(i => {
      if (i === "") return;
      if (mode === -1) {
        count++;
        if (count === 5) {
          mode++;
        }
      } else if (mode === 0) {
        if (count === 5 && i === "// stageCTRL::edit not_header") {
          mode++;
        } else if (count === 5) {
          result.push("//:header");
          result.push(i);
          count++;
        } else {
          if (i === "// stageCTRL::edit /header") {
            result.push("//:/header");
            mode++;
          } else {
            result.push(i);
          }
        }
      } else if (mode === 1) {
        if (i === "// stageCTRL::edit footer") {
          mode++;
          count = 10;
          return;
        } else if (i === "// stageCTRL::edit not_footer") {
          mode += 2;
          return;
        }
        if (i.substring(0, 1) === "*") {
          if (i.indexOf("*skybox,") !== -1) {
            result.push(i);
          } else {
            result.push(i); //TODO
          }
          return;
        }
        if (i.substring(0, 1) === ":") return;
        i = i.replace(/ /g, "");
        if (i.substring(0, 2) === "//") return;
        i = i.split("=")[0];
        var items = i.split(",");
        items[2] = (-parseInt(items[2])).toString();
        result.push([[items[0], items[1], items[2]].join(","), id++].join("="));
      } else if (mode === 2) {
        if (count === 10) {
          count++;
          result.push("//:footer");
          result.push(i);
        } else {
          if (i ===  "// stageCTRL::edit /footer") {
            result.push("//:/footer");
            mode++;
          } else {
            result.push(i);
          }
        }
      }
    });
    return result.join("\n");
  }
  
  export function csv2Json(csv:string):jsonPlanet.jsonPlanet {
    var result = new jsonPlanet.jsonPlanet(version.jsonPlanetVersion);
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
      result.Stage[0].push(new jsonPlanet.jsonBlockItem(items[0], parseInt(items[1]), parseInt(items[2]), nameAndblock[1]));
    });
    return result;
  }
}
export = compiler;