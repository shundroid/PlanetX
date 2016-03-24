import Vector2 from "./classes/vector2";

/**
 * 画像処理系はここにまとめたい。(makePrefabDataUrls.ts)
 */
export default function image(url:string, isNoJaggy?:boolean, size?:Vector2):HTMLImageElement {
  var a = new Image();
  a.src = url;
  if (isNoJaggy) {
    var width = (a.width + size.x) / 2;
    var height = (a.height + size.y) / 2;
    var newC:HTMLCanvasElement;
    var saveURL:string;
    newC = document.createElement("canvas");
    newC.width = width;
    newC.height = height;
    var ctx = newC.getContext("2d");
    ctx.drawImage(a, 0, 0, width, height);
    return image(newC.toDataURL("image/png"));
  } else {
    return a;
  }
}
