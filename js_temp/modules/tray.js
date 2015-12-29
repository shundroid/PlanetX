var TrayBlockDetails = require("./classes/trayBlockDetails");
var d = require("./data");
var tray;
(function (tray) {
    function updateActiveBlock(blockName, fileName, label, width, height) {
        console.log(d);
        var w = width || d.defaultBlockSize;
        var h = height || d.defaultBlockSize;
        d.selectBlock = new TrayBlockDetails(blockName, fileName, label, w, h);
        console.log(d.defaultBlockSize);
    }
    tray.updateActiveBlock = updateActiveBlock;
    function updateSelectImage() {
        //d.selectImage = 
    }
    tray.updateSelectImage = updateSelectImage;
})(tray || (tray = {}));
module.exports = tray;
