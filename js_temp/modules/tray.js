var tray;
(function (tray) {
    var TrayBlockDetails = (function () {
        function TrayBlockDetails(blockName, fileName, label, // 表示するときのブロック名
            width, height) {
            this.blockName = blockName;
            this.fileName = fileName;
            this.label = label;
            this.width = width;
            this.height = height;
        }
        return TrayBlockDetails;
    })();
    tray.TrayBlockDetails = TrayBlockDetails;
    function updateActiveBlock(blockName, fileName, label, width, height) {
        return new TrayBlockDetails(blockName, fileName, label, width, height);
    }
    tray.updateActiveBlock = updateActiveBlock;
    function updateSelectImage() {
        //d.selectImage = 
    }
    tray.updateSelectImage = updateSelectImage;
})(tray || (tray = {}));
module.exports = tray;
