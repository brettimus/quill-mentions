// TODO - write Editor View
function EditorView() {
    throw new Error("NYI");
}


var DOM = require("./utilities/dom");


module.exports = View;


/**
 * @constructor
 */
function View(container, templates, options) {
    this.container = container;
    this.list = templates.list;
    this.listItem = templates.listItem;
    this.error = templates.error;
    this.options = options || {}; // TODO - use Object.assign polyfill
}


/**
 * Renders data to the template
 * @method
 * @param {array} data
 */
View.prototype.render = function(data) {
    var ulTemplate = this.list,
        liTemplate = this.listItem;

    if (data && data.length) {
        this.container.innerHTML = ulTempalte.replace("{{choices}}", data.map(this._renderLI));
    }
    else {
        this.container.innerHTML = ulTempalte.replace("{{choices}}", this.error);
    }
};

View.prototype._renderLI = function(datum) {
    return this.listItem
            .replace("{{choice}}", datum.name) // rename
            .replace("{{data}}", datum.data);
};


/**
 * @method
 */
View.prototype.hide = function hide(quill, range) {
    DOM.removeClass(this.container, "ql-is-mentioning");
    this.container.style.marginTop = "0";
    if (range) quill.setSelection(range);
};

/**
 * @method
 */
View.prototype.isHidden = function isHidden() {
    return DOM.hasClass(this.container, "ql-is-mentioning");
};

/**
 * @method
 * @param {Quill} quill
 * @private
 */
View.prototype.show = function show(quill) {

    // todo alphabetize
    var range,
        qlContainer = quill.container,
        qlEditor = quill.editor.root,
        qlLines,
        paddingTop = this.options.paddingTop || 10,
        negMargin = -paddingTop;


    range = quill.getSelection();
    qlLines = this._findOffsetLines(range);

    negMargin += qlEditor.getBoundingClientRect().height;
    negMargin -= qlLines.reduce(function(total, line) {
        return total + line.getBoundingClientRect().height;
    }, 0);

    this.container.style.marginTop = "-"+negMargin+'px';
    DOM.addClass(this.container, "ql-is-mentioning");
    this.container.focus();
};

/**
 * Return an array of dom nodes corresponding to all lines at or before the line corresponding to the current range.
 * @method
 * @private
 * @param {Range} range
 * @return {Node[]}
 */
View.prototype._findOffsetLines = function(range) {
    var node = this._findMentionNode(range);
    return DOM.getOlderSiblingsInclusive(node);
};

/**
 * Return the DOM node that encloses the line on which current mention is being typed.
 * @method
 * @private
 * @param {Range} range
 * @return {Node|null}
 */
View.prototype._findMentionNode = function _findMentionNode(quill) {
    var leafAndOffset,
        leaf,
        offset,
        node;

    leafAndOffset = quill.editor.doc.findLeafAt(range.start, true);
    leaf = leafAndOffset[0];
    offset = leafAndOffset[1]; // how many chars in front of current range
    if (leaf) node = leaf.node;
    while (node) {
        if (node.tagName === "DIV") break;
        node = node.parentNode;
    }
    if (!node) return null;
    return node;
};