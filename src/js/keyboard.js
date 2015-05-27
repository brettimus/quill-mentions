var DOM = require("./utilities/dom"),
    addClass = DOM.addClass,
    removeClass = DOM.removeClass;

var SELECTED_CLASS = "ql-mention-choice-selected";

/**
 * Dispatches keyboard events to handlers
 * @namespace
 * @prop {function} 
 */
var KEYS = {
    13: handleEnter,
    27: handleEscape,
    38: handleUpKey,
    40: handleDownKey,
};

/**
 * @method
 * @this {QuillMentions}
 */
function handleDownKey() {
    _moveSelection.call(this, 1);
}

/**
 * @method
 * @this {QuillMentions}
 */
function handleUpKey() {
    _moveSelection.call(this, -1);
}



/**
 * @method
 * @this {QuillMentions}
 */
function handleEnter() {
    var nodes,
        currIndex = this.selectedChoiceIndex,
        currNode;

    if (currIndex === -1) return;
    nodes = this.container.querySelectorAll("li");
    if (nodes.length === 0) return;
    currNode = nodes[currIndex];
    this.addMention(currNode);
    this.selectedChoiceIndex = -1;
}

/**
 * @method
 * @this {QuillMentions}
 */
function handleEscape() {
    this.hide();
    // may need to set selection
    this.quill.focus();
}

/**
 * Moves the selected list item up or down. (+steps means down, -steps means up)
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

    nodes = this.container.querySelectorAll("li");

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
    if (modulo <= 0) throw new Error("WTF are you doing? _normalizeIndex needs a nonnegative, nonzero modulo.");
    while (i < 0) {
        i += modulo;
    }
    return i % modulo;
}

module.exports = KEYS;