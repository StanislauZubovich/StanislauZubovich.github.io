# Javascript files

    ui/js/
        ├── i18n/               # Locale files
            └── en.js           # Default strings used in js files
        ├── init.js             # Bootstrap script
        ├── README.md           # This file
        └── libs/               # Library files
            ├── hab/            # Scripts specfic to the project
            └── sfr/            # Scripts which can be used across projects
                ├── plugins.js  # Custom JQuery plugins
                └── utils.js    # Utility functions



## Custom Events

### `ajaxifyHabForm.complete`

* Triggered in: `$.fn.ajaxifyHabForm()`
* Elements: `<fieldset>` `<form>`
* Arguments: none
 
Called after AJAX response on a ajaxified form.

### `domUpdated`

* Triggered in: `$.fn.domUpdated()`
* Element: `<body>`
* Arguments: element that triggered the event.

Document DOM has been changed.


### `bh-complete.bh-ajaxLoader`

* Triggered in: `$.fn.habAjaxLoader()`
* Element: `<a>`
* Arguments: none

Function turns `<a>` href into a AJAX response, which is posted into the DOM.  The event is triggered on AJAX response.


### `bh-triggered.bh-ajaxLoader`

* Triggered in: `$.fn.habAjaxLoader()`
* Element: `<a>`
* Arguments: none

Function turns `<a>` href into a AJAX response, which is posted into the DOM.  The event is triggered when the function is called.

## Patterns

### Conceal / Reveal

* Defined in `$('li').revealConceal();`

The pattern

    <ul data-conceal="6" data-reveal="trigger-reveal" data-child="li">
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
    <a href="#" id="trigger-reveal" data-reveal-text="Show all" data-conceal-text="Hide all"></a>

Where

  * `data-reveal` is the id of the element that triggers the reveal
  * `data-conceal` is the number of elements to conceal
  * `data-reveal-text` is the text to change the reveal trigger link to.  
  * `data-child`* is the child tag name to reveal conceal. Optional. Default is 'li'.
  * `data-conceal-text` is the text to change the conceal trigger link to.  Leave blank to remove the link.
  
Use `{{num}}` in the reveal text to as a placeholder for the number of items.  

### Double Submit 

* Defined in `$.fn.checkAndSubmit`

Example pattern:

    <form>
      <label class="radio checked">
        <input type="radio" name="address-id" value="1" checked>
      </label>
      <div class="remove-item">
        <a href="#">Remove this address</a>
      </div>
      <div class="buttons">
        <input type="submit" name="submit" value="Save default address" class="submit orangeSubmit">
        <input type="submit" name="submit" value="Remove address" class="default submit orangeSubmit check-submit">          
      </div>
    </form>
    
Example pattern:
    
    <form>
      <label>
        <input type="radio" name="rfl-card-id" value="card-3">
        <div class="act-remove remove-item">
          <a href="#">Remove account</a>
        </div>
      </label>       
      <div class="buttons">
        <input type="submit" name="submit" value="Remove card" class="submit orangeSubmit check-submit">          
      </div>    
    </form>
    
Clicking on `remove-item a` will check the assoicated radiobox and then submit the form by triggering `input[type=submit].check-submit`.

Note: JQuery has a problem submitting a form using `$('form').trigger('submit')` if there is more than one submit button with the same name attribute in the form.  To get over this, trigger a click on the button:

    $('form input[type=submit].default').trigger('click');
  