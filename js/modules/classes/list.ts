export default class List<list> {
    private data:Object;
    constructor() {
      this.data = {};
    }
    push(index:string, item:list) {
      (<any>this.data)[index] = item;
    }
    update(index:string, item:list) {
      (<any>this.data)[index] = item;
    }
    get(index:string):list {
      return (<any>this.data)[index];
    }
    getAll():Object {
      return this.data;
    }
    remove(index:string) {
      delete (<any>this.data)[index];
    }
    clear() {
      this.data = {};
    }
    contains(index:string):boolean {
      return this.data.hasOwnProperty(index);
    }
    toSimple():Object {
      return this.data;
    }
}
