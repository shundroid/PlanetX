import Vector2 = require("./classes/vector2");
import d = require("./data");
import stage = require("./stage");

module editBlock {
  export class EditBlock {
    constructor(
      public blockName:string,
      public blockPos:Vector2,
      public blockId:number
    ) {}
  }
  var currentEditBlock: EditBlock;
  /**
   * 関数内でupdateEditBlockUI()を呼び出します。
   */
  export function updateEditBlock(editBlock: EditBlock) {
    currentEditBlock = editBlock;
    updateEditBlockUI();
  }
  export function getCurrentEditBlock() {
    return currentEditBlock;
  }
  export function updateEditBlockUI() {
    document.getElementById("ed-name").textContent = `Name: ${currentEditBlock.blockName}`;
    document.getElementById("ed-pos").textContent = `Pos: ${currentEditBlock.blockPos.x}, ${currentEditBlock.blockPos.y}`;
    document.getElementById("ed-id").textContent = `ID: ${currentEditBlock.blockId}`;
    (<HTMLElement>document.getElementsByClassName("ed-attr-view")[0]).innerHTML = "";
    if (stage.blockAttrs.containsBlock(d.editingBlockId)) {
      var l = stage.blockAttrs.getBlock(d.editingBlockId).getAll();
      Object.keys(l).forEach(i => {
        renderAttributeUI(i, stage.blockAttrs.getAttr(d.editingBlockId, i));
      });
    }
  }
  export function renderAttributeUI(attrName: string, inputValue?: string) {
    var addAttr = d.pack.attributes.get(attrName);
    var addElem = document.createElement("section");
    var addInput = document.createElement("input");
    addInput.type = addAttr.type;
    addInput.id = `ed-attr-${attrName}`
    if (typeof addAttr.placeholder !== "undefined") {
      addInput.placeholder = addAttr.placeholder;
    }
    if (typeof inputValue !== "undefined") {
      console.log("hoge");
      addInput.value = inputValue;
    } else if (typeof addAttr.defaultValue !== "undefined") {
      addInput.value = addAttr.defaultValue;
    } else if (addInput.type === "number") {
      addInput.value = "0";
    }
    addInput.addEventListener("change", changeAttrInput);
    var addLabel = document.createElement("label");
    addLabel.htmlFor = addInput.id;
    addLabel.textContent = ` ${addAttr.label}: `;
    var removeButton = document.createElement("button");
    removeButton.innerHTML = '<i class="fa fa-minus"></i>';
    removeButton.classList.add("pla-btn");
    addElem.appendChild(removeButton);
    addElem.appendChild(addLabel);
    addElem.appendChild(addInput);
    document.getElementsByClassName("ed-attr-view")[0].appendChild(addElem);
  }
  
  export function changeAttrInput(e:Event) {
    stage.blockAttrs.update(d.editingBlockId, (<HTMLElement>e.target).id.replace("ed-attr-", ""), (<HTMLInputElement>e.target).value);
  }
}
export = editBlock;