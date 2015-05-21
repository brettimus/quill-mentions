# quill-mentions
_very much under construction_

mentions module for quilljs


# to use
`quill-mentions` exposes a single global variable, `QuillMentions`. 

To include `quill-mentions`, simply add the relevant styles, the Quill editor itself, and the quill-mentions module on your page.

Pass the global `QuillMentions` contsructor to Quill's [registerModule](http://quilljs.com/docs/api/#quillregistermodule) function, and add `mentions` to your module config when you instantiate your editor(s).


```html
<link rel="stylesheet" href="/path/to/quill-mentions.css">
...
<script src="/path/to/quill.min.js"></script>
<script src="/path/to/quill-mentions.min.js"></script>
<script>
  Quill.registerModule("mentions", QuillMentions);
  var editor = new Quill('#editor-container', {
    modules: {
      'mentions': { /* add your configuration here */ },
    }
  });
</script>
```

Register the module
```javascript

```


# v0 goals
* ~~inject choices (as array)~~
* ~~parse contents~~
* ~~use `@` to summon popover with possible choices matched to text~~
* align popover to position of calling `@` (there are alternatives, see the notes...)


# notes & ideas
* current regex doesn't match hyphenated names, names with periods, or first+middle+last combos
* use static positioning on the mention choices so that the quill container expands with choices. this presents some design challenges, but it solves a lot of the pitfalls of using an absolutely positioned container
* place mentions container in the toolbar


# todo
* 
* write more robust regex for parsing names
* render ql-mentions container in a more logical position 
