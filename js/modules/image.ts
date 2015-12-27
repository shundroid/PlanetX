import Vector2 = require("./vector2");
function image(url:string, isNoJaggy?:boolean, size?:Vector2):HTMLImageElement {
  var a = new Image();
  a.src = url;
  if (isNoJaggy) {
    var width = (a.width + size.x) / 2;
    var height = (a.height + size.y) / 2;
    var newC:HTMLCanvasElement, ctx:CanvasRenderingContext2D;
    var saveURL:string;
    newC = document.createElement("canvas");
    newC.width = width;
    newC.height = height;
    ctx = newC.getContext("2d");
    ctx.drawImage(a, 0, 0, width, height);
    return image(newC.toDataURL("image/png"));
  } else {
    return a;
  }
}
export = image;