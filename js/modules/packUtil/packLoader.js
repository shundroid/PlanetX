/// <reference path="../../../typings/es6-promise/es6-promise.d.ts" />
var packManager = require("./packManager");
function load(packName) {
    return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", packManager.getPackPath(packName) + "packinfo.json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            }
        };
        xhr.send(null);
    });
}
module.exports = load;
