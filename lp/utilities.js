
function loadJSON(path, success, error) {
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
    return xhr;
}

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