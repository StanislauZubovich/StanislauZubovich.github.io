/**
 * Our global namespace.  Create if not already created.
 */
var SFR = SFR || {};

/**
 * Namespace util functions
 */
SFR.Utils = {};


/**
 * Safari for iOS ignores the size attribute of <select> elements. It always renders a one-line high drop down instead of a multi-line list box.
 * Also applies to android
 * Add a class to the body so we can apply styles to suit
 */
SFR.Utils.fixSizeSelectsIniOS = function() {

  if (navigator.userAgent.match(/iPad|iPhone/i)) {
    $('body').addClass('is-ios');
  }

  if (navigator.userAgent.match(/android/i)) {
    $('body').addClass('is-android');
  }
  if(navigator.userAgent.match(/Windows Phone/i)) {
    $('body').addClass('is-ieMobile');
  }

};

/**
 * Responsive tables
 * Simplified version of http://filamentgroup.com/lab/responsive_design_approach_for_complex_multicolumn_data_tables/
 */
SFR.Utils.deleteResponsiveTables = function(holder) {
	holder = holder ? holder + " " : "";

	$.root.find(holder + 'table.responsive-table-remove-enhanced').each(function(index, item) {
	    $(item).removeClass('enhanced');
	});
};

SFR.Utils.setupResponsiveTables = function(holder) {
  holder = holder ? holder + " " : "";

  $.root.find(holder + 'table.responsive-table').each(function(index, item) {
    var $table = $(item);

    $table.addClass('enhanced');

    var $nav = $('<div class="table-menu"><ul /></div>');
    $nav.hide();

    // Nav checkbox change handler - toggles the respective column
    $nav.on('change', ':checkbox', function() {
      var $this = $(this);
      var $column = $this.data('column');
      var $table = $this.data('table');

      var colIndex = $column.index();

      if($this.is(':checked')) {
        $table.find('thead th').eq(colIndex).css('display', 'table-cell');
        $table.find('tbody tr').each(function(index, row) {
          $(row).children('*').eq(colIndex).css('display', 'table-cell');
        });
      } else {
        $table.find('thead th').eq(colIndex).css('display', 'none');
        $table.find('tbody tr').each(function(index, row) {
          $(row).children('*').eq(colIndex).css('display', 'none');
        });
      }

    });

    // Loop over table headers and generate checkboxes for each
    $table.find('thead th, tbody td').each(function(index, item) {
      var $th = $(item);

      if(!$th.is('.persist')) {

        var toggle = $('<li><label><input type="checkbox" name="toggle-cols" value="" />' + $th.text() + '</label></li>');
        toggle
          .find(':checkbox')
          .data('column', $th)
          .data('table', $table);

        if($th.is('.essential')) {
          toggle
            .find(':checkbox')
            .attr('checked', true);

          if ($th.is('.span5')) {
            $th.attr('colspan', 5);
          }

          if ($th.is('.span4')) {
            $th.attr('colspan', 4);
          }

          if ($th.is('.span3')) {
            $th.attr('colspan', 3);
          }

          if ($th.is('.span2')) {
            $th.attr('colspan', 2);
          }
        }

        $nav.children('ul').append(toggle);
      }
    });


    // Add our menu toggling button
    var $button = $('<a href="#" class="bt column-menu">Columns</a>');
    $button.click(function(e) {
      e.preventDefault();
      $(this)
        .toggleClass('active')
        .next('.table-menu')
        .toggle();
    });

    // Add it all to the dom
    // $table.wrap('<div class="table-wrapper"></div>');
    // $table
    //   .before($button)
    //   .before($nav);
  });
};




/**
 * Clear new rows of floated variable-height list items
 * This is a fallback for browsers that don't support :nth-child (guess who?)
 *
 * @param {String} list
 *   Selector for the <ul /> or <ol /> containing <li>s to be cleared
 * @param {Integer} count
 *   The number of items that should display in each row before the float is cleared
 */
SFR.Utils.clearNthChild = function(ctx,count) {

  var selector = 'li:nth-child('+count +'n+1)';

  $(ctx).find(selector).each(function() {

    $(this).addClass('clear');

  });

};


/**
 * Print page
* @param {String} link
*   selector for element to trigger print function
 */
SFR.Utils.setupPrintLinks = function(link) {
	if (window.print && typeof(window.print) === 'function' && !checkIsWinphone() && !checkIsAndroid()) {
		$.root.on('click', link, function() {
			window.print();
		});
	} else {
		$(link).hide();
	}
};

checkIsWinphone = function () {
	return (navigator.userAgent.toLowerCase().indexOf("iemobile") != -1) || (navigator.userAgent.toLowerCase().indexOf("windows nt") != -1 && navigator.userAgent.toLowerCase().indexOf("touch") != -1) || (navigator.userAgent.toLowerCase().indexOf("windows phone") != -1);
};

checkIsAndroid = function () {	
	return (navigator.userAgent.toLowerCase().indexOf("android") != -1) && (navigator.userAgent.toLowerCase().indexOf("mobile") != -1);
};

/**
 * Partial fix for iPhone viewport scale bug
 * https://gist.github.com/901295
 */
SFR.Utils.scaleFix = function () {

  // Original code from http://www.blog.highub.com/mobile-2/a-fix-for-iphone-viewport-scale-bug/
  var metas = document.getElementsByTagName('meta');
  var i;

  function gestureStart() {
    for (i=0; i<metas.length; i++) {
      if (metas[i].name === "viewport") {
        metas[i].content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";
      }
    }
  }

  if (navigator.userAgent.match(/iPhone/i)) {
    for (i=0; i<metas.length; i++) {
      if (metas[i].name === "viewport") {
        metas[i].content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
      }
    }
    document.getElementsByTagName('body')[0].addEventListener("gesturestart", gestureStart, false);
  }


};

/**
* Customise radio buttons
* This function simply adds applies a hook to a label so that we can render
* custom radio buttons in CSS
*/
SFR.Utils.setupCustomRadioHandlers = function() {

  var oRadio,
      oLabel,
      oP,
      oRadios,
      oRadioChecked;

  /*
    [1]
    Find all checked radios and add .checked class to the label (incase the class wasn't added server-side)
    (This should be fired on DOM ready and again after new AJAX content is added)
  */

  $.root.find('input[type=radio]:checked').each(function(e) {
    if (!$(this).closest('label').hasClass("radio-do-not-checked")) {
      $(this).closest('label').addClass('checked');
    }
  });

  /* Find all disabled radios and add a class to the parent label */
  $.root.find('input[type=radio]:disabled').each(function(e) {
    $(this).closest('label').addClass('is-disabled');
  });

  /*
    [2]
    Add delegated click handlers
    @TODO: don't attach handlers to <label class-"is-disabled"> radios
  */
  $.root.on('click', 'label.radio', function() {

    oLabel = $(this);
    oP = $(this).closest('form');
    oRadio = oLabel.find(':radio');

    if (!oLabel.hasClass("radio-do-not-checked")) {
    /*
     * If disabled or it is already checked, don't do anything
     */
    if ( oRadio.is(':disabled') || oLabel.hasClass('is-disabled') || oLabel.hasClass('checked') ) {
      return;
    }

    /*
     * Find radios sharing same name attribute
     */
    oRadios = oP.find('input[name=' + oRadio.attr('name') + ']');

    /*
     * Remove .checked class from all relevant checkbox and label
     */
    oRadioChecked = $(oP).find('input[name=' + oRadio.attr('name') + ']:checked');
    oRadioChecked
      .prop('checked', false)
      .closest('label')
      .removeClass('checked');


    /*
     * add .checked class to the label of the 'checked' radio (the one that was clicked to fire this)
     */

    oLabel.addClass('checked');

    oRadio.prop('checked', true).trigger("change");
    }
  });
  /*
    [3]
    Handle focus states
  */
  $.root.on('focus', 'label.radio input', function() {

    $(this)
      .parents('label.radio')
        //.click() This lead to unnecessary SKU info AJAX request on PDP while browser window getting focus after focus loss (ALT+TAB for. ex.). See NBTYATG-5383 for details.
        .addClass('has-focus');
  });
  $.root.on('blur', 'label.radio input', function() {

    $(this).parents('label.radio').removeClass('has-focus');

  });


};


/**
* Add 'disabled' attribiute
* (For use with form elements)
* @param {Object} $elem
*   element to manipulate.
*/
SFR.disableElem = function($elem) {

  $elem.attr('disabled', true);

};
/**
* Remove 'disabled' attribiute
* (For use with form elements)
* @param {Object} $elem
*   element to manipulate.
*/
SFR.enableElem = function($elem) {

  $elem.attr('disabled', false);

};


/**
* Collapse it / Expand it!
*
* Matching functions that extend the jQuery .hide() state to ensure that
* hidden content remains accessible to Assistive Technologies
 * @param {Object} target
 *   element to be collapsed.
 * @param {Number} speed
 *   optional argument specifying speed for animation (in milliseconds).
 * @param {Function} callback
 *   Function to be executed on completion.
* Currently it assumes slideUp/slideDown is the desired animation.
* @TODO: develop extra arguments (and set up configuration pattern) to allow alernative animation types
*/

SFR.Utils.collapseIt = function(target, speed, callback) {

  target.slideUp(speed, function() {

    $(this)
      .addClass('visuallyhidden')
      .css({'display': 'block', 'overflow': 'hidden'});

    // A collapsible element can contain more than one element to slide down.
    // We only want trigger the callback when the last element's animation has
    // completed.
    // Check if the callback exists, and is an executable function, then execute it
    if ( (target.length-1) === target.index($(this)) ) {
      if (callback && typeof(callback) === 'function') {
        return callback();
      }
    }


  });

};

/**
 *  Expand a target element
 *
 *  @param {Object} target
 *    Target element.
 *  @param {number} speed
 *    Speed to example in milliseconds.
 *  @param {function} callback
 *    Callback function.
 */
SFR.Utils.expandIt = function(target, speed, callback) {

  SFR.Utils.reapplyBadHiddenState(target, function() {
    target.slideDown(speed, function() {

      // slideDown() also adds an undesirable style="overflow:hidden;" to the target
      // We need to override that to ensure that absolutely positioned children remain visible
      $(target).css({'overflow': 'visible'});

      // A collapsible element can contain more than one element to slide down.
      // We only want trigger the callback when the last element's animation has
      // completed.
      // Then check if the callback exists, and is an executable function, then execute it
      if ( (target.length-1) === target.index($(this)) ) {
        if (callback && typeof(callback) === 'function') {
          return callback();
        }
      }

    });

  });

};



/**
* Reapply bad hidden state
* Return hidden elements to a jQuery-friendly state before animating them open again
 * @param {Object} target
 *   the element to be modified.
 * @param {Function} callback
 *   Function to be executed on completion.
*/
SFR.Utils.reapplyBadHiddenState = function(target, callback) {

  target
    .removeClass('visuallyhidden')
    .css({'display': 'none'});

  // Check if the callback exists, and is an executable function, then execute it
  if (callback && typeof(callback) === 'function') {
    callback();
  }

};


/**
* Accessibly toggle
* Check current state of collapsible element and call expand/collapse function accordingly
 * @param {Object} container
 *   element containing trigger and collapsible elements.
 * @param {Object} target
 *   element to be collapsed.
 * @param {Number} speed
 *   optional argument specifying speed for animation (in milliseconds).
 * @TODO: use configuration pattern
*/
SFR.Utils.accessiblyToggle = function(container, target, speed, callback) {

  // Specify default incase no arg for animation speed is passed by the calling function
  var defaultSpeed = 300,
      $speed = (speed) ? speed : defaultSpeed;

  if (container.hasClass('is-collapsed')) {
    SFR.Utils.expandIt(target, $speed, callback);
  } else {
    SFR.Utils.collapseIt(target, $speed, callback);
  }

};


/**
* Set up collapsibles
* Collapse on load (if specified in HTML), and add click handlers
* The chain of events triggered here requires the following DOM structure:

<element class="collapsible" />   <= the container (optionally also class="is-collapsed")
  <element class="trigger" />     <= the control for the animation
  <element class="target" />      <= the element to be collapsed

*/
SFR.Utils.setUpCollapsibles = function() {

  $.root.find('.collapsible').each(function() {

    var $ctx = $(this),
        $trigger,
        $triggerIcon,
        replaceText,
        $target = $ctx.find('.target');

    // Check to see if trigger already exists in markup
    if ($ctx.find('.trigger').length) {

      $trigger = $ctx.find('.trigger');

    // If not, we need to make one
    } else {

      // Set default button text
      var defaultTxt = 'Show more';

      $trigger = $('<button />')
                   .addClass('trigger')
                   .html(defaultTxt)
                   .appendTo($ctx);

    }

    if ($ctx.hasClass('is-collapsed')) {
      SFR.Utils.collapseIt($target);
    }

    $trigger.click(function() {

      SFR.Utils.accessiblyToggle($ctx, $target, 300, function(e) {

        if ( !$trigger.hasClass('button') && ( !$trigger.data('text-hide') || !$trigger.data('text-show') ) ) {
          return;
        }

        $triggerIcon = $trigger.find('span');

        if ( $ctx.hasClass('is-collapsed') ) {
          // expanded
          $trigger.html($trigger.data('text-hide'));
          $triggerIcon.removeClass('ico-expand')
            .addClass('ico-collapse')
            .prependTo($trigger);

        }
        else {
          // collapsed
          $trigger.html($trigger.data('text-show'));
          $triggerIcon.removeClass('ico-collapse')
            .addClass('ico-expand')
            .prependTo($trigger);

        }

        $trigger.html(replaceText);

        $ctx.toggleClass('is-collapsed');
        $ctx.toggleClass('is-expanded');

      });



      // If the button is inside a form we need to prevent it submitting
      return false;

    });

  });

};





/**
 * Equal heights
 * Make things equal height, for OCD, cos it looks proper neat
 *
 * @param {Object} columns
 *   Common selector for objects to be aligned.
 */
SFR.Utils.setEqualHeight = function(columns) {

  var tallestColumn = 0,
      currentHeight = 0;

  $.root.find(columns).each(function() {

    currentHeight = $(this).innerHeight();

    if (currentHeight > tallestColumn) {

      tallestColumn = currentHeight;

    }

  });

  $.root.find(columns).height(tallestColumn);

};



/**
 * Remove equal heights.
 *
 * @param {Object} columns
 *    JQuery selector
 */
SFR.Utils.unSetEqualHeights = function(columns) {

  // @TODO:If window is loaded at 980 then resized down, some elements become narrower and so their height could need to change
  // So, when this function is called we need to remove any previously set inline height declaration, then set it again

};



/**
* Select list navigation
*
* This function send ajax request on change, url is a value of the selected option
* It will also hide any submit button present in the container markup
*
* @param {String} ctx
*   Selector for a container for the select list to be initialised.
*
* @return {boolean}
*   Return false on navselect change .
*/
SFR.Utils.activateSelectListNavs = function(ctx) {
  if ( $(ctx).find('select').length) {

    // Hide submit button
    if ( $(ctx).find('[type="submit"]').length) {

      $(ctx).find('[type=submit]').hide();

    }

    // Hide label text
    if ( $(ctx).find('.label-txt').length) {

      $(ctx).find('.label-txt').hide();

    }

    // Event handler for select
    $(ctx).find('select').on('change', function() {

      var url = $(this).val();

      if (url) {
          ajaxLoadingPage(url);
      }
      return false;

    });
    return true;
  }
};


/**
 * Highlight target
 * If we animate or jump to an element on the same page,
 * highlight it temporarily to make sure the user knows where to look
 *
 * Requires jquery.color.js to animate colour values
 * Note: as we're animating the background colour back to a transparent state,
 * the target should *not* be an element that has a background colour applied with CSS.
 *
 * @todo: add an optional bgColour param (passing optional settings as an object?)
 *
 * @param {Object} target
 *   ID of element to highlight.
 * @param {Number} duration
 *   Length of time to display highlight before animating back to transparent state.
 */
SFR.Utils.highlightLocalTarget = function(target, duration) {

  var $target = $(target),

      // Set RGBa background colour to use as highlight
      bgColour = 'rgba(92,151,176,.3)',

      // Use default if no param for duration is passed by the calling function
      defaultDuration = 750,
      $duration = (duration) ? duration : defaultDuration;

  $target
    .css('backgroundColor', bgColour)
    .delay($duration)
    // animate back to *transparent* rgba colour
    .animate({'backgroundColor': 'rgba(255,255,255,0)'}, 750);
};



/**
 * Scroll to..
 * Animate the window to the target of any in-page anchors, nice and smooth like chocolate
 *
 * @param {String} scrollTarget
 *   ID of element to scroll to.
 * @param {String} speed
 *   speed of animation.
 * @param {Function} callback
 *   so we can trigger further events once the animation is complete
 * Currently uses Ariel Flesler's jquery.scrollTo.js for animation (flesler.blogspot.co.uk/2007/10/jqueryscrollto.html).
 */
SFR.Utils.scrollToLocalTarget = function(scrollTarget, speed, callback) {

  // If no speed param is passed by the calling function, use default
  var $defaultSpeed = 300,
      $speed = (speed) ? speed : $defaultSpeed;

  // Only do stuff if we're not already animating the window
  if (!$(window).is(':animated')) {

    $.scrollTo(scrollTarget, $speed, function() {

      // Check if the callback exists, and is an executable function
      if (callback && typeof(callback) === 'function') {

        // Execute the callback
        callback();
      }
    });
  }
};


/**
 * In-page links
 * Function to trigger chain of events that nice up the interaction when
 * a user clicks a link that navigates to an element in the same page
 * @param {String} localLinkSelector
 *   classname for links to initialise.
 * It assumes presence of valid href attribute on initialised <a />s.
 */
SFR.Utils.niceUpInPageNav = function(localLinkSelector) {

  // Attach delegated event handlers
  $.root.on('click', localLinkSelector, function() {

    // The target is identified in the href of the link we're clicking
    var $scrollTarget = $(this).attr('href');

    // Animate the window until the target is at the top of the viewport
    // (optionally specifying a speed for the animation)
    SFR.Utils.scrollToLocalTarget($scrollTarget, 500, function() {

      // Once animation is complete, temporarily highlight the target
      // (optionally specifying a duration for the highlight)
      SFR.Utils.highlightLocalTarget($scrollTarget);

      // and set focus for keyboard users
      $scrollTarget.setKeyboardFocus();

    });
  });
};



/**
 * Activate popups
 *
 * Opening image link in lightbox
 */

SFR.Utils.activatePopUps = function() {

  $.root.find('.new-window').on('click', function() {

    var $oAnchor = $(this);

    HAB.hookContentLightbox($oAnchor);
    return false;

  });

};


/**
 * Polyfill support for HTML5 placeholder text
 * https://github.com/mathiasbynens/jquery-placeholder
 *
 * Automatically checks if the browser natively supports the HTML5 placeholder attribute
 * for input and textarea elements. If this is the case, the plugin won’t do anything.
 */
SFR.Utils.polyfillPlaceholderText = function() {

  $(':input').placeholder();

};

SFR.Utils.getCaret = function(el) {
   if (document.selection) {
    el.focus();

    var r = document.selection.createRange();
    if (r === null) {
      return 0;
    }

    var re = el.createTextRange(),
        rc = re.duplicate();
    re.moveToBookmark(r.getBookmark());
    rc.setEndPoint('EndToStart', re);

    return rc.text.length;
  }
  return 0;
};

/**
 * Analog of the scrollToLocalTarget function, but implemented via jQuery.animate 
 * (jQuery.scrollTo may not working in ie8 in some cases and on Nexus)
 * 
 * @param target - element to which need to scroll
 * @param duration - determine how long the animation will run, default is 800
 */
SFR.Utils.scrollTo = function(target, duration){
  /* 
   * Set timeout is a temporary workaround for issue 
   * NBTYATG-5492 : [UI] the scroll doesn't jump to correct place to show delivery address completely in specific case
   * Looks like the DOM not fully loaded or initialized at the moment of scrolling.
   * Early this issue was resolved by setting class "clearLeft" to the target, 
   * but this is not working for editing delivery address for some reasons. 
   */
  setTimeout(function() {
    $('html, body').animate({
      scrollTop: $(target).offset().top
    }, duration ? duration  : 800);
  }, 100);
};

/**
 * Show or hide ajax loader
 * 
 * @param target - loader will be displayed in the center of target element.
 *                 if target is not defined loader will be centered on the whole screen.
 */
SFR.Utils.switchAjaxLoader = function(target) {
  if (!$('.ajax-loader').is(':visible')){
    SFR.Utils.showAjaxLoader(target);
  } else {
    SFR.Utils.hideAjaxLoader();
  }
}

/**
 * Show ajax loader
 * 
 * @param target - loader will be displayed in the center of target element.
 *                 if target is not defined loader will be centered on the whole screen.
 */
SFR.Utils.showAjaxLoader = function(target) {
  var $ajaxLoaderBG = $('.ajax-loader-bg');
  var $ajaxLoader = $('.ajax-loader');
  
  $ajaxLoaderBG.css({
    height: $(document).height(),
    width: $(document).width()
  }).show();
  $ajaxLoader.center(target).show();
}

/**
 * Hide ajax loader
 */
SFR.Utils.hideAjaxLoader = function() {
  $('.ajax-loader-bg, .ajax-loader').hide();
}

/**
 * Check fields and show or hide ajax loader 
 * 
 * @param field1 - first field to check
 * @param field2 - second field to check 
 *            
 */
SFR.Utils.checkAndSwitchAjaxLoader = function(field1, field2) {
	if (($.trim($(field1).val()) !== '') && ($.trim($(field2).val()) !== '')
			&& ($.trim($(field1).val()) === $.trim($(field2).val()))) {
		SFR.Utils.switchAjaxLoader();
	}

}

/**
 * Language translations
 * 
 * @param {String}
 *            str The string to translate
 */
var _t = function(str) {
  return i18n[str] !== undefined ? i18n[str] : str;
};

/**
 * Object for parse url on components for easy handling.
 */
var Url = {
    parse : function(stringUrl) {
        var urlBase = stringUrl;
        var urlParams = {};
        var urlFragment = "";
        
        var splitFragment = urlBase.split("#", 2);
        urlBase = splitFragment[0];
        if (splitFragment.length > 1) {
            urlFragment = splitFragment[1];
        }
        
        var splitQuery = urlBase.split("?", 2);
        urlBase = splitQuery[0];
        if (splitQuery.length > 1) {
            urlParams = this.parseQueryString(splitQuery[1]);
        }
        
        return {
            base : urlBase,
            params : urlParams,
            fragment : urlFragment,
            toString : function() {
                var res = this.base;
                var q = $.param(this.params);
                var f = this.fragment;
                if (q.length != 0){
                    res += "?" + q;
                }
                if (f.length != 0){
                    res += "#" + f;
                }
                return res;
            }
        }
    },
    parseQueryString : function(query){
      var urlParams = {};
      query = query.replace("?", "");
      var queryParts = query.split("&");
      for(var i=0;i< queryParts.length; i++){
          var p = queryParts[i].split("=");
          if(p[1]){
              urlParams[this.decodeUri(p[0])] = this.decodeUri(p[1]);
          } else if (p[0]) {
              urlParams[this.decodeUri(p[0])] = "";
          }
      }
      return urlParams;
    },
    decodeUri : function(uri){
      return decodeURIComponent(uri.replace(/\+/g, ' '));
    }
};
