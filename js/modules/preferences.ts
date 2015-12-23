module preferences {
  export var defaultPackName:string = "halstar";
  export module stage {
    export class StageEffects {
      public skybox:string;
      constructor() {
        this.skybox = "";
      }
    }
    export var stageEffects:StageEffects = new StageEffects();
  }
}
export = preferences;