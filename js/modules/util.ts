module util {
  interface oI {
    [index: string]:any;
  }
  export function obj2SelectElem(obj:oI) {
    var result:Array<string> = [];
    Object.keys(obj).forEach(i => {
      if (obj[i].constructor === {}.constructor) {
        result.push('<optgroup label="' + i + '">');
        result.push(obj2SelectElem(<oI>obj[i]));
        result.push('</optgroup>');
      } else {
        result.push('<option value="' + obj[i] + '">' + i + '</option>');
      }
    });
    return result.join("\n");
  }
}
export = util;