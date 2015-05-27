module.exports.getOlderSiblingsInclusive = getOlderSiblingsInclusive;

function getOlderSiblingsInclusive(node) {
    var result = [node];
    if (!node) return [];
    while (node.previousSibling) {
        result.push(node.previousSibling);
        node = node.previousSibling;
    }
    return result;
}