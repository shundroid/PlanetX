///<reference path="classes.ts" />
var compiler;
(function (compiler) {
    function getLangAuto(oneLine) {
        switch (oneLine) {
            case "//:csv":
                return compileLangs.CSV;
                break;
        }
        return compileLangs.unknown;
    }
    compiler.getLangAuto = getLangAuto;
    (function (compileLangs) {
        compileLangs[compileLangs["CSV"] = 0] = "CSV";
        compileLangs[compileLangs["JsWithPla"] = 1] = "JsWithPla";
        compileLangs[compileLangs["yaml"] = 2] = "yaml";
        compileLangs[compileLangs["unknown"] = 3] = "unknown";
        compileLangs[compileLangs["auto"] = 4] = "auto";
    })(compiler.compileLangs || (compiler.compileLangs = {}));
    var compileLangs = compiler.compileLangs;
    var centerLang = (function () {
        function centerLang(prefabList, header, footer, effects) {
            this.prefabList = prefabList;
            this.header = header;
            this.footer = footer;
            this.effects = effects;
        }
        ;
        return centerLang;
    })();
    compiler.centerLang = centerLang;
    function toCenterLang(mode, text) {
        switch (mode) {
            case compileLangs.CSV:
                return CSV2CenterLang(text);
                break;
        }
        return null;
    }
    compiler.toCenterLang = toCenterLang;
    function CSV2CenterLang(text) {
        var lines = text.replace(/;/g, "").split("\n");
        var result = new p.List();
        var header = [];
        var footer = [];
        var effects = new p.stageSettings();
        var mode = 0; // 0: normal, 1: header, 2: footer
        lines.forEach(function (i) {
            if (mode === 0) {
                if (i === "//:header") {
                    mode = 1;
                }
                else if (i === "//:footer") {
                    mode = 2;
                }
                else {
                    i = i.replace(/ /g, "");
                    if (i === "")
                        return;
                    if (i.substring(0, 2) === "//")
                        return;
                    var items = i.split(",");
                    if (items[0].substring(0, 1) === "*") {
                        if (items[0] === "*skybox") {
                            effects.skybox = items[1];
                        }
                        return;
                    }
                    result.push(i, new p.prefabLite(parseInt(items[1]), parseInt(items[2]), items[0]));
                }
            }
            else if (mode === 1) {
                if (i === "//:/header") {
                    mode = 0;
                    return;
                }
                header.push(i);
            }
            else if (mode === 2) {
                if (i === "//:/footer") {
                    mode = 0;
                    return;
                }
                footer.push(i);
            }
        });
        return new centerLang(result, header.join("\n"), footer.join("\n"), effects);
    }
    compiler.CSV2CenterLang = CSV2CenterLang;
    function old2CSV(old) {
        var lines = old.split("\n");
        var result = [];
        var id = 0;
        var mode = -1; // -1: system_header, 0: header, 1: normal, 2: footer, 3: return
        var count = 0;
        result.push("//:csv");
        lines.forEach(function (i) {
            if (i === "")
                return;
            if (mode === -1) {
                count++;
                if (count === 5) {
                    mode++;
                }
            }
            else if (mode === 0) {
                if (count === 5 && i === "// stageCTRL::edit not_header") {
                    mode++;
                }
                else if (count === 5) {
                    result.push("//:header");
                    result.push(i);
                    count++;
                }
                else {
                    if (i === "// stageCTRL::edit /header") {
                        result.push("//:/header");
                        mode++;
                    }
                    else {
                        result.push(i);
                    }
                }
            }
            else if (mode === 1) {
                if (i === "// stageCTRL::edit footer") {
                    mode++;
                    count = 10;
                    return;
                }
                else if (i === "// stageCTRL::edit not_footer") {
                    mode += 2;
                    return;
                }
                if (i.substring(0, 1) === "*") {
                    if (i.indexOf("*skybox,") !== -1) {
                        result.push(i);
                    }
                    else {
                        result.push(i); //TODO
                    }
                    return;
                }
                if (i.substring(0, 1) === ":")
                    return;
                i = i.replace(/ /g, "");
                if (i.substring(0, 2) === "//")
                    return;
                i = i.split("=")[0];
                var items = i.split(",");
                items[2] = (-parseInt(items[2])).toString();
                result.push([[items[0], items[1], items[2]].join(","), id++].join("="));
            }
            else if (mode === 2) {
                if (count === 10) {
                    count++;
                    result.push("//:footer");
                    result.push(i);
                }
                else {
                    if (i === "// stageCTRL::edit /footer") {
                        result.push("//:/footer");
                        mode++;
                    }
                    else {
                        result.push(i);
                    }
                }
            }
        });
        return result.join("\n");
    }
    compiler.old2CSV = old2CSV;
})(compiler || (compiler = {}));
