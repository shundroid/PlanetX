export class StageEffects {
  public skyboxes:string[];
  constructor() {
    this.skyboxes = [ "" ];
  }
}
export var stageEffects:StageEffects = new StageEffects();
export function setStageEffects(effect: StageEffects) {
  stageEffects = effect;
}