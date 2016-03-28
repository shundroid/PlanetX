var canvasModule = {};

// main.js から ctx、canvasElem へはアクセスしないようにする
var canvasElem;
var ctx;

canvasModule.canvasRect = {};

// initializeCanvas という名前にするのではなく、
// この中で処理がわかれている部分は 別関数にしたい。
// -> attachListeners resizeCanvas disableSmoothing
canvasModule.initializeCanvas = function () {
  // ui.setupCanvas
  canvasElem = document.getElementById("pla-canvas");
  canvasElem.addEventListener("mousedown", (e) => { on.raise("mousedownCanvas") });
  canvasElem.addEventListener("mousemove", (e) => {
    if (e.buttons === 1) {
      on.raise("mousemoveCanvas");
    } else {
      on.raise("hoverCanvas");
    }
  });
  canvasElem.addEventListener("mouseup", (e) => { on.raise("mouseupCanvas") });

  // リサイズ処理を行う
  canvas.resizeCanvas();

  // canvas.ts initDOM
  if (canvasElem && canvasElem.getContext) {
    // 次 : ここから
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
  }

};

// イベントハンドラ (window.addEventListener("resize", ...)) は main.js に書くのが望ましい。
// -> いや、main.js からは、window などの Core にはアクセスせず、ラップしたい
canvasModule.resizeCanvas = function () {
  canvasElem.width = window.innerWidth;
  canvasElem.height = window.innerHeight;
  canvasModule.updateCanvasRect();
};

canvasModule.updateCanvasRect = function () {
  canvasModule.canvasRect = { x: 0, y: 0, width: canvasElem.width, height: canvasElem.height };
}
module.exports = canvasModule;