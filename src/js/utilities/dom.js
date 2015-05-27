module.exports.addClass = addClass;
module.exports.getOlderSiblingsInclusive = getOlderSiblingsInclusive;
module.exports.hasClass = addClass;
module.exports.removeClass = removeClass;

function addClass(node, className) {
    if (!hasClass(node, className)) {
        node.className += " "+className;
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

function hasClass(node, className) {
    if (!node) return;
    return node.className.indexOf(className) !== -1;
}

function removeClass(node, className) {
    if (!hasClass(node, className)) return;
    while (node.className.indexOf(className) !== -1) {
        node.className = node.className.replace(className, "");
    }
}