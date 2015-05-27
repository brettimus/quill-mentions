var escapeRegExp = require("./regexp").escapeRegExp;

module.exports = {
    all: replaceAll,
};

/**
 * @param {stirng} [options] - RegExp options (like "i"). Defaults to the empty string.
 **/
function replaceAll(string, toReplace, replaceWith, options) {
    options = options || "";
    var reOpts = "g" + options,
        re     = new RegExp(escapeRegExp(toReplace), reOpts);

    return string.replace(re, replaceWith);
}