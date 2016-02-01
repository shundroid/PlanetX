var handlerList = new Array<()=>void>();
/**
 * DOMContentLoadedのタイミングで呼ばれます。
 */
function add(fn:()=>void) {
  handlerList.push(fn);
}
document.addEventListener('DOMContentLoaded', () => {
  handlerList.forEach(i => {
    i();
  });
});
export = add;