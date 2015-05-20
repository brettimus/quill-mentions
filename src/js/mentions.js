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
    console.log(this.quill.getSelection());
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