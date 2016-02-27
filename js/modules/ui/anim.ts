/// <reference path="../../definitely/move.d.ts" />
export function showTrayFull() {
  move(".pla-footer").set("height", "100%").duration("0.5s").end();
}
export function hideTrayFull() {
  move(".pla-footer").set("height", "50px").duration("0.5s").end();
}
export function showInspector() {
  move(".pla-inspector")
    .set("left", "80%")
    .duration("0.5s")
    .end();
}
export function hideInspector() {
  move(".pla-inspector")
    .set("left", "100%")
    .duration("0.5s")
    .end();
}
export function hideLoading() {
  move(".loading")
    .set("opacity", 0)
    .duration("1s")
    .then()
    .set("display", "none")
    .pop()
    .end();
}

