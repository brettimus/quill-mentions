module.exports.addClass = addClass;
module.exports.removeClass = removeClass;
module.exports.getOlderSiblingsInclusive = getOlderSiblingsInclusive;

function addClass(node, className) {
    if (!node) return;
    if (!node.className) node.className = className;
    else if (node.className.indexOf(className) === -1) {
        node.className += " "+className;
    }
}

function removeClass(node, className) {
    if (!node) return;
    while (node.className.indexOf(className) !== -1) {
        node.className = node.className.replace(className, "");
    }
}

function getOlderSiblingsInclusive(node) {
    var result = [node];
    if (!node) return [];
    while (node.previousSibling) {
        result.push(node.previousSibling);
        node = node.previousSibling;
    }
    return result;
}

// helper
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}