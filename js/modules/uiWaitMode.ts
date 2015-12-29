module uiWaitMode {
  export function start() {
    document.getElementById("pla-canvas").style.cursor = "wait";
  }
  export function end() {
    document.getElementById("pla-canvas").style.cursor = "crosshair";
  }
}
export = uiWaitMode;