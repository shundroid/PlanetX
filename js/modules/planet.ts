import stage = require("./stage");
module planet {
  export function exportText():string {
    return "";
  }
  export function importText(file:string) {
    return new stage.StageEffects();
  }
  export var header:string;
  export var footer:string;
}
export = planet;