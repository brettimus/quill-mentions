var template = require("./template");
var extend = require("./utilities/extend");

var Mentions = function(quill, options) {
    var defaults = {
        ajax: false,
        choices: ["Simone dB.", "Mister P", "Jelly O.", "Chewie G."],
        choiceTemplate: "<li>{{choice}}</li>",
        hideMargin: '-10000px',
        isMentioning: false,
        offset: 10,
        template: template,
    };
    this.quill = quill;
    this.options = extend({}, defaults, options);

    this.container = this.quill.addContainer("ql-mentions");
    this.hide();
    this.addListeners();

    // todo - allow classes
    this.quill.addFormat('mention', { tag: 'A', "class": 'ql-mention-item' });

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
    var choices = this.options.choices.map(function(choice) {
        return this.options.choiceTemplate.replace("{{choice}}", choice);
    }, this).join("");
    this.container.innerHTML = this.options.template.replace("{{choices}}", choices);
};

Mentions.prototype.addListeners = function addListeners() {
    var selectionChangeHandler = this.selectionChangeHandler.bind(this);
    var textChangeHandler = this.textChangeHandler.bind(this);
    var addMentionHandler = this.addMentionHandler.bind(this);

    this.quill.on(this.quill.constructor.events.SELECTION_CHANGE, selectionChangeHandler);
    this.quill.on(this.quill.constructor.events.TEXT_CHANGE, textChangeHandler);

    this.container.addEventListener('click', addMentionHandler, false);
    this.container.addEventListener('touchend', addMentionHandler, false);
};

Mentions.prototype.textChangeHandler = function textChangeHandler(delta) {

    var mention = this._findMentionSymbol(delta);
    if (mention) {
        // this.setMode(anchor.href, false);
        this.getChoices();
        this.show();
    }
    else if (this.container.style.left !== this.options.hideMargin) {
        this.range = null;   // Prevent restoring selection to last saved
        this.hide();
    }
    // this.quill.on(this.quill.constructor.events.SELECTION_CHANGE, function(range)

    // )
};

Mentions.prototype.selectionChangeHandler = function selectionChangeHandler(range) {
    if (!range || !range.isCollapsed()) return;

    var mention = this._findMentionNode(range);
    if (this.isMentioning) { // BAD - relies on sideffecting...

        console.log("[MENTIONS] we are mentioning and the mentionNode found here is node:", mention);

        this.getChoices();
        this.show();
    }
    else {
        this.range = null;
    }
    //   return unless range? and range.isCollapsed()
    //   anchor = this._findAnchor(range)
    //   if anchor
    //     this.setMode(anchor.href, false)
    //     this.show(anchor)
    //   else if @container.style.left != Tooltip.HIDE_MARGIN
    //     @range = null   # Prevent restoring selection to last saved
    //     this.hide()
};

Mentions.prototype.addMentionHandler = function addMentionHandler(e) {
    var target = e.target || e.srcElement;
    this.quill.insertText(this.range.end, target.innerText, { "mention": true });
    this.hide();
    e.stopPropagation();
};


Mentions.prototype._findMentionSymbol = function _findMentionSymbol(delta) {

    // var contents = this.quill.getContents(0, delta.length());
    // console.log("_findMentionSymbol contents", contents);

    var text = this.quill.getText(0, delta.length());
    var index = text.lastIndexOf("@"),
        result;

    if (index === -1) return false;

    result = this.quill.getContents(index, delta.length());
    console.log("_findMentionSymbol result", result);
    return result;
};

// This is how the link-toolitp finds an anchor tag...
Mentions.prototype._findMentionNode = function _findNode(range) {

    var text = this.quill.getText(0, range.end),
        index = text.lastIndexOf("@"),
        result;

    this.isMentioning = (index !== -1);


    var leafAndOffset = this.quill.editor.doc.findLeafAt(range.start, true),
        leaf = leafAndOffset[0],
        offset = leafAndOffset[1];
    var node;

    if (leaf) node = leaf.node;

    while (node && node !== this.quill.root) {
        if (node.tagName == 'DIV') {
            return node;
        }
        node = node.parentNode;
    }
    return null;
};


module.exports = Mentions;