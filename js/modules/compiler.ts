import jsonPlanet = require("./jsonPlanet");
import version = require("./version");

module compiler {
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