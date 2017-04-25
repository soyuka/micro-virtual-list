(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MicroVirtualList = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Microframe = require('microframe');
var NanoBounce = require('nanobounce');

function noop(cb) {
  cb();
}

function MicroVirtualList(container, config) {
  var total = config.total;
  var frame = Microframe();
  var bounce = config.bounce === false ? noop : NanoBounce(config.bounce === undefined ? 10 : config.bounce);

  // Our shadow element to show a correct scroll bar
  var scroller = document.createElement('tr');

  // Cache heights
  var heights = new Array(total).fill(0).map(function (e, i) {
    var row = config.getRow(i);

    if (row.height !== undefined) {
      return row.height;
    }

    return config.itemHeight;
  });

  // Compute positions
  var positions = new Array(total).fill(0);

  computePositions();

  // Scroll height
  var scrollHeight = computeScrollHeight();

  // Visible elements
  var averageHeight = scrollHeight / total;
  var visibleCache = void 0;

  setContainerHeight(config.height);

  // stores the last scrollTop
  var lastRepaint = void 0;
  var lastFrom = void 0;

  //init
  onscroll();
  container.addEventListener('scroll', onscroll);

  function setContainerHeight(height) {
    visibleCache = Math.ceil(height / averageHeight) * 3;
    // Set up container, block display has to be forced on tables
    container.setAttribute('style', 'width:100%;height:' + height + 'px;overflow:auto;position:relative;padding:0;display:block;');
  }

  function computeScrollHeight() {
    var scrollHeight = heights.reduce(function (a, b) {
      return a + b;
    }, 0);

    scroller.setAttribute('style', 'opacity:0;position:absolute;width:1px;height:' + scrollHeight + 'px;');

    return scrollHeight;
  }

  function computePositions() {
    var from = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    if (from < 1) {
      from = 1;
    }

    for (var i = from; i < total; i++) {
      positions[i] = heights[i - 1] + positions[i - 1];
    }
  }

  // Get the index we start from
  function getFrom() {
    var scrollTop = container.scrollTop;
    var i = 0;

    while (positions[i] < scrollTop) {
      i++;
    }

    return i;
  }

  // Render elements
  function render() {
    var scrollTop = container.scrollTop;

    if (lastRepaint === scrollTop) {
      return;
    }

    var from = getFrom() - 1;
    from = from < 0 ? 0 : from;

    if (lastFrom === from) {
      return;
    }

    lastFrom = from;

    var to = from + visibleCache;
    to = to > total ? total : to;

    var fragment = document.createDocumentFragment();
    fragment.appendChild(scroller);

    for (var i = from; i < to; i++) {
      var element = config.getRow(i);

      if (element.height) {
        if (heights[i] !== element.height) {
          heights[i] = element.height;
          computePositions(i);
          computeScrollHeight();
        }

        element = element.element;
      }

      var top = positions[i];

      element.setAttribute('style', '\n        ' + (element.style.cssText || '') + '\n        position: absolute;\n        top: ' + top + 'px;\n      ');

      fragment.appendChild(element);
    }

    lastRepaint = scrollTop;

    container.innerHTML = '';
    container.appendChild(fragment);
  }

  function onscroll() {
    bounce(function () {
      frame(render);
    });
  }

  function destroy() {
    container.removeEventListener('scroll', onscroll);
    container.innerHTML = '';
  }

  return {
    destroy: destroy,
    refresh: render,
    setContainerHeight: setContainerHeight
  };
}

module.exports = MicroVirtualList;

},{"microframe":2,"nanobounce":3}],2:[function(require,module,exports){
module.exports = Microframe

function Microframe () {
  var inFlight = false
  var callback = null

  return function (cb) {
    callback = cb
    if (!inFlight) {
      inFlight = true
      window.requestAnimationFrame(function () {
        inFlight = false
        callback()
        callback = null
      })
    }
  }
}

},{}],3:[function(require,module,exports){
module.exports = Nanobounce

function Nanobounce (timeout) {
  timeout = timeout || 256

  var callback = null
  var last = null
  var inFlight = false

  return function (cb) {
    callback = cb
    last = Date.now()

    if (!inFlight) {
      inFlight = true
      window.setTimeout(next, timeout)
    }

    function next () {
      var diff = Date.now() - last
      if (diff > timeout) {
        last = null
        inFlight = false
        callback()
        callback = null
      } else {
        window.setTimeout(next, diff)
      }
    }
  }
}

},{}]},{},[1])(1)
});