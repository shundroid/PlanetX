/// <reference path="classes.ts" />
/**
 * 簡潔に書くためのUtility
 */
var util;
(function (util) {
    /**
     * 面倒くさい処理をせず、簡潔にHTMLImageElementインスタンスを生成します。
     */
    function QuickImage(filename) {
        var a = new Image();
        a.src = filename;
        return a;
    }
    util.QuickImage = QuickImage;
    function makeNoJaggyURL(filename, size) {
        var a = new Image();
        a.src = filename;
        var width = (a.width + size.x) / 2;
        var height = (a.height + size.y) / 2;
        var newC, ctx;
        var saveURL;
        newC = document.createElement("canvas");
        newC.width = width;
        newC.height = height;
        ctx = newC.getContext("2d");
        ctx.drawImage(a, 0, 0, width, height);
        return newC.toDataURL("image/png");
    }
    util.makeNoJaggyURL = makeNoJaggyURL;
    /**
     * いっぺんにたくさんのlogを飛ばせるが、飛ばした元関数がわかりにくくなるのが欠点。
     */
    function log() {
        var logs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            logs[_i - 0] = arguments[_i];
        }
        logs.forEach(function (i) {
            console.log(i);
        });
    }
    util.log = log;
    function addEventListenerforQuery(query, event, listener) {
        var elems = document.querySelectorAll(query);
        for (var i = 0; i < elems.length; i++) {
            elems[i].addEventListener(event, listener);
        }
    }
    util.addEventListenerforQuery = addEventListenerforQuery;
})(util || (util = {}));
