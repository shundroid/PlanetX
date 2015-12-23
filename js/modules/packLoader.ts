/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
import packManager = require("./packManager");
function load(packName:string) {
  return new Promise(resolve => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", packManager.getPackPath(packName) + "packinfo.json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      }
    };
    xhr.send(null);
  });
}
export = load;