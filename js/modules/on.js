var eventer = {};
var listeners = {};
eventer.on = (event, fn) => {
  if (!(listeners[event] instanceof Array)) {
    listeners[event] = [];
  }
  listeners[event].push(fn);
};
eventer.raise = (event) => {
  let args = [];
  if (typeof arguments[1] !== "undefined") {
    for (let i = 1; i < arguments.length; i++) {
      // 0 番目は省略するため、i は、1 から始める。
      args.push(arguments[i]);
    }
  }
  if (listeners[event] instanceof Array) {
    listeners[event].forEach(listener => {
      listener.apply(this, args);
    });
  }
};
module.exports = eventer;