# quill-mentions
_very much under construction_

A mentions module for quilljs

## Docs

if you build docs, be warned. shit fails if the _full path_ to your repo includes any folders with an underscore. See the issue and fix [here](https://github.com/brettimus/quill-mentions/issues/1).


## Usage
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

## Style Dependencies...



# v0 goals
* ~~inject choices (as array)~~
* ~~parse contents~~
* ~~use `@` to summon popover with possible choices matched to text~~
* ~~vertically align popover to position of calling `@`~~

# v0.1 goals
* Customizable no-match-found messages
* Keyboard events for up and down arrows
* Insert data with mention into markup (this might require deviating from custom quill format because custom formats are too nascent :confused:)
* Horizontally align

# TODO
* Find alternative to current use of `transform: translateZ` on the popover list items...
* Write more robust regex for parsing names
* Hide view after insert
* Determine horizontal rendering of mentions container.
* Add keyboard events for up and down arrows
* ~~Don't allow 'womp womp' message to be clicked~~
* ~~Render ql-mentions container in a more logical position~~
