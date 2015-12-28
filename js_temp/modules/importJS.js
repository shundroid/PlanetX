function importJS(src) {
    var elem = document.createElement("script");
    elem.src = src;
    return elem;
}
module.exports = importJS;
