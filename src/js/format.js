module.exports = function addFormat(Mentions) {

    Mentions.prototype.addFormat = function(className) {
        this.quill.addFormat('mention', { tag: 'SPAN', "class": "ql-", });
    };

};