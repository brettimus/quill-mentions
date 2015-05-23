# quill-mentions
_very much under construction_

mentions module for quilljs

# Docs

if you build docs, be warned. shit fails if the _full path_ to your repo includes any folders with an underscore. See the issue and fix [here](https://github.com/brettimus/quill-mentions/issues/1).


# Usage
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


# v0 goals
* ~~inject choices (as array)~~
* ~~parse contents~~
* ~~use `@` to summon popover with possible choices matched to text~~
* align popover to position of calling `@` (there are alternatives, see the notes...)


# notes & ideas
* ~~current regex doesn't match hyphenated names, names with periods, or first+middle+last combos~~
* Toolbar
* Staticallys position the mention choices so that the `quill`s container expands with choices. This presents some design challenges, but it solves a lot of the pitfalls of using an absolutely positioned container


# TODO
* Write more robust regex for parsing names
* Hide view after insert
* Don't allow 'womp womp' message to be inserted
* Render ql-mentions container in a more logical position 
