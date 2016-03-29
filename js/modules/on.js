var eventer = {};
var listeners = {};
eventer.on = (event, fn) => {
  if (event instanceof Array) {
    event.forEach(item => {
      eventer.on(item, fn);
    });
  }
  if (!(listeners[event] instanceof Array)) {
    listeners[event] = [];
  }
  listeners[event].push(fn);
};
eventer.raise = function (event) {
  let args = Array.prototype.slice.call(arguments, 1);
  if (listeners[event] instanceof Array) {
    listeners[event].forEach(listener => {
      listener.apply({eventName: event}, args);
    });
  }
};
module.exports = eventer;