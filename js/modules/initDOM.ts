var handlerList = new Array<()=>void>();
/**
 * DOMContentLoadedのタイミングで呼ばれます。
 */
export default function(fn:()=>void) {
  handlerList.push(fn);
}
document.addEventListener('DOMContentLoaded', () => {
  handlerList.forEach(i => {
    i();
  });
});
