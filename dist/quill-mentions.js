(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function addFormat(Mentions) {

    Mentions.prototype.addFormat = function(className) {
        this.quill.addFormat('mention', { tag: 'SPAN', "class": "ql-", });
    };

};
},{}],2:[function(require,module,exports){
(function (global){
global.QuillMentions = require("./mentions");
// if (window.Quill) {
//     Quill.registerModule('mentions', Mentions);
// }
// else {
//     throw new Error("Quill is not defined in the global scope.");
// }

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mentions":3}],3:[function(require,module,exports){
var template = require("./template");
var extend = require("./utilities/extend");

var addFormat = require("./format");
var addSearch = require("./search");
var addView = require("./view");

addFormat(Mentions);
addSearch(Mentions);
addView(Mentions);

// TODO - document this...
// ajax = { path: "", toName: Function }


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
        queryParameter: "q",
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
        queryString,
        that;
    if (mention) {
        this.currentMention = mention;
        queryString = mention[0].replace("@", "");
        that = this;
        // todo - remember last ajax request, and if it's still pending, cancel it.
        //       ... to that end, just use promises.

        this.search(queryString, function(data) {
            console.log("Callback data: ", data);
            that.currentChoices = data.slice(0, that.options.choiceMax);
            console.log("Callback currentChoices: ", that.currentChoices);
            that.renderCurrentChoices();
            that.show();
        });
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
},{"./format":1,"./search":4,"./template":5,"./utilities/extend":7,"./view":8}],4:[function(require,module,exports){
var loadJSON = require("./utilities/ajax").loadJSON;

module.exports = function addSearch(Mentions) {
    Mentions.prototype.search = function search(qry, callback) {
        if (this.options.ajax) {
            this.ajaxSearch(qry, callback);
        }
        else {
            this.staticSearch(qry, callback);
        }
    };

    Mentions.prototype.staticSearch = function staticSearch(qry, callback) {
        var data = this.options.choices.filter(function(choice) {
            // TODO - use case insensitive regexp
            return choice.name.toLowerCase().indexOf(qry.toLowerCase()) !== -1;
        });
        if (!callback) console.log("Warning! staticSearch was not provided a callback. It's probably definitely going to error after this message, you ding-dong.");
        callback.call(this, data);
    };

    Mentions.prototype.ajaxSearch = function ajaxSearch(qry, callback) {
        var path = this.options.ajax.path;
        var toName = this.options.ajax.toName; // TODO - provide identity function as default (but do the default handling in teh constructor plz)
        var qryString = path + "?" + this.options.queryParameter + "=" + qry; // TODO - encodeURIComponent
        loadJSON(qryString, function(data) {
            console.log("Ajax success! Here's the data: ", data);
            if (callback) {
                callback(data.map(toName));
            } else {
                console.log("Warning! No callback provided to ajax success...");
            }
        }.bind(this), function(error) {
            console.log("Loading json errored...", error);
        });
    };
};
},{"./utilities/ajax":6}],5:[function(require,module,exports){
module.exports = '<ul>{{choices}}</ul>';
},{}],6:[function(require,module,exports){
module.exports = {

    // from stackoverflow 
    // https://stackoverflow.com/questions/9838812/how-can-i-open-a-json-file-in-javascript-without-jquery
    loadJSON: function loadJSON(path, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function()
        {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    if (success)
                        success(JSON.parse(xhr.responseText));
                } else {
                    if (error)
                        error(xhr);
                }
            }
        };
        xhr.open("GET", path, true);
        xhr.send();
    },
};
},{}],7:[function(require,module,exports){
module.exports = function extend() {
    // extends an arbitrary number of objects
    var args   = [].slice.call(arguments, 0),
        result = args[0];

    for (var i=1; i < args.length; i++) {
        result = extendHelper(result, args[i]);
    }

    return result;
};

function extendHelper(destination, source) {
    // thanks be to angus kroll
    // https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/
    for (var k in source) {
        if (source.hasOwnProperty(k)) {
          destination[k] = source[k];
        }
    }
    return destination;
}
},{}],8:[function(require,module,exports){
module.exports = function addView(Mentions) {

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
};
},{}]},{},[1,2,3,4,5,6,7,8]);
