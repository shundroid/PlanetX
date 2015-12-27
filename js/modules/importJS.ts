function importJS(src:string) {
  var elem = document.createElement("script");
  elem.src = src;
  return elem;
}
export = importJS;