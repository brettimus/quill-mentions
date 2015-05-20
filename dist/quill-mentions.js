(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
global.QuillMentions = require("./mentions");
// if (window.Quill) {
//     Quill.registerModule('mentions', Mentions);
// }
// else {
//     throw new Error("Quill is not defined in the global scope.");
// }

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mentions":2}],2:[function(require,module,exports){
var template = require("./template");
var extend = require("./utilities/extend");

var Mentions = function(quill, options) {
    var defaults = {
        ajax: false,
        hideMargin: '-10000px',
        offset: 10,
        template: template,
    };
    this.quill = quill;
    this.options = extend({}, defaults, options);

    this.container = this.quill.addContainer("ql-mentions");
    this.container.innerHTML = this.options.template;
    this.hide();
    this.addListeners();

};

Mentions.prototype.isMentioning = function isMentioning() {
    throw new Error();
};

Mentions.prototype.position = function position(reference) {
    var referenceBounds,
        parentBounds,
        offsetLeft,
        offsetTop,
        offsetBottom,
        left,
        top;

    if (reference) {
        // Place tooltip under reference centered
        // reference might be selection range so must use getBoundingClientRect()
        referenceBounds = reference.getBoundingClientRect();
        parentBounds = this.quill.container.getBoundingClientRect();
        offsetLeft = referenceBounds.left - parentBounds.left;
        offsetTop = referenceBounds.top - parentBounds.top;
        offsetBottom = referenceBounds.bottom - parentBounds.bottom;
        left = offsetLeft + referenceBounds.width/2 - this.container.offsetWidth/2;
        top = offsetTop + referenceBounds.height + this.options.offset;
        if (top + this.container.offsetHeight > this.quill.container.offsetHeight) {
            top = offsetTop - this.container.offsetHeight - this.options.offset;
        }
        left = Math.max(0, Math.min(left, this.quill.container.offsetWidth - this.container.offsetWidth));
        top = Math.max(0, Math.min(top, this.quill.container.offsetHeight - this.container.offsetHeight));

    }
    else {
        // Place tooltip in middle of editor viewport
        left = this.quill.container.offsetWidth/2 - this.container.offsetWidth/2;
        top = this.quill.container.offsetHeight/2 - this.container.offsetHeight/2;
    }
    return [left, top];
};

Mentions.prototype.hide = function hide() {
    this.container.style.left = this.options.hideMargin;
    if (this.range) this.quill.setSelection(this.range);
    this.range = null;
    // throw new Error();
};

Mentions.prototype.show = function show(reference) {
    var position,
        left,
        top;
    this.range = this.quill.getSelection();
    position = this.position(reference);
    left = position[0];
    top = position[1];
    this.container.style.left = left+"px";
    this.container.style.top  = top+"px";
    this.container.focus();
};

Mentions.prototype.getChoices = function getChoices() {
    throw new Error();
};

Mentions.prototype.addListeners = function addListeners() {
    var addMentionHandler = this.addMentionHandler.bind(this);
    this.container.addEventListener('click', addMentionHandler, false);
    this.container.addEventListener('touchend', addMentionHandler, false);
};

Mentions.prototype.addMentionHandler = function addMentionHandler(e) {
    var target = e.target || e.srcElement;
    this.quill.insertText(this.range.end, target.innerText);
    console.log("this range", this.range);
    console.log(target);
    this.hide();
    e.stopPropagation();
};

// This is how the link-toolitp finds an anchor tag...
Mentions.prototype._findAnchor = function _findAnchor(range) {
    var leafAndOffset = this.quill.editor.doc.findLeafAt(range.start, true),
        leaf = leafAndOffset[0],
        offset = leafAndOffset[1];
    var node;

    if (leaf) node = leaf.node;

    while (node && node !== this.quill.root) {
        if (node.tagName == 'A') {
            return node;
        }
        node = node.parentNode;
    }
    return null;
};


module.exports = Mentions;
},{"./template":3,"./utilities/extend":4}],3:[function(require,module,exports){
module.exports = '<ul><li>Person DaPerson</li><li>Boots McShoes</li><li>Penelope Muse</li><li>Kirkland Costner</li></ul>';
},{}],4:[function(require,module,exports){
module.exports = function extend() {
    // extends an arbitrary number of objects
    var args   = [].slice.call(arguments, 0),
        result = args[0];

    for (var i=1; i < args.length; i++) {
        result = extendHelper(result, args[i]);
    }

    return result;
};

function extendHelper(destination, source) {
    // thanks be to angus kroll
    // https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/
    for (var k in source) {
        if (source.hasOwnProperty(k)) {
          destination[k] = source[k];
        }
    }
    return destination;
}
},{}]},{},[1,2,3,4]);
