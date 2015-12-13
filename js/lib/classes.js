/**
 * PlanetでTypescriptを活用するためのクラスを提供します。
 */
var p;
(function (p) {
    var List = (function () {
        function List() {
            this.data = {};
        }
        List.prototype.push = function (index, item) {
            this.data[index] = item;
        };
        List.prototype.update = function (index, item) {
            this.data[index] = item;
        };
        List.prototype.get = function (index) {
            return this.data[index];
        };
        List.prototype.getAll = function () {
            return this.data;
        };
        List.prototype.remove = function (index) {
            delete this.data[index];
        };
        List.prototype.clear = function () {
            this.data = {};
        };
        List.prototype.contains = function (index) {
            return this.data.hasOwnProperty(index);
        };
        return List;
    })();
    p.List = List;
    var Vector2 = (function () {
        function Vector2(x, y) {
            this.x = x;
            this.y = y;
        }
        return Vector2;
    })();
    p.Vector2 = Vector2;
    var plaEvent = (function () {
        function plaEvent() {
        }
        plaEvent.empty = function () {
            return new this();
        };
        return plaEvent;
    })();
    p.plaEvent = plaEvent;
})(p || (p = {}));
