var DOM = require("./utilities/dom"),
    addClass = DOM.addClass,
    removeClass = DOM.removeClass,
    getOlderSiblingsInclusive = DOM.getOlderSiblingsInclusive;

module.exports = function addView(QuillMentions) {


    /**
     * @method
     */
    QuillMentions.prototype.hide = function hide() {
        removeClass(this.container, "ql-is-mentioning");
        this.container.style.marginTop = "0";
        if (this.range) this.quill.setSelection(this.range);
        this.range = null;
    };

    /**
     * @method
     * @param {Object} reference
     */
    QuillMentions.prototype.show = function show(reference) {

        var qlContainer = this.quill.container,
            qlEditor = this.quill.editor.root,
            qlLines,
            paddingTop = 10,
            negMargin = -paddingTop;


        this.range = this.quill.getSelection();
        qlLines = this._findOffsetLines(this.range);

        negMargin += qlEditor.getBoundingClientRect().height;
        negMargin -= qlLines.reduce(function(total, line) {
            return total + line.getBoundingClientRect().height;
        }, 0);

        this.container.style.marginTop = "-"+negMargin+'px';
        addClass(this.container, "ql-is-mentioning");

        // add keyboard listeners?
        // or have keyboard listeners filter action based on "ql-is-mentioning";

        this.container.focus(); // has no effect...
    };


    /**
     * Return the DOM node that encloses the line on which current mention is being typed.
     * @method
     * @private
     * @param {Range} range
     * @return {Node|null}
     */
    QuillMentions.prototype._findMentionNode = function _findMentionNode(range) {
        var leafAndOffset,
            leaf,
            offset,
            node;

        leafAndOffset = this.quill.editor.doc.findLeafAt(range.start, true);
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

    /**
     * Return an array of dom nodes corresponding to all lines at or before the line corresponding to the current range.
     * @method
     * @private
     * @param {Range} range
     * @return {Node[]}
     */
    QuillMentions.prototype._findOffsetLines = function(range) {
        var node = this._findMentionNode(range);
        return getOlderSiblingsInclusive(node);
    };


    /**
     * Render and return the "no matches found" template string
     * @getter
     * @private
     * @return {string}
     */
    Object.defineProperty(QuillMentions.prototype, "noMatchHTML", {
        get: function() {
            var template = this.options.noMatchTemplate,
                message = this.options.noMatchMessage;

            return message ? template.replace("{{message}}", message) : null;
        }
    });

};