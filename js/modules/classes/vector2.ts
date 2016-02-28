export default class Vector2 {
  constructor(public x:number, public y:number) { };
  static get zero() {
    return new Vector2(0, 0);
  }
}
