import Vector2 = require("./classes/vector2");
import d = require("./data");
import stage = require("./stage");

/**
 * Inspector内、EditBlockのデータ化
 */
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
  
  /**
   * editingのblockが変わった時など、InspectorのEditBlockを更新する必要があるときに呼び出してください。
   * UIを変更します。
   */
  export function updateEditBlockUI() {
    document.getElementById("ed-name").textContent = `Name: ${currentEditBlock.blockName}`;
    document.getElementById("ed-pos").textContent = `Pos: ${currentEditBlock.blockPos.x}, ${currentEditBlock.blockPos.y}`;
    document.getElementById("ed-id").textContent = `ID: ${currentEditBlock.blockId}`;
    (<HTMLElement>document.getElementsByClassName("ed-attr-view")[0]).innerHTML = "";
    if (stage.blockAttrs.containsBlock(d.editingBlockId)) {
      var l = stage.blockAttrs.getBlock(d.editingBlockId);
      Object.keys(l).forEach(i => {
        var attr = stage.blockAttrs.getAttr(d.editingBlockId, parseInt(i));
        renderAttributeUI(parseInt(i), attr.attrVal, attr.attrName);
      });
    }
  }
  
  // Todo: [x] attrNameをattrIdに変える
  // Todo: オーバーロード export function renderAttributeUI(attrId: number, attr: stage.Attr);
  export function renderAttributeUI(attrId: number, inputName?: string, inputValue?: string) {
    // Attrをグループ化しておく
    var elemGroup = document.createElement("section");
    elemGroup.id = `ed-attr-field-${attrId}`;

    // attrのNameを指定するInput (途中)
    var nameElem = document.createElement("input");
    nameElem.type = "text";
    nameElem.id = `ed-attr-name-${attrId}`;
    nameElem.classList.add("ed-attr-name");
    nameElem.placeholder = "name";
    if (typeof inputName !== "undefined") {
      nameElem.value = inputName;
    }
    nameElem.addEventListener("change", changeAttrName);

    // valueに当たるInput
    var valElem = document.createElement("input");
    valElem.type = "text";
    valElem.id = `ed-attr-${attrId}`;
    valElem.classList.add("ed-attr-val");
    valElem.placeholder = "value";
    if (typeof inputValue !== "undefined") {
      valElem.value = inputValue;
    }

    // 値が変わったとき
    valElem.addEventListener("change", changeAttrVal);

    // attrの削除
    var removeButton = document.createElement("button");
    removeButton.innerHTML = '<i class="fa fa-minus"></i>';
    removeButton.classList.add("pla-btn");
    removeButton.id = `ed-attr-remove-${attrId}`;
    removeButton.addEventListener("click", clickRemoveAttr);

    // elemGroupへ追加。順番に注意!
    elemGroup.appendChild(removeButton);
    elemGroup.appendChild(nameElem);
    elemGroup.appendChild(document.createTextNode(":"));
    elemGroup.appendChild(valElem);
    // 最後にattr-viewにすべて追加
    document.getElementsByClassName("ed-attr-view")[0].appendChild(elemGroup);
  }
  
  export function changeAttrVal(e:Event) {
    console.log(stage.blockAttrs.getAll());
    console.log(parseInt((<HTMLElement>e.target).id.replace("ed-attr-", "")));
    // Todo: [x] blockAttrsで、inputNameかinputValかどちらかを変えられるように、オーバーロードを作る
    stage.blockAttrs.update(d.editingBlockId, parseInt((<HTMLElement>e.target).id.replace("ed-attr-", "")), { attrVal: (<HTMLInputElement>e.target).value });
  }
  
  export function changeAttrName(e:Event) {
    stage.blockAttrs.update(d.editingBlockId, parseInt((<HTMLElement>e.target).id.replace("ed-attr-name-", "")), { attrName: (<HTMLInputElement>e.target).value });
  }
  
  export function clickRemoveAttr(e:MouseEvent) {
    var attrId = parseInt((<HTMLElement>e.target).id.replace("ed-attr-remove-", ""));
    stage.blockAttrs.removeAttr(d.editingBlockId, attrId);
    document.getElementsByClassName("ed-attr-view")[0].removeChild(document.getElementById(`ed-attr-field-${attrId}`));
  }
}
export = editBlock;