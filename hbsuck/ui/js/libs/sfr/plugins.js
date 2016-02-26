(function($)
{
    /**
     * Turns inline content into a set of tabs the user can switch between.
     *
     * Options:
     * --------
     *  sContentSelector:   jQuery selector to find ‘content’ blocks (Required)
     *  sHeaderSelector:  jQuery selector to find header within content blocks (Required)
     *  sContainerClass:  class to add to containing element (ie, the element we're calling this on)
     *  sTabClass:      class to add to tab bar (optional, default 'cf ui_tabs')
     *  sContentClass:    class to add to each content block (optional, default: 'ui_tabContent')
     *  sActiveClass:     class to add to active tab
     *  bRemoveHeader:    whether or not to remove header element from block (optional, default: true)
     *
     * @param option  configuration options (required)
     */
    $.fn.tabbedContent = function(option)
    {
      var opt = $.extend(true, {
        sContentSelector: '',
        sHeaderSelector: '',
        sContainerClass: 'ui_tabbedContent',
        sTabClass: 'ui_tabs cf',
        sContentClass: 'ui_tabContent',
        sActiveClass: 'ui_active',
        bRemoveHeader: true
      }, option);

      return this.each(function()
      {
        var oT  = $(this).addClass(opt.sContainerClass),
          oTc = $('<ul>').prependTo(oT).addClass(opt.sTabClass),
          aoC = oT.find(opt.sContentSelector);

        // remove stuff
        aoC.each(function(idx)
        {
          var oH = $(this).addClass(opt.sContentClass).find(opt.sHeaderSelector);
          if (opt.bRemoveHeader) {
            oH.remove();
          }
          oTc.append('<li class="i'+idx+'" data-slide="'+idx+'"><a href="#">'+oH.html()+'</a></li>');
        }).hide();

        // hook up events
        oTc.children().on('click', function()
        {
          var oL = $(this);

          oL.addClass(opt.sActiveClass).siblings().removeClass(opt.sActiveClass);
          oL.parent().siblings(opt.sContentSelector).hide().eq(oL.data('slide')).show();
          return false;
        }).eq(0).trigger('click');
      });
    };


    /**
     * Set keyboard focus
     * Move focus to target element so that keyboard users' next tab click doesn't return them to whence they came
     * Assimilated from WebAIM (webaim.org/media/scripts/main.js)
     *
     * @param {String} target
     *   ID of element to move focus to.
     */
    $.fn.setKeyboardFocus = function() {
      var $target = $(this);
      // Set tabindex on the target so IE knows it is focusable,
      $target.attr('tabindex', -1);
      
      $target.focus();
    };
    
    
    
    /**
     * Generalised plugin that makes a CSS flyout menu keyboard-accessible.
     *
     * Options
     * -------
     *  sSubnavSelector     a jQuery selector to grab the sub-nav element (required)
     *  sActiveClass        the class to add to the menu item when the menu is active (optional, default: 'hover')
     *
     * @param   opt an object containing configuration options for this plugin.
     * @return  the jQuery object this function was called on
     */
    $.fn.accessifyFlyout = function(opt)
    {

        // 0. options
        var _opt = $.extend(true, {
            sSubnavSelector: '',
            sActiveClass:    'hover'
        }, opt);

        // 1. check we have a subnav selector (don't care if it matches)
        if (_opt.sSubnavSelector === '')
        {
            return this;
        }

        // 2. hook everything up.
        // note: doing this in an each() so we have an absolute reference to the parent element all the time
        this.each(function()
        {
            var oParent = $(this);

            // a. individual links in the subnav
            oParent.find(_opt.sSubnavSelector+' a').on('focus', function()
            {
                oParent.addClass(_opt.sActiveClass);
            }).on('blur', function()
            {
                oParent.removeClass(_opt.sActiveClass);
            });

            // b. Toggle classname on <li /> when any nested <a /> is has focus
            //    Firstly, MSIE 7+8 doesn't seem to apply 'element:focus + .stuff'-type selectors until
            //     something else on the page changes (no idea, sorry!) 
            //    Secondly, this gives us the hook to style consistently across focus and hover states.
            oParent.children('a').on('focus', function()
            {
                oParent.addClass(_opt.sActiveClass);
            }).on('blur', function()
            {
                oParent.removeClass(_opt.sActiveClass);
            });
        });

        // 3. drop out
        return this;
    };

    /**
     * Plug-in to watch for swipe events on objects. This has to be manually triggered on elements, it doesn’t globally
     * listen to everything.
     *
     * Options
     * -------
     *  iMinSuppressDelta   the minimum of horizontal movement on the element before we start inhibiting scrolling
     *                      (default: 10px)
     *  iMaxSwipeTime       the maximum amount of time a ‘swipe’ can take (after that, it’s just interaction)
     *                      (default: 1000ms)
     *  iMinHorizDelta      minimum horizontal distance before we consider interaction a swipe (30px)
     *  iMaxVertDelta       maximum vertical distance that we consider a swipe, otherwise it’s just interaction (75px)
     *
     * @param   opt configuration options (optional)
     */
    $.fn.enableSwipe = function()
    {
        var _opt = $.extend({
            iMinSuppressDelta: 10,          // minimum amount of (horiz) swipe before we stop scrolling
            iMaxSwipeTime:     1000,        // maximum amount of time we’ll watch for swiping, before we give up
            iMinHorizDelta:    30,          // minimum horizontal distance before we trigger a swipe
            iMaxVertDelta:     75           // maximum vertical distance at which we trigger a swipe
        }, (arguments.length === 1) ? arguments[0] : {});
        
        return this.on('touchstart.swipe', function(event)
        {            
            var oThis = $(this),
                oTouchEvent = event.originalEvent.touches[0],
                oStart = {
                    time: new Date().getTime(),
                    pos: {x: oTouchEvent.pageX, y: oTouchEvent.pageY},
                    target: $(event.target)
                },
                oEnd = null;

            // 1. bind move event
            oThis.on('touchmove.swipe', function(event)
            {
                oTouchEvent = event.originalEvent.touches[0];
                
                // a. store current info into oEnd object
                oEnd = {
                    time: new Date().getTime(),
                    pos: {x: oTouchEvent.pageX, y: oTouchEvent.pageY}
                };
                
                // b. if we’ve scrolled sufficiently far, cancel scrolling
                if (Math.abs(oStart.pos.x - oEnd.pos.x) > _opt.iMinSuppressDelta)
                {
                    event.preventDefault();
                }
            });
            
            // 2. bind end event
            oThis.on('touchend.swipe', function()
            {
                // a. unbind events
                oThis.off('touchmove.swipe touchend.swipe');
                
                // b. if it’s quick enough, and triggers threshholds
                if (((oEnd.time - oStart.time) < _opt.iMaxSwipeTime) &&
                    (Math.abs(oStart.pos.x - oEnd.pos.x) > _opt.iMinHorizDelta) &&
                    (Math.abs(oStart.pos.y - oEnd.pos.y) < _opt.iMaxVertDelta)
                )
                {
                    oStart.target.trigger('swipe').trigger((oEnd.pos.x > oStart.pos.x) ? 'swiperight' : 'swipeleft');
                }
                
                // c. teardown
                oStart = null;
                oEnd   = null;
            });
        });
    };
    /**
     *  Hide / Reveal plugin
     *  
     *  Apply to ul elements.
     *  
     *  data attributes:
     *  
     *    conceal
     *      Number of li elements to hide.
     *    reveal
     *      The id of the link that triggers the conceal / reveal.
     *    child
     *      The child tag name to reveal conceal. Default is 'li'.
     *    reveal-text
     *      Text to change the trigger a to.  Leave blank to remove the elemnt
     *      
     *  @todo breakout 'init' into seperate method so that we can reinit when
     *  the dom changes, i.e. keep any new li's hidden.
     */
    $.fn.revealConceal = function() {
      return this.each(function() {
        var oElm = $(this),
        nConceal = parseInt(oElm.data('conceal'), 10)-1,
        oTrigger = $('#' + oElm.data('reveal')),
        oChild = oElm.data('child');
        
        if (typeof oChild === 'undefined' || oChild === '') {
            oChild = 'li';
        }
        
        /*
         * First count all the li's to see if we need to do anything, i.e. if 
         * the number of items is less than data-conceal attribute, then we don't
         * need to do anything.
         */         
        if ( oElm.find(oChild).length <= (nConceal+1) ) {
          oTrigger.hide();
        }
        else {
          oTrigger.show();
        }
        
        /*
         * Change the trigger html to the data-reveal-text attribute
         */
        if ( oTrigger.data('reveal-text') != null ){
          oTrigger.html(oTrigger.data('reveal-text').replace('{{num}}', 12));
        }
        oElm.find(oChild + ':gt(' + nConceal + ')').hide();
        //SFR.Utils.collapseIt(oElm.find(oChild + ':gt(' + nConceal + ')'), 'fast');
        
        /*
         * ensure the event doesn't get added more than once.
         */
        if ( oElm.data('has-reveal-event') === true ) {
          return;
        }
        
        oElm.data('has-reveal-event', true);
        
        oTrigger.on('click', function(e) {
          
          if ( !oElm.hasClass('revealed') ) {
            //SFR.Utils.expandIt(oElm.find(oChild + ':gt(' + nConceal + ')'), 'fast');            
            oElm.find(oChild + ':gt(' + nConceal + ')').slideDown('fast');
           
            if ( !oTrigger.data('conceal-text') ) {
              oTrigger.remove();
            }
            else {
              oTrigger.html(oTrigger.data('conceal-text'));
            }

            oElm.addClass('revealed');
          }
          else {
            //SFR.Utils.expandIt(oElm.find(oChild + ':gt(' + nConceal + ')'), 'fast');
            oElm.removeClass('revealed');
            oElm.find(oChild + ':gt(' + nConceal + ')')
              .slideUp('fast')
              .removeClass('revealed');    

            oTrigger.html(oTrigger.data('reveal-text'));
            
          }
          e.preventDefault();
        });
      });
    };
    
    /**
     *  Check and submit pattern.
     *  
     *  When clicking on a link with parent .remove-item, the link
     *  will check the associated radio, and submit the form.
     *  
     *  No expiclity declaration of the radio to click, so currently it is
     *  reliant on markup pattern.
     */
    $.fn.checkAndSubmit = function() {
      
      var oElm = {};
      
      return this.each(function() {
        
        oElm = $(this);
        
        oElm.on('click', function(e) {
          $(this).parent('.remove-item')
            .parent()
            .find('input[type=radio]')
            .attr('checked', true);
         
          $(this).closest('form')
            .find('.check-submit')
            .trigger('click');  
     
          e.preventDefault();  
        });
      });
    };

    
    $.fn.equalHeight = function() {
        var setEqualHeight = function ($panels) {
            var tallest = 0;
            
            $panels.height('auto').each(function () {
                var $panel = $(this);
                
                var panelHeight = $panel.height();
                
                if (panelHeight > tallest) {
                    tallest = panelHeight;
                }
                
                $(this).find('img').unbind('.fixEqualHeight').bind('load.fixEqualHeight', function () {
                    var panelHeight = $panel.height('auto').height();
                    
                    if (panelHeight > tallest) {
                        tallest = panelHeight;
                        
                        $panels.height(tallest);
                    }
                });
            });
            
            $panels.height(tallest);
        }

        setEqualHeight(this);
        
        return this;
    };

    /**
     * Inline (client-side) form validation plug-in. This is built on and hooks into the current HTML5 input validation
     * specification and provides unified, cross-browser form validation.
     *
     * This provides:
     *  - support for required fields, through ‘required’ attribute
     *  - basic input validation based on input type (email, tel, etc)
     *  - range checking for numeric fields through ‘max’ and ‘min’ attributes, if specified
     *  - complex regex-based matching through ‘pattern’ attribute
     *  - customisable error messaging, via data attributes (see below—not part of the HTML5 spec).
     *
     * The aim is to provide the functionality of the HTML5 input spec across all browsers, and in a way that’s easily
     * stylable (ie, messaging is via DOM injection, rather than internal browser methods). Like the new features of
     * HTML5, it degrades gracefully in browsers that don’t have JS enabled.
     *
     * USAGE
     * - specify validation rules, as per HTML5 spec
     * - call this function on fields you want validated.
     * - ...
     * - profit!
     *
     * ERROR MESSAGING
     * This function provides basic error messages, but allows these to be overridden on a per-field basis as required
     * using data attributes. These are:
     *
     *  data-required-message:  message shown when field is required
     *  data-invalid-message:   message shown when input is invalid
     *  data-confirm-message:   message shown when confirmation criteria is not met (required)
     *
     *
     * OPTIONS
     *  - sRequired:    the default message shown when field is required
     *  - sValid:       the default message shown when field value is invalid (may be overriden by type-specific rules)
     *  - sParentSelector:  an ancestor selector used to select the ‘parent’ element to which error classes and messages
     *                  are added. If you want to select the direct parent of the input, specify null.
     *                  Default: null
     *  - sParentErrorClass: the class to add to the parent (see sParentSelector) if there’s an error on the field
     *                  Default: 'error'
     *  - sMsgMarkup:   any markup you wish to wrap the error message in.
     *                  Default: <em class="error"/>
     *
     * @TODO
     *  - date/time fieldtype range validation
     *  - selenium tests
     *  - move asRangeMsg into field-specific data attributes
     *
     * --
     * jdp/2012 :: share and enjoy
     *
     * ----------------------------------------------------------------------------------------------------------------
     *
     * @param   opt     an object containing specific options for this instance of the function (see OPTIONS) above.
     *                  Default: null (no overrides)
     */
    $.fn.removeInlineValidation = function()
    {
        this.each(function() {
          $(this).siblings('em.error').remove();
          $(this).off('keyup.inlineValidation');
          $(this).off('blur.inlineValidation');
          $(this).parent().removeClass("error");
          $(this).removeClass('validated-inline');
   //       $(this).val(1);
        });
        return true;
    };
    $.fn.inlineValidation = function()
    {
        // predefined validation settings—taken from HTML5 field types
        var __oPredefValid = {
            datetime: {
                // Validates YYYY-MM-DDTHH:II:SSZ or YYYY-MM-DDTHH:II:SSZ(+-)HH:MM
                rValidate: /^(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|((\+|\-)(\d{2}):(\d{2})))$/,
                fValidate: function(a)
                {
                    // date
                    if ((parseInt(a[1], 10) <  0) ||
                        (parseInt(a[2], 10) > 12) ||
                        (parseInt(a[3], 10) > 31))
                    {
                        return false;
                    }
                    
                    // time
                    if ((parseInt(a[4], 10) > 23) ||
                        (parseInt(a[5], 10) > 59) ||
                        (parseInt(a[6], 10) > 59))
                    {
                        return false;
                    }
                    
                    // short-circuit timezone if zulu
                    if (a[7] === 'Z')
                    {
                        return true;
                    }
                    
                    // validate offset
                    return  ((parseInt(a[10], 10) > 0) && (parseInt(a[10], 10) < 13) && (parseInt(a[11], 10) < 59));
                },
                sValid: 'Input must be in valid datetime format',
                bCaseSensitive: true
            },
            datetimelocal: {
                rValidate: /^(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{2})?$/,
                fValidate: function(a)
                {
                    // date
                    if ((parseInt(a[1], 10) <  0) ||
                        (parseInt(a[2], 10) > 12) ||
                        (parseInt(a[3], 10) > 31))
                    {
                        return false;
                    }
                    
                    // time
                    if ((parseInt(a[4], 10) > 23) ||
                        (parseInt(a[5], 10) > 59) ||
                        (parseInt(a[6], 10) > 59))
                    {
                        return false;
                    }
                    return true;
                },
                sValid: 'Input must be in valid local time format',
                bCaseSensitive: true
            },
            date: {
                rValidate: /^(\d{4})\-(\d{2})\-(\d{2})$/,
                fValidate: function(a)
                {
                    // date
                    if ((parseInt(a[1], 10) <  0) ||
                        (parseInt(a[2], 10) > 12) ||
                        (parseInt(a[3], 10) > 31))
                    {
                        return false;
                    }
                    
                    return true;
                },
                sValid: 'Input must be in YYYY-MM-DD format'
            },
            month: {
                rValidate: /^(\d{4})\-(\d{2})$/,
                fValidate: function(a)
                {
                    return ((parseInt(a[1], 10) > 0) && (parseInt(a[2], 10) < 13));
                },
                sValid: 'Input must be in YYYY-MM format'
            },
            time: {
                rValidate: /^(\d{2}):(\d{2}):(\d{2})(\.(\d{2}))?$/,
                fValidate: function(a)
                {
                    if ((parseInt(a[1], 10) > 24) ||
                        (parseInt(a[2], 10) > 59) ||
                        (parseInt(a[3], 10) > 59))
                    {
                        return false;
                    }
                    
                    // no point in validating hundredths of a second-the regex will do that for us
                    return true;
                },
                sValid: 'Input must be in HH:MM:SS or HH:MM:SS.nn format'
            },
            week: {
                rValidate: /^(\d{4})\-(\d{2})$/,
                fValidate: function(a)
                {
                    return ((parseInt(a[1], 10) > 0) && (parseInt(a[2], 10) < 54));
                },
                sValid: 'Input must be in YYYY-WW format'  
            },
            number: {
                rValidate: /^\-?\d+(\.\d+)?$/,
                sValid: 'Input must be a valid number'
            },
            range: {
                rValidate: /^\-?\d+(\.\d+)?$/,
                sValid: 'Input must be a valid number'
            },
            email: {
                // regex taken from rfc3696
                 rValidate: /^[a-z0-9!$'*+\-_&]+(\.[a-z0-9!$'*+\-_&]+)*@([a-z0-9]+(-+[a-z0-9]+)*\.)+([a-z]{2,6})$/,
                 sValid: 'This should be a valid email address (eg. john.smith@domain.com)'
            },
            url: {
                rValidate: /^https?:\/\//,
                sValid: 'Input must be a valid URL'
            },
            tel: {
                rValidate: /^\+?([\d\(\)\-x\s]+)$/,
                sValid: 'Phone numbers may only contain numbers'
            }
        },
        opt = $.extend(true, {
            sRequired: 'This field is required',
            sValid: 'Invalid input',
            sParentSelector: null,
            sParentErrorClass: 'error',
            sMsgMarkup: '<em class="error"/>',
            asRangeMsg: {
                sRange: 'Must be between %min and %max',
                sMin: 'Must be greater than %min',
                sMax: 'Must be less than %max'
            }
        }, (arguments.length === 1 ? arguments[0] : {}));
  
        return this.not('.validated-inline').each(function()
        {
            var oField = $(this),
                oParent = (opt.sParentSelector === null) ? oField.parent() : oField.parents(opt.sParentSelector).eq(0),
                oValidRule = {bCaseSensitive: false, sRequired: opt.sRequired, sValid: opt.sValid, rValidate: null, fValidate: null},
                sType = null,
                sTmp  = null,
                oErr  = null;
            
            if ( (oField.attr('type') !== undefined) ) {
              sType = oField.attr('type').toLowerCase().replace('-', '');
            }
            else {
              sType = oField[0].tagName.toLowerCase();
            }
            
            // 0. if we have no parent hook, or it’s check, radio, submit, reset, or similarly unvalidatable type
            if ((oParent.length !== 1) || (sType === 'radio') || 
                (sType === 'submit') || (sType === 'reset') || (sType === 'button') ||
                (sType === 'file') || (sType === 'image'))
            {
                return;
            }

            /*
             * Set novalidate on the form element so that it isn't 
             * validated on submit.
             */                  
            oField.closest('form').attr('novalidate', 'novalidate');
            
            // 1. build validation rule
            // a. if it's a predefined type, load base rules
            if (typeof(__oPredefValid[sType]) !== undefined)
            {
                $.extend(oValidRule, __oPredefValid[sType]);
            }
            
            // b. if required, load that in (done messily, because IE)
            oValidRule.bRequired = oField.prop('required');        
            
            // handle IE being IE…
            if (oValidRule.bRequired === undefined)
            {
                // oField.prop('required') doesn't work for IE9 
                // that why this attribute we should get in old way as .attr()
                if(oField.attr('required') === 'required'){
                    oValidRule.bRequired = true;
                } else{
                    oValidRule.bRequired = false;
                }
            }
            if (oValidRule.bRequired === '')
            {
                oValidRule.bRequired = true;
            }
            
            /*
             * If the element is a checkbox, the only validation we
             * can do to is ensure it is checked if it is required
             * to be checked.
             */
            if ( sType === 'checkbox' && !oValidRule.bRequired ) {
              return;
            }               
            
            // c. load any custom pattern
            if ((sTmp = oField.attr('pattern')) !== undefined)
            {
                // manually add anchor characters, because they're inferred in HTML5
                oValidRule.rValidate = new RegExp('^'+sTmp+'$');
            }
            
            // d. load any custom error messages
            if ((sTmp = oField.data('required-message')) !== undefined)
            {
                oValidRule.sRequired = sTmp;
            }
            if ((sTmp = oField.data('invalid-message')) !== undefined)
            {
                oValidRule.sValid = sTmp;
            }
            
            // 2. bind event handler
            oField.on('keyup.inlineValidation blur.inlineValidation', function(event)
            {
                // a. reset
                __reset();
                
                //force remove non-digits from phone number before check (after copy-paste)
                if(sType === 'tel'){
                    var str=oField.val();
                    str=str.replace(/[^0-9]+/g,'');
                    oField.val(str);
                }
                
                // b. get value
                var sValue = $.trim(oField.val());
                if (!oValidRule.bCaseSensitive)
                {
                    sValue = sValue.toLowerCase();
                }
                
                // Do not hightlight invalid email field until user removes focus (see NBTYCOMM-941) 
                if(sType === 'email' && event.type !== 'blur'){
                    return true;
                }
                
                
                if ( sType === 'checkbox' && !oField.prop('checked') )
                {
                    __error(oValidRule.sRequired);
                    return true;                  
                }
                
                // c. required?
                if (oValidRule.bRequired && (sValue === ""))
                {
                    __error(oValidRule.sRequired);
                    return true;
                }

                // d. validation
                if ((oValidRule.rValidate !== null) && (sValue !== ''))
                {
                    var aM = null;
                    // i. initial validation
                    if ((aM = oValidRule.rValidate.exec(sValue)) === null)
                    {
                        __error(oValidRule.sValid);
                        return true;
                    }
                    
                    // ii. sub-validation
                    if ((typeof(oValidRule.fValidate) === 'function') &&
                        !oValidRule.fValidate(aM))
                    {
                        __error(oValidRule.sValid);
                        return true;
                    }
                }
                
                // e. if it's a number, perform validation on max/min range
                if ((sType === 'number') || (sType === 'range'))
                {
                    __validateNumeric(sValue);
                    return true;
                }
                
                // f.1 if there's a confirm-field-email validation set up
                var sRelId = oField.data('confirm-field-email'),
                    oRelEl = null;
                if ((sRelId !== undefined) &&
                    ((oRelEl = $('#'+sRelId)).length === 1) &&
                    (oField.val().toLowerCase() !== oRelEl.val().toLowerCase()))
                {
                    var sValidMessage = oField.data('confirm-message');
                    if (sValidMessage === undefined)
                    {
                        sValidMessage = opt.sValid;
                    }
                    __error(sValidMessage);
                }
                
                // f.2 if there's a confirm-field validation set up
                var sRelId = oField.data('confirm-field'),
                    oRelEl = null;
                if ((sRelId !== undefined) &&
                    ((oRelEl = $('#'+sRelId)).length === 1) &&
                    (oField.val() !== oRelEl.val()))
                {
                    var sValidMessage = oField.data('confirm-message');
                    if (sValidMessage === undefined)
                    {
                        sValidMessage = opt.sValid;
                    }
                    __error(sValidMessage);
                }
                
                // g. all good!
                return true;
            });
            
            if (oField.hasClass('noKeyUpValidation')) {
                oField.off('keyup.inlineValidation');
            }
            
            if (sType === 'checkbox'){
                oField.on('change.inlineValidation', function(event) {
                    __reset();
                    if ( !oField.prop('checked') ) {
                        __error(oValidRule.sRequired);
                    }
                    return true;
                });
            }
            
            // 3. inhibit browser-based client-side validation.
            //    This is messier than it needs to because not all input types actually have novalidate, so we have to
            //    strip out everything else. Far from ideal, but hey… this wouldn't be web development without /some/
            //    messy hacking, right? =)
            oField.prop('required', false).prop('novalidate', true).removeAttr('pattern').addClass('validated-inline');
            
            
            /** Internal Utility functions */
            /**
             * Removes any current error state on the field.
             */
            function __reset()
            {
                if (oErr !== null)
                {
                    oParent.removeClass(opt.sParentErrorClass);
                    oErr.remove();
                    oErr = null;
                }
            }
            
            /**
             * Sets the error state on the field
             */
            function __error(sMsg)
            {
                oErr = $(opt.sMsgMarkup).html(sMsg).appendTo(oParent.addClass(opt.sParentErrorClass));
            }
            
            /**
             * Special validation function for type="number" fields which validates against any max/min attributes.
             *
             * @param   sValue  the value of the field
             */
            function __validateNumeric(sValue)
            {
                var fValue = parseFloat(sValue),
                    fMin   = parseFloat(oField.attr('min')),
                    fMax   = parseFloat(oField.attr('max'));
                var fMaxQuantityMessage = oField.attr('maxQuantityMessage');
                
                // a. if it's NaN
                if (isNaN(fValue))
                {
                    oField.val(fMin);
                    if (fMaxQuantityMessage != undefined && fMaxQuantityMessage != ""){
                        __error(fMaxQuantityMessage);
                    } else {
                        __error(oValidRule.sValid);
                    }
                    return;
                }
                

                if ( oField.data('required-chars') && sValue.length !== oField.data('required-chars') ) {
                    __error(oValidRule.sRequired);
                    return;
                }

                // b. if both max and min are undefined
                if (isNaN(fMax) && isNaN(fMin))
                {
                    return;
                }
                
                // c. reset invalid value to min or max
                var noErrors = false;
                if (!isNaN(fMax) && (fValue > fMax)) {
                    oField.val(fMax);
                } else if (!isNaN(fMin) && (fValue < fMin)) {
                    oField.val(fMin);
                } else {
                    noErrors = true;
                }
                
                // d. print error messages
                if (noErrors){
                    return;
                } 
                
                // NBTY rule for min/max quantity message
                if (fMaxQuantityMessage != undefined && fMaxQuantityMessage != ""){
                    __error(fMaxQuantityMessage);
                } else {
                    // generic validation rules
                    if (!isNaN(fMin) && !isNaN(fMax) && ((fValue > fMax) || (fValue < fMin))){
                        __error(opt.asRangeMsg.sRange.replace('%min', fMin).replace('%max', fMax));
                    } else if (!isNaN(fMax) && (fValue > fMax)) {
                        __error(opt.asRangeMsg.sMax.replace('%max', fMax));
                    } else if (!isNaN(fMin) && (fValue < fMin)) {
                        __error(opt.asRangeMsg.sMin.replace('%min', fMin));
                    }
                }
                return;
            }
        });
    };

  /*
   * Move caret @see https://gist.github.com/1007907
   */

  // Behind the scenes method deals with browser
  // idiosyncrasies and such
  $.caretTo = function (el, index) {
    if (el.createTextRange) {
      var range = el.createTextRange();
      range.move("character", index);
      range.select();
    } else if (el.selectionStart !== null) {
      el.focus();
      el.setSelectionRange(index, index);
    }
  };

  // The following methods are queued under fx for more
  // flexibility when combining with $.fn.delay() and
  // jQuery effects.

  // Set caret to a particular index
  $.fn.caretTo = function (index, offset) {
    return this.queue(function (next) {
      if (isNaN(index)) {
        var i = $(this).val().indexOf(index);

        if (offset === true) {
          i += index.length;
        } else if (offset) {
          i += offset;
        }

        $.caretTo(this, i);
      } else {
        $.caretTo(this, index);
      }

      next();
    });
  };

  // Set caret to beginning of an element
  $.fn.caretToStart = function () {
    return this.caretTo(0);
  };

  // Set caret to the end of an element
  $.fn.caretToEnd = function () {
    return this.queue(function (next) {
      $.caretTo(this, $(this).val().length);
      next();
    });
  };

  /**
   * iframe swticher plugin
   *
   * @class iframeSwitcher
   * @memberOf jQuery.fn
   */
  $.fn.iframeSwitcher = function(options) {

    var self = null,
        url = '',
        iframe = {},
        iframeEventLoad = null,
        inputs = {};

    var settings = $.extend( {
      iframeWrapper: $('#iframe-wrapper'),
      submitBtn: $('.submit'),
      scrollToDuration : 800,
      iframeHeight:600,
      iframeWidth:300,
      urlCallback: function(elem) {
        return elem.data('iframe-url');
      }
    }, options);

    /*
     * Add the iframe
     */
    iframe = $(document.createElement('iframe'));
    iframe.attr({
      'class': 'checkout-iframe',
      'width': 0, //settings.iframeWidth,
      'height': 0, //settings.iframeHeight,
      'frameBorder': 0,
      'allowTransparency': "true"
    }).hide();

    settings.iframeWrapper.append(iframe);

    return this.each(function() {

      self = $(this);

      self.on('change', function(e) {

        inputs = self.parents('form').find('input');

        if ( self.attr('disabled') === 'disabled' ) {
          return;
        }

        /*
         * Disable other inputs to prevent people clicking whilst in scrollTo
         */
        //inputs.attr('disabled', true);
        inputs.each(function(index, item) {
            var $item = $(item);

            // Store this input's current disabled state so that once we're done, we can return it to it's original state
            $item.data('disabled-state', $item.prop('disabled'));

            // Disable it
            $item.attr('disabled', true);
          });
            //use this code during merge until payment iframe CR is accepted:Start
            //5.4.13 code added for shipping page prevent disable inputs .... 
            if($('.checkout_rec').val()=='true'){
                inputs.attr('disabled', false); 
            }
            else{inputs.attr('disabled', true);}
            //use this code during merge until payment iframe CR is accepted:End

        /*
         * If first time, then append span that shows the loading spinner and set the height
         * so that we have something to scroll to.
         */
        if ( !$('span',settings.iframeWrapper).is('*') ) {
          iframe.height(settings.iframeHeight);
        }

        /*
         * Make sure we are at the iframe.  If the iframe height is 0, then we need to set it to a default so that
         * we have something to scroll to
         */

        $('html,body').animate({
          scrollTop: settings.iframeWrapper.position.top
        }, settings.scrollToDuration);

        /*
         * The URL is retrieved through a callback which allows us to deal with different device urls in the calling
         * function
         */
        url = settings.urlCallback($(this));

        if ( typeof url === "undefined" ) {
          /*
           * No URL so hide the iframe and show the submit button
           */
          iframe.hide();

          /*
           * Show the submit button
           */
          settings.submitBtn.show();

          // Restore this input's disabled state to it's previous value
          inputs.each(function(index, item) {
            var $item = $(item);
            $item.attr('disabled', $item.data('disabled-state'));
          });
        }
        else {

          if ( iframe.is(':visible') && ( url === iframe.attr('src') ) && !($('.checkout-submit').is(':visible')) ) {
            /*
             * already on the selected iframe
             */
            // Restore this input's disabled state to it's previous value
            inputs.each(function(index, item) {
              var $item = $(item);
              $item.attr('disabled', $item.data('disabled-state'));
            });

            return;
          }

          iframe.fadeOut(function() {
            settings.iframeWrapper.append($(document.createElement('span')));
          });

          /*
           * We have a url to change the iframe src to
           */
          settings.submitBtn.hide();

          /*
           * Change the iframe src
           */
          iframe.attr('src', url);

          /*
           * When loaded show the iframe
           */
          iframe.bind('load', function()
          {
            clearTimeout(iframeEventLoad);

            iframeEventLoad = setTimeout(function() {
              settings.iframeWrapper.find('span').remove();
              iframe.show();

              $('html,body').animate({
                scrollTop: iframe.position().top
              }, settings.scrollToDuration);

              // Restore this input's disabled state to it's previous value
              inputs.each(function(index, item) {
                var $item = $(item);
                $item.attr('disabled', $item.data('disabled-state'));
              });

            },1000);
          });
        }
      });
    });
  };

  /**
   * Plugin for switching attribute "disabled"
   */
  $.fn.toggleDisabled = function(){
      return this.each(function(){
          this.disabled = !this.disabled;
      });
  };
  
  /**
   * Plugin for dispose element in the center of target or in the center of screen if target undefined
   */
  jQuery.fn.center = function(target) {
    this.css("position", "absolute");
    var $target = $(target);
    if ($target.length > 0) {
      this.css("top", $target.offset().top + $target.height()/2 + "px");
      this.css("left", $target.offset().left + $target.width()/2 + "px");
    } else {
      this.css("top", ($(window).height() - this.height())/2 + $(window).scrollTop() + "px");
      this.css("left", ($(window).width() - this.width())/2 + $(window).scrollLeft() + "px");
    }
    return this;
  };
})(jQuery);