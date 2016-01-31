import list = require("./classes/list");
import prefabMini = require("./classes/prefabMini")
import stage = require("./stage");
import d = require("./data");
import jsonPlanet = require("./jsonPlanet");
import version = require("./version");

module compiler {

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