var util;
(function (util) {
    function obj2SelectElem(obj) {
        var result = [];
        Object.keys(obj).forEach(function (i) {
            if (obj[i].constructor === {}.constructor) {
                result.push('<optgroup label="' + i + '">');
                result.push(obj2SelectElem(obj[i]));
                result.push('</optgroup>');
            }
            else {
                result.push('<option value="' + obj[i] + '">' + i + '</option>');
            }
        });
        return result.join("\n");
    }
    util.obj2SelectElem = obj2SelectElem;
})(util || (util = {}));
module.exports = util;
