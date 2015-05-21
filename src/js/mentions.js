var template = require("./template");
var extend = require("./utilities/extend");
var loadJSON = require("./utilities/ajax").loadJSON;
var addSearch = require("./search");
var addView = require("./view");

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
        matcher: /@([a-z]+\s?[a-z]+)/,
        offset: 10,
        template: template,
    };
    this.quill = quill;
    this.options = extend({}, defaults, options);

    this.currentChoices = null;

    this.container = this.quill.addContainer("ql-mentions");
    this.hide();
    this.addListeners();

    // todo - allow custom classes
    this.quill.addFormat('mention', { tag: 'A', "class": 'ql-mention-item' });

}

Mentions.prototype.addListeners = function addListeners() {
    var textChangeHandler = this.textChangeHandler.bind(this);
    var addMentionHandler = this.addMentionHandler.bind(this);

    this.quill.on(this.quill.constructor.events.TEXT_CHANGE, textChangeHandler);

    this.container.addEventListener('click', addMentionHandler, false);
    this.container.addEventListener('touchend', addMentionHandler, false);
};

Mentions.prototype.textChangeHandler = function textChangeHandler(delta) {
    var mention = this.findMention();
    if (mention) {
        this.getChoices(mention[0]);
        // this.show();  // called in the rabbit hole
    }
    else if (this.container.style.left !== this.options.hideMargin) {
        this.range = null;   // Prevent restoring selection to last saved
        this.hide();
    }
};

Mentions.prototype.findMention = function findMention() {
    var range = this.quill.getSelection(),
        contents,
        match;

    if (!range) return;
    contents = this.quill.getText(0, range.end);
    match = this.options.matcher.exec(contents);
    return match;
};

Mentions.prototype.getChoices = function getChoices(queryText) {
    console.log("About to call callback with queryText: ", queryText);
    this.search.call(this, queryText, function(data) {
        console.log("Callback data: ", data);
        this.currentChoices = data.slice(0, this.options.choiceMax);
        console.log("Callback currentChoices: ", this.currentChoices);
        this.renderCurrentChoices();
        this.show();
    });
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
    var target = e.target || e.srcElement;
    this.quill.insertText(this.range.end, target.innerText, { "mention": true });
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