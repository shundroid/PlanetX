var handlerList = new Array<()=>void>();
function add(fn:()=>void) {
  handlerList.push(fn);
}
document.addEventListener('DOMContentLoaded', () => {
  handlerList.forEach(i => {
    i();
  });
});
export = add;