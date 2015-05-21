/**
 * @module format
 */
 
module.exports = addFormat;

function addFormat(Mentions) {
    Mentions.prototype.addFormat = function(className) {
        this.quill.addFormat('mention', { tag: 'SPAN', "class": "ql-", });
    };
}