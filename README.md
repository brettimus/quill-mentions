# :construction: quill-mentions
_Under construction_

An at-style mentions module for quilljs.

## Get it.
You can get `quill-mentions` through npm
```bash
$ npm install quill-modules
```
Or you can just take the files from the `dist` folder. That works too.

## Use it.
`quill-mentions` exposes a single global variable, `QuillMentions`. 

To include mentions in your Quill project, simply add the stylesheet and all the Javascripts to your page.

Pass the global `QuillMentions` contsructor to Quill's [registerModule](http://quilljs.com/docs/api/#quillregistermodule) function, and add `mentions` to your module config when you instantiate your editor(s).

```html
<head>
  ...
  <link rel="stylesheet" href="/path/to/quill-mentions.css">
  ...
</head>
<body>
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

</body>
```

## Docs

The docs are not as exhaustive as they should be, but they live (nonetheless) in the `docs` folder.

:warning: If you build the docs, be warned that your build will fail if the _full path_ to your clone/fork of the repo includes any folders with an underscore. See the issue and fix [here](https://github.com/brettimus/quill-mentions/issues/1).


## Style Dependencies...
**Not Yet Written**


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
* ~~Refactor with MVC~~
* Break out defaultFactory (the main default object has toooo much :shit: on it.)
* **Horizontally align the popover**
* Refactor styles to not rely on dom elements

# V-0 goals 
* More flexible templates, allow custom `value` accessor functions
* Allow config to turn of quill custom format
* Customizable hotkeys

# TODO
* Determine horizontal rendering of mentions container.
* Find alternative to current use of `transform: translateZ` on the popover list items...
* ~~Write more robust regex for parsing names (separate for work)~~
* ~~Hide view after insert~~
* ~~Add keyboard events for up and down arrows~~
* ~~Don't allow 'womp womp' message to be clicked~~
* ~~Render ql-mentions container in a more logical position~~
