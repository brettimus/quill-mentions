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
**NYW**


# v-3 goals
* ~~inject choices (as array)~~
* ~~parse contents~~
* ~~use `@` to summon popover with possible choices matched to text~~
* ~~vertically align popover to position of calling `@`~~

# v-2 goals
* ~~Customizable no-match-found messages~~ TODO - figre out how to configure so there's _no message_. Was running into issues trying this out.
* ~~Keyboard events for up and down arrows~~ Also for escape and enter!
* ~~Insert data with mention into markup (this might require deviating from custom quill format because custom formats are too nascent :confused:)~~ Currently, the `data-mention` attribute from a matching `li` is appended to the class of a mention `span`. This is hacky, but it avoids having to manually insert HTML...
* Horizontally align the popover

# V-1 goals
* Refactor with MVC
* Break out defaultFactory (the main default object has toooo much shit on it.)
* **Horizontally align the popover**

# TODO
* Find alternative to current use of `transform: translateZ` on the popover list items...
* Write more robust regex for parsing names
* Hide view after insert
* Determine horizontal rendering of mentions container.
* Add keyboard events for up and down arrows
* ~~Don't allow 'womp womp' message to be clicked~~
* ~~Render ql-mentions container in a more logical position~~
