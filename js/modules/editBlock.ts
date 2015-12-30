import Vector2 = require("./classes/vector2");
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
  }
}
export = editBlock;