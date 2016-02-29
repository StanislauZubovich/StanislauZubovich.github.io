var HAB = HAB || {};
HAB.account = HAB.account || {};

HAB.slowDropdownConfig = HAB.slowDropdownConfig || {};
HAB.slowDropdownConfig.mouseDelay = $('html').hasClass('no-touch') ? 80 : 400;
HAB.slowDropdownConfig.flyOutDelay = $('html').hasClass('no-touch') ? 200 : 1000;

/**
 * Simple callback to determine if we are in mobile mode.
 */
HAB.isMobile = function() {
  return $(window).width() < 768;
};


/**
 * Help IE
 * 
 * Polyfills for CSS support
 * Add indexOf to IE8
 * 
 */
HAB.fixIE = function()
{
    /* 
     * :nth-child for < IE9
     */
    if( $('html').hasClass('lt-ie9') ) {

      // Float clearing
      if ( $('.t-checkout .address-list').length ) {      
        SFR.Utils.clearNthChild('.t-checkout .address-list',3);
      }    
      if ( $('.t-account .address-list').length ) {      
        SFR.Utils.clearNthChild('.t-account .address-list',4);
      }    
      if ( $('.t-account .address-list').length ) {
        SFR.Utils.clearNthChild('.t-account .address-list',4);
      }
      // Zebra striping
      $.root.find('.article-body table.has-zebra tbody tr:nth-child(odd)').addClass('odd');
      $.root.find('.s-account-module table.has-zebra tbody tr:nth-child(odd)').addClass('odd');
   
    }

    // Add indexOf method in IE8
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (elt /*, from*/) {
            var len = this.length >>> 0;
            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0) from += len;

            for (; from < len; from++) {
                if (from in this && this[from] === elt) return from;
            }
            return -1;
        }
    }

};


/**
 * Blocking / loading widget. As used by AJAX calls to block the UI
 */
HAB.blocker = {
  block: function(sMessage) {
    var oWin = $(window);

    this.container = $('<div class="lightbox-container wait-screen"><div class="masq"></div></div>').appendTo($.root).hide();
    this.messageContainer = $('<div class="content"><p><span></span>' + sMessage + '</p></div>').appendTo(this.container);

    this.container.show();
    this.messageContainer.css({
        top:  (oWin.height() - this.messageContainer.height()) / 2,
        left: (oWin.width()  - this.messageContainer.width() ) / 2
    });

    this.container.hide().css({
      height: $.root.height(),
      width: $.root.width()
    }).fadeIn(200);
  },
  unblock: function() {
    this.container.fadeOut(100);
  }
};


/**
 * Hook form validation plugin.
 * 
 * @TODO: retrigger hookFormValidation() after AJAX requests, or make the plugin handle AJAX-updated DOM elements
 * 
 */
HAB.hookFormValidation = function()
{
    $('form.feature input, form.feature select, .signup-form input').inlineValidation();
};


/**
 * Reorder all items from a previous order
 * 
 * This function checks checkboxes for each product in the current form and submits the page
 * 
 */
HAB.setupReorderAllItemsLinks = function()
{
//    $.root.on('click', '.reorder-link a', function(e) {
//    
//      e.preventDefault();
//      
//     $(this).closest('form').find('.basket-product input:checkbox').each(function()
//    {
//    $(this).click();
//    })
//    var totalCheckboxes = $("[name=itemSelectCheckBoxes]");
//    var allCheckboxes = [];   
//    $.each(totalCheckboxes, function() { 
//      allCheckboxes.push(1);
//    });
//    //passing the allCheckboxes to handler
//    $('#checkValues').val(allCheckboxes);
//    
//       $(this)
//    .closest('form')
//        .find('.basket-product input')
//          .click()
//          .end()
//        .closest('form')
//        .submit(); 
//    });
    
};


/**
 * Initialise AddThis 
 * 
 * We're firing this on DOM ready to prevent blocking
 * http://support.addthis.com/customer/portal/articles/381221#.UGtDEPlxsVk
 */
HAB.initAddThis = function() {
//    Fix for http://s7.addthis.com/js/250/addthis_widget.js net::ERR_CONNECTION_REFUSED.
    try {
        addthis.init();
    }
    catch(err) {
//        console.error(err.message);
    }
};


/**
 * Re-render select lists with JS
 * Note: this is done for cosmetic reasons only. There's no behavioural gain.
 * See labs.abeautifulsite.net/jquery-selectBox for docs
 * @TODO: handle tab order (I think currently the real (display: none;) <select /> still recieves focus but it's not visible to the use
 * @TODO: set focus on this element (.selectBox) on .click or .active for correpsonding <label />
 */
HAB.reStyleSelects = function()
{
    $.root
      .find('select').not('.selectBox, #addressSelector, .addresspicker-country, #addressCaputure-billing #billing-country').attr('tabindex', -1)
      .selectBox();
        
//        Set tabindex on the generated element so IE knows it is focusable
//        

/*
        .focus( function() {
        })
        .blur( function() {
        })
        .change( function() {
        })
*/

};


/**
 * Add icons to submit buttons
 * Note: we'd normally do this with CSS on <button /> elements, but they aren't supported by the current CMS
 * & CSS generated content can only be applied to container elements
 * The downside to this approach is that the icon masks the clickable area of the submit :-/
 * The only other alternative is using bespoke <input type=image" /> buttons, which adds http requests and maintaibability problems
 */
HAB.addSubmitIcons = function()
{
    $.root.find('.prod-submit-bt').each( function(){

      var icon = $('<span class="ico ico-basket-add" />');
      var button = $(this);
      icon.on("click", function(){
        button.click();
      });
      button.before(icon);
    
    });
};


/**
 * Hook hero stuff
 */
HAB.hookHomeHero = function()
{
    var heroBanners = $('section.hero-banner');
    heroBanners.each(function(){


    // 0. init
    var __aClass   = ['', 'full', 'half', 'third', 'quarter'],
        oContainer = $(this),
        oList      = oContainer.addClass('js').find('ul li'),
        oFoot      = null,
        _oTo= null;
    // Auto-advance handler
    function _setTimeout()
    {
      clearTimeout(_oTo);
      _oTo = setTimeout(function()
      {
        var oNext = oFoot.find('.current').next();

        if (oNext.length === 0) // If no next slide
        {
          // Return to first
          oFoot.find('li').eq(0).children('a').trigger('click'); 
          // Uncomment the next line to stop slideshow when it returns back to first slide
          // return; 
        }

        oNext.children('a').trigger('click'); // Trigger animation via click handler
        _setTimeout(); // Rebind timeout
      }, 5000); // Speed
    }

    // 1. if there's nothing to do or worth doing, drop out
    if ((oContainer.length === 0) || (oList.length === 0))
    {
        return false;
    }
    
    // 2. create new footer element
    oFoot = $('<ol class="clearfix"/>').addClass(__aClass[oList.length]+'-grid');
    var sMarkup = $('html').hasClass('lt-ie9') ? '<div class="footer"/>' : '<footer/>';
    oContainer.each(function() {
      $(sMarkup).appendTo($(this)).append(oFoot);
    });
    // $(sMarkup).appendTo(oContainer).append(oFoot);

    // 3. iterate through slides
    oList.each(function(idx)
    {
        var oSelf = $(this),
            sText = oSelf.data('title');

        if (sText === undefined)
        {
            sText = oSelf.text();
        }

        // create footer element
        $('<a/>').data('index', idx).html(sText).appendTo(oFoot).wrap('<li/>');
    });
    
    // 4. hook
    oFoot.find('a').on('click', function()
    {
        var oSelf  = $(this),
            sClass = oContainer.attr('class').replace(/bg\-\S+/, ''),
            oSlide = oList.eq(oSelf.data('index'));
        clearTimeout(_oTo);
        // a. switch banner
        oSlide.show().siblings().hide();
        
        // b. switch status
        oSelf.parent().addClass('current').siblings().removeClass('current');
        
        // c. background
        // @TODO: What is this? I see a class of bg-purple in the markup, but no mention of this in the CSS - I think this must be legacy and could be removed?
        if(typeof(oSlide.attr('class')) !== 'undefined') {
          sClass += ' '+oSlide.attr('class').match(/(bg\-\S+)/)[1];
          oContainer.attr('class', sClass);
        }

        return false;
    }).eq(0).addClass('current').trigger('click');
    
    
    // 5. line up the first slide
    oList.hide().eq(0).show();
 // 6. auto-advance
    _setTimeout();
    oContainer.height('auto');
  });
};

/**
 * Hooks a list of product teasers into a carousel: used on mobile view only
 * Currently applied just to Recently Viewed products on home
 */
HAB.hookProdTeaserCarousel = {
  create: function() {
    var nPips = 0,
        oElm = {},
        cList = [],
        items = $('.is-carousel .l-wrap'); // Note: maybe be more than one carousel on a page
 
    if ( items.hasClass('mobile-carousel') ) {
      return; 
    }
 
    /*
     * Add the carousel
     */
    items.removeClass('l-wrap')
      .habCarousel('li')
      .children('li')
      .removeClass('l-col');
    
    /*
     *  Loop through each carousel, set up pips and directional nav
     */
    $.each(items, function (i, el) {      

      nPips = $(el).children('li').length;      

      if (nPips <= 1) { // If only one product/slide, drop-out        
        return false;
      }
      
      $(el).closest('.prod-teaser-items').append(
        '<ul class="mobile-carousel-nav">' +
          '<li class="lnk-prev lnk-disabled"><span>Previous</span></li>' +
          '<li class="lnk-next"><span>Next</span></li>' +
        '</ul>'
      );

      while(nPips > 0) {
        cList.push(nPips);
        nPips--;
      }    

    var ulElem = $(document.createElement('ul'));
    ulElem.attr({
      'class': 'mobile-pips'  
    });

    $.fn.reverse = [].reverse;
    
    /*
     * Create an li element for each
     * product.
     */
    $(cList).reverse()
      .map(function(i, text) {
        oElm = $(document.createElement('li'))
          .html(text)
          .appendTo(ulElem);
      });

    ulElem.find('li')
      .eq(0)
      .addClass('current');

      $(el).closest('.prod-teaser-items').append(ulElem);

      cList = []; // Reset pip-count

    });

    /*
     * Bind to the slide change
     */ 
    $('.is-carousel ul li').on('slidechange', function(e) {
      var oSelf = $(this),
          loc = oSelf.index(),
          carousel = $(this).closest('.is-carousel').find('.mobile-carousel'),
          slideCount = carousel.children().length,
          currSlide = carousel.find('> li:not(.out-right,.out-left)'),
          carouselNav = carousel.closest('.is-carousel').find('.mobile-carousel-nav');
         
       oSelf.closest('section')
         .find('ul.mobile-pips li')
         .eq(loc)
         .addClass('current')
         .siblings()
         .removeClass('current');

        // Hide/show direction nav when reaching boundaries
        carouselNav.find('li').removeClass('lnk-disabled');
        if (currSlide.index() + 1 === slideCount) {
          carouselNav.find('.lnk-next').addClass('lnk-disabled');
        }
        if (currSlide.index() === 0) {
          carouselNav.find('.lnk-prev').addClass('lnk-disabled');
        }

    });

    /*
    * Activate directional nav
    */
    $('.is-carousel .mobile-carousel-nav li').enableSwipe().on('click swipeleft swiperight', function() {

      var carousel = $(this).closest('.is-carousel').find('.mobile-carousel'),          
          currSlide = carousel.find('> li:not(.out-right,.out-left)');      

      // Lazy hijack swipe with trigger
      if ( $(this).hasClass('lnk-next') ) { // If next
        currSlide.trigger('swipeleft');
      } else { // If prev        
        currSlide.trigger('swiperight');
      }

    });

  },

  // Reverse the steps taken out in the create function above and in $.fn.habCarousel
  destroy: function() {
    var items = $('.mobile-carousel'); // Note: maybe be more than one carousel on a page

    items
      .addClass('l-wrap')
      .removeClass('mobile-carousel')
      .children('li')
      .addClass('l-col')
      .off('swipeleft')
      .off('swiperight')
      .removeClass('out-right');

    items.next('.mobile-carousel-nav').remove();
    items.next('.mobile-pips').remove();
  }
};

/**
 * Conditionally load images for desktop view
 *
 * 
 * Some advantages of this approach over CSS background images:
 * - We can scale the image in fluids layouts (background-size isn't available in < IE9)
 * - We can display a subset of the dektop images without the file size overhead of a large sprite 
 *   (at the cost of some extra - albeit async - HTTP requests)
 *
 * Note
 * - As we're adding a JS dependency this technique should only be used if the image is considered 'decorative'
 * - Decorative images shouldn't have any alt text, so search bots and assistive tech users aren't missing out on anything
 *   although we do have an option of adding surrogate 'alt text' inside the span that will be replaced with an image
 *
 * @TODO: extend to enable 'large-vp' logic
 * @TODO: could we handle image sizes here? (To pass info to the CSS to configure the layout accordingly)
 */
HAB.loadDesktopImages = function() {

  $.root.find('[data-img-src]').each( function(){
    
    var $this = $(this),
        $imgClass = $this.attr('class'),
        $imgSrc = $this.data('img-src'),

        // Create image element 
        $img = $('<img />')
                 .addClass($imgClass)
                 .attr('src', $imgSrc)
                 .attr('alt', '');
    
    // Add class to parent so we can apply CSS
    $this.parents('.teaser-item').addClass('has-img');
    
    // Inject img into DOM in place of span
    $this.replaceWith($img);
  
  });

};

/**
 * Trigger all main menu-related JS
 */
HAB.hookDesktopMenu = function() {

    $('.main-nav').find('li').not('.main-nav-item.simple-nav-item').off('mouseenter').on('mouseenter', function(){
        if(!$(this).hasClass('loaded')) {
            var N = $(this).find('.urlRef').val();
            var id = $(this).find('.dataId').val();
            loadHeaderMenuItem(this, id, N);
        }
    });
    
  // Add a hook so we can stop the flyouts overflowing right edge of viewport
  $.root
    .find('.main-nav-item:last')
      .addClass('last-nav-item');

  //HAB.accessifyMenu();
};


/**
 * Enable keyboard navigation in meganav drop-downs
 * This function ensures that each dropdown remains open when keyboard focus is on a link inside it
 * Similar to above, but specific to markup in main navigation
 */
/*HAB.accessifyMenu = function() {
  $('.main-nav-item').accessifyFlyout({sSubnavSelector: '.sub-nav'});
};*/


/**
* Setup slow dropdowns 
*/
jQuery.widget( "ui.slow_dropdown", $.ui.cx_dropdown, {
    options: {
        flyOutDelay: HAB.slowDropdownConfig.flyOutDelay
    },
    vars: {
        tabOffTimer:null
    },
    _tabOff: function(e) {
        var that = this;

        clearTimeout(this.vars.tabOffTimer);

        this.vars.tabOffTimer = setTimeout(function() {
            that._closestListItem(e.target).removeClass(that.options.hoverClass).find(that.options.menuClass).removeAttr('style');
        }, this.options.flyOutDelay);
    }
} );

HAB.setupDropdowns = function() {
  $('.main-nav ul[role=menubar]').slow_dropdown({
      hoverClass: 'hover',
      menuClass: 'sub-nav',
      ariaAttr: 'aria-haspopup',
      ariaValue: 'true',
      fixPosition: false,
      mouseDelay: HAB.slowDropdownConfig.mouseDelay
    });
};


/**
* Destroy dropdowns
*/
HAB.destroyDropdowns = function() {
  if ($('.main-nav ul[role=menubar]').is(":ui-cx_dropdown")) {
    $('.main-nav ul[role=menubar]').cx_dropdown('destroy');
  }
};


/**
 * Switch Strings
 * A generic function that allows us to simply manipulate text strings 
 * Can be used in scenarios where text should differ at certain viewport widths
 * It assumes a 'mobile first' approach to content, and stores replacement strings for larger viewprts in a data attribute
 */
HAB.switchStrings = function() {
  
  $.root.find('[data-string-largevp]').each( function(){
    
    var $this = $(this),
        // check for nested <span class="ico" />
        $icon = $this.children('.ico'),  
        $newString = $this.data('string-largevp');

    $this.html($icon).append($newString);  

  });
  
};


/**
 * Set up local navigation menu (on LHS of desktop version) so we can toggle it depending on device/viewport size
 */
HAB.initLocalNav = function()
{
    var oLocalNavList = $.root.find('nav.local-nav ul.local-nav-list, nav.prod-filter-nav ul.filter-set-type').not('.local-nav-child');
    var sSpecTitle;

    // 1. Set default <select /> option text
    if ( $('body').hasClass('t-cat') )
    {   
        // In a category page, build from the page title
        sSpecTitle = $.root.find('h1.page-title').html() + _t('categories');
    } 
    else if ( $('body').hasClass('t-subcat') )
    {
        // in a subcat page, show 'select type' option
      sSpecTitle = _t('Select ') + oLocalNavList.prev('.filter-group-title').text().toLowerCase();
    } else if ( oLocalNavList.is('.filter-set-type') ) {
        // on a search page, grab the text from the .filter-set-type dropdown
        sSpecTitle = _t('Select ') + oLocalNavList.prev('.filter-group-title').text().toLowerCase();
    } else {
        // in any other section (e.g. account)                
        sSpecTitle = _t('Select section');
    }
    
    // 2. init the object
    HAB.__localNav = oLocalNavList.mobileMenu({
        prependTo:      'nav.local-nav',
        switchWidth:    1,                  // means menu will /always/ remain unmolested so we can manually toggle it
        topOptionText:  sSpecTitle,
        groupPageText:  '',
        combine:        false,
        bindResize:     false,               // don't bind to page resize
        clearLabel:     _t('View all brands')
    });
    
    $.root.find('nav.local-nav').domUpdated();
};

HAB.initMobileFilterAccordion = function() {
    var sectionHolder = '#searchResult',
        btnBlockSelector = '.facet-block',
        btnAllFacetsSelector = '.all-facets',
        openedClassSelector = 'opened',
        facetsSelector = '.prod-filters',
        itemSelector = '.filter-holder';

    $(sectionHolder)
        .on('click', btnBlockSelector, function (ev) {
            ev.preventDefault();

            $(this).toggleClass(openedClassSelector).siblings(itemSelector).slideToggle(500);
        })
        .on('click', btnAllFacetsSelector, function (ev) {
            ev.preventDefault();

            $(this).toggleClass(openedClassSelector).siblings(facetsSelector).slideToggle(500);
        });
};

HAB.addSelectedIndicator = function() {
    var sectionHolder = '#searchResult',
        parentSelector = '.filter-set',
        globalParentSelector = ".prod-filter-nav",
        activeFacetClass = 'active',
        activeFacetSelector = $(sectionHolder).find('input:checked');

    activeFacetSelector.parents(parentSelector).addClass(activeFacetClass);
    activeFacetSelector.parents(globalParentSelector).addClass(activeFacetClass);
}

/**
 * Manually toggles state of local navigation menu between 'mobile' and 'desktop' versions.
 * 
 * @param   bShowMobileVersion  true to show the mobile version, false otherwise
 */
HAB.collapseLocalNav = function(bShowMobileVersion)
{
    // Abort if there's no local nav on this page
    if (! $.root.find('nav.local-nav').length )
    {
        return;
    }
    
    // 0. if we've not inited, do so now
    if (typeof(HAB.__localNav) === 'undefined')
    {
        HAB.initLocalNav();
        HAB.initMobileFilterAccordion();
    }
    
    // 1. toggle
    HAB.__localNav.trigger('stateChange', bShowMobileVersion);
    
    // select current page
    var sCurrentPageURL = HAB.__localNav.find('.current a').attr('href'); // Get href of current page in nav list
    HAB.__localNav
      .parent()
      .children('select')
      .find('option[value="' + sCurrentPageURL + '"]')
      .attr('selected','selected'); // Select matching opt

    HAB.reStyleSelects();

};

/**
 * Set up mobile menu
 * Collapsed menu for narrow viewports
 * (WIP)
 */
HAB.setupMobileMenu = function() {
  
  var $menu = $.root.find('.main-nav'),
      $menuBar = $menu.find('[role=menubar]'),
      $menuBtWrap = $('<div class="main-nav-bt-wrap"></div>'),
      $menuBt = $('<div class="main-nav-bt"></div>'),
      $menuIco = $('<span class="ico ico-expand"></span>'),
      setMenuBtState = function () {
  
        if ( $menuBar.hasClass('is-expanded') ) {
    
          $menuBt
            .html(_t('Hide menu'));
          $menuIco
            .removeClass('ico-expand')
            .addClass('ico-collapse')
            .prependTo($menuBt);
          
        } else {
          
          $menuBt
            .html(_t('Browse the store'));
          $menuIco
            .removeClass('ico-collapse')
            .addClass('ico-expand')
            .prependTo($menuBt);

        }
      };
  
  // Construct menu button and insert to DOM on load
  $menuBt.appendTo($menuBtWrap);
  if (! $.root.find('.main-nav-bt').length ) {
    $menuBtWrap.insertAfter($menu);
  }
  
  // The menu should load open on homepage
  if ( $('body').hasClass('t-home') ) {
  
   // console.log('home');
    $menuBar.addClass('is-expanded');
  
  } else {
  
   // console.log('not home');
    $menuBar.hide();
  
  }
  setMenuBtState();

  // Click handlers
  $menuBt.click( function() {

    $menuBar
      .slideToggle()
      .toggleClass('is-expanded');
    setMenuBtState();

  });

};


/**
 * Undo mobile menu
 */
HAB.undoMobileMenu = function() {

  $.root.find('.main-nav ul').show();
  
};

/**
 * Set up image toggle checkbox
 * In subcat page, submit form if 'show images' input is changed. If the user:
 * - checks it: this input will post image-display=true
 * - unchecks it: this input will post nothing                       
 */
HAB.setUpImageToggle = function() {

    var $pageDiplayForm = $.root.find('form.page-display');
     
    $pageDiplayForm.on('change', '.image-toggle input[type=checkbox]', function()
    {
        setTimeout(function()
        {
            $pageDiplayForm.submit();
        },10);
    });
};


/**
 * Check for collapsed content in Prod Info panels (Description & Nutritional facts)
 * If there is none, hide the 'Show more' trigger
 * @TODO: load the 'Show more' trigger with JS when required instead
 */
HAB.checkProdInfoOverflow = function() {
  
  if (! $.root.find('.prod-desc .target').is('*') ) {
    $.root.find('.prod-desc .overflow').hide();
  }

  if (! $.root.find('.prod-facts .target').is('*') ) {
    $.root.find('.prod-facts .overflow').hide();
  }

};



/**
 * Set up product teasers
 * Initialise any functions required for teaser pages
 */
HAB.setupProdTeasers = function() {

  /**
   * Layout switcher
   * Set up controls to toggle product lost between grid and list views
   * Note: this functionality should only be available if images are switched on
   */  
  var $teaserBlock = $.root.find('.prod-teaser-block').not('.new-prod-teaser-block');
  
  // Only set up layout switcher if we have images
 // if ( $.root.find('.image-toggle input[type="checkbox"]').is(':checked') ) {
    /* Create markup for controls */
    var $switcher = $('<fieldset />').addClass('l-switcher large-vp');
    var $gridToggleBt = $('<button />').addClass('l-switcher-grid')
    .attr({
        'title': 'Switch to grid view',
        'type': 'button',
        'onclick':'setViewMode("grid");'
    })
    .appendTo($switcher);
    var $listToggleBt = $('<button />').addClass('l-switcher-list')
    .attr({
        'title': 'Switch to list view',
        'type': 'button',
        'onclick':'setViewMode("list");'
    })
    .appendTo($switcher);
    // Insert into DOM
    $switcher.insertBefore($.root.find('.page-limit'));
    
    /*
     * Set up on load
    */  
    if ( $teaserBlock.hasClass('is-grid') ) {
      
      SFR.disableElem($gridToggleBt);
      SFR.enableElem($listToggleBt);
      
    } else {
      
      SFR.disableElem($listToggleBt);
      SFR.enableElem($gridToggleBt);
      
    }
        
    /*
     * Attach handlers
    */  
    // List-view button
    $listToggleBt.click(function(){
      $teaserBlock
        .removeClass('is-grid')
        .addClass('is-list');
  
      $('.prod-teaser-block')
        .not('.new-prod-teaser-block')
        .find('.prod-quickbuy-container:hidden')
        .show();
  
      SFR.disableElem($listToggleBt);
      SFR.enableElem($gridToggleBt);
      HAB.truncateText('.prod-teaser-block.is-list .prod-desc'); 
    });
    // Grid-view button
    $gridToggleBt.click(function(){
      
      $teaserBlock
        .addClass('is-grid')
        .removeClass('is-list');
        
      $('.prod-quickbuy-container:visible').hide();        
        
      SFR.disableElem($gridToggleBt);
      SFR.enableElem($listToggleBt);
  
      /*
       * Iterate over each teaser 
      */
      $.root.find('.prod-teaser-item').each( function(){
    
        /*
         * @TODO
         * If .prod-submit-opts are expanded when the view is toggled back to grid
         * we need to collapse the prod-submit-opts and reapply button handlers
        */
      
      });
    });    
 // }

  // hook up 'add to basket' buttons
  HAB.hookProdQuickBuy();
  
//  HAB.initPagination();
};

/**
 * Initialise any functions required for pagination.
 */
//HAB.initPagination = function(){
//    $('#ajaxLoaded .list-pagination a, #ajaxLoaded .show-all').click(function(e){
//        var paginationUrl = this.href;
//        ajaxLoadingPage(paginationUrl);
//        e.preventDefault();
//    });
//    // scroll to top if navigate via footer pagination
//    $('#ajaxLoaded .prod-teaser-footer .list-pagination a').click(function(){
//        $('html, body').animate({scrollTop : 0});
//    });
//}

/**
 * Set product teasers into list view (for mobile)
 */
HAB.setProdTeaserMobileView = function() {  
  HAB.setViewMode('list');
};

/**
 * Set product teasers into grid view
 */
HAB.setProdTeaserDesktopView = function() {
  /*
   * setViewMode is a function which will be defined only on the search and suncategory pages. 
   * On these pages need to preserve viewMode defined by the user and this function do it.
   */
  if (typeof(setViewMode) != 'undefined') {
    setViewMode();
  } else {
    HAB.setViewMode('grid');
  }
};

/**
 * Adjust page view according to the viewMod
 * 
 * @param viewMod - can be 'list' or 'grid', 'grid' by default
 */
HAB.setViewMode = function(viewMod) {
  var currentViewMode;
  if (typeof (viewMod) == 'undefined') {
    currentViewMode = "grid";
  } else {
    currentViewMode = viewMod;
  }
  
  if (!$('html').hasClass('lt-ie9') && !$('body').hasClass('.t-product')) { // Fix for IE8 for PDP, for IE8 we use only desktop viwe. TODO:: Need implament for all site!!!!!
    if (currentViewMode == 'list') {
      $('.teaser-block.prod-teaser-block').attr('class',
        'teaser-block prod-teaser-block clearfix is-list');
    } else {
      $('.l-prod-col.prod-img-wrapper').removeAttr('style');
      $('.prod-info').parent().attr('class', 'l-prod-col');
      $('.teaser-block.prod-teaser-block').attr('class',
          'teaser-block prod-teaser-block clearfix is-grid');
    }
    // fix for saving view mode during user session 
    var oldGridViewMode = $("#gridViewMode").val();
    var newGridViewMode = (currentViewMode === 'grid');
    if (typeof oldGridViewMode !== "undefined" 
        && oldGridViewMode != String(newGridViewMode)) {
      $("#gridViewMode").val(newGridViewMode);
      $("#gridViewMode").closest('form').ajaxSubmit();
    }
  }
};


/**
 * Hooks up quickbuy functionality on products.
 */
HAB.hookProdQuickBuy = function()
{
    $('.prod-quickbuy-container input[type=submit]').on('click', function(e) {
      var oP   = $(this).parents('.prod-teaser-item'),
          oF   = oP.find('form'),
          oPos = oP.offset();

      // 1. if we're viewing in list view or there's no form to submit, drop out
      if (oP.parents().hasClass('is-list') || (oF.length === 0)) {
        return true;
      }

      // 2. if not, create pop-up
      var oQbDiv   = $('<div class="quickbuy-container prod-teaser-item lightbox-container"><div class="masq"></div></div>').appendTo($.root).hide(),
          oContent = $('<form class="content clearfix prod-teaser-form quick-buy" action="#" method="post"><a href="#" class="lb-close lb-close-main">' + _t("Close") + '</a></form>').appendTo(oQbDiv);

      // 3. copy content into it
      var imgBlock = (oP.find('.prod-img').clone());
      imgBlock.prop({id:"quickBuyProduct"});
      var qbCont = oP.find('.prod-quickbuy-container').clone();
      qbCont.find(".fake-submit").hide();
      oContent.append(imgBlock)
          .append(oP.find('.prod-title').clone())
          .append(qbCont);
      // #MK remove promo messages from add to basket popup
      //oP.find('.prod-offers').clone().insertAfter(oContent.find('fieldset.prod-size-opts'));

      var oProdQuickbuyContainer = oContent.find('.prod-quickbuy-container');

      // 4. hook up events
      // a. close events
      oQbDiv.find('.masq, .lb-close').on('click', function()
      {
        oQbDiv.fadeOut(100, function()
        {
          $(this).remove();
        });
        return false;
      });

      var oSubmitButton = oContent.find('.prod-submit-bt');

      // b. form submission
      oContent.on('submit', function()
      { 
        // Shiva : Added for OutofStock
        var oCheckedContent=oContent.find('.checked').length;
        if(!oCheckedContent){return false;}
        
        // Disable the submit button so you can't hammer it multiple times
        oSubmitButton.prop('disabled', true);
        oProdQuickbuyContainer.addClass('loading');

        // remove any postback messages
        oContent.find('.quickbuy-message').remove();

        // AJAX post
        var sU = oF.data('ajax-url');
        if ((sU === undefined) || (sU === ''))
        {
          sU = oF.attr('action');
        }
        $.post(sU, $(this).serialize(), function(sHtml)
        {
          $(sHtml).appendTo(oContent).addClass('quickbuy-message');

          // Next four lines added by request, to update basket count
          var refreshURL=oF.data('refresh-url');

          if(oF.data('refresh-url')){
            $.root.find('.basket-nav-item>a').load(refreshURL);
          }

          // Enable the submit button again once the ajax callback has returned
          oSubmitButton.prop('disabled', false);
          oProdQuickbuyContainer.removeClass('loading');
          var oDuplicate = $('.basket-message.message-success.quickbuy-message').next('.basket-message.message-success.quickbuy-message').length;
          if(oDuplicate){
           $('.basket-message.message-success.quickbuy-message').next('.basket-message.message-success.quickbuy-message').remove();
            }
        });
        return false;
      });

      // 5. position everything
      oQbDiv.css({height: $.root.height(), width: $.root.width()});

      // Check if there's space to allow position 'quickbuy' modals directly over the product teaser (and extend out to the right)
      var oContentTop = (oPos.top-30)+'px',
          oContentLeft = Math.min(oPos.left - Math.round((oContent.width() - oP.width()) / 2), $.root.width() - oContent.width());


        if ( (oContentLeft + oContent.width() + 40) < $(window).width() ) {
          
          // We have enough space, proceed as normal
          oContent.css({
              top: oContentTop,
              left: oContentLeft+'px'
          });

        }else if (navigator.userAgent.match(/iPad/i)){

          oContent.css({
              top: oContentTop,
              left: (oContentLeft - (oContent.width()-oP.width()))+'px'
          });

        } else {

          // No room at the inn - align to the right of the viewport instead
          oContent.css({
              top: oContentTop,
              right: 0
          });

        }

      // Hook up validation
      oContent.find('[name=prod-qty-field]').inlineValidation();

      // 6. fade in
      oQbDiv.fadeIn(400);

      // inhibit normal behaviour
      return false;
    });

    $('article.prod-teaser-item').each(function()
    {
        var oItem = $(this),
            oCont = oItem.parents('.prod-teaser-block').eq(0),
            oQb   = oItem.find('.prod-quickbuy-container'),
            oTo   = null;

        // hook up mouseover/enter
        oItem.find('.prod-img-wrapper').add(oQb);

        oItem.on('mouseenter', function()
        {
            clearTimeout(oTo);
            // only do this for grid
            if (oCont.hasClass('is-grid'))
            {
                oQb.show();
            }
        }).on('mouseleave', function(event)
        {

          /*
           * if current is open, ignore
           */
            clearTimeout(oTo);
            if (!oCont.hasClass('is-grid'))
            {
                return;
            }
            oTo = setTimeout(function()
            {
                oQb.hide();
            }, 100);
        });
    });
};

/**
 * Content choreography for Subcategory pages 
 * @TODO: ideally this needs a 'tear down' incase user resizes the browser down to mobile
 */
HAB.reflowSubCatPage = function() {

  $.root.find('section.prod-teaser-block').not('.new-prod-teaser-block').each(function()
  {
      var oSection = $(this),
          oFooter  = oSection.children('footer'),
          oHeader  = null;
     
      if ( !oSection.find('header').is('*') ) {
       
          oHeader = $('<header class="prod-teaser-header"/>').prependTo(oSection);
       
          // create header
          oHeader.append(oFooter.children());

          // add pagination to footer
          oFooter.append(oHeader.find('.list-pagination').clone());
      }
  });

};

/**
 * Set up product filters
 * Initialise any functions required for product refinement dimensions block
 */
HAB.initProdFilters = function() {
  // scroll to top of facet block when click "show less" link
  $(document).on('click', '.reveal-link', function(){
    var $revealBlock = $(this).closest('[data-conceal]');
    if (!$revealBlock.is('.revealed')) {
      SFR.Utils.scrollTo($revealBlock);
    }
  })
}

/**
 * Set up tooltips
 *
 * @TODO: use Modernizr .touch/.no-touch feature detection to display on click or hover 
 *
 * Requirements:
 *
 <element class="tooltip" />      <= the container (we need this to give context and allow abs positioning)
   <element class="trigger" />   <= the trigger used to reveal the panel
   <element class="tooltip-target" />  <= the element to show/hide
 
 */
HAB.setupTooltips = function() {

  // Hide panels on load
  $.root
    .find('.tooltip-target')
    .hide();

  function closeTooltips() {
    $.root
      .find('.tooltip-target.is-visible')
        .removeClass('is-visible')
        .fadeOut(100);  
  }

  // Attach click handlers to trigger text
  $.root.on('click', '.tooltip .trigger', function(e) {

    e.stopPropagation();

    if ( $(this).parents('.tooltip').find('.tooltip-target').hasClass('is-visible') ) {

      // Let's close any other open tooltips
      closeTooltips();
    
    } else {

      closeTooltips();
      
      // ... now open this one
      $(this)
        .parents('.tooltip')
        .find('.tooltip-target')
          .fadeIn()
          .toggleClass('is-visible')
          .show();
    
    }

  });

  /*
   * Hide *any* open panels on click outside
   */
  $(document).on('click touchstart', function(e) {

    if (e.type === 'click' ) {
      if ( $('body').hasClass('breakpoint-220') ) {
        /*
         * for the 220 breakpoint, the menu only shows top level items.  Therefore we don't want to prevent the click.
         */
        return;
      }

     /* if ( $(e.srcElement).parent('li').hasClass('main-nav-item') ) {
        e.preventDefault();
      }*/
    }


    if ( $.root.find('.tooltip-target.is-visible').length ) {
      closeTooltips();
    }

  });
  // Hide open tooltips when the window scrolls (this means we don't necessarily need to listen for a touch outside) 
  $(window).scroll(function() {
    closeTooltips();
  });
  // Prevent clicks inside the info panel triggering mouseleave
  $.root.on('click', '.tooltip-target', function(e) {
    e.stopPropagation();
  });

  /*
   * When AJAX called made, need to hide the tooltips.
   */
  $.root.bind('ajaxifyHabForm.complete', function(e) {
    HAB.setupTooltips();
  });

};


/**
 * Content choreography in Category pages 
 * @TODO: ideally this needs a 'tear down' incase user resizes the browser down to mobile
 */
// HAB.reflowCatPage = function() {

//   // Move banner above the first teaser block
//   $.root
//     .find('.cat-banner')
//       .insertAfter('.prod-teaser-block:first');

// };

/**
 * Content choreography in Account > Favourites
 * Clone page sorting controls and add duplicate set above products
 * @TODO: ideally this needs a 'tear down' incase user resizes the browser down to mobile
 * @TODO: consolidate this with similar behaviour in HAB.reflowSubCatPage()
 */
HAB.reflowFavsPage = function() {

/*
[1] clone $('.s-favourites-footer')
[2] insert clone before $('.s-favourites-list')
*/

  $.root.find('section.s-your-favourites').each(function()
  {
      var oSection = $(this),
          oFooter  = oSection.children('footer'),
          oHeader  = oSection.find('header');
      
      if ( !oHeader.find('form').is('*') ) {
        oFooter.children().clone().appendTo(oHeader);
      }
  });

};

/**
 * Content choreography in homepage
 * @TODO: ideally this needs a 'tear down' incase user resizes the browser down to mobile
 */
HAB.reflowHomepage = function() {

  // Move signup form above the editorial teasers
  $.root
    .find('.signup-teaser')
      .prependTo('.ed-teaser-block');

};

/**
 * Content choreography for notice bars
 * If a notice bar lives in a column layout let's reposition it immediately below the masthead
 * @TODO: ideally this needs a 'tear down' incase user resizes the browser down to mobile
 */
HAB.reflowPageNotice = function() {

  $.root
    .find('.l-five-sixths .notice')
      .insertBefore('#content .page .crumb');

};


HAB.setupStockEmailPrompts = function()
{
    $.root.find('article.prod-item,section.s-basket').find('a.act-emailInStock,a.act-stockCheck').on('click', function()
    {
        var oT      = $(this),
            oC      = oT.parents('div.form-item,p').eq(0),
            sAcqUri = $(this).data('ajax-url');
            
        // 1. if there's no acquisition URI, fall back to the HREF of the link
        if ((sAcqUri === undefined) || (sAcqUri === ''))
        {
            sAcqUri = oT.attr('href');
        }
        
        // 2. load the content in
        $.get(sAcqUri, null, function(sHtml)
        {
            var oTmp = $(sHtml).insertAfter(oC).ajaxifyHabForm().hide().slideDown();
            
            // hide anything already there
            oTmp.siblings('.ajaxed').slideUp(400, function()
            {
                $(this).remove();
            });
            
            // now set a class
            oTmp.addClass('ajaxed');
        });
        
        return false;
    });
    return;
};


/**
 * Lightboxes (jQuery UI Dialog)
 * Links with a class of .lightbox-trigger will load their targets in a lightbox.
 * This can either be a fragment ID such as #foo or a URL in which case the
 * content would be fetched via ajax.
 * The title of the lightbox is fetched from the title attribute of the link.
 *
 * e.g:
 * <a href="/ajax/path/to/some/content" title="What a lovely lightbox" class="lightbox-trigger" id="myLightbox">Load this lightbox</a>
 *
 * Clicking the above link will request the content from the url and open it in
 * a lightbox with the title attribute as the title.
 * In addition, visiting the following url:
 *
 * http://www.hollandandbarrett.com/#myLightbox
 *
 * Would load the above lightbox immediately. Note that the fragment identifier
 * here must match the id attribute of the .lightbox-trigger link.
 *
 * Alternatively, lightbox fragments which are already in the DOM can be loaded
 * directly via a url without the need for a trigger link. E.g.
 *
 * http://www.hollandandbarrett.com/#anotherLightbox
 *
 * Would load the corresponding html into a lightbox:
 *
 * <div id="anotherLightbox" class="lightbox-content" title="Another lightbox">Foo</div>
 *
 * In mobile mode, dynamically loaded lightbox content will be placed directly
 * after the link in the DOM and will simply slide down instead of using a dialog.
 *
 * The destination of the content in mobile mode can be specified using the following data- options.
 * These options are ignored in desktop mode since in order for the lightbox to
 * appear properly it is always inserted as a direct child of the <body>
 *
 * <a data-method="insertAfter" data-location=".foo" href="/path/to/content" class="lightbox-trgger">Load this lightbox in a custom location</a>
 *
 * The data-method and data-location will be used to construct a custom jQuery
 * command to run. In this example, this is equivalent to:
 *
 * $html.insertAfter('.foo');
 *
 * Where $html is the html contents of the lightbox that was returned via ajax
 *
 * Another alterative might be:
 *
 * <a data-method="appendTo" data-location=".foo" href="/path/to/content" class="lightbox-trgger">Load this lightbox in a custom location</a>
 *
 * Which is equivalent to:
 *
 * $html.appendTo('.foo');
 *
 *
 * Manual opening of a lightbox.
 * In addition to all the above options, a lightbox can be opened directly from JavaScript as follows:
 *
 * HAB.lightboxes.open($('.something'), { ... opts ... });
 *
 * The first parameter is the DOM element you wish to open in a lightbox
 * The second parameter is optional extra options for the jQuery UI Dialog
 *
 */
HAB.lightboxes = {

  // Default jQuery UI Dialog options
  defaultDialogOptions: {
    modal: true,
    width: 'auto'
  },

  // Perform setup tasks
  setup: function() {
    // Handle click events on lightbox triggers
    $.root.on('click', 'a.lightbox-trigger', function(e) {
      e.preventDefault();

      var $this = $(this);
      var href = $this.attr('href');

      // Are we loading a lightbox from existing html via a fragment identifier?
      // Or loading a lightbox with content loaded via ajax?
      if(href.length > 1 && href.indexOf('#') === 0) {
        // Loading from a fragment ID
        HAB.lightboxes.open($.root.find(href), { title: $this.attr('title') });

      } else {
        // Loading via ajax
        var $selector;

        // If we're on mobile and we've already loaded the dialog, just close it        

        if(HAB.isMobile() && $this.is('.active')) {
          if ( ( $selector = $this.data('dom-fragment') ) ) {
            var $target = $this.parent().find($selector); // Locate the ajaxed content
            $target.slideUp(); // Hide
            $this.removeClass('active');
          }
        } else {
          $.get(href, function(html) {
            var $html;
            var $destination;

            if ( ( $selector = $this.data('dom-fragment') ) ) {
              $html = $(html).find($selector);
            }
            else {
              $html = $(html);
            }

            // Only use dialog on desktop mode
            if(HAB.isMobile()) {
              $html.hide();

              // If a DOM method and destination is specified and can be found
              // then we call the appropriate jQuery method assigning $html to 'this' using .call()
              if(
                  typeof($this.data('dom-location')) !== 'undefined' &&
                      typeof($this.data('dom-method')) !== 'undefined' &&
                      ($destination = $($this.data('dom-location')))
                  ) {
                var method = $.fn[$this.data('dom-method')];
                method.call($html, $destination);

              } else {
                // Otherwise simply insert the contents after the trigger
                $html
                  .insertAfter($this)
                  .append('<a class="trgr-close-accordion" href="#">Hide</a>'); // And add close link
              }

              // Indicate that link has been activated and target is visible so we know to slideUp
              $this.addClass('active');

            } else {
              $html
                  .hide()
                  .appendTo($.root);
            }

            HAB.lightboxes.open($html, { title: $this.attr('title') });

            // Triggering dom updated so that the selectbox gets styled up
            $html.domUpdated();

          });
        }
      }
    });

    // Handle direct loading of lightboxes using hashbangs
    try{
        var url = $.url();
        var fragment = url.attr('fragment');
        // For compatibility with AJAX refresh for all search refinment interactions on the subcategory and SRP pages
        try {
          var ENDECA_PARAMS_REGEXP = /N=(.*)\//;
          var QUERY_STRING_REGEXP = /\?(.*)/;
          var ENDECA_SEARCH_JSON_REGEXP= /.*?=.*/;
            var isEndecaParamsFragment = ENDECA_PARAMS_REGEXP.test(fragment);
            var isQueryStringFragment = QUERY_STRING_REGEXP.test(fragment);
            var isEndecaSearchJson = ENDECA_SEARCH_JSON_REGEXP.test(fragment);
        } catch (e){};
        if(fragment.length > 0 && !isEndecaParamsFragment && !isQueryStringFragment && !isEndecaSearchJson) {

          // Loading via a trigger
          var $trigger = $.root
              .find('#' + fragment)
              .filter('.lightbox-trigger');

          if($trigger.length > 0) {
            $(window).scrollTo(0);
            $trigger.click();
          }

          // Loading an html snippet directly into a lightbox
          var $content = $.root
              .find('#' + fragment)
              .filter('.lightbox-content');

          if($content.length > 0) {
            $(window).scrollTo(0);

            var openDialog = function() { HAB.lightboxes.open($content, { title: $content.attr('title') }); };

            if(HAB.isMobile()) {
              // wait for the mobile nav steup to complete, otherwise the element position will be wrong
              $(window).one('mobileNavSetupComplete', function(){
                openDialog();
              });
            }
            else {
              openDialog();
              $content.attr('id', ''); // stops window from scrolling down to embedded content
            }
          }
        }
    }catch(e){};

    // Close lightboxes when users click on the modal overlay
    $.root.on('click', '.ui-widget-overlay', function(e) {
      $.root.find('.ui-dialog-titlebar-close').click();
    });

    // Close accordion content on mobile
    $.root.on('click', 'a.trgr-close-accordion', function(e) {
      e.preventDefault();
      var lightbox_trigger = $(this).parent().siblings('a.lightbox-trigger');
      lightbox_trigger.trigger('click'); // Cheekily hijack the trigger toggle    
      $(window).scrollTop(lightbox_trigger.offset().top);
    });

  },

  /**
   * Helper function to open an element in a lightbox dialog
   * @param $element
   *   The DOM element you wish to open in a dialog
   * @param dialogOptions
   *   Object containing additional options to pass to the jQuery UI Dialog.
   */
  open: function($element, dialogOptions) {
    var options = $.extend({}, HAB.lightboxes.defaultDialogOptions, dialogOptions);

    // Only use dialog on desktop mode
    if(HAB.isMobile()) {
      $element
          .slideToggle(function(){
            SFR.Utils.scrollTo($element, 1000);
          });
    } else {
      $element
          .dialog(options)
          .attr('tabIndex', -1)
          .parent() // stops focus issue on embedded snippet loads
          .focus();
    }
  }
};

/**
 * Lightbox for iframe content
 */
HAB.hookContentLightbox = function(oAnchor)
{

  // i. create new markup
  var oLightbox = $('<div class="preview-container lightbox-container"><div class="masq"></div></div>').appendTo($.root).css({height: $.root.height(), width: $.root.width()}),
        oContent = $('<div class="content single-image clearfix"><a href="#" class="lb-close lb-close-main">' + _t("Close") + '</a></div>').appendTo(oLightbox);
    // ii. bind closing
    oLightbox.find('.masq, .lb-close').on('click', function()
    {
        oLightbox.fadeOut(100, function()
        {
            $(this).remove();
        });
        return false;
    });
    
    // iii. view area
    var oContentImg = $('<img src="' + oAnchor.attr('href') + '" alt="Email preview" />').appendTo(oContent);

    // v. position/display lightbox
    var oWin = $(window),
        iLightboxMargin = 100, // Spacing around lightbox
        iImageMaxWidth = oWin.width() - iLightboxMargin,
        iImageMaxHeight = oWin.height() - iLightboxMargin;

    oContentImg.css({
      'max-width': iImageMaxWidth,
      'max-height': iImageMaxHeight
    });

    oContentImg.load(function() { 
      // Wait for image load to get accurate sizing/positioning
      var iImageWidth = $(this).width(),
          iImageHeight = $(this).height();
      oContent.css({
        top: oWin.scrollTop() + ((oWin.height() - oContent.height() ) / 2),
        left: (oWin.width() - oContent.width() ) / 2
      });

    });

};

/**
 * Desktop version: hooks into product images and hooks up the preview/zoom functionality
 */
HAB.hookProductImagesDT = function()
{
    /**
     * Internal function: normalises and rewrites an image filename for a given size.
     *
     * @param   sFn the name of the file
     * @param   sSz the size to rewrite for
     * @return  the rewritten file path
     */
    function _rewriteFilename(sFn, sSz)
    {
        var replace = '';

        if ( sSz ) {
          replace = '.'+sSz+'.$1';
        }
        else {
          replace = '.$1';
        }

        return sFn.replace(/\.(mobile|thumb|desktop)\./i, '.').replace(/\.([a-z0-9]+)$/i,replace);
    }
    
    /**
     * Internal function: updates a given DOM element with the provided image/
     *
     * @param   oLink   the link from which to get the image
     * @param   sSize   the size of the image to update with
     * @param   oArea   the area to set the background on
     * @return  void
     */
    function _updateImageDisplay(oLink, sSize, oArea)
    {
        var sImgUri = '';
        
        // a. attempt to pull the image URI from the data attribute
        sImgUri = oLink.data('img-'+sSize);
        
        // b. if there's no data for what we're after, we'll have a null or false, so gack from URI
        if ((sImgUri === undefined) || (sImgUri === ''))
        {   
            sImgUri = _rewriteFilename(oLink.attr('href'), sSize);
        }
        
        // c. update the display area
        oArea.css({'background-image': 'url('+sImgUri+')'});
        
        // d. trigger active style
        oLink.parent().addClass('ui_active').siblings().removeClass('ui_active');
        
        return false;
    }
    
    /**
     * Internal function: repositions the thumbnails in a carousel.
     *
     * @param   iDir    the direction to move: -1 = left, 1 = right, 0 = just redraw things
     */
    function _animateThumbs(iDir)
    {
        // 1. check lock state
        if (bLock)
        {
            return false;
        }
        
        // 2. can we move?
        if (((iDir > 0) && (iCurr >= (aoImg.length - 3))) ||
            (iDir < 0) && (iCurr <= 0))
        {
            return false;
        }
     
        // 3. lock the UI
        bLock = true;
        
        // 4. work out which way we're going and animate it
        if (iDir === 1)
        {
            oList.children('li').animate({top: '-='+iDeltaX}, {
                duration: 200,
                complete: function() {
                  bLock = false;
                }
            });
            iCurr++;
        }
        else if (iDir === -1)
        {
            oList.children('li').animate({top:'+='+iDeltaX}, {
                duration: 200,
                complete: function() {bLock = false;}
            });
            iCurr--;
        }
        else if (iDir === 0)
        {
            oList.children('li').each(function(idx)
            {
                $(this).css('top', (idx * iDeltaX)+'px');
            });
            bLock = false;
        }
        
        // 5. restripe the controls
        oList.siblings('.control-left').toggle(iCurr < aoImg.length - 3);
        oList.siblings('.control-right').toggle(iCurr > 0);
        
        return;
    }
    
    // 0. do we need to run?
    if ($('.prod-img-container').length === 0) {
        return false;
    }
    
    // 1. hook stuff
    var aoImg        = $('.prod-img-container .prod-img-thumbs a'),
        oDisplayArea = $('.prod-img-container .prod-img');


    // Add markup for 'zoom' icon
    $('<span class="prod-zoom-icon">Zoom <span class="ico ico-image-zoom"></span></span>')
      .appendTo($('.prod-img-container .prod-img'));
    
    // 2. empty any existing image information
    oDisplayArea.find('img').not('.roundel').remove();
    
    // 3. hook click-to-update
    aoImg.on('click', function()
    {
        _updateImageDisplay($(this), '', oDisplayArea);
        return false;
    });
    
    // 4. display the first image
    aoImg.eq(0).trigger('click');
    
    // 5. handle clicking large-scale
    oDisplayArea.on('click', function()
    {
      // i. create new markup
      var oLightbox = $('<div class="preview-container lightbox-container"><div class="masq"></div></div>').appendTo($.root).css({height: $.root.height(), width: $.root.width()}),
          oContent = $('<div class="content clearfix"><a href="#" class="lb-close lb-close-main">' + _t("Close") + '</a></div>').appendTo(oLightbox),
          selectedIndex = aoImg.parent('li.ui_active').index();

          
      // ii. bind closing
      oLightbox.find('.masq, .lb-close').on('click', function()
      {
          oLightbox.fadeOut(100, function()
          {
              $(this).remove();
          });
          return false;
      });
      
      // iii. view area
      var oImgArea = $('<div class="prod-img"></div>').appendTo(oContent);
      
      // iv. clone in the thumbnail list
      aoImg.parents('ul').clone().prependTo(oContent).on('click', 'a', function()
      {
          _updateImageDisplay($(this), 'zoom', oImgArea);
          return false;
      }).find('a').eq(selectedIndex).trigger('click');
      
      // v. move it into place
      var oWin = $(window);
      oContent.css({
          top: '310px',
          left: Math.abs((oWin.width()  - oContent.width() ) / 2)
      });

        return false;
    });

    if ($('body').is('.breakpoint-768')) {
        aoImg.parents('ul').eq(0).removeClass('mobile-pips');
    }

    // 6. carousel the list...
    // a. check if we need to first
    if (aoImg.length <= 3)
    {
        return false;
    }
    
    // b. in which case...
    var oList  = aoImg.eq(0).parents('ul').eq(0).addClass('prod-img-carousel'),
        iCurr  = 0,
        bLock  = false,
        iDelta = oList.children('li').eq(0).outerWidth(true),
        iDeltaX = 87;

    if (aoImg.eq(0).parents('ul').eq(0).addClass('prod-img-carousel').parent().hasClass('prod-img-carousel-wrapper')) {
        return;
    }

    oList.wrap('<div class="prod-img-carousel-wrapper"/>');

    // c. create buttons
    $('<a href="#" class="prod-img-carousel-control control-left"><i class="ico-arrow-up" /></a>').on('click', function() {
        _animateThumbs(1);
        return false;
    }).insertBefore(oList);
    $('<a href="#" class="prod-img-carousel-control control-right"><i class="ico-arrow-down" /></a>').on('click', function() {
        _animateThumbs(-1);
        return false;
    }).insertAfter(oList);
    
    // d. stripe
    _animateThumbs(0);
    
};

/**
 * Similar above, only for mobile.
 */
HAB.hookProductImagesMB = function()
{
    // 0. do we need to run?
    if ($('.prod-img-container').length === 0 ) {
        return false;
    }

    // 1. hook stuff
    var aoImg        = $('.prod-img-container .prod-img-thumbs a'),
        oDisplayArea = $('.prod-img-container .prod-img'),
        oList        = $('<ul/>');
    
    $('.prod-img.img-panel').eq(0).attr("style", "background-image:none;");

    // 2. nuke thumbnails - we don't need them
    //aoImg.children('img').remove();
    
    // 3. empty the existing DOM
    oDisplayArea.empty().append(oList);
    
    // 4. build new DOM
    aoImg.each(function(idx)
    {
        // a. work out the URI of the image
        var oLink   = $(this),
            sImgUri = oLink.data('img-mobile');
        if ((sImgUri === undefined) || (sImgUri === ''))
        {
            sImgUri = oLink.attr('href').replace(/\.(mobile|thumb|desktop)\./i, '.').replace(/\.([a-z0-9]+)$/i, '.$1').replace(/370/, '180');
        }
            
        // b. create it
        $('<li/>').css('background-image', 'url('+sImgUri+')').appendTo(oList).on('slidechange', function()
        {
            oLink.parent().addClass('current').siblings().removeClass('current');
        });
        oLink.parent().off("click").on("click", function() {
            var beforeItemNumber = $(this).parent().find('.current').index(),
                currentItemNumber = $(this).index();

            oList.find('li').eq(currentItemNumber).removeClass('out-left').removeClass('out-right');

            if (beforeItemNumber == currentItemNumber) {
                
            } else if (beforeItemNumber >= currentItemNumber) {
              oList.find('li').eq(beforeItemNumber).addClass('out-right');
            } else {
              oList.find('li').eq(beforeItemNumber).addClass('out-left');
            }

          $(this).addClass('current').siblings().removeClass('current');
        });
    });
    
    // 5. hook up events
    oList.habCarousel('li');

    // 6. set a quick style on the parents
    aoImg.parents('ul').eq(0).addClass('mobile-pips').find('.current').removeClass('current');
    aoImg.eq(0).parent().addClass('current');
 
    
};

/**
 * Hooks up a faceted search.
 */
HAB.hookFacetedSearch = function()
{
    var oContainer  = $('form.prod-filters'),
        oTimeout    = null,
        oWin        = $(window),
        bHasChecked = false,
        oClearLink  = null;

    if (oContainer.length === 0) {
        return false;
    }

    // Function: Add a clear all link
    function addClearFilter() {

      // Only add link if checkboxes are checked 
      oContainer.find(':input').each(function() {
        if ( $(this).prop('checked') ) {
          bHasChecked = true;
          $(this).parents('.filter-set').addClass('selected');
          return;
        }
      });
      
      if ( bHasChecked ) {
        
        if ( !$('a.filter-clear-all').is('*') ) {

            oClearLink = $(document.createElement('a'));
            oClearLink.attr({
              'href': '#',
              'class': 'filter-clear-all',
              'title': 'Clear all filters'
            }).html('Clear');

            oClearLink.on('click', function(e) {
              oContainer.find(':input').each(function() {
                $(this).prop('checked', false);
              });
              oClearLink.remove();
              _submitForm();
              e.preventDefault();
            });

            oContainer.find('h2.prod-filter-title').after(oClearLink);
          }
        }

    }

    addClearFilter(); // Add clear filter link onload if required

    // Disable facets if required
    if (oContainer.hasClass('is-disabled')) {
      
      oContainer.find('label').each(function() {
      
        var $this = $(this);
        $this.addClass('disabled');
        SFR.disableElem($this.find('input'));

      });      
      return false;
      
    }

    // bind event
    oContainer.bind('change', ':input', function(e)
    {        
        clearTimeout(oTimeout);
        
        addClearFilter();

        oTimeout = setTimeout(_submitForm, 200);

        return true;
    });

    function _submitForm()
    {
        // 1. get submission path
        var sUri    = oContainer.data('ajax-url');
        if ((sUri === undefined) || (sUri === ''))
        {
            sUri = oContainer.attr('action');
        }


        HAB.blocker.block('Updating results');

        // 3. fire off a submission
        $.post(sUri, oContainer.serialize(), function(sHtml)
        {

            $('section.prod-teaser-block').not('.new-prod-teaser-block').html(sHtml);

            HAB.blocker.unblock();

            SFR.Utils.activateSelectListNavs('.page-limit');

            // remarshall content
            HAB.setupProdTeasers();
            HAB.reflowSubCatPage();
            oContainer.domUpdated();
            HAB.addSubmitIcons();
            HAB.hookProductSubmitButton();
        });
        
    }
};

/**
 *  Add AJAX submit to the homepage signup form.
 */
HAB.hookSignupTeaser = function()
{
  // hook up form
  $('.signup-teaser').on('submit','form', function(e)
  {
    var oT = $(this),
        sU = oT.data('ajax-url'),
        fM = (oT.attr('method') === 'get') ? $.get : $.post;

    if (sU === undefined)
    {
      sU = oT.attr('action');
    }
            
    // toggle submit button
    oT.find('input[type=submit]')
      .val(_t('Please wait'))
      .prop('disabled', true);
      
    // fire off 
    fM(sU, oT.serialize(), function(sHtml)
    {
      oT.replaceWith(sHtml);
    });
    
    e.preventDefault();
    
  });
        
      
};

HAB.hookProductSubmitButton = function()
{
    $.root.off('submit','form.prod-teaser-form, form.prod-form, form.fav-form, .adobe-recommendation form');
    $.root.on('submit','form.prod-teaser-form, form.prod-form, form.fav-form, .adobe-recommendation form', function()
    {
        // acquire information
        var oF = $(this),
            oB = oF.find('.prod-submit-bt'),
            fR = (oF.attr('method').toLowerCase() === 'get') ? $.get : $.post,
            sU = oF.data('ajax-url');
        
        $.ajaxSetup ({
      // Disable caching of AJAX responses
      cache: false
    });

        // if there's no URL
        if ((sU === undefined) || (sU === ''))
        {
            sU = oF.attr('action');
        }

        // serialise and send
        fR(sU, oF.serialize(), function(sHtml)
        {
            var oTmp = $(sHtml).appendTo(oB.parent()).hide().slideDown(),
                oBasket = $.root.find('.basket-nav-item>a'),
                outerBasket = $('.basket-nav-item>a', parent.parent.document);

                sBasketUri = null;
            
            oB.setKeyboardFocus();
            
            // hide anything already there
            oTmp.siblings('.ajaxed').slideUp(400, function()
            {
                $(this).remove();
            });

            // add class and hook any behaviours
            oTmp.addClass('ajaxed').find('.bh-ajax-loader').habAjaxLoader();

            // update the masthead basket
            if (!((oBasket.length === 0) ||
                ((sBasketUri = oBasket.data('refresh-url')) === undefined)))
            {
              // flash the basket
              oBasket.load(sBasketUri);                
            }
            if (!((outerBasket.length === 0) ||
                ((sBasketUri = outerBasket.data('refresh-url')) === undefined)))
            {
              outerBasket.load(sBasketUri);
            }
        });
        
        return false;
    });
};

/**
 * Add to favourites
 * As products contain multiple SKUs (one per size option) we should allow the
 * user to 'favourite' each size option individually from the same page.
 * 
 */
HAB.setupAddToFavourites = function()
{
    
    // Bind a change event to the product-size radio buttons so that we can
    // reset any previously triggered 'success' messaging and allow the user to
    // add the newly selected size option to their favourites list
    // Note: this doesn't currently handle the scenario where a user toggles 
    // the sizing options back to a previously 'favourited' item
    
    // @TODO: this change event is firing even when the current 'checked' item is clicked
    $.root.find('.prod-form .prod-size-opts input').on('change', function() {

      var $prodFavOpt = $.root.find('.prod-fav-opt');

      if ( $prodFavOpt.find('div').hasClass('success') ) {

        // Check that we can find an attribute containing the path to the required data
        if ( $prodFavOpt.find('.success').data('bh-url') !== undefined ) {
        
          $.ajax({
            url: $prodFavOpt.find('.success').data('bh-url'),
            type: 'GET',
            cache: false,
            success: function(data) {
            
              // Replace success message with original 'Add to favourites' link
              $prodFavOpt.html(data);
              
              // Fire 'dom updated' event so we can initialise 
              // AJAX-loading functions on new DOM elements
              $.root.domUpdated();
                        
            }
    
          });
          
        }

      }

    });

};

/**
 * Per product option images
 * As products contain multiple SKUs (one per size option) we need to show
 * different images per SKU
 *
 */
HAB.setupProdOptImages = function()
{

    $.root.find('.prod-form .prod-size-opts input').on('click', function() {

      var image_url = $(this).data('image-url');

      if(typeof(image_url) === 'undefined') {
        return;
      }

      var $prodImgContainer = $('.prod-img-container');

      $prodImgContainer.css({
        'width': $prodImgContainer.width(),
        'height': $prodImgContainer.height()
      });

      $prodImgContainer
        .addClass('loading')
        .empty();

      $prodImgContainer
        .load(image_url, function() {

          $prodImgContainer
            .css({
              'width': '',
              'height': ''
            })
            .removeClass('loading');

          if($('body').is('.breakpoint-768')) {
            HAB.hookProductImagesDT();
          } else {
            HAB.hookProductImagesMB();
          }
        });

    });

};

/**
 * Per product offers
 * As products contain multiple SKUs (one per size option) we need to show
 * different offers per SKU
 *
 */
HAB.setupProdOptOffers = function()
{

    $.root.find('.prod-form .prod-size-opts input').on('change', function() {

      var offers = $(this).data('offers');
      var $offersList = $('.prod-offers');
      var $offersListItems = $(document.createDocumentFragment());

      //$offersList.empty();

      if(typeof(offers) !== 'undefined') {
        $.each(offers.split(','), function(index, item) {
          $offersListItems.append('<li>' + $.trim(item) + '</li>');
        });

        $offersList.append($offersListItems);
      }

    });

};


HAB.initBasket = function()
{
    HAB.hookBasketRepeat();
    HAB.hookBasketShippingCosts();
    HAB.hookBasketRewards();
    /* CSS fallback for 'zero quantity' products in basket
    */
    if ( $('html').hasClass('.no-opacity') ) {
      $.root
        .find('.basket-product.is-zero')
          .find('.product div.img')
          .fadeTo('', 0.5);
    
    }
    HAB.hookBasketRflSection();
};

HAB.hookBasketRepeat = function()
{
    $('article.basket-row input.prod-repeat-in').on('change', function()
    {
        var oIn = $(this),
            oA  = oIn.parents('article').eq(0),
            sU  = oIn.data('ajax-url'),
            oM  = null;
        
        // 0. if we don't know what to do, ignore it
        if ((sU === undefined) || (sU === ''))
        {
            return true;
        }
        
        // 1. if the input is checked
        if (oIn.is(':checked'))
        {
            oM = $('<span class="ico ico-wait"></span>').css({
                height: oIn.height(),
                width:  oIn.width()
            }).insertAfter(oIn.hide());
            
            $.get(sU, null, function(sHtml)
            {
                oIn.show();
                oM.remove();
                oA.append(sHtml);
            });
            
            // make the containing DD full-height
            oIn.parents('dd').eq(0).height(oA.height()).addClass('open');
        }
        else
        {
            oA.find('fieldset.basket-repeat').remove();
            oIn.parents('dd').eq(0).removeClass('open');
        }
        
        // 2. drop out
        return true;
    });
};

HAB.hookBasketShippingCosts = function()
{
    $('section.s-basket').on('change', 'select.basket-shipping-sel', function()
    {
        var oSelect  = $(this),
            oSection = oSelect.parents('section').eq(0),
            sUrl     = oSelect.data('ajax-url'),
            oM       = $('<div class=""></div>').appendTo(oSection);
        // we have remove this class because it is effect to country drop down
        
        // if there's no submission endpoint
        if ((sUrl === undefined) || (sUrl === ''))
        {
            return true;
        }
        
        // create mask DIV
        oSection.find('.clear-on-submit').empty();
        
        // hide info, possibly
        if (oSection.children('aside.basket-rewards').is(':visible'))
        {
            oSection.children('aside.basket-rewards').slideUp();
        }
        
        // fire off request
        $.get(sUrl, oSelect.serialize(), function(sHtml)
        {
            oSection.find('dl').replaceWith(sHtml);
            oM.remove();
            oSection.domUpdated();
        });
               
        return true;    
    });
};


/*
 * Limit length of inputs with either maxlength (deprecated) or data-maxlength
 */

HAB.setMaxLength = function()
{
    $.root.on('keyup', 'input[maxlength], input[data-maxlength]', function(e) {

      var nLength = $(this).attr('maxlength'); // Set maxlength (deprecated)

      // Use data-maxlength if provided
      if ($(this).attr('data-maxlength') ) {
        nLength = $(this).attr('data-maxlength');
      }

      if ( $(this).val().length > nLength ) {
        $(this).val($(this).val().slice(0,nLength));
      }

    });
};

/*
 * Limit input to certain characters/regex (uses data-safe-chars)
 * Use with caution - we're overriding default behaviour
 */

HAB.limitChars = function()
{
  /* qodo.co.uk/assets/files/uploads/javascript-restrict-keyboard-character-input.html */
  function restrictCharacters(myfield, e, restrictionType, caretPos) {

    var character = '',
        code = -1,
        regex = new RegExp(restrictionType, "i"),
        allowedKeys = [];

    if (!e) {
      e = window.event;
    }
    if (e.keyCode) {
      code = e.keyCode;
    }
    else if (e.which) {
      code = e.which;
    }

    character = $(myfield).val().slice(caretPos-1, caretPos);

    // allowed functional keys
    allowedKeys = [
      13, // enter
      8, // backspace
      39, // right (and ')
      9, // tab
      37 // left (and %)
    ];

    if (!e.ctrlKey && !e.metaKey && $.inArray(code,allowedKeys)===-1) {

      // if not ctrl/cmd or in allowedKeys
      if ( regex.test(character) ) { // allow input of data-safe-chars
        return true;
      } else { // disallow input
        return false;
      }
    }

    return true;
  }

  $.root.on('keyup', 'input[data-safe-chars]', function(event) {

      var caretPos = 0,
          newValue = '';

      // Pull regex from data attribute on input
      var safeChars = $(this).attr('data-safe-chars').toString(); 
      // @iamkeir: preferable not to set this on every key event but need to consider forms loaded via AJAX...

      caretPos = SFR.Utils.getCaret($(this).get(0));

      if ( !restrictCharacters(this,event,safeChars, caretPos) ) {
        var character = $(this).val().slice(caretPos-1, caretPos);
        if(character==""){
          
        }
        else{
        newValue = $(this).val().replace(character, '');
        $(this).val(newValue);
        $(this).caretTo(caretPos-1,1);
        }
      }

  });

};


/*
 * Truncate text
 * Limit number of characters displayed in a container  
 * Moves cropped chars into expandable overflow
 *
 * @param   ctx  
     selector for container
 */

HAB.truncateText = function(ctx)
{

    var $ctx = $(ctx),
        // If we can find a data attribute defining the number of chars visible by default, use it
        defaltCharLength = 300,
        $charLength = $(ctx).data('char-length'),
        charLength = $charLength ? $charLength : defaltCharLength;
    
    // idempotence FTW
    if ( $ctx.hasClass('is-truncated') ) {
      return;
    }

   $ctx
      .jTruncate({ // http://www.jeremymartin.name/projects.html?project=jTruncate
          length: charLength, 
          moreText: 'Show More',
          lessText: 'Show Less'
      })
      .addClass('is-truncated');

};

/*
 Note: auto-submit on Qty buttons and remove links has bee disabled by request:  
*/

HAB.hookQtyButtons = function()
{
    var oTo = null;
        
    $('input.in-qty-control').each(function()
    {
        var oInp  = $(this),
            iMin  = parseInt(oInp.attr('min'), 10),
            iMax  = parseInt(oInp.attr('max'), 10),
            iStep = parseInt(oInp.attr('step'), 10),
            nLength = 0;
            
        if (oInp.siblings('button').length > 0)
        {
            return true;
        }
        
        // default things
        if (isNaN(iMin))
        {
            iMin = Number.NEGATIVE_INFINITY;
        }
        if (isNaN(iMax))
        {
            iMax = Number.POSITIVE_INFINITY;
        }
        if (isNaN(iStep))
        {
            iStep = 1;
        }
        
        // build additional DOM
        minusButton = $('<button type="button">-</button>');
        minusButton.insertBefore(oInp).on('click', function()
        {
          if(oInp.val()!==""){
            var iV = parseInt(oInp.val(), 10) - 1;
                
                oInp.val(iV).triggerHandler('blur');
                
                if (iV < iMin) {
                    oInp.val(iMin);
                } else if (iV > iMax) {
                    oInp.val(iMax);
                }
          } else{
            $('.in-qty-control').val(parseInt(prodQuantity));
          }
            
            return false;
        });
        
        plusButton = $('<button type="button">+</button>');
        plusButton.insertAfter(oInp).on('click', function()
        {
          if(oInp.val()!==""){
              var iV = parseInt(oInp.val(), 10) + 1;
              
              oInp.val(iV).triggerHandler('blur');
              
              if (iV < iMin) {
                  oInp.val(iMin);
              } else if (iV > iMax) {
                  oInp.val(iMax);
              }
          } else{
            $('.in-qty-control').val(parseInt(prodQuantity));
          }
            return false;
        });
        
        if(oInp.hasClass('itemQtyControl')){
            oInp.keypress(function(event) {
                if ( event.which == 13 ) {
                    event.preventDefault();
                    var inputEle = $(this).closest('.quantity-wrapper').find('input');
                    var maxval=parseInt($(this).attr('max'));
                    var minval=parseInt($(this).attr('min'));
                    var curval=parseInt($(this).val());
                    if (curval > maxval)
                    {
                        $(this).triggerHandler('blur');
                        $(this).val(maxval);
                    }
                    $('#giftlistItemId').val(inputEle.attr('name'));
                    $('#updateQuantity').val(inputEle.attr('value'));
                    $('#itemNumb').val(inputEle.attr('cnt'));
                    $('#updateGiftlistItemsSmbt').click();
                    $('#updateGiftlistItems').ajaxSubmit();
                }
            });
        }
        
        if(plusButton.parents('.myFav').length > 0  /*&& minusButton.parents('.myFav').length > 0*/){
            plusButton.add(minusButton).click(function(event){
                event.preventDefault();
                var inputEle = $(this).closest('.quantity-wrapper').find('input');
                $('#giftlistItemId').val(inputEle.attr('name'));
                $('#updateQuantity').val(inputEle.attr('value'));
                $('#itemNumb').val(inputEle.attr('cnt'));
                $('#updateGiftlistItemsSmbt').click();
                $('#updateGiftlistItems').ajaxSubmit();
            });
        }
        
        // if the input is disabled
        if (oInp.prop('disabled'))
        {
            oInp.siblings('button').addClass('disabled').prop('disabled', true);
        }

        oInp.inlineValidation();

    });

};

HAB.__updateBasket = function(oCtx)
{
    
    var oF = oCtx.parents('form.f-basket').eq(0),
        sU = null,
        fM = null;
    
    if (oF.length === 0)
    {
        return false;
    }
    
    // append a mask
    oF.append('<div class="masq"></div>');
    
    // grab endpoint and method
    sU = oF.data('ajax-url');
    if ((sU === undefined) || (sU === ''))
    {
        sU = oF.attr('action');
    }
    fM = (oF.attr('method').toLowerCase() === 'get') ? $.get : $.post;
    // submit the form via ajax
    fM(sU, oF.serialize(), function(sHtml)
    {
        oF.html(sHtml);
        HAB.initBasket();
        HAB.hookQtyButtons();
        oF.domUpdated();
    });
};

/**
 *  Ensure the 'Active Your Card' form is
 *  submitted via ajax.
 */
HAB.hookRFLActivation = function() {
  
  $('body').bind('bh-triggered.bh-ajaxLoaded', function(e, element) {
    if ( element && element.hasClass('rfl-activate') ) {
      element.ajaxifyHabForm();
    }
  });
  
  // Disable button "Activate" on the order confirmation page when terms and conditions doesn't accepted
  $("#activateAccount").prop("disabled",true);
  $("#agreements").click(function(event){
    if ($(this).is(':checked')) {
      $("#activateAccount").prop("disabled",false);
    } else {
      $("#activateAccount").prop("disabled",true);
    }
  });
  
};

HAB.hookBasketRewards = function()
{
    $('.basket-abs-total small span').addClass('trigger');
    $('section.basket-totals').on('click', '.basket-abs-total small span', function()
    {
        $(this).parents('section').eq(0).children('aside.basket-rewards').slideToggle();
        return false;
    });
    $('section.basket-totals aside.basket-rewards').hide();
};

HAB.hookBasketRflSection = function() {
  var $newRflCardCheckbox = $('#newRflCard');
  var $rflCardNumberInput = $('#rflCardNumber');
  var $addRflCardButton = $('#addRflCard');
  var $discountCode = $('#discountCode');
  var $applyDiscountBtn = $('#addDiscount');
  
  var requestNewRflCardWithOrder = $newRflCardCheckbox.attr('checked');
  if (requestNewRflCardWithOrder) {
    $rflCardNumberInput.toggleDisabled();
    $addRflCardButton.toggleDisabled();
  }
  
  $newRflCardCheckbox.click(function(){
    $rflCardNumberInput.toggleDisabled();
    $addRflCardButton.toggleDisabled();
  });
  
  $('.newRflCard').click(function(event){
    $(this).closest('form').ajaxSubmit();
  });
  
  // to handle appropriate submit method
  $rflCardNumberInput.keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      $addRflCardButton.click();
    }
  });
  $discountCode.keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      $applyDiscountBtn.click();
    }
  });
}

HAB.__bBasketLoaded = false;
HAB.hookBasketFlyout = function()
{
    var oTimeout = null,
        bOpen = false,
        iBasketShowTimeout = 100,
        iBasketHideTimeout = 200,
        oNavItem = $('nav.utility-nav .basket-nav-item'),
        oBasketDom = null,
        sUrl = oNavItem.find('a').data('ajax-url');
    
    /**
     * Internal function: shows the basket, loading it from the server if required
     */
    function _showBasket()
    {
        oBasketDom.addClass('basket-loading').html('<p>'+_t('Basket loading')+'</p>');

        $.ajax({
          url: sUrl,
          success: function(sHtml){
              oBasketDom.removeClass('basket-loading').html(sHtml);

              $('.mini-basket-holder footer a').setKeyboardFocus();
          },
          dataType: 'html',
          cache: false
        });
        
        // b. show it
        oBasketDom.slideDown(100);
        bOpen = true;
    }
    
    /**
     * Internal function: hides the basket.
     */
    function _hideBasket()
    {
        oBasketDom.slideUp(150);
        bOpen = false;
    }
    
    /* -- end internal functions */
    
    // 1. if we don't have an AJAX endpoint, drop out
    if ((sUrl === undefined) || (sUrl === ''))
    {
        return false;
    }
    
    // 2. append DOM
    oBasketDom = $('<div class="menu-flyout mini-basket-holder"></div>').hide().appendTo(oNavItem);
    
    // 3. hook up mouseover/mouseout events
    oNavItem.on('mouseover', function()
    {
    $.ajaxSetup ({
      // Disable caching of AJAX responses
      cache: false
    });
        clearTimeout(oTimeout);
        if (!bOpen)
        {
            oTimeout = setTimeout(_showBasket, iBasketShowTimeout);
        }
    }).on('mouseout', function()
    {
        clearTimeout(oTimeout);
        if (bOpen)
        {
            oTimeout = setTimeout(_hideBasket, iBasketHideTimeout);
        }
    });
};

HAB.hookLanguageSelection = function(){
  var languageMenu = $('.language-nav-item');
  var dropdown = languageMenu.find('.language-dropdown');
  var isSelectLanguage=false;
  languageMenu.find('.language-current').on({
    'click' : function(e) {
      e.preventDefault();
      languageMenu.toggleClass('arrow-up');
      dropdown.toggleClass('show');
    },
    'blur' : function() {
       setTimeout(function(){
         if(!isSelectLanguage){
           languageMenu.removeClass('arrow-up');
           dropdown.removeClass('show');
         }
       }, 200);
    }
  });

  dropdown.on('click', '.language-select', function(e){
    isSelectLanguage=true;
    e.preventDefault();
    var language = $(this);
    var form = dropdown.find('#languageSwitcher');
    form.find('input[name="language"]').val(language.data('set-value'));
    var successUrlInput = form.find('input[name="successUrl"]');
    var errorUrlInput = form.find('input[name="errorUrl"]');
    successUrlInput.val(language.attr('href'));
    //useful if switching language on PLP
    var urlHash = window.location.hash;
    if(urlHash) {
        successUrlInput.val(successUrlInput.val()+urlHash);
        errorUrlInput.val(errorUrlInput.val()+urlHash);
    }
    form.submit();
  });
};

/**
 * @TODO: Document this function. And maybe even rename it! What does it *do* as a whole? It looks like a dumping ground, should the functionality be split out?
 */
HAB.hookSpecialBehaviour = function()
{
    /*
     * Add check and submit behaviour to certain
     * links.
       
       (removed by request)
       
     */
/*
    if ( $('.remove-item a').is('*') ) {
      $('.remove-item a').checkAndSubmit();
    }
*/
  
    /*
     * Add conceal/reveal behaviour to uls
     */
    var $concealElements = $('[data-conceal]');
    if ( $concealElements.not('.revealed').is('*') ) {
      $concealElements.revealConceal();
    }

    $.root.find('.bh-ajax-loader').habAjaxLoader();
// de-scoped by request (PA will attach click handlers so we should still leave the classnames in the HTML as CSS hooks)
//    $.root.find('.bh-auto-submit').habAutoSubmit();
//    $.root.find('.bh-ui-toggle').habUiToggle();

   /*
    * Remove the 'add a new address' link whilst we adding a new address
    */
   
   /*
   $('.bh-ajax-loader').live('bh-complete.bh-ajaxLoader', function(e) {
     $('.bh-add-address').hide();
   });
*/
/*
   $('fieldset.add-address').on('ajaxifyHabForm.complete', function(e) {
     
     //  need to unbind the click as it seems to be putting the event on twice
     $('.bh-add-address').unbind('click').show();
     
     //  the ajax loader is not removing the fieldset, so explicitly remove it.
     $(this).remove();
   });
*/


};

/**
 * General init call for basket functionality. Call individual functions from here rather than cluttering init.js
 */
HAB.doCheckoutHooks = function()
{
    var oElm = null,
        oLinkElm = $.root.find('.bh-add-address'),
        oLinkElmParent = oLinkElm.parent(),
        sValidateUrl = '';
    /*
     *  Ensure we have postcode lookup on address forms
     */
    HAB.postcodeLookup.init();

    /*
     *  hookup callback on 'add new address' button
     */
    oLinkElm.on('bh-complete.bh-ajaxLoader', function(e)
    {
        // have to do this in a timeout because the event is fired before the DOM gets updated
        // @OPTIMIZE: This sounds brittle - is there no better way this code could be structured?
        setTimeout(function() {

          HAB.postcodeLookup.init();

          $('fieldset[data-ajax-method]').ajaxifyHabFormElement(function(oElm) {
            //  ajax submit callback
            oElm.find('li').prependTo('ul.delivery-select:eq(0)');
            
            $('ul.delivery-select li:eq(0) label')
              // Make it the selected item
              .click()
              // Give it keyboard focus
              .setKeyboardFocus();
          });
        }, 50);
        
        
    });
    
    /*
     * If the delivery checkbox is checked to say
     * billing is the same as delivery, populate the input
     * fields with the data-set-value value.
     */
     $.root.on('change','#checkout_form_use_delivery',function(e) {
       var checkbox = $(this);
       var addrForm = checkbox.closest('form');
       var addrFields = addrForm.find(':input[data-set-value]');
       addrFields.each(function() {
         var oElm = $(this);
         var setVal = oElm.data( checkbox.is(':checked')?'set-value':'default-value');
         if(oElm.is('#checkout_form_country')) {
           if(setVal === undefined) setVal = oElm.find("option:first")[0].value;
           oElm.selectBox('value', setVal);
         } else {
           oElm.val(setVal === undefined ? '' : setVal);
         }
       });
       $('#checkout_form_country').change()
     });

     /*
      * Uncheck 'use delivery address' if user changes the postcode lookup select.
      */
     $.root.on('click','#checkout_form_address-select',function(e) {
       $('#checkout_form_use_delivery').prop('checked', false);
     });
 


   /*
    * Remove the 'add a new address' link whilst we adding a new address.
    */
   $('.bh-ajax-loader').live('bh-complete.bh-ajaxLoader', function(e) {
     $('.bh-add-address').hide();
   });

   /*
    * Show it again once the add address ajax call has completed.
    */
   $('fieldset.address-list').on('ajaxifyHabForm.complete', function(e) {
     oElm = $(this).find('.bh-add-address');
     
     //  need to unbind the click as it seems to be putting the event on twice
     oElm.unbind('click').show();
     
     //  the ajax loader is not removing the fieldset, so explicitly remove it.
     $(this).find('fieldset.add-address').remove();
     
   });

    
    /*
     *  Add Fieldset AJAX for RFL
     */
    
    $('fieldset[data-ajax-method]').ajaxifyHabFormElement();

    /*
     * Apply iframe switcher
     */
    $('input', '#checkout-payment').iframeSwitcher({
      'submitBtn': $('.checkout-submit'),
      'urlCallback': function(elem) {
        if ( HAB.isMobile() ) {
          return elem.data('mobile-fields');
        }
        else {
          return elem.data('desktop-fields');
        }
      }
    });

    /*
     * When user selects a credit card show the add new card link, hide the new card boxout
     */
    $('input', '#checkout-payment').on('change', function(e) {
      if ( !$(this).parents('#payment-add-card').is('*') ) {
        $('.payment-add-card').show();
        $('#payment-add-card').addClass('visuallyhidden');
      }
    });

    /*
     * Add click handler to the 'add a new card' link
     */
    $('.payment-add-card').on('click', function(e) {
      $('#payment-add-card').removeClass('visuallyhidden');
      $('label', '#checkout-payment').removeClass('checked');
      $('.checkout-iframe').hide();
      $('.payment-add-card').hide();
      e.preventDefault();
    });
    
    /*
     * Check selected delivery address and update fields above
     */
    $('input:radio[name="default-delivery-address"]').live("change", function(){
        if ($(this).is(':checked')) {

          var checkedAddressForm_Title = $.trim($('#prefixForPrefil'+this.value).html());
            var checkedAddressForm_FirstName = $.trim($('#firstNameForPrefil'+this.value).html());
            var checkedAddressForm_LastName = $.trim($('#lastNameForPrefil'+this.value).html());
            var checkedAddressForm_Homephone = $.trim($('#phoneForPrefil'+this.value).html());
            
          if(checkedAddressForm_Title){
                $('#checkout_title :selected').selectBox("value", checkedAddressForm_Title.replace("&nbsp;", ""));
                $('#checkout_title').next().children(":first").text(checkedAddressForm_Title.replace("&nbsp;", ""));
            } else{
                $('#checkout_title :selected').selectBox("value", "");
                $('#checkout_title').next().children(":first").text("Please select");
            }
            $('#checkout_form_firstname').val(checkedAddressForm_FirstName);
            $('#checkout_form_lastname').val(checkedAddressForm_LastName);
            $('#checkout_form_phone').val(checkedAddressForm_Homephone);
            
          var buttonSaveShippingAddress = $('#save-shipping-address');
          if(buttonSaveShippingAddress.hasClass('invis') && buttonSaveShippingAddress.is(':hidden')){
            buttonSaveShippingAddress.removeClass('invis').show();
          }
          buttonSaveShippingAddress.prop('disabled', false);
        }
    });

    $('.hb-form-cancel-add').live("click", function (event) {
        event.preventDefault();

        var buttonSaveShippingAddress = ($('#save-shipping-address').length > 0) ? $('#save-shipping-address') : $('#save-shipping-address-metapack');

        if(buttonSaveShippingAddress.hasClass('invis') || buttonSaveShippingAddress.is(':hidden')) {
            buttonSaveShippingAddress.removeClass('invis').show();
        }

        $('#newAddressDiv').html('');
        $('#newShippingAddressId').show();
        $('.form-errors').html('');

        if(!$('.form-errors').hasClass('hdn')) {
            $('.form-errors').addClass('hdn');
        }

        SFR.Utils.scrollTo('#deliveryDetails');
      });

    /*
     * Reveal extra addresses on delivery address
     */
//    $.each( $('table[data-conceal]'), function(key, value) {
//      var concealCount = $(this).attr('data-conceal');
//      var revealButtonID = "#" + $(this).attr('data-reveal');
//      var addressRows = $(this).find( "tr" );
//
//      for(var index = 0; index < addressRows.length; index++){
//        if (index > (concealCount)-1) {
//
//          addressRows.eq(index).css( "display", "none" );
//        }  
//      }
//      
//      var revBut = $(revealButtonID);
      $('#address-reveal').live('click', function(e) {
        $('li.vcard .l-col .l-one-third').css( "display", "none" );
        $('#address-reveal').hide();
        //e.preventDefault();
      });
   // });

};

/**
 * Hooks postcode lookup functionality
 * @TODO: Use non cryptic variable names written in english
 * @TODO The selectors in this function are horrible. If we can confirm that all postcode lookup fields have the class "postcode-lookup-input" we could do away with all of the IDs here and clean this up significantly.
 */

HAB.postcodeLookup = {
  initialized: false,

  init: function() {

    var self = this,
    lookupElems = $('#checkout_form_postcode-lookup, #frm_address_postcode-lookup, #frm_registration-rfl_postcode-lookup, .postcode-lookup-input'),
    lookupElemsForm = lookupElems.parents('form'),
    currentElemFocus = false;

    /*
     * Submit changes focus to the button, so we don't know if the user's focus was on the postcode field at the
     * point the submitted the form.  Therefore we need to work out what textfield the user *was* on.
     */
    lookupElemsForm.find('input[type=text]').on('focus', function(e) {
          currentElemFocus = $(this);
    });

    /*
     * The user has submitted the form when they are in the postcode input
     */
    lookupElemsForm.on('submit', function(e) {  
      if ( lookupElems.is('currentElemFocus') ) {
          var lookupButton = $('input[name="postcode-lookup-trigger"]');
          if (lookupButton.is(":visible") ){
              lookupButton.click();
          }
        e.preventDefault();
      }
    });

    var lookupBtn = $.root.find('.postcode-lookup-field input[type="button"]');
    
    lookupElems.each(function () {
      if(!$.trim($(this).val())){
//        lookupBtn.prop('disabled', true);
        }
    });
    
    lookupElems.on('keyup', function(e) {
      lookupBtn.prop('disabled', false);
    });

    if(!HAB.postcodeLookup.initialized) {
      HAB.postcodeLookup.initialized = true;
      HAB.postcodeLookup.oneTimeInit();
    }

  },

  oneTimeInit: function() {

    // bind initial click on the button
    $.root.on('click', '.postcode-lookup-field input[type="button"]', function(e)
    {
      if(typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
          return this.replace(/^\s+|\s+$/g, ''); 
        }
      }   
      // a. on click, grab the value of the form, endpoint and add it to the appropriate DATA item
      // @TODO: Use non cryptic variable names written in english.
      var oT = $(this).addClass('pca-bound'), // lookup address button
          oP = oT.parent(), // container for lookup address button and postcode field (<li>)
          oF = oT.siblings('input'), // postcode field
          addressForm = $(this).parents('form:first'), // address form 
          sU = oT.data('submit-url') // url for page with found addresses (will be inserted after postcode, user can choose on of these addresses)


      // clear any existing select box...
      oP.siblings('.postcode-lookup-field').remove();

      oP.addClass('loading');
      oT.prop('disabled', true); 

      var countryISO = addressForm.find(':input[name="country"]').val();
      var data = {};
      data["countryISO"] = countryISO;
      if (countryISO == "IRL") {
        data["houseNumName"] = addressForm.find('input[name="house-lookup"]').val();
        data["street"] = addressForm.find('input[name="street-lookup"]').val();
        data["locality"] = addressForm.find('input[name="town-lookup"]').val();
      } else {
        data["postalCode"] = addressForm.find('input[name="registration-rfl_postcode-lookup"]').val();
      }
      if(countryISO == "IRL"){
	      data["layout"] = "NBTYIRL4"; //NBTYATG-3869
      }
      if(countryISO == "NLD"){
        data["layout"] = "HANDBNLD"; //NBTYATG-4686
      }
      $.get(sU, data, function(data, textStatus, jqXHR) {
        var qasResults = $(data).find(".data_attr_value");
        if (qasResults.length == 1) {
          populateHB(qasResults, addressForm);
        } else {
          oP.after(data);
        }
        
        oP.removeClass('loading');
        oT.prop('disabled', false);
        
        oP.trigger('domUpdated');
        $('.address-select').focus();
      });

      // d. block default submit, everything gets handled by the behaviour
      e.preventDefault();
    return false;
    });

    $.root.on('change', '.postcode-lookup-field select.address-select', function(e)
    {   
    
      // grab everything
      var oThis   = $(this),
          oP = oThis.closest('.postcode-lookup-field'),
          sU      = oThis.data('submit-url'),
          oFields = oThis.closest('.postcode-lookup-field').nextAll('.pcl-house-number, .pcl-address-line-1, .pcl-address-line-2, .pcl-town, .pcl-county, .pcl-country'),
          lookupBtn = oThis.closest('.postcode-lookup-field').prev('.postcode-lookup-field').find('[name=postcode-lookup-trigger]');

      var data = {
        'addressMoniker': oThis.val(),
        'prefix': lookupBtn.data('prefix'),
        'namePrefix': lookupBtn.data('name-prefix')
      };
  
   //   HAB.blocker.block('Fetching address details');
      

    oP.addClass('loading');
      oThis.prop('disabled', true).selectBox('disable');
      
        //oThis.closest('.postcode-lookup-field').after(response);
        //oFields.remove();
      populateHB($('option:selected', oThis), oThis.closest('form'));
    
    
    //HAB.blocker.unblock();
    //oFields.remove();
    oThis.trigger('domUpdated');
    //oP.removeClass('loading');
    
    oThis.prop('disabled', false).selectBox('enable'); 
    
    $('#addressSelectedFlag').val(true);
    $('#addr_verified_status').val("Full Address and Postal Code Found");
     
    });

    $.root.on('keypress', '.house-lookup, .town-lookup, .street-lookup', function(e) {
      var addrForm = $(this).closest('form');
      if(e.which == 13){
        addrForm.find('.postcode-lookup-field input[name=postcode-lookup-trigger]').trigger('click');
        return false;
      }
    });
  }
};

/**
 * Fires account hooks
 */
HAB.doAccountHooks = function() 
{
    // check based on the page template
    if ($('.t-account').length === 0)
    {
        return false;
    }
    
    for (var k in HAB.account)
    {
        if (typeof(HAB.account[k]) === 'function')
        {
            HAB.account[k]();
        }
    }
    
    if ( $.root.find('.s-your-addresses').is('*') ) {
      HAB.postcodeLookup.init();
    }
    
    $('.bh-element-toggle').click(function (event) {
      var item = $(this).closest('tr').next().find('.hb-form-payment-remove');
      
      event.preventDefault();
      
      $('.hb-form-payment-remove').removeClass('row-form-show');
      $(item).addClass('row-form-show');
      
      /* Reapply selectBox to fix width as it can't be determined due to being hidden */
      $('.hb-form-address-add select, .hb-form-address-edit select, .hb-form-payment-add select, .hb-form-payment-edit select').each(function() { 
        $(this).selectBox('destroy');
        $(this).selectBox();
      });
    });

    $('.hb-form-cancel').click(function (event) {
      event.preventDefault();
      $('.hb-form-payment-remove').removeClass('row-form-show');
      
      $('#newAddressDiv').html('');
      $('#newShippingAddressId').show();
      
      $('.form-errors').html('');
      if(!$('.form-errors').hasClass('hdn')){
        $('.form-errors').addClass('hdn');
      }
    });
    
    $('.setDefaultCard').click(function(event){
      $(this).closest('form').ajaxSubmit();
    });
};

/**
 * Hooks up 'edit email' link on event page
 */
HAB.account.hookEditEmail = function()
{
    var oIn = $('.act-enable-email').on('click', function()
    {
        $(this).parents('.text').find('input[name=details_email]').show().focus().siblings('span').remove().end().end().end().remove();
        return false;
    }).parents('.text').find('input[name=details_email]').hide();
    
    // append SPAN
    oIn.after('<span class="readonly">'+oIn.val()+'</span>');
};

/**
 * Hooks up the add rfl card on the account
 * registration page.
 */
HAB.account.hookAddRFLCard = function()
{
    var oF = $('.fs-register-rfl'),
        submit = null;

    if ( oF.is('*') ) {
      
        oF.ajaxifyHabFormElement(function() {
        
          /*  
           * When ajax finished, if the card is an active one...
           */               
          HAB.account.makeEditable();
        });  
    }
 
};

HAB.account.makeEditable = function() {

  if ( $('.act-enable-rfl-number').is('*') ) {

    $('.act-enable-rfl-number').on('click', function(e) {
      /*
       * Add event listener to the 'edit card number' link.
       * On click, remove readonly stuff.
       */
      $('#account-rfl-number')
      .prop('readonly', false)
      .removeClass('readonly')
      .focus();            

     
       e.preventDefault();
    });
  }
  else {
    $('.fs-register-rfl').find('input, select').inlineValidation();
  }
};   


/**
 * Hook back on 'add new address' option in account
 */
HAB.account.hookAddressCallback = function()
{
    $('form').bind('ajaxifyHabForm.complete', function() {
        setTimeout(HAB.postcodeLookup.init, 50);
    });
  
    $('.act-add-address').on('bh-complete.bh-ajaxLoader', function()
    {
        setTimeout(HAB.postcodeLookup.init, 50);
    });
};


/**
 *  Link parent & child checkboxes in 'Contact permissions' section of Your Details
 * 
 *  if any checkbox is selected inside $('.s-contact-prefs .grouped') 
 *  make sure that the checkbox inside $('.s-contact-prefs .grouped').siblings('label').find(':checkbox') is checked too
 *
 *  likewise, when ALL $('.s-contact-prefs .grouped').siblings('label').find(':checkbox') are unchecked, 
 *  also uncheck $('.s-contact-prefs .grouped :checkbox')
 *
 */
HAB.account.linkRelatedPrefs = function()
{
  var oFG = null,
      oR = null,
      bC = false;

  $('.s-contact-prefs input[type=checkbox]').on('change', function(e) {
    
    oFG = $(this).closest('fieldset.grouped');
    oR = $(this);
    
    if ( oFG.is('*') ) {      
      /*
       * If a checkbox in the fieldgroup has been changed
       */
      bC = oFG.find(':checked').is('*') ? true : false;
      $('#frm_details_contact-email').prop('checked', bC);
    }
    else {
      /*
       * If the 'by email' checkbox has been checked
       */
      bC = oR.is(':checked') ? true : false;
      oR.parent()
        .siblings('fieldset')
        .find('input[type=checkbox]')
        .attr('checked', bC);
    }
  });

};

/**
 * HAB-specific JQ plugins
 */
(function($)
{
    $.fn.ajaxifyHabForm = function()
    {
        return this.each(function()
        {
            // 0. locate stuff
            var oCurr = $(this),
                sSubmitUri = oCurr.data('ajax-url'),
                sSubmitMethod = oCurr.data('ajax-method'),
                oInv  = (this.nodeName.toUpperCase() === 'FORM') ? oCurr : oCurr.parents('form').eq(0);
            
            // 1. fallback for submit URI
            if ((sSubmitUri === undefined) || (sSubmitUri === ''))
            {
                sSubmitUri = oInv.attr('action');
            }
            if ((sSubmitMethod === undefined) || (sSubmitMethod === ''))
            {
                sSubmitMethod = oInv.attr('method');
            }
            
            // 2. hook submit
            oCurr.on('click', 'input[type=submit],button[type=submit]', function()
            {
                // a. acquire data
                var sData = oCurr.serialize();
                
                // branch on submission type
                // b. redirect and query string (always GET)
                if (sSubmitMethod.match(/^browser/i))
                {
                    var sUri = sSubmitUri + ((sSubmitUri.indexOf('?') === -1) ? '?' : '&');
                    sUri += sData;
                    document.location.href = sUri;
                    return false;
                }
                
                // c. if we should call the form (default behaviour)
                if (sSubmitMethod.match(/^form/i))
                {
                    oInv.submit();
                    return false;
                }
                
                // d. otherwise, it's an ajax thingie, so grab a callback
                function _fcb(sHtml)
                {
                    oCurr.html(sHtml);
                    oCurr.setKeyboardFocus();
                    oCurr.trigger('ajaxifyHabForm.complete');
                    oCurr.domUpdated();
                }
                
                // e. trigger
                var sMeth = sSubmitMethod.replace(/^(browser|form)\./i, '');
                if (sMeth.toLowerCase() === 'get')
                {
                    $.get(sSubmitUri, sData, _fcb);
                    return false;
                }
                else
                {
                    $.post(sSubmitUri, sData, _fcb);
                    return false;
                }
            });
        
            // 3. hook close
            oCurr.on('click touchstart', '.act-close', function()
            {
                oCurr.slideUp(400, function() {$(this).remove();});
                return false;
            });
            
            // 4. hook other stuff
            oCurr.find('input[type=text],input[type=number]').on('keypress', function(e)
            {
                if (e.charCode === 13)
                {
                    oCurr.find('input[type=submit],button[type=submit]').trigger('click');
                    return false;
                }
            });
        });
    };
    
    /**
     *  Submit a partial form.  For example, on the RFL block on the
     *  account-register page, we don't want to submit the whole, form
     *  just the card number text field.
     *  
     *  @see ajaxifyHabForm
     */
    $.fn.ajaxifyHabFormElement = function(callback) {
    
        return this.each(function()
        {
            // 0. locate stuff
            var oCurr = $(this),
                sSubmitUri = oCurr.data('ajax-url'),
                sSubmitMethod = oCurr.data('ajax-method');
            
            // 2. hook submit
            oCurr.on('click', 'input[type=submit],button[type=submit]', function(e)
            {  
                /*
                 * If the element has a postcode lookup, ensure we
                 * don't submit the form.
                 */
                if ( $(this).attr('name') === 'postcode-lookup-trigger' ) {
                  e.preventDefault();
                  return;
                }
                
                
                // a. acquire data
                var sData = oCurr.serialize();
                
                // branch on submission type
                // b. redirect and query string (always GET)
                if (sSubmitMethod.match(/^browser/i))
                {
                    var sUri = sSubmitUri + ((sSubmitUri.indexOf('?') === -1) ? '?' : '&');
                    sUri += sData;
                    document.location.href = sUri;
                    return false;
                }
                
                // d. otherwise, it's an ajax thingie, so grab a callback
                function _fcb(sHtml)
                {
                    oCurr.html(sHtml);
                    oCurr.setKeyboardFocus();
                    
                    if ( $.isFunction(callback) ) {
                      callback(oCurr);
                    }
                    
                    oCurr.trigger('ajaxifyHabForm.complete');
                    oCurr.domUpdated();
                }
                
                // e. trigger
                var sMeth = sSubmitMethod.replace(/^(browser|form)\./i, '');
                if (sMeth.toLowerCase() === 'get')
                {
                    $.get(sSubmitUri, sData, _fcb);
                    return false;
                }
                else
                {
                    $.post(sSubmitUri, sData, _fcb);
                    return false;
                }
            });
        
            // 3. hook close
            oCurr.on('click touchstart', '.act-close', function()
            {
                oCurr.slideUp(400, function() {$(this).remove();});
                return false;
            });
            
            // 4. hook other stuff
            oCurr.find('input[type=text],input[type=number]').on('keypress', function(e)
            {
                if (e.charCode === 13)
                {
                    oCurr.find('input[type=submit],button[type=submit]').trigger('click');
                    return false;
                }
            });
        });      
    };
        
    /**
     * Implements a very basic CSS-based carousel system on the selected element. Note that this works simply by applying
     * and removing classes, rather than performing any DOM-based animation.
     *
     * Please look at the .out-right and .out-left classes in the CSS files for more information
     *
     * @param   sItemSelector   the selector used to pick up individual items in the carousel (usually LI for a list)
     */
    $.fn.habCarousel = function(sItemSelector)
    {
        this.addClass('mobile-carousel').children(sItemSelector).enableSwipe().on('swipeleft', function()
        {
            // a. grab things
            var oCurr = $(this),
                oNext = oCurr.next(sItemSelector);

            // b. if there's nothing to slew to, ignore it
            if (oNext.length === 0)
            {
                return false;
            }

            // c. otherwise...
            oCurr.addClass('out-left');
            oNext.removeClass('out-right').trigger('slidechange');
        }).on('swiperight', function()
        { 
            // a. grab things
            var oCurr = $(this),
                oNext = oCurr.prev(sItemSelector);

            // b. if there's nothing to slew to, ignore it
            if (oNext.length === 0)
            {
                return false;
            }

            // c. otherwise...
            oCurr.addClass('out-right');
            oNext.removeClass('out-left').trigger('slidechange');
        }).not(':first-child').addClass('out-right');
        
        return this;
    };
        
    /**
     * DOM behaviour: on clicking on this element, DOM content is loaded in from a specified location and inserted into
     * the page.
     *
     * Options
     * --
     * Note: generally, options should be specified through DATA attributes on the element.
     *
     *  - url       the URL from which to request the data (GET) [ data-bh-url ]
     *  - insert    how to insert the HTML into the page (default: append) [ data-bh-insert ]
     *  - selector  the selector to determine where the HTML should be injected (required) [ data-bh-selector ]
     *
     * Insert behaviours
     * --
     *  - append    append to the selected element
     *  - prepend   prepend to the selected element
     *  - replace   replace the contents of the selected element
     *  - before    insert before the selected element
     *  - after     insert after the selected element
     *  - swap      replace the selected element with the returned HTML
     *
     * Selectors
     * -- 
     * Selectors are relative to the parent of the element and fit standard JQuery syntax. Additionally, one or many
     * '..' at the start of the selector allows access to ascendants, and starting the selector '/' will change context
     * to the root of the DOM.
     * Not specifying a selector (or specifying an empty selector) will default to the parent of the element to which
     * the behaviour is attached.
     *
     * Examples:
     *  'aside'     select any ASIDE tags that are siblings of the element with the behaviour
     *  '.. aside'  select any ASIDE elements in the grandpanret of the behaviour element
     *  '/ aside'   all ASIDE elements in the document (not recommended!)
     *
     * @param   opt an optional configuration object (not recommended - use DOM DATA attributes instead)
     */
    $.fn.habAjaxLoader = function()
    {
        var __globOpt = (arguments.length === 1) ? arguments[0] : {};
        return this.addClass('bh-bound').on('click.bh-ajaxLoader', function(e)
        {
            var oSelf   = $(this),          // the element with the behaviour
                oTarget = oSelf.parent(),   // the parent of the behaviour element
                _opt    = {                 // configuration options
                    url: '',
                    insert: 'append',
                    selector: '',
                    multi: false
                },
                sData = null;

            // 0. load in configuration from the DOM
            if ((sData = oSelf.data('bh-url')) !== undefined)
            {
                _opt.url = sData;
            }
            if ((sData = oSelf.data('bh-insert')) !== undefined)
            {
                _opt.insert = sData;
            }
            if ((sData = oSelf.data('bh-selector')) !== undefined)
            {
                _opt.selector = sData;
            }
            if ((sData = oSelf.data('bh-multi')) !== undefined)
            {
                _opt.multi = sData;
            }    

            // 1. pull in any call options
            $.extend(_opt, __globOpt);
            _opt.selector = $.trim(_opt.selector);
            
        
            /*
             * We are running domUpdated on ajax return, this re-applies the
             * event regardless of the multi attribute.  If this has already been
             * run, and multi == false, return.
             */
            if ( oSelf.hasClass('bh-triggered') && _opt.multi === false ) {
              e.preventDefault();
              return;
            }
                
            oSelf.addClass('bh-triggered');
            
            // 2. if there's no URL, fall out
            if (_opt.url === '')
            {
                return true;
            }
            
            // 3. sort out selector
            try
            {
                if (_opt.selector !== '')
                {
                    // a. if it starts with a root selector
                    if (_opt.selector.substring(0,1) === '/')
                    {
                        oTarget = $.root;
                        _opt.selector = $.trim(_opt.selector.substring(1));
                    }

                    // b. remove any '..' selectors
                    while (_opt.selector.substring(0,2) === '..')
                    {
                        oTarget = oTarget.parent();
                        _opt.selector = $.trim(_opt.selector.substring(2));
                    }

                    // c. any remaining selectors
                    if (_opt.selector !== '')
                    {
                        oTarget = oTarget.find(_opt.selector);
                    }
                }
            }
            catch (exception) {} // squish - handle this below
            
            // 4. if the target is null or somehow broken
            if ((oTarget === null) || (oTarget === undefined))
            {
                return true;
            }
            
            // 5. awesome, we have everything we need: fire off the request
            $.get(_opt.url, null, function(sHtml)
            {
                var oNew = $(sHtml);
                
                // a. trigger complete event /before/ we crunch the DOM (as the element may not be there after)
                oSelf.trigger('bh-complete.bh-ajaxLoader');
                
                // b. crunch the DOM
                
                switch (_opt.insert.toLowerCase())
                {
                    case 'swap':
                        oTarget.replaceWith(oNew);
                        break;
                    case 'before':
                        oTarget.before(oNew);
                        break;
                    case 'after':
                        oTarget.after(oNew);
                        break;
                    case 'replace':
                        oTarget.html(oNew);
                        break;
                    case 'prepend':
                        oTarget.prepend(oNew);
                        break;
                    default:
                        oTarget.append(oNew);
                        break;
                }
                
                oSelf.domUpdated();
  
            });
            
            // 6.  If multi is not set in the options, remove
            //     the event so that multiple ajax requests aren't
            //     made.   Multiple clicks woinlineValidationn't work for swap / replace
            //     regardless.
            
            
            if ( _opt.multi === false ) {
              oSelf.unbind('click');
              oSelf.bind('click', function(e) {
                e.preventDefault();
              });
            }
            
            // 7. trigger event and block other handlers
            oSelf.trigger('bh-triggered.bh-ajaxLoader');
            
            return false;
        });
    };

    /**
     * Hook for forms that auto-submits them when the user changes an element. This (currently) does NOT perform an
     * AJAX submit, it simply calls $form.submit()
     *
     * Params
     * --
     *  @param  iDelay  a delay (in ms) between the user changing an input and the form being submitted (Default:1000ms)
     */
    $.fn.habAutoSubmit = function()
    {
        var iTimeout = (arguments.length === 1) ? arguments[0] : 0;
        return this.each(function()
        {
            var oForm = $(this),
                oTo = null;
            
            // hook change handler
            oForm.on('change', ':input', function()
            {
              /*
               * jQuery won't submit a form if there is more there is a form
               * with more than submit buttons with the same 'name' attribute.
               * 
               * We need two buttons when we are doing, for example 'remove card',
               * and 'set default card'.  
               * 
               * If there is more than one button, trigger a click on the submit
               * button with class .default on it, instead of a  form submit.
               */
              if ( oForm.find("input[type='submit']").length > 1 ) {
                oForm.find("input[type='submit'].default").trigger('click');
              } 
              else {
                oForm.trigger('submit');  
              }
            });
        });
    };
    
    /**
     * DOM Updated event wrapped in a plugin.
     * 
     * The triggered element is always the document, but the original element
     * is passed back as an argument to any binding function.
     */
    $.fn.domUpdated = function() {
      $(document.body).trigger('domUpdated', [this]);     
      return this.each(function() {});      
    };

    /**
     * Sets up autocomplete on site search.
     */
    HAB.setupAutocompleteSearch = function()
    {
       var ignoreNextBlur = true;
      var contextPath = document.getElementById('contextPath').value;
        /**
         * Internal function called when the search field is updated
         *
         * @param   oData   the JSON object returned by the search service.
         */
        function _processSearchResults(oData)
        {
            // 0. empty everything
            oResultList.empty();
  
            // 1. if there are no results...
            if (oData.length === 0)
            {
                oResultList.append('<li class="no-results">...</li>');
            }
           else
            {
            var recordSearchResult = null;       
                var autoSuggestCartridges = oData.contents[0].autoSuggest;
                //if no data returned, returns null
                if(autoSuggestCartridges == null || autoSuggestCartridges.length == 0)
              {
                  return null;
              }
              var tabIndex = 900;
              for(var j = 0; j < autoSuggestCartridges.length; j++)
              {
                  var cartridge = autoSuggestCartridges[j];
                    if(cartridge['@type'] == "RecordSearchAutoSuggestItem")
                    {
                      var servletPath = contextPath;
                      recordSearchResult = cartridge;
                      if (recordSearchResult != null && recordSearchResult.records != null && recordSearchResult.records.length > 0) {
                        oResultList.append('<div class="auto-suggest-group">Products</div>');
                        var maxRecs = typeof recordSearchResult['defaultRecsPerPage'] != 'undefined' ? recordSearchResult['defaultRecsPerPage'] : 10;
                        $.each(recordSearchResult.records, function(index, record) {
                          if ( index < maxRecs ) {
                              var prodId = getAttribute(record,'product.repositoryId',"");
                              var recUrl = servletPath + record.detailsAction.contentPath  + record.detailsAction.recordState.slice(0,-1) + '-' + prodId;
                              var prod_nam = getAttribute(record,'Name',"");
                              var iconSrc = getAttribute(record,'iconURL',"");
                              tabIndex++;
                              oResultList.append('<li tabindex="' + tabIndex + '" class="auto-suggest-wrapper"><a href="'+ recUrl + '"><img src="'
                                  + iconSrc + '" class="auto-suggest"/><span>'
                                  + prod_nam + '</span></a></li>');
                           }
                        });
                      }
                  }
                  if(cartridge['@type'] == "DimensionSearchAutoSuggestItem")
                  {
                      var servletPath = contextPath;
                      var dimSearchResult = cartridge;
                      
                      if (dimSearchResult != null && dimSearchResult.dimensionSearchGroups != null && dimSearchResult.dimensionSearchGroups.length > 0) {
                        $.each(dimSearchResult.dimensionSearchGroups, function(i, dimensionGroup) {
                              oResultList.append('<div class="auto-suggest-group">' + dimensionGroup.displayName +'</div>');
                            if (dimensionGroup.dimensionSearchValues != null && dimensionGroup.dimensionSearchValues.length > 0) {
                              $.each(dimensionGroup.dimensionSearchValues, function(j, dimension) {
                                tabIndex++;
                                var url = contextPath;
                                url += dimensionGroup.dimensionSearchValues[j].contentPath;
                                url += dimensionGroup.dimensionSearchValues[j].navigationState;
                                oResultList.append('<li class="auto-suggest-item" tabindex="' + tabIndex + '"><a href="'+ url + '">' 
                                    + dimensionGroup.dimensionSearchValues[j].label + '</a></li>');
                              });
                            }
                        });
                      }
                  }
              }
          }
          oResultDom.addClass('ui_visible');
        }
  
        /**
         * Hides the autocomplete list.
         */
        function _resetDom()
        {
            oResultDom.removeClass('ui_visible');
            oResultList.empty();
        }
  
        // 0. look for DOM
        var oSearchWidget = $('#site-search');
        if (oSearchWidget.length === 0) {
            return false;
        }
  
        // 1. hook everything
        var oInp        = oSearchWidget.find('input[type=search]').attr('autocomplete', 'off'),
            sParamName  = oInp.attr('name'),            // cache this
            oForm       = oInp.parents('form').eq(0),   // be safe
            oResultDom  = $('<div class="site-search-results"></div>').appendTo(oSearchWidget),
            oResultList = $('<ul></ul>').appendTo(oResultDom),
            oTrigSearch = $('<strong></strong>').appendTo(oResultDom).wrap('<a href="#" class="submit">Search for </a>'),
            sVal        = '',
            oTo         = null;
  
        // 2. event binding on the search box
        var typeAheadXhr = null;
        oInp.off('input.search').on('input.search', function(e)
        {
            /*
                Trigger request on keypress
            */
            // a. grab value
            sVal = oInp.val();
            oTrigSearch.text(sVal);
            
  
            // b. if it's too short, drop out
            if (sVal.length === 0){
              _resetDom();
              return true;        // return true, otherwise well confuse the user
            }
            else if($.trim(sVal).charAt(0)=="&")
            {
              _resetDom();
              oResultDom.addClass('ui_visible');
              return true; 
            }
  
            // d. otherwise, ping a request off
            var oSend = {};
            oSend[sParamName] = sVal;
            var path=oSearchWidget.data('json-submit-uri');
            var regx=/[^a-z A-Z 0-9 &-]/;
            if($.trim(sVal)=="" || regx.test(sVal)==true){
              sValue = $.trim(sVal);            
              if(sValue.length-1 > 0){
                var ch=/[^a-z A-Z 0-9 &-]/.exec(sVal);                
                var str=sValue.replace(ch,'');
                var term=encodeURIComponent(str);
                  typeAheadXhr = $.ajax(
                       {
                        url:path+'?Ntk=AutoSuggest&query='+term,
                          dataType:'json',
                          async:true,
                          success:function(data){
                            _processSearchResults(data);
                          },
                          beforeSend : function()    {
                            if(typeAheadXhr != null) {
                              typeAheadXhr.abort();
                            }
                          }
                        }
                  )
              }
              else{
                _resetDom();  
              }
          }
            else{
            var term = encodeURIComponent(sVal);
                typeAheadXhr = $.ajax(
                      {
                        url:path+'?Ntk=AutoSuggest&query=' + term,
                          dataType:'json',
                          async:true,
                          success:function(data){
                            _processSearchResults(data);
                          },
                          beforeSend : function()    {
                              if(typeAheadXhr != null) {
                                  typeAheadXhr.abort();
                              }
                          }
                      }
              );
            }
            return true;
        }).on('blur.search', function()
        {
            /*
                Hide the autocomplete list when the user removes focus from the input
                (on a timeout in case they shift focus to the autocomplete list)
            */

            /*
             * The first keydown triggers this blur *after* after the keydown event.
             */

            if ( !ignoreNextBlur ) {
              oTo = setTimeout(_resetDom, 1000);
            }
            return true;
        }).on('focus.search', function(e)
        {
            /*
                Clear any hide timeout if the user shifts focus back to the list
            */
            clearTimeout(oTo);
        }).on('keydown.search', function(e)
        {
            /*
                Listen for keydowns: if they hit the down cursor, shift them to the first autocomplete suggestion
            */
            // if they're not pressing the down key, ditch out tab
            if (e.keyCode !== 40) {
                return true;
            }

            if ( e.srcElement && e.srcElement.tagName !== 'INPUT' ) {
              ignoreNextBlur = false;
            }


            // otherwise, shift focus
            var oA = oResultDom.find('a').eq(0).focus(); //trigger('focus');
            if (oA.length > 0)
            {
                // if the above achieved anything, we need to clear the hide timeout - focus() on the link gets called
                // *before* blur() on the input...
                clearTimeout(oTo);
            }
            return false;
        });
  
        // 3. listen for events in the autocomplete list
        oResultDom.on('click.search', 'li a', function()
        {
            /*
                Clicking on an autocomplete: fills the form with the current value
            */
            oInp.val($(this).text());
           // return false;
        }).on('click.search', 'a.submit', function()
        {
            /*
                Clicking on the 'search for x' link: resets the search term to what they entered (because it may have been
                overwritten by the click handler above) and submis the form
            */
            oInp.val(oTrigSearch.text());
            oForm.trigger('submit');
            return false;
        }).on('focus.search', 'a', function()
        {
            /*
                Focusing on one of the links in the autocomplete list: set the search form value to the term
            */
            var oT = $(this);
  
            // 0. clear the hide timeout
            clearTimeout(oTo);
  
            // 1. copy current value back to form
            oInp.val( (oT.hasClass('submit') ? oTrigSearch.text() : oT.text()) );
        }).on('blur.search', 'a', function()
        {
            /*
                Shifting away from one of the links: trigger a timed close
            */
            oTo = setTimeout(_resetDom, 100);
        }).on('keydown.search', 'a', function(e)
        {
            /*
                Pressing up or down cursor on autocomplete links: move between them
                Pressing enter: submit the form
            */
            // 0. if it's not an up or down...
            if ((e.keyCode !== 40) && (e.keyCode !== 38) && (e.keyCode !== 13)) {
                return true;
            }

            var oCurrLink = $(this);

            // 1. if it's enter, submit the form and drop out
            if (e.keyCode === 13)
            {
              if (oCurrLink.hasClass('submit'))
              {
                oForm.trigger('submit');
                return false;
              }
              else
              {
                window.location = oCurrLink.attr('href');
                return false;
              }
            }

            // 2. if we're on the submit link...
            if (oCurrLink.hasClass('submit'))
            {
                // a. if they've hit the up key, send them to the last item in the select list
                if (e.keyCode === 38)
                {
                    oResultList.find('a:last').focus();
                    clearTimeout(oTo);
                }
  
                // b. trap either way
                return false;
            }
  
            // 3. otherwise, we're somewhere in the result list
            var oNextEl = null;
            if (e.keyCode === 40)
            {
                /* down */
                // a. try and get next link
                oNextEl = oCurrLink.parent().next().find('a');
  
                // b. if it's not worked, move them to the submit link
                if (oNextEl.length === 0)
                {
                  oNextSection = oCurrLink.parent().nextAll('li').first()
                  if(oNextSection.length === 0 ){
                    oNextEl = oTrigSearch.parent();
                  }else{
                    oNextEl = oNextSection.find('a').eq(0);
                  }
                }
            }
            else
            {
                /* up */
                // a. try and get prev link
                oNextEl = oCurrLink.parent().prev().find('a');
  
                // b. if it's not worked, move them to the input
                if (oNextEl.length === 0)
                {
                  oNextSection = oCurrLink.parent().prevAll('li').first();
                  if(oNextSection.length === 0 ){
                    oNextEl = oInp;
                  }else{
                    oNextEl = oNextSection.find('a').last();
                  }
                }
            }
  
            // 4. call focus
            oNextEl.trigger('focus');
            clearTimeout(oTo);
  
            return false;
        });

      // Close the search when we click outside
      $('[role=banner], #content, [role=contentinfo]').click(function(e) {
        var $target = $(e.target);

        if($target.parents('.site-search-form').length === 0) {
          _resetDom();
        }
      });

    };

    /**
     * Sets up site search form
     */
    HAB.hookSiteSearch = function()
    {
      
      //HAB.sanitiseSiteSearch(); // DEPRECATED: Replaced by HAB.limitChars
      HAB.setupAutocompleteSearch();

    };
    
    var getAttribute = function(record, attrName, defaultVal) {
      if (record != null && attrName != null && record.attributes != null 
          && record.attributes[attrName] != null) {
        return record.attributes[attrName][0];
      }
      return (typeof(defaultVal) === "undefined" ? null : defaultVal);
    };  
    $('#checkout_form_country').live('blur',function(event){
      var savedVal = $.trim($('#checkout_form_country option:selected').text());
      if(savedVal == 'Select Country'){
            $('#selectBoxError1').hide();
            $('#selectBoxError').hide();
    }
      //var errLength = $('#selectCountry').find('.error').length;
      //alert(errLength);
    });
    $('#checkout_form_country').change(function(){
      var savedVal = $.trim($('#checkout_form_country option:selected').text());
      if(savedVal == 'Select Country'){
            $('#selectBoxError1').hide();
            $('#selectBoxError').hide();
    }
    });

    //title validation start
    $('#checkout_form_title').live('change blur',function(){
      var optVal = $(this).parents('li').find('.selectBox-label').text();
      var savedVal = $.trim($('#checkout_form_title option:selected').val());     
        if(savedVal == 'Please select' || savedVal == "" || savedVal == null || optVal == 'Please select'){
          
              $(this).parents('li').addClass('error');
              $(this).parents('li').find('.title_error').css('display','block');
        }
        else {
          $(this).parents('li').removeClass('error');
          $(this).parents('li').find('.title_error').css('display','none');
        }
    });
    //end
    $('.nbty_anonym').live('change',function(){
      var savedVal = $.trim($('.nbty_anonym option:selected').val());
      // console.log(savedVal);
      if(savedVal != null || savedVal !=""){
      $(this).parents('li').find('.error').remove();
      }
      });
    
})(jQuery);



HAB.loadFavorites = function (){
  if ($('.prod-list-item').length>0){
      $.ajax({
          url : "/common/favProds.jsp",
          type : "GET",
          dataType: "html",
          success : function(data) {
              var listtOfIds = data.split("|");
              for ( var i = 0; i < listtOfIds.length; i++) {
                  var tempId = $.trim(listtOfIds[i]);
                  if (!!tempId) {
                      $("<span class='ico ico-fav'>Favourite</span>").appendTo($(".prod-list-item."+tempId));
                  }
              }
          }
      });
  }
};

/** Run scroll to error block if it is exist and apply this mechanism on the success ajax calls. */
HAB.initScrollToError = function() {
  $(document).ajaxSuccess(function(event, request, settings) {
    HAB.scrollToError(true);
  });
  HAB.scrollToError();
};

/** 
 * Scrolls to the error block if it exists
 */
HAB.scrollToError = function(isSmoothly) {
  var $errorBlock = $('.form-errors:visible').not('.handled-error');
  if ($errorBlock.length > 0) {
    if (isSmoothly) {
      SFR.Utils.scrollTo($errorBlock);
    } else {
      // fix scrolling not working on the login and your details page (NBTYCOMM-1221)
      $errorBlock.prop('id', 'errMsg');
      window.location.hash = 'errMsg';
    }
    
    // add some class for marking error as handled to prevent duplicated scrolling to the same error.
    // this double scrolling may occur when we have an old error message and load some content using ajax.
    $errorBlock.addClass('handled-error');
  }
};

HAB.showMoreLessDescription = function(){
  if($('.descript .visible-part').height() > 45){
    $('.descript .visible-part').height(45);
    var moreBtn = $('#show-more'),
        lessBtn = $('#show-less');
    moreBtn.parent().show();
    lessBtn.show();
    moreBtn.on('click', function(e){
      e.preventDefault();
      $(this).parent().hide();
      $('.descript .visible-part').height('auto');
      $('.descript').height('auto');
    });

    lessBtn.on('click', function(e){
    e.preventDefault();
    $(this).prev().show().parent('.visible-part').height(45);
    $('.descript').height(45);
    })
  }
}

function loadHeaderMenuItem(obj, id, N) {
  $.ajax({
    dataType: "html",
        url: "/common/flyoutmenuwrap.jsp?page=/flyout"+N,
    success: function( data ) {
      document.getElementById(id).innerHTML = data;
      $(obj).addClass('loaded');
    }
  });
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Polyfill
//Fix for IE8.
if (typeof Object.create != 'function') {
(function () {
    var F = function () {};
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw Error('Second argument not supported');
        }
        if (typeof o != 'object') { 
            throw TypeError('Argument must be an object');
        }
        F.prototype = o;
        return new F();
    };
})();
}

HAB.healpers = {
  /* Input:
   * @string (type string) - string for cutting
   * @countSymbols (type number) - cut string after this value
   * @addPiece (type string) - added to the end of string if string longer that countSymbols
   * Output:
   * @respons (type string) - result string
   */
  cutContent: function(string, countSymbols, addPiece) {
    var stringAddPiece = (addPiece && (typeof addPiece) === 'string') ? addPiece : '...',
      stringLength = 0,
      respons = '';

    if (!string) {
      return '';
    }

    if ((typeof string) !== 'string' || !countSymbols) {
      return string;
    }

    stringLength = string.length;

    if (string.length > countSymbols) {
      respons = string.substr(0, countSymbols) + stringAddPiece;
      return respons;
    } else {
      return string;
    }
  }
}

HAB.mainCarouselClass = {
  init: function(holder) {
    this.config = {
      initCarousel: true,
      selector: 'ul',
      selectorElements: 'li',
      quantity: 1,
      showPagination: true,
      showArrow: false,
      slideEvent: true,
      $container: $(holder)
    };

    var settings = this.config.$container.data("init-main-carousel-params");

    ($('body').is('.breakpoint-220') && !$('html').hasClass('lt-ie9')) ? $.extend(true, this.config, settings.breakpoint220 || {}) : $.extend(true, this.config, settings.breakpoint768 || {});

    this.initialize();
  },

  initialize: function() {
    this.removeCarousel(this.config.$container);

    this.config.length = $(this.config.selectorElements, this.config.$container).length;
    this.config.setCount = Math.ceil(this.config.length / this.config.quantity);


    if (this.config.setCount > 1 && this.config.initCarousel) {
      this.config.$container.addClass("main-carousel").find(this.config.selector).wrapAll('<div class="main-carousel-holder"><div class="main-carousel-slide-holder">');

      this.setSize();

      if (this.config.showArrow) {
        this.arrow();
      }

      if (this.config.showPagination) {
        for (var set = this.config.setCount; set > 0; set--) {
          for (var i = this.config.quantity; i > 0; i--) {
            $(this.config.selectorElements, this.config.$container).eq(set * this.config.quantity - i).attr("data-set-number", set);
          }
        }

        this.pagination();
      }

      this.bindEvents();
    }
  },

  pagination: function() {
    var iteration = 1,
      paginationElements = '';

    for (iteration; iteration <= this.config.setCount; iteration++) {
      paginationElements += '<a href="#"><span>' + iteration + '</span></a>';
    }

    $('<div class="carousel-paging">' + paginationElements + '</div>').appendTo(this.config.$container);

    this.setCurrentSet(1);
  },

  arrow: function() {
    $('<a class="prev-btn" rel="prev" href="#"></a><a class="next-btn" rel="next" href="#"></a>').appendTo(this.config.$container.find('.main-carousel-holder'));
  },

  setSize: function() {
    var elementWidth = $('.main-carousel-holder', this.config.$container).outerWidth() / this.config.quantity,
      slideHolderWidth = elementWidth * this.config.length;

    this.config.elementWidth = elementWidth;

    $('.main-carousel-slide-holder', this.config.$container).css({"width": slideHolderWidth + "px"});
    $(this.config.selectorElements, this.config.$container).each(function() {
      if (elementWidth !== 0) {
        $(this).css({"width": elementWidth + "px"});
      } else {
        $(this).css({"width": ""});
      }
    });
  },

  setCurrentSet: function(setNumber) {
    var that = this,
      prevSet = this.config.currentSet;

    this.config.currentSet = (typeof Number(setNumber) === 'number') ? Number(setNumber) : 1;

    if (prevSet) {
      this.config.$container.find(".main-carousel-slide-holder").animate({
        left: "-=" + (this.config.currentSet - prevSet) * this.config.quantity * this.config.elementWidth
      },
      300, function() {
        that.config.$container.find('.carousel-paging a').removeClass('selected').eq(that.config.currentSet-1).addClass('selected');
      });
    } else {
      this.config.$container.find('.carousel-paging a').removeClass('selected').eq(that.config.currentSet-1).addClass('selected');
    }
  },

  slide: function(direction) {
    var setNumber = $('.carousel-paging .selected', this.config.$container).text();

    setNumber = Number(setNumber) + direction;

    if (setNumber > this.config.setCount) {
      setNumber = 1;
    }

    if (setNumber === 0) {
      setNumber = this.config.setCount;
    }

    this.setCurrentSet(setNumber);
  },

  bindEvents: function() {
    var that = this;

    $(window)
      .bind('resizeCarusel', function () {
        that.setSize();
      });

    if (this.config.showPagination) {
      this.config.$container
        .on('click', '.carousel-paging a', function (ev) {
          ev.preventDefault();
  
          var setNumber = $(this).text();
  
          that.setCurrentSet(setNumber);
        });
    }

    if (this.config.showArrow) {
      this.config.$container
        .on('click', '.prev-btn', function (ev) {
          ev.preventDefault();
  
          that.slide(-1);
        })
        .on('click', '.next-btn', function (ev) {
          ev.preventDefault();
  
          that.slide(1);
        });
    }

    if (this.config.slideEvent) {
      $(this.config.selectorElements, this.config.$container).enableSwipe()
        .on('swipeleft' , function() {
          that.slide(1);
        })
        .on('swiperight' , function() {
          that.slide(-1);
        });
    }
  },

  removeCarousel: function() {
    $(window).unbind('resizeCarusel', this.setSize()); 

    $(this.config.selectorElements, this.config.$container).each(function() {
      $(this).css({"width": ""});
    });

    this.config.$container.off('click');

    $(this.config.selectorElements, this.config.$container)
      .off('swipeleft')
      .off('swiperight');

    this.config.$container.find(this.config.selector).each(function(){
      if ($(this).parent().hasClass('main-carousel-slide-holder')) {
        $(this).unwrap().unwrap();
      }
    });

    this.config.$container.removeClass('main-carousel');

    this.config.$container.find('.carousel-paging').remove();
    this.config.$container.find('.prev-btn').remove();
    this.config.$container.find('.next-btn').remove();
  }
};

HAB.mainCarouselModule = Object.create(HAB.mainCarouselClass);

HAB.mainCarouselCopyContentModule = Object.create(HAB.mainCarouselClass);

HAB.mainCarouselCopyContentModule.init = function(holder) {
  this.config= {
    initCarousel: true,
    selector: 'ul',
    selectorElements: 'li',
    quantity: 1,
    showPagination: true,
    showArrow: false,
    slideEvent: true,
    $container: $(holder).html('')
  };

  var settings = this.config.$container.data("init-main-carousel-params"),
    $tempHolder;

  ($('body').is('.breakpoint-220') && !$('html').hasClass('lt-ie9')) ? $.extend(true, this.config, settings.breakpoint220 || {}) : $.extend(true, this.config, settings.breakpoint768 || {});

  if (!this.config.initCarousel) {
    return;
  }

  $tempHolder = $(this.config.copySelector).clone();
  $tempHolder.addClass("main-carousel-copy-content-ul").find('li').removeAttr('style').find('a').removeAttr('style').find('img').removeAttr('style').css({"width":"100%"});
  this.config.$container.append($tempHolder);
  this.initialize();
}

HAB.showElementClass = {
  init: function(holder) {
    this.config = {
      initShowElement: true,
      $container: $(holder),
      openSelector: 'li'
    };

    this.removeShowElementClass();

    var settings = this.config.$container.data("init-params");

    ($('body').is('.breakpoint-768')) ? $.extend(true, this.config, settings.breakpoint768 || {}) : $.extend(true, this.config, settings.breakpoint220 || {});

    if (this.config.initShowElement) {
      this.bindEvents();
    }
  },

  bindEvents: function() {
    var that = this;
    this.config.$container
      .on('click', function (ev) {
        ev.preventDefault();

        $(that.config.openSelector).slideToggle(500);
      });
  },

  removeShowElementClass: function() {
    this.config.$container.off('click');
  }
}

HAB.showElementModule = Object.create(HAB.showElementClass);

HAB.mainAccordionClass = {
  init: function(holder) {
    this.config = {
      initAccordion: true,
      parentSelector: '.list-head',//nav
      childHolderSelector: ['.l-wrap.clearfix', '.link-list'],//ul
      childSelector: '[role=menuitem] a',//li
      $container: $(holder)
    };

    this.removeMainAccordion();

    var settings = this.config.$container.data("init-params");

    ($('body').is('.breakpoint-220') && !$('html').hasClass('lt-ie9')) ? $.extend(true, this.config, settings.breakpoint220 || {}) : $.extend(true, this.config, settings.breakpoint768 || {});

    if (this.config.initAccordion) {
      this.config.$container.addClass("main-accordion");
      this.addStyle();
      this.bindEvents();
    }
  },

  addStyle: function() {
    var that = this;

    $(this.config.parentSelector, this.config.$container).each(function() {
      if ($(this).next(that.config.childHolderSelector).html()) {
        $(this).addClass('main-accordion-plus');
        $(this).next(that.config.childHolderSelector).css({"display": "none"}).find(that.config.childSelector).addClass('main-accordion-link');
      } else {
        $(this).addClass('main-accordion-link');
      }
    });
  },

  bindEvents: function() {
    var that = this;

    this.config.$container
      .on('click', that.config.parentSelector + '.main-accordion-plus', function (ev) {
        ev.preventDefault();

        that.openClose(this);
      })
      .on('click', that.config.parentSelector + '.main-accordion-minus', function (ev) {
        ev.preventDefault();

        that.openClose(this);
      });
  },

  openClose: function(holder) {
    $(holder).hasClass('main-accordion-plus') ? $(holder).removeClass('main-accordion-plus').addClass('main-accordion-minus') : $(holder).removeClass('main-accordion-minus').addClass('main-accordion-plus');
    $(holder).next(this.config.childHolderSelector).slideToggle(500);
  },

  removeMainAccordion: function() {
    var that = this;

    this.config.$container.removeClass('main-accordion');
    $(this.config.parentSelector, this.config.$container).each(function() {
      if ($(this).next(that.config.childHolderSelector).html()) {
        $(this).next(that.config.childHolderSelector).removeAttr('style');
      }
    });

    this.config.$container.off('click');
  }
}

HAB.mainAccordionModule = Object.create(HAB.mainAccordionClass);

HAB.mainProductsBundleClass = {
  init: function(holder) {
    this.config = {
      init: true,
      elementSelector: '.l-col',
      formSelector: '.prod-teaser-form',
      elementPriceSelector: '.prod-price .current-prod-price',
      checkboxSelector: '.checkbox-selector',
      totalPriceSelector: '.total-price .total-price-sum',
      submitSelector: '.orangeSubmit.bigSubmit',
      productsBundleBuyMessageSelector: '.products-bundle-buy-message',
      titleSelector: '.prod-title',
      titleCutAfter: 42,
      $container: $(holder)
    };

    this.removeProductsBundle();

    var settings = this.config.$container.data("init-params");

    ($('body').is('.breakpoint-220') && !$('html').hasClass('lt-ie9')) ? $.extend(true, this.config, settings.breakpoint220 || {}) : $.extend(true, this.config, settings.breakpoint768 || {});

    if (this.config.init) {
      this.bindEvents();
      this.activateElements();
      this.calculateTotalPrice();
    }
  },

  activateElements: function() {
    $(this.config.checkboxSelector + ' input:eq(0)', this.config.$container).prop('disabled',true);
    $(this.config.submitSelector, this.config.$container).prop('disabled',false);

    this.cutContent();
  },

  cutContent: function() {
    var that = this,
      currentString = '';

    $(this.config.titleSelector, this.config.$container).each(function() {
      currentString = $(this).html();
      $(this).html(HAB.healpers.cutContent(currentString, that.config.titleCutAfter));
    });
  },

  bindEvents: function() {
    var that = this;

    this.config.$container
      .on('click', that.config.checkboxSelector, function (ev) {
        var checkBoxes = $('input',this);

        if(!checkBoxes.prop('disabled')) {
          that.calculateTotalPrice();
        }
      })
      .on('click', that.config.submitSelector, function (ev) {
        ev.preventDefault();

        var data = {},
          forma = $(that.config.formSelector + ':eq(0)', that.config.$container),
          addToBasketURL = forma.data('ajax-url'),
          refreshBasketURL = forma.data('refresh-url');

        data['isRecommendedBundle'] = true;
        data['prod-qty-field'] = 0;
        data['recommendedBundles'] = [];

        $(that.config.checkboxSelector + ' input', that.config.$container).each(function() {
          if ($(this).is(':checked')) {
            var currentForm = $(this).closest(that.config.formSelector),
              currentFormArray = currentForm.serializeArray(),
              currentElement = {};

            $(currentFormArray).each(function() {
              currentElement[this.name] = this.value;
            })

            data['recommendedBundles'].push(currentElement);
            data['prod-qty-field'] += 1;
          }
        });

        data['recommendedBundles'] = JSON.stringify(data['recommendedBundles']);

        $(that.config.productsBundleBuyMessageSelector, that.config.$container).html('').addClass('loading');

        $.post(addToBasketURL, data, function(respons) {
          $(that.config.productsBundleBuyMessageSelector, that.config.$container).html(respons).removeClass('loading');
          $.root.find('.basket-nav-item>a').load(refreshBasketURL);
        });
      });
  },

  calculateTotalPrice: function() {
    var that = this,
      totalPrice = 0,
      currentElementPrice = 0;

    $(this.config.checkboxSelector + ' input', this.config.$container).each(function() {
      if ($(this).is(':checked')) {
        currentElementPrice = parseFloat($(this).closest(that.config.elementSelector).find(that.config.elementPriceSelector).text().substr(1));
        if (currentElementPrice) {
          totalPrice += parseFloat(currentElementPrice);
        } else {
          $(this).prop('checked', false).prop('disabled',true);
        }
      }
    });

    $(this.config.totalPriceSelector, this.config.$container).text(totalPrice.toFixed(2));
  },

  removeProductsBundle: function() {
    this.config.$container.off('click');
  }
}

HAB.mainProductsBundleModule = Object.create(HAB.mainProductsBundleClass);

HAB.mainFacetsClass = {
  init: function(holder) {
    this.config = {
      init: true,
      inputSelector: '.facets-input',
      elementHolderSelector: '.facets-elements',
      elementSelector: '.facets-item',
      elementLinkSelector: 'a',
      noSearchResults: '.no-search-results',
      placeholderSelector: '.placeholder-item', //Fix for core placeholder for IE8
      placeholderText: '',
      $container: $(holder)
    };

    var $placeholderText = $(this.config.placeholderSelector, this.config.$container),
      placeholderText = $placeholderText.html().toLowerCase();

    this.config.placeholderText = placeholderText;

    this.removeModule();

    var settings = this.config.$container.data("init-params");

    ($('body').is('.breakpoint-220') && !$('html').hasClass('lt-ie9')) ? $.extend(true, this.config, settings.breakpoint220 || {}) : $.extend(true, this.config, settings.breakpoint768 || {});

    if (this.config.init) {
      this.bindEvents();
    }
  },

  bindEvents: function() {
    var that = this,
      content = '';

    // Fix for IE8
    $(this.config.inputSelector, this.config.$container)
      .on('propertychange', function(){
        content = $(this).val();
        that.selectElement(content);
      });

    // Fix for IE9
    if($('html').hasClass('ie9')) {
      this.config.$container
      .on('keyup', that.config.inputSelector, function() {
        content = $(this).val();
        that.selectElement(content);
      });
    }

    // For all browsers except IE8
    this.config.$container
      .on('input', that.config.inputSelector, function() {
        content = $(this).val();
        that.selectElement(content);
      });
  },

  selectElement: function(content) {
    var that = this,
      currentElemntText = '',
      searchContent = content.toLowerCase(),
      countShowedFacets = 0;

    this.showAll();

    if (searchContent != '' && searchContent != this.config.placeholderText) {
      $(this.config.elementSelector + ' ' + this.config.elementLinkSelector, this.config.$container).each(function() {
        currentElemntText = $.trim($(this).html().toLowerCase());

        //ignore links that were generated for robots. Such links are always without text.
        if(currentElemntText.length > 0) {
	        if(currentElemntText.indexOf(searchContent) != 0) {
	          $(this).closest(that.config.elementSelector).addClass('facets-item-hidden');
	        } else {
	          countShowedFacets+=1;
	        }
      	}
      });

      if (countShowedFacets == 0) {
        $(this.config.noSearchResults, this.config.$container).removeClass('facets-item-hidden');
      }
    }
  }, 

  showAll: function() {
    $(this.config.elementSelector, this.config.$container).removeClass('facets-item-hidden');
    $(this.config.noSearchResults, this.config.$container).addClass('facets-item-hidden');
  },

  removeModule: function() {
    this.config.$container.off('input');
    this.config.$container.off('keyup');
    this.config.$container.off('propertychange');

    if(this.config.placeholderText != $(this.config.inputSelector, this.config.$container).val().toLowerCase()) {
      $(this.config.inputSelector, this.config.$container).val('');
    }

    this.showAll();
  }
}

HAB.mainFacetsModule = Object.create(HAB.mainFacetsClass);

HAB.initModule = function() {
  var module = {};

  $('[data-init-module]').each(function() {
    module[$(this).data("init-module")] = true;
  });

  for (property in module) {
    $('[data-init-module="'+property+'"]').each(function(index) {
      HAB[property][index] = Object.create(HAB[property]);
      HAB[property][index].init(this);
    });
  }
}

HAB.loadingContent = function($element) {
  var url = ($element) ? $element.data('href') : '',
    success = function() {},
    error = function() {};

  if (url) {
    success = function(respons) {
      $element.html(respons);

      // Init modules after loading content.
      $('[data-init-module]', $element).each(function() {
        var property = $(this).data('init-module'),
          propertyNumber = 0;

        if (Object.keys) {
          propertyNumber = Object.keys(HAB[property]).length;
        } else {
          var i;

          for(i in HAB[property]) {
            if (HAB[property].hasOwnProperty(i)) {
              propertyNumber++;
            }
          }
        }

        HAB[property][propertyNumber] = Object.create(HAB[property]);
        HAB[property][propertyNumber].init(this);
      });
    };

    error = function() {
      $element.html('');
    };

    $.ajax({
      type: 'GET',
      url: url,
      success: success,
      error: error
    });
  }
}

HAB.adobeRecommendation = HAB.adobeRecommendation || {};

HAB.adobeRecommendation.carousel = setInterval(function () {
  var holder = '.adobe-recommendation',
    $holder = $(holder),
    selectorElements = '.l-col',
    adobeRecommendationContent = $holder.html(),
    adobeRecommendationLength = $(selectorElements, $holder).length;

  // Check we already have any content and items in holder.
  if(adobeRecommendationContent && adobeRecommendationLength) {
    $('[data-init-module="mainCarouselModule"]', $('.adobe-recommendation')).each(function() {
      HAB.mainCarouselModule.adobeRecommendation = Object.create(HAB.mainCarouselModule);
      HAB.mainCarouselModule.adobeRecommendation.init(this);
    });
    
    clearInterval(HAB.adobeRecommendation.carousel);
  }
}, 1000);

/*
 * This method submits the "order replacement" form
 */
HAB.replacementSubmitFormClass = {
	init: function(holder) {
		this.config = {
			init: true,
			formSelector: '#orderReplacementForm',
			labelSelector: '.replacement-label-checkbox',
			$container: $(holder)
		};

    	this.bindEvents();
	},

	bindEvents: function() {
		var that = this;

		this.config.$container
			.on('change', that.config.labelSelector, function (ev) {
			    $(that.config.formSelector).submit();
			});
	}
}

HAB.replacementSubmitFormModule = Object.create(HAB.replacementSubmitFormClass);

HAB.quantitySelectboxClass = {
	init: function(holder) {
		this.config = {
			holderSelector: '.quantity-selectbox-holder',
			selectSelector: '.item-quantity-selectbox',
			inputSelector: '.input-quantity-selectbox'
		};

		this.bindEvents();
	},

	bindEvents: function() {
		var that = this;

		$('body')
			.on('change', that.config.selectSelector, function () {
				if(!$(this).is(':disabled')) {
					$(this).closest(that.config.holderSelector).find(that.config.inputSelector)
						.val($(this).val())
						.trigger(jQuery.Event('keypress', {which: 13}));
				}
			});
	}
};

	HAB.quantitySelectboxClass.init();

HAB.mobileHamburgerNavigationClass = {
		init: function() {
			this.config = {
				$container: $("#mobile-navigation-header-logo-holder"),
				mobileNavigationBtn: "#mobile-navigation-header-logo-btn",
				mobileNavigationHeaderItemsList: "#mobile-navigation-header-items-list",
				mobileHamburgerNavigationOverlay: "#mobile-hamburger-navigation-overlay",
				mobileHamburgerNavigationOpenedClass: "mobile-menu-opened",
				openClassSelector: "open",
				closeClassSelector: "close",
				mobileMenu: ""
			};

			if (!$(this.config.mobileNavigationHeaderItemsList).length) {
				this.addChangeToHtml();
			}
		},
		
		remove: function() {
			var that = this;
			
			$(that.config.mobileHamburgerNavigationOverlay).hide();
			$('body').removeClass(that.config.mobileHamburgerNavigationOpenedClass);
			setTimeout(function() {
		    	$("html").css({"overflow-x": ""});
			}, 400);
			$(that.config.mobileNavigationBtn)
				.removeClass(that.config.closeClassSelector)
				.addClass(that.config.openClassSelector);
		},

		addChangeToHtml: function() {
			var that = this,
				div = document.createElement("div"),
				menuItemHref = "",
				menuItemText = "";

		    $.each($(".main-nav.replete-nav [role=menubar] .main-nav-item a"), function() {
		    	menuItemText = $.trim($(this).text());
		    	menuItemHref = $(this).attr('href');

	    		that.config.mobileMenu += "<li><a href ='" + menuItemHref + "'>" + menuItemText + "</a></li>";
	    	});
		    
		    that.config.mobileMenu = "<ul id='" + that.config.mobileNavigationHeaderItemsList.substr(1) + "'>" + that.config.mobileMenu + "</ul><div id='" + that.config.mobileHamburgerNavigationOverlay.substr(1) + "'></div>";
		    $("body").prepend(that.config.mobileMenu);

		    this.preBindEvents();
		},
		
		preBindEvents: function() {
			var that = this;

			if ($(that.config.mobileNavigationHeaderItemsList).length) {
				that.bindEvents();
			} else {
				setTimeout(function() {
					that.preBindEvents();
				}, 500);
			}
		},

		bindEvents: function() {
			var that = this,
				width;

			that.config.$container
				.on("click", that.config.mobileNavigationBtn+"."+that.config.openClassSelector, function (ev) {
					$("html").css({"overflow-x": "hidden"});
					$("body").addClass(that.config.mobileHamburgerNavigationOpenedClass);
					$(that.config.mobileHamburgerNavigationOverlay).show();
					$(that.config.mobileNavigationBtn)
						.removeClass(that.config.openClassSelector)
						.addClass(that.config.closeClassSelector);

				})
				.on("click", that.config.mobileNavigationBtn+"."+that.config.closeClassSelector, function (ev) {
					$(that.config.mobileHamburgerNavigationOverlay).hide();
					$("body").removeClass(that.config.mobileHamburgerNavigationOpenedClass);
					setTimeout(function() {
						$("html").css({"overflow-x": ""});
					}, 400);
					$(that.config.mobileNavigationBtn)
						.removeClass(that.config.closeClassSelector)
						.addClass(that.config.openClassSelector);
				});

			$("body")
				.on("click vclick", that.config.mobileHamburgerNavigationOverlay, function (ev) {
					ev.preventDefault();

					$(that.config.mobileNavigationBtn+"."+that.config.closeClassSelector).trigger("click");
				});
		}
	}

HAB.mobileHamburgerNavigationModule = Object.create(HAB.mobileHamburgerNavigationClass);

/* because of ie bug with coockies and loosing session 
 * https://connect.microsoft.com/IE/feedback/details/810700/subject-ie11-is-losing-cookie-information-and-thus-becoming-detached-from-a-web-application-session */
HAB.winMobilePopup = {
  init: function() {
    if ($('body').hasClass('is-ieMobile')) {
      this.config = {
        bodyFrameCls: '.is-ieMobile',
        frameId: "iframe-ieMobile",
        frameBtnCls: '.ie-frame',
        frameCloseBtn: 'close',
        frameTemplate: {
          width: "100%",
          height: "100%",
          frameborder: 0
        },
        frameBodyCss: {
          margin: '0',
          background: '#fff',
          padding: '0 35px 0 15px'
        },
        frameBtnCloseCss: {
          position: 'absolute',
          right: '10px',
          top: '10px',
          font: 'bold 32px/1 Arial, sans-serif',
          color: '#000',
          textDecoration: 'none'
        }
      };
      
      this.config.frameTemplate.id = this.config.frameId;
      this.initHolder();
      this.bindEvents();
    }
  },

  initHolder: function() {
    var self = this;
    var frameTemplate = $('<iframe />', self.config.frameTemplate);

    if (!$('#'+self.config.frameId).length) {
      frameTemplate.load(function() {
        var frameElements = $('#'+self.config.frameId).contents();
        frameElements.find('body').css(self.config.frameBodyCss);
        frameElements.find('body').append('<a href="#" class="'+self.config.frameCloseBtn+'">X</a>');
        frameElements.find('.'+self.config.frameCloseBtn).css(self.config.frameBtnCloseCss);
      }).appendTo(self.config.bodyFrameCls);
    }
  },

  bindEvents: function() {
    var self = this;
    $(self.config.frameBtnCls).click(function(e) {
      e.preventDefault();
      var framePath = $(this).attr('href');
      $('#'+self.config.frameId).attr('src', framePath).addClass('active');
    })

    $('#'+self.config.frameId).load(function() {
      $('#'+self.config.frameId)
        .contents()
        .find('.'+self.config.frameCloseBtn)
        .on('click', function() {
          $('#'+self.config.frameId).removeClass('active');
      });
    })
  }
}

HAB.callTealiumView = function() {
  HAB.callTealium("view", window.universal_variable);
}

HAB.callTealium = function(fn, arg) {
	if(typeof utag != 'undefined' && typeof utag[fn] === 'function') {
		utag[fn](arg);
	};
};
HAB.mobileCheckoutBtnPos = {
	init: function() {
		this.config = {
			bthHolder: $(".f-basket .l-col.l-one-quarter").first(),
			checkoutBtn: $(".f-basket .checkoutBtn"),
			flag: true
		}
		if (this.config.checkoutBtn.length > 0) {
			this.btnPositionChange();
		}
	},

	remove: function() {
		this.config.bthHolder.removeClass('p-fixed');
		this.config.flag = false;
	},
	
	btnPositionChange: function() {
		var that = this, 
			btnPositionTop = this.config.checkoutBtn.offset().top;
		
		if ($(window).scrollTop() >= btnPositionTop) {
			that.config.bthHolder.addClass('p-fixed');
		}

		$(window).scroll(function() {
			if (that.config.flag) {
				if ($(window).scrollTop() >= btnPositionTop) {
					that.config.bthHolder.addClass('p-fixed');
				} else if ($(window).scrollTop() < btnPositionTop) {
					that.config.bthHolder.removeClass('p-fixed');
				}
			}
		})
	}
}

//On page Basket, when we scroll down Order Summary block should fixed on the screen
HAB.orderSummaryBlockClass = {
	init: function(holder) {
		this.config = {
			init: true,
			$container: $(holder),
			orderSummary: $('#scrollable-order-summary'),
			basketBlock: $('.basket-content-holder'),
			classFixed: 'fixed-order-summary',
			page: $('#content .page'),
			top: 30,  // Order Summary gap from top of display
			right: 0, // right gap order summary block from left content
			minWidth: 980, // minimal width of display when appear bottom scroll
			padding: 20, // distanse order summary to right side of display, use for ios
			orderWidthPercent: 0.3 // width of order summary block
		};

		var settings = this.config.$container.data('init-params');

		($('body').is('.breakpoint-220') && !$('html').hasClass('lt-ie9')) ? $.extend(true, this.config, settings.breakpoint220 || {}) : $.extend(true, this.config, settings.breakpoint768 || {});

		this.removeEvents();

		if (this.config.init) {
			this.bindEvents();  // init event listeners 
		}
	},

	bindEvents: function() {
		var that = this;
						
		$(window)	
			.on('load', function() {
				that.behaviorOrderPosition(); //add class 'fixed' to order summary or 'absolute' by default
				that.behaviorOrderTop(); // add value for position 'top'
				that.behaviorOrderRightWidth(); // add values for position 'right' and width
			})
			.bind('resize.customResizeBasket', function() {
				that.behaviorOrderRightWidth();
			})
			.bind('scroll.customScrollBasket', function() {
				that.behaviorOrderPosition();
				that.behaviorOrderTop();
				that.behaviorOrderRightWidth();
		});
		
	},
	
	getScroll: function() {
		return $(window).scrollTop();
	},
	
	getBeginContentBlock: function() {
		return this.config.basketBlock.offset().top - this.config.top;
	},
	
	getEndContentBlock: function() {
		return  this.getBeginContentBlock() + (this.config.basketBlock.height() - this.config.orderSummary.height());
	},

	getRightPosition: function() {
		var right = null,
			pageHolder = $(this.config.page).width();

		if ($('body').hasClass('breakpoint-768')) {
			if ($('body').hasClass('is-ios')) {
				right = this.config.padding;
			} else {
				right = $(window).width() < this.config.minWidth ? $(window).width() - this.config.minWidth + $(window).scrollLeft() : ($(window).width() - pageHolder)/2;
			}
		}
		return right;
	},

	behaviorOrderPosition: function() {
		var scroll = this.getScroll(),
			beginContentBlock = this.getBeginContentBlock(),
			endContentBlock = this.getEndContentBlock();
		
		scroll >= beginContentBlock && scroll < endContentBlock ? this.config.orderSummary.addClass(this.config.classFixed) : this.config.orderSummary.removeClass(this.config.classFixed);
	},

	behaviorOrderTop: function() {
		var scroll = this.getScroll(),
			top = this.config.basketBlock.height() - this.config.orderSummary.height(),
			beginContentBlock = this.getBeginContentBlock(),
			endContentBlock = this.getEndContentBlock();
		
		if(scroll >= beginContentBlock && scroll < endContentBlock) {
			this.config.orderSummary.css('top', this.config.top);
		} else if(scroll >= endContentBlock) {
			this.config.orderSummary.css('top', top);
		} else {
			this.config.orderSummary.removeAttr('style');
		}
	},

	behaviorOrderRightWidth: function() {
		var scroll = this.getScroll(),
			pageHolder = $(this.config.page).width(),
			right = this.getRightPosition(),
			width = $(this.config.page).width() * this.config.orderWidthPercent,
			beginContentBlock = this.getBeginContentBlock(),
			endContentBlock = this.getEndContentBlock();
		
		if(scroll >= beginContentBlock && scroll < endContentBlock) {
			this.config.orderSummary.css({'right': right, 'width': width});
		} else if(scroll >= endContentBlock) {
			this.config.orderSummary.css({'right': this.config.right, 'width': width});
		} else {
			this.config.orderSummary.removeAttr('style');
		}
	},

	removeEvents: function() {
		$(window).unbind('customScrollBasket');
		$(window).unbind('customResizeBasket');
	}
};

HAB.orderSummaryBlockModule = Object.create(HAB.orderSummaryBlockClass);

HAB.termsAndConditionsTooltip = {
  init: function() {
    this.config = {
      target: ".terms-condition-tooltip",
      tooltipBtn: ".terms-condition-tooltip a"
    }
    
    if ($(this.config.target).length > 0) {
      this.tooltipFn();
    }
  },
  
  tooltipFn: function() {
    var self = this;
     
    $(self.config.target).tooltip({
      tooltipClass: 'terms-conditions-tooltip-block',
      disabled: true,
      content: function(callback){
        $.ajax({
          url: '/checkout/includes/termsAndConditions.jsp',
          type: 'GET',
          cache: true,
          success: function(data) {
            callback(data);
          },
          error: function(data) {
            callback('Error: ' + data.status + ', ' + data.statusText);
          }
        })
      },
      close: function(){
        $(this).tooltip('disable');
      }
    });
    
    $('body').on('click', function(ev){
      var target = ev.target || ev.srcElement,  //for ie8
          tooltipBlock = '.terms-conditions-tooltip-block',
          tooltipTarget = $(target).parents(tooltipBlock);
      
      if ($(tooltipBlock).length > 0 && tooltipTarget.length === 0) {
        $(self.config.tooltipBtn).parent().tooltip('close');
      }
    })
    
    
    $(this.config.tooltipBtn).on('click', function(ev){
      ev.preventDefault();
      
      $(this).parent()
      .tooltip('enable')  //enable tooltip for open only on mouseclick
      .tooltip('open')  //open tooltip on click
      .off('mouseleave')
      .off('focusout')  //prevent from closing on focus out
    })
  }
};