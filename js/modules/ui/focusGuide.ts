import Vector2 from "./../classes/vector2";
import initDOM from "./../initDOM";
module focusGuide {
  var guideElement:HTMLDivElement;
  initDOM(() => {
    guideElement = document.createElement("div");
    guideElement.id = "guide";
    guideElement.style.position = "fixed";
    guideElement.style.backgroundColor = "rgba(240,0,0,0.6)";
    guideElement.style.pointerEvents = "none";
    document.body.appendChild(guideElement);
  });
  export function focus(screenPos:Vector2, size:Vector2, color:string) {
    guideElement.style.visibility = "visible";
    guideElement.style.left = `${screenPos.x}px`;
    guideElement.style.top = `${screenPos.y}px`;
    guideElement.style.width = `${size.x}px`;
    guideElement.style.height = `${size.y}px`;
    guideElement.style.backgroundColor = color;
  }
  export function hide() {
    guideElement.style.visibility = "hidden";
  }
}
export = focusGuide;
