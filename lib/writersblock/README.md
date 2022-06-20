# WritersBlock JS

Simple WYSIWYG editor which uses content editables to create rich text content. 

## Resources:

The system relies on a few primary files to function as expected.

**Styles:**
```
<link rel="stylesheet" type="text/css" href="writersblock/css/writersblock.css">
```

Styles should be loaded in the head, as part of the other media resources for your app. 

**Scripts:**

```
<script type="text/javascript" src="writersblock/js/writersblock.js"></script>
```

Scripts should be loaded in the footer, with any additional files your app requires. This should be loaded before initializing the system. 

**Font Awesome**

```
<script src="https://kit.fontawesome.com/yourkitlink.js" crossorigin="anonymous"></script>
```

If you do want to use the default Font-Awesome icons, ensure you load your Font Awesome 5 Kit 


## Prepare 

The system supports two starting element types, specifically, `textarea` and `contenteditable`. Both options will be converted into a standardized editor, which uses content editable functionality. 

Below is an example of a bear-bones `textarea` which we will add some default content to: 
```
<textarea class="writersblock" placeholder="Start writing here..." name="article_content" disabled="disabled"><strong>Example heading</strong><p>This is an example of some content</p></textarea>
```

## Initialization

WritersBlock uses class based architecture, which means you can initialize the system as seen below: 
```
<script type="text/javascript">
	const editor = new WritersBlock('.writersblock');
</script>
```

Your editor will then be shown as seen below: 
![image](https://user-images.githubusercontent.com/16894783/129740286-22e3a0ae-afaa-41dd-a4e8-a6d0be576e6d.png)

## Basic Options

There are various configuration options which can be adjusted, these should be passed as a second paramarter (`object`):
```
const editor = new WritersBlock('.writersblock', {
  enableResize : false,
  enableToolbar false,
});
```

You can find a full list of options below: 

Option | Type | Default | Description
-------|------|---------|------------
enableLogs | Boolean | false | If true, will log errors, warnings, and info messages in the console
enableResize | Boolean | true | If true, the content editable will be resizable via a handle
enableToolbar | Boolean | true | If true, shows the toolbar above the editor
enablePopup | Boolean | true | If true, shows the popup quick toolbar for basic editing, depends on a selection
enabledTools | Array | false | If set, only show/enable these tools. Should be a list of tool 'slug' names as defined in the tools list
customTools | Array | false | An array containing objects, which define new groups/tools to be added to the system, see the custom tools section for more information
popupTools | Array | 'bold', 'italic', 'underline' | List of tools to be shown in the popup toolbar when a user makes a selection
placeholder | String | '' | Set a custom placeholder, if empty, prefers the `placeholder` attribute
content | String | '' | The content to load by default in the editor, if empty, prefer the HTML content of the element the editor is bound to
predictionMode | int | PREDICTION_MODE_OFF | The prediction mode to follow, defaults to `PREDICTION_MODE_OFF`, supports, `PREDICTION_MODE_WORD` and `PREDICTION_MODE_SENTENCE`. Can be set to a function, which must set a selection in the window to reflect the prediction sample
predictionPolicy | int | PREDICTION_POLICY_PARTIAL | The prediction policy, defaults to `partial` matches, however, can be set to a function which must return a boolean reflecting whether or not the sample matches the current phrase according to custom conditions
predictions | Array|function | false | If array, loops values to look for predictive text matches, if function, passes values off to get a prediction. Useful for more dynamic searches.


## Popup Tools 

Popup tools will be shown whenever a user makes a selection within the editor: 

![image](https://user-images.githubusercontent.com/16894783/129740419-0a8cd356-def8-4572-83dc-89ab6ac3da46.png)

These can be altered using the 'popupTools' property in the config, for example: 

```
const editor = new WritersBlock('.writersblock', {
  popupTools : ['bold', 'h1', 'h2'],
});
```

This would produce a new popup: 
![image](https://user-images.githubusercontent.com/16894783/129740698-f30c47fa-673a-454e-b19d-67f24e13eceb.png)

You could also add custom tool slugs to this tool system if you preferred. 

## Custom Tools

Registering a custom tool can be done via the configuration object:

```
const editor = new WritersBlock('.writersblock', {
  customTools : [
			{
				tag : 'custom-content-group',
				tools : {
					'cutsom-generate' : {
						text : 'EXP',
						title : 'Expand',
						shortcut : {
							commandKey: true,
							shiftKey: true,
							actionKey : 'Enter'
						},
						action : (editor) => {console.log(editor.getSelection().toString()); }
					}
				}
			}
		]
});
```

This will add a new `EXP` menu item, which will console log the current selection to the window. 

You will notice we first create a new `group` as seen here: 

```
{
  tag : 'custom-content-group',
  tools : {
    /* Tools listed here */
  }
}
```

Selecting an existing `tag` will add the tool within the relevat group in the toolbar instead. 

Tool definitions can include the following options, each one should have a unique key:

Key | Value
--- | ----
text | The text label to be shown
icon | The icon (wrapped in an `i` tag to be used instead of text
title | The title to be shown on hover
shortcut | String if the shortcode is automatic, like undo. An object, defining a new shortcut (keyboard) if preferred. If so, you can create rules for commandKey (CTRL/Command), shiftKey and actionKey
action | The default action or a function which will perform some custom logic

## Default Tools

Writers block includes the following default tools:

Key | Description
--- | -----------
undo | Undo a recent action
redo | Redo a recent action
p | Add or wrap selection as a paragraph tag
blockquote | Add or wrap selection as a blockquote tag
h1 | Add or wrap selection as a H1 tag
h2 | Add or wrap selection as a H2 tag
bold | Format text as bold
italic | Format text as italic
underline | Format text as underlined
strikeThrough | Format text as striked
justifyLeft | Align text left
justifyCenter | Align text center
justifyRight | Align text right
justifyFull | Align text justified
outdent | Outdent text
indent | Indent text
createlink | Create a link (Shows built in modal)
unlink | Remove link formatting
insertImage | Create a image (Shows built in modal)
insertUnorderedList | Add an unordered list
insertOrderedList | Add an ordered list
insertHorizontalRule | Add a horizontal rule
removeFormat | Remove formatting

Additional custom tools can be defined easily, and existing tools can be overridden entirely if preferred. 

