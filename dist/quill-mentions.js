(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
global.QuillMentions = require("./mentions");
// if (window.Quill) {
//     Quill.registerModule('mentions', Mentions);
// }
// else {
//     throw new Error("Quill is not defined in the global scope.");
// }

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mentions":2}],2:[function(require,module,exports){
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
},{"./search":3,"./template":4,"./utilities/ajax":5,"./utilities/extend":6,"./view":7}],3:[function(require,module,exports){
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
        qry = qry.replace("@", "");
        var data = this.options.choices.filter(function(choice) {
            return choice.name.toLowerCase().indexOf(qry) !== -1;
        });
        if (!callback) console.log("Warning! staticSearch was not provided a callback. It's probably definitely going to error after this message, you ding-dong.");
        callback.call(this, data);
    };

    Mentions.prototype.ajaxSearch = function ajaxSearch(qry, callback) {
        qry = qry.replace("@", "");
        var qryString = encodeURIComponent(this.options.ajax + "?" + this.options.queryParameter + "=" + qry);
        loadJSON(this.options.ajax, function(data) {
            console.log("Ajax success! Here's the data: ", data);
            if (callback) {
                callback(data);
            } else {
                console.log("Warning! No callback provided to ajax success...");
            }
        }.bind(this), function(error) {
            console.log("Loading json errored...", error);
        });
    };
};
},{}],4:[function(require,module,exports){
module.exports = '<ul>{{choices}}</ul>';
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{}]},{},[1,2,3,4,5,6,7]);
