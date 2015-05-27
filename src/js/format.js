module.exports = addFormat;

function addFormat(QuillMentions) {
    /**
     * @method
     */
    QuillMentions.prototype.addFormat = function(className) {
        this.quill.addFormat('mention', { tag: 'SPAN', "class": "ql-", });
    };
}