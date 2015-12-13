/// <reference path="classes.ts" />
/// <reference path="canvas.ts" />

module main {
  document.addEventListener("DOMContentLoaded", init);
  var id = 0;
  var isClear = false;
  var image:HTMLImageElement;
  function init() {
    image = new Image(50, 50);
    image.src = "pack/halstar/images/mapicons/magma.png";
    image.onload = () => {
      setInterval(function() {
        if (!isClear) {
          id = Canvas.render(image, {x: 0, y: 0, width: 50, height: 50});
        } else {
          Canvas.clear(id);
        }
        isClear = !isClear;
      }, 1000);
    }
  }
}