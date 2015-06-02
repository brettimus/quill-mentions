

var DOM = require("./utilities/dom"),
    addClass = DOM.addClass,
    removeClass = DOM.removeClass;

var SELECTED_CLASS = "ql-mention-choice-selected";

/**
 * Dispatches keyboard events to handlers
 * @namespace
 * @prop {function} 
 */
 /**
  * @namespace
  * @prop {Number} 13 - Handler for the enter key.
  * @prop {Number} 27 - Handler for the escape key.
  * @prop {Number} 38 - Handler for the up arrow key.
  * @prop {Number} 40 - Handler for the down arrow key.
  */
var keydown = {
    27: keydownEscape,
    38: keydownUpKey,
    40: keydownDownKey,
};

var keyup = {
    13: keyupEnter,
};

/**
 * @method
 * @this {QuillMentions}
 */
function keydownDownKey() {
    if (this.view.isHidden()) return;
    _moveSelection.call(this, 1);
}

/**
 * @method
 * @this {QuillMentions}
 */
function keydownUpKey() {
    if (this.view.isHidden()) return;
    _moveSelection.call(this, -1);
}

/**
 * @method
 * @this {QuillMentions}
 */
function keyupEnter() {
    var nodes,
        currIndex = this.selectedChoiceIndex,
        currNode;

    if (currIndex === -1) return;
    if (!this.view.hasMatches()) return;

    this.quill.setSelection(this._cachedRange);
    nodes = this.view.getMatches();
    currNode = nodes[currIndex];
    this.addMention(currNode);
    this.selectedChoiceIndex = -1;
}

/**
 * @method
 * @this {QuillMentions}
 */
function keydownEscape() {
    this.view.hide();
    this.selectedChoiceIndex = -1;
    this.quill.focus();
}

/**
 * Moves the selected list item up or down. (+steps means down, -steps means up) PUT THIS IN THE VIEW
 * @method
 * @private
 * @this {QuillMentions}
 */
function _moveSelection(steps) {
    var nodes,
        currIndex = this.selectedChoiceIndex,
        currNode,
        nextIndex,
        nextNode;

    nodes = this.view.container.querySelectorAll("li");

    if (nodes.length === 0) {
        this.selectedChoiceIndex = -1;
        return;
    }
    if (currIndex !== -1) {
        currNode = nodes[currIndex];
        removeClass(currNode, SELECTED_CLASS);
    }

    nextIndex = _normalizeIndex(currIndex + steps, nodes.length);
    nextNode = nodes[nextIndex];

    if (nextNode) {
        addClass(nextNode, SELECTED_CLASS);
        this.selectedChoiceIndex = nextIndex;
    }
    else {
        console.log("Indexing error on node returned by querySelectorAll");
    }

}

function _normalizeIndex(i, modulo) {
    if (modulo <= 0) throw new Error("TF are you doing? _normalizeIndex needs a nonnegative, nonzero modulo.");
    while (i < 0) {
        i += modulo;
    }
    return i % modulo;
}

module.exports = {keyup: keyup, keydown: keydown};