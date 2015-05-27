/** @module mentions */

var AJAXController = require("./controller").AJAXController,
    Controller = require("./controller").Controller,
    View = require("./view");

var extend = require("./utilities/extend"),
    defaultFactory = require("./defaults/defaults"), // keep in defaults so we can write specific defaults for each object
    KEYS = require("./keyboard");

module.exports = QuillMentions;

/**
 * @constructor
 * @param {Object} quill - An instance of `Quill`.
 * @param {Object} [options] - User configuration passed to the mentions module. It's mixed in with defaults.
 * @prop {Quill} quill
 * @prop {DOMNode} container - Container for the popover (a.k.a. the View)
 * @prop {RegExp} matcher - Used to scan contents of editor for mentions.
 * @prop {Bool} isMentioning - Updated with our "mentioning state" changes. 
 */
function QuillMentions(quill, options) {

    this.quill = quill;
    var modOptions = defaultFactory(options),
        container = this.quill.addContainer(modOptions.containerClassName);

    this.triggerSymbol = modOptions.triggerSymbol;
    this.includeTrigger = modOptions.includeTrigger;
    this.matcher = modOptions.matcher;
    this.mentionClass = modOptions.mentionClass;
    this.isMentioning = false;
    this.currentMention = null;

    this.selectedChoiceIndex = -1;

    // this.container = container; // [TODO] see if we can destroy this reference. right now KEYs depends on it

    this.setView(container, modOptions)
        .setController(modOptions)
        .listenTextChange(quill)
        .listenSelectionChange(quill)
        .listenHotKeys(quill)
        .listenClick(container)
        .addFormat();

    this._cachedRange = null;
}

/**
 * Sets QuillMentions.view to a View object
 * @method
 * @private
 * @param {Node} container
 * @param {Object} options - Configuration for the view
 */
QuillMentions.prototype.setView = function(container, options) {
    var templates = {};
    templates.list = options.template;
    templates.listItem = options.choiceTemplate;
    templates.error = options.noMatchTemplate;
    this.view = new View(container, templates);
    return this;
};

/**
 * Sets QuillMentions.controller to a Controller or AJAXController object (depending on options).
 * @method
 * @private
 * @param {Object} options - Configuration for the controller.
 */
QuillMentions.prototype.setController = function(options) {
    if (!this.view) throw new Error("Must set view before controller.");

    var formatter,
        config = {
            max: options.choiceMax,
        };
    if (!options.ajax) {
        formatter = options.format;
        config.data = options.choices;
        this.controller = new Controller(formatter, this.view, config);
    } else {
        formatter = options.ajax.format;
        extend(config, options.ajax);
        this.controller = new AJAXController(formatter, this.view, config);
    }
    return this;
};

/**
 * Sets a listener for text-change events on the given Quill instance
 * @method
 * @param {Quill} quill - An instance of Quill
 */
QuillMentions.prototype.listenTextChange = function listenTextChange(quill) {
    var eventName = this.quill.constructor.events.TEXT_CHANGE;
    quill.on(eventName, textChangeHandler.bind(this));
    return this;

    function textChangeHandler(_) {
        var mention = this.findMention(),
            query,
            _this;

        if (mention) {
            _this = this;
            this._cachedRange = quill.getSelection();
            this.isMentioning = true;
            this.currentMention = mention;
            query = mention[0].replace(this.triggerSymbol, "");

            this.controller.search(query, function() {
                _this.view.show(_this.quill);
            });
        }
        else {
            this.isMentioning = false;
            this.view.hide();
            //
            // NB - i dont' know what these do but i'm keeping them in here in case shit goes awry
            // this.currentMention = null; // DANGER HACK TODO NOOOO
            // this.range = null;   // Prevent restoring selection to last saved
        }
    }
};


/**
 * Sets a listener for selection-change events on the given Quill instance
 * @method
 * @param {Quill} quill - An instance of Quill
 */
QuillMentions.prototype.listenSelectionChange = function(quill) {
    var eventName = quill.constructor.events.SELECTION_CHANGE;
    quill.on(eventName, selectionChangeHandler.bind(this));
    return this;

    function selectionChangeHandler(range) {
        if (!range) {
            this.view.hide();
            quill.setSelection(null); // this is unnecessary right?
        }
    }
};

/**
 * Sets a listener for keyboard events on the given container.
 * Events are dispatched through the KEYS object.
 * @method
 * @param {Quill} quill - An instance of Quill
 */
QuillMentions.prototype.listenHotKeys = function(quill) {
    quill.container
        .addEventListener('keyup',
                           keyboardHandler.bind(this),
                           false); // TIL keypress is intended for keys that normally produce a character
    return this;

    function keyboardHandler(event) {
        var code = event.keyCode || event.which;
        if (this.isMentioning || code === 13) { // need special logic for enter key :sob:
            dispatch.call(this, code);
            event.stopPropagation();
            event.preventDefault();
        }
    }

    function dispatch(code) {
        var callback = KEYS[code];
        if (callback) {
            quill.setSelection(this._cachedRange); // HACK oh noz! todo bad icky
            callback.call(this);
        }
    }
};

/**
 * Listens for a click or touchend event on the View.
 * @method
 * @param {HTMLElement} elt
 */
QuillMentions.prototype.listenClick = function(elt) {

    elt.addEventListener("click", addMention.bind(this));
    elt.addEventListener("touchend", addMention.bind(this));
    return this;

    /** Wraps the QuillMentions~addMention method */
    function addMention(event) {
        var target = event.target || event.srcElement;
        if (target.tagName.toLowerCase() === "li") { // TODO - this is bad news... but adding a pointer-event: none; to the error message list item does not work bc i'm using bubbling to capture click events in the first place and oh my garsh is this a long comment...
            console.log(target);
            this.addMention(target);
        }
        e.stopPropagation();
    }
};

/**
 * Looks for a string in the editor (up to the cursor's current position) for a match to QuillMentions~matcher
 * @method
 * @return {Match}
 */
QuillMentions.prototype.findMention = function findMention() {
    var cursor = this.quill.getSelection().end,
        contents = this.quill.getText(0, cursor);

    return this.matcher.exec(contents);
};

/**
 * Needs to be refactored! QuillMention should be responsible for this action.
 * @method
 * @param {HTMLElement}
 */
 QuillMentions.prototype.addMention = function addMention(node) {
     var insertAt = this.currentMention.index,
         toInsert = (this.includeTrigger ? this.triggerSymbol : "") + node.dataset.display,
         toFocus = insertAt + toInsert.length + 1;


     this.quill.deleteText(insertAt, insertAt + this.currentMention[0].length);
     this.quill.insertText(insertAt, toInsert, "mention", this.mentionClass+"-"+node.dataset.mention);
     this.quill.insertText(insertAt + toInsert.length, " ");
     this.quill.setSelection(toFocus, toFocus);

     this.isMentioning = false;
     this.view.hide(); // sequencing?
 };


 /**
  * Refactor.
  * @method
  */
 QuillMentions.prototype.hasSelection = function() {
     return this.selectedChoiceIndex !== -1;
 };

/**
 * Waiting on new custom formats in Quill to beef this up.
 * @method
 * @private
 */
 QuillMentions.prototype.addFormat = function(className) {
     this.quill.addFormat('mention', { tag: 'SPAN', "class": "ql-", }); // a mention is a span with the class prefix "ql-". the naming is an artifact of the current custom formats implementation
     return this;
 };

