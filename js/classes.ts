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
  }
}