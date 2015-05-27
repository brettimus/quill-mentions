module.exports = function addController(QuillMentions) {

    /**
     * @method
     */
    QuillMentions.prototype.renderCurrentChoices = function renderCurrentChoices() {
        if (this.hasChoices()) {
            this.render(this._getChoicesHTML());
        }
        else {
            // render helpful message about nothing matching so far...
            this.render(this.noMatchFound);
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