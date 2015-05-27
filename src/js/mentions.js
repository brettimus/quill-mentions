var addController = require("./controller"),
    addFormat = require("./format"),
    addSearch = require("./search"),
    addView = require("./view");

var defaultFactory = require("./defaults/defaults"),
    KEYS = require("./keyboard");

addController(QuillMentions);
addFormat(QuillMentions);
addSearch(QuillMentions);
addView(QuillMentions);

module.exports = QuillMentions;

/**
 * @constructor
 * @param {Object} quill - An instance of `Quill`.
 * @param {Object} [options] - User configuration passed to the mentions module. It's mixed in with defaults.
 * @property {Object} quill - Instance of quill editor.
 * @property {Object} options - Default configuration mixed in with user configuration.
 * @property {Object} container - DOM node that contains the mention choices.
 * @property {Object[]|null} currentChoices - 
 * @property {Object|null} currentMention
 */
function QuillMentions(quill, options) {

    this.quill = quill;
    this.options = defaultFactory(options);
    this.container = this.quill.addContainer(this.options.containerClassName);
    this.currentChoices = null;
    this.currentMention = null;

    this.selectedChoiceIndex = -1;

    this.hide();
    this.addFormat(); // adds custom format for mentions
    this.addListeners();
}

/**
 * @method
 */
QuillMentions.prototype.addListeners = function addListeners() {
    var textChangeHandler = this.textChangeHandler.bind(this),
        addMentionHandler = this.addMentionHandler.bind(this),
        keyboardHandler   = this.keyboardHandler.bind(this);

    this.quill.on(this.quill.constructor.events.TEXT_CHANGE, textChangeHandler);

    this.container.addEventListener('click', addMentionHandler, false);
    this.container.addEventListener('touchend', addMentionHandler, false);

    this.quill.container.addEventListener('keyup', keyboardHandler, false);
};

/**
 * @method
 */
QuillMentions.prototype.textChangeHandler = function textChangeHandler(_delta) {
    var mention = this.findMention(),
        queryString,
        that;
    if (mention) {
        this.currentMention = mention;
        queryString = mention[0].replace("@", "");
        that = this;
        this.search(queryString, function(data) {
            that.currentChoices = data.slice(0, that.options.choiceMax);
            that.renderCurrentChoices();
            that.show();
        });
    }
    else if (this.isMentioning()) {
        this.currentMention = null;
        this.range = null;   // Prevent restoring selection to last saved
        this.hide();
    }
};

/**
 *
 */
QuillMentions.prototype.keyboardHandler = function(e) {
    var code = e.keyCode || e.which;
    if (this.isMentioning()) {
        console.log("We are mentioning!");
        this._dispatchKeycode(code);
        e.stopPropagation();
        e.preventDefault();
    }
};

QuillMentions.prototype._dispatchKeycode = function(code) {
    var callback = KEYS[code];
    if (callback) callback.call(this);
};


/**
 * @method
 */
QuillMentions.prototype.hasSelection = function() {
    return this.selectedChoiceIndex !== -1;
};



/**
 * @method
 * @return {Match}
 */
QuillMentions.prototype.findMention = function findMention() {
    var contents,
        match;

    this.range = this.quill.getSelection();
    if (!this.range) return;
    contents = this.quill.getText(0, this.range.end);
    match = this.options.matcher.exec(contents);
    return match;
};



/**
 * @method
 */
QuillMentions.prototype.addMentionHandler = function addMentionHandler(e) {
    var target = e.target || e.srcElement,
        insertAt = this.currentMention.index,
        toInsert = "@"+target.innerText,
        toFocus = insertAt + toInsert.length + 1;

    this.hide(); // sequencing?

    this.quill.deleteText(insertAt, insertAt + this.currentMention[0].length);
    this.quill.insertText(insertAt, toInsert, "mention", this.options.mentionClass);
    this.quill.insertText(insertAt + toInsert.length, " ");
    this.quill.setSelection(toFocus, toFocus);
    e.stopPropagation();
};

QuillMentions.prototype.isMentioning = function() {
    return this.container.className.search(/ql\-is\-mentioning/) !== -1;
};

