var initDOM = require("./initDOM");
var ui;
(function (ui) {
    function init() {
        onBtnClickhandlerList = new Array();
    }
    var onBtnClickhandlerList;
    function onBtnClick(fn) {
        onBtnClickhandlerList.push(fn);
    }
    ui.onBtnClick = onBtnClick;
    initDOM(function () {
        var elems = document.querySelectorAll(".ui-btn");
        for (var i = 0; i < elems.length; i++) {
            elems.item(i).addEventListener("click", function (e) {
                onBtnClickhandlerList.forEach(function (j) {
                    j(elems.item(i), e);
                });
            });
        }
    });
    init();
})(ui || (ui = {}));
module.exports = ui;
