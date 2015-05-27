module.exports = function addController(QuillMentions) {

    /**
     * TODO - this should simply pass data to the view and let it sort shit out.
     * @method
     */
    QuillMentions.prototype.renderCurrentChoices = function renderCurrentChoices() {
        var noMatchFoundMessage;
        if (this.hasChoices()) {
            this.render(this._getChoicesHTML());
        }
        else {
            // render helpful message about nothing matching so far...
            noMatchFoundMessage = this.noMatchHTML;
            console.log(noMatchFoundMessage);
            if (noMatchFoundMessage) {
                this.render(noMatchFoundMessage);
            } else {
                this.hide();
            }
        }
    };

    /**
     * Adds markup to template and puts it inside the container.
     * @method
     * @private
     */
    QuillMentions.prototype.render = function(choices) {
        var template = this.options.template,
            result   = template.replace("{{choices}}", choices);

        this.container.innerHTML = result;
    };

    /**
     * Maps the current array of possible choices to one long string of HTML.
     * @method
     * @private
     */
    QuillMentions.prototype._getChoicesHTML = function() {
        return this
                .currentChoices
                .map(this._renderChoice, this)
                .join("");
    };

    /**
     * Replaces the {{choice}} and {{data}} fields in a template.
     * @method
     * @private
     */
    QuillMentions.prototype._renderChoice = function(choice) {
        var template = this.options.choiceTemplate,
            result;
        result = template
                    .replace("{{choice}}", choice.name)
                    .replace("{{data}}", choice.data);
        return result;
    };

    /**
     * Returns whether or not there are any choices to display.
     * @method
     * @private
     */
    QuillMentions.prototype.hasChoices = function() {
        return this.currentChoices && this.currentChoices.length;
    };
};