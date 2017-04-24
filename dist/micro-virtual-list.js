(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MicroVirtualList = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function MicroVirtualList(container, config) {
  // Set up container, block display has to be forced on tables
  container.setAttribute('style', 'width:100%;height:' + config.height + 'px;overflow:auto;position:relative;padding:0;display:block;');

  var total = config.total;

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
  var visibleCache = Math.ceil(config.height / averageHeight) * 3;

  // stores the last scrollTop
  var lastRepaint = void 0;

  render();

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
      return requestAnimationFrame(render);
    }

    var from = getFrom() - 1;
    from = from < 0 ? 0 : from;

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
    requestAnimationFrame(render);
  }

  function destroy() {
    cancelAnimationFrame(render);
  }

  return {
    destroy: destroy
  };
}

module.exports = MicroVirtualList;

},{}]},{},[1])(1)
});