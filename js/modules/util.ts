/**
 * Todo: 必要性
 * - react?
 * - packManager.ts の viewに当たる？
 */

export default function obj2SelectElem(obj:{[index: string]:any}) {
  var result:Array<string> = [];
  Object.keys(obj).forEach(i => {
    if (obj[i].constructor === {}.constructor) {
      result.push('<optgroup label="' + i + '">');
      result.push(obj2SelectElem(obj[i]));
      result.push('</optgroup>');
    } else {
      result.push('<option value="' + obj[i] + '">' + i + '</option>');
    }
  });
  return result.join("\n");
}
