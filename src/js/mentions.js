var template = require("./template");
var extend = require("./utilities/extend");

var addFormat = require("./format");
var addSearch = require("./search");
var addView = require("./view");

addFormat(Mentions);
addSearch(Mentions);
addView(Mentions);


function Mentions(quill, options) {
    var defaults = {
        ajax: false,
        choiceMax: 10,
        choices: [{ name: "Simone dB.",}, { name: "Mister P", }, { name: "Jelly O.", }, { name: "Chewie G.", }],
        choiceTemplate: "<li>{{choice}}</li>",
        hideMargin: '-10000px',
        isMentioning: false,
        matcher: /@([a-z]+\ ?[a-z]*$)/i,  // TODO - is using a literal space in this REGEX okay?
        mentionClass: "mention-item",
        offset: 10,
        template: template,
    };

    this.options = extend({}, defaults, options);
    this.quill = quill;
    this.addFormat(); // adds custom format for mentions

    this.currentChoices = null;
    this.currentMention = null;

    this.container = this.quill.addContainer("ql-mentions");
    this.hide();
    this.addListeners();

    // todo - allow custom classes

}

Mentions.prototype.addListeners = function addListeners() {
    var textChangeHandler = this.textChangeHandler.bind(this);
    var selectionChangeHandler = this.selectionChangeHandler.bind(this);
    var addMentionHandler = this.addMentionHandler.bind(this);

    this.quill.on(this.quill.constructor.events.TEXT_CHANGE, textChangeHandler);
    // this.quill.on(this.quill.constructor.events.SELECTION_CHANGE, selectionChangeHandler);


    this.container.addEventListener('click', addMentionHandler, false);
    this.container.addEventListener('touchend', addMentionHandler, false);
};

Mentions.prototype.textChangeHandler = function textChangeHandler(_delta) {
    var mention = this.findMention(),
        queryString;
    if (mention) {
        this.currentMention = mention;
        queryString = mention[0].replace("@", "");
        this.search(queryString, function(data) {
            console.log("Callback data: ", data);
            this.currentChoices = data.slice(0, this.options.choiceMax);
            console.log("Callback currentChoices: ", this.currentChoices);
            this.renderCurrentChoices();
            this.show();
        }.bind(this));
    }
    else if (this.container.style.left !== this.options.hideMargin) {
        this.currentMention = null;
        this.range = null;   // Prevent restoring selection to last saved
        this.hide();
    }
};

Mentions.prototype.selectionChangeHandler = function selectionChangeHandler(range) {
    throw new Error("No idea what to do with a selection-change event");
};

Mentions.prototype.findMention = function findMention() {
    var contents,
        match;

    this.range = this.quill.getSelection();
    if (!this.range) return;
    contents = this.quill.getText(0, this.range.end);
    match = this.options.matcher.exec(contents);
    return match;
};

Mentions.prototype.renderCurrentChoices = function renderCurrentChoices() {
    if (this.currentChoices && this.currentChoices.length) {
        var choices = this.currentChoices.map(function(choice) {
            return this.options.choiceTemplate.replace("{{choice}}", choice.name).replace("{{data}}", choice.data);
        }, this).join("");
        this.container.innerHTML = this.options.template.replace("{{choices}}", choices);
    }
    else {
        // render helpful message about nothing matching so far...
        this.container.innerHTML = this.options.template.replace("{{choices}}", "<li><i>Womp womp...</i></li>");

    }
};

Mentions.prototype.addMentionHandler = function addMentionHandler(e) {
    console.log("Current selection when a choice is clicked: ", this.range);
    var target = e.target || e.srcElement,
        insertAt = this.currentMention.index,
        toInsert = "@"+target.innerText,
        toFocus = insertAt + toInsert.length + 1;
    this.quill.deleteText(insertAt, insertAt + this.currentMention[0].length);
    this.quill.insertText(insertAt, toInsert, "mention", this.options.mentionClass);
    this.quill.insertText(insertAt + toInsert.length, " ");
    this.quill.setSelection(toFocus, toFocus);
    this.hide();
    e.stopPropagation();
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