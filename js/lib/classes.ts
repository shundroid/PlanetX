/**
 * PlanetでTypescriptを活用するためのクラスを提供します。
 */
module p {
  export class List<list> {
    private data:Object;
    constructor() {
      this.data = {};
    }
    push(index:string, item:list) {
      this.data[index] = item;
    }
    update(index:string, item:list) {
      this.data[index] = item;
    }
    get(index:string):list {
      return this.data[index];
    }
    getAll():Object {
      return this.data;
    }
    remove(index:string) {
      delete this.data[index];
    }
    clear() {
      this.data = {};
    }
    contains(index:string):boolean {
      return this.data.hasOwnProperty(index);
    }
  }
  export class Vector2 {
    x:number;
    y:number;
    constructor(x:number, y:number) {
      this.x = x;
      this.y = y;
    }
  }
  export class plaEvent {
    constructor() {
      
    }
    static empty() {
      return new this();
    }
  }
}