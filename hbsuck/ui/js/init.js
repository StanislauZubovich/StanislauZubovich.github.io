/* NBTYATG-1939: IE8 and IE9 don't have console object if Developer Tools are not opened */
if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function(){};
if (!window.console.error) window.console.error = function(){};

/**
 * Our HAB project namespace.
 */
var HAB = HAB || {};

HAB.init = function() {

  /* Globally cache the jQuery reference to the document to avoid repeated lookups.
   * This should be used as the base of all document-wide
   * searches where a closer context isn't available e.g.
   * var $someElement = $.root.find(someSelector);
   */
  $.root = $(document.body);


  /* Set up breakpoints.js
   */
  $(window).setBreakpoints({
    // Use only largest available vs use all available
    distinct: true,
    // array of widths (in px) where breakpoint events should be triggered
    breakpoints: [
      220,
      768
    ] 
  }); 


  /* Narrow viewports
   * Functions to execute for narrow viewports
   */
  $(window).bind('enterBreakpoint220',function() {
    // Fix conflict between equal block height(cann't set height for hidden element) and mainCarousel.
    $('.main-carousel').find('li').removeClass('hidden-element').removeClass('selected');
    
    // Collapse main nav for mobile use
    // @TODO: rename to disabmigute from mobileMenu plugin (which handles local navigation)
    HAB.setupMobileMenu();
    
    // Toggle mobile menu to mobile version
    HAB.collapseLocalNav(true);

    // Ensure product teasers display in list view on mobile
    HAB.setProdTeaserMobileView();

    HAB.hookProductImagesMB();
    HAB.hookProdTeaserCarousel.create();

    SFR.Utils.setupResponsiveTables();
    
    // if ( $.root.hasClass('t-cat') || $.root.hasClass('t-subcat') ) {
    //   HAB.reflowCatPage();
    // }
    HAB.initModule();
    postBreakpointInit();
  });
  /* Functions to execute when the viewport is manually adjusted below 768px
   */
  $(window).bind('exitBreakpoint768',function() {
    
    // Ensure product teasers display in list view on mobile
    HAB.setProdTeaserMobileView();

    // destroy menu dropdowns
    HAB.destroyDropdowns();

  });


  /* Wide viewports
   * Functions to execute when the viewport is wider than 767px
   */
  
  $(window).bind('enterBreakpoint768',function() {
    // Fix conflict between equal block height(cann't set height for hidden element) and mainCarousel.
    $('.main-carousel').find('li').removeClass('hidden-element').removeClass('selected');
    
    // Switch any text strings that differ for large viewports
    HAB.switchStrings();
    
    HAB.undoMobileMenu();

    if ($.root.find('.main-nav-item').length) {
      HAB.hookDesktopMenu();
    }

    // Ensure product teasers display in grid view on desktop
    HAB.setProdTeaserDesktopView();
//
    HAB.truncateText('.prod-teaser-block.is-list .prod-desc');
//    
    HAB.hookProdTeaserCarousel.destroy();

    // setup menu dropdowns
    HAB.setupDropdowns();
    /* Content choreography 
     * In general, we'll take a 'mobile first' approach to DOM ordering and reflow for larger viewports
     * Pros: less JS executed on mobiles
     * Cons: the reflow is more noticeable on larger screens and might need some kind of 'blanket' cover 
     * (We could replace this with flexbox implementation for supporting browsers)
     * @TODO: ideally each case should have a 'tear down' function incase user resizes the browser down to mobile
     * Note: elegance of breakpoint switching isn't a high priority (likelihood of user resizing is small)
     */
    HAB.reflowSubCatPage();
    HAB.reflowFavsPage();
    if ( $.root.hasClass('t-home') ) {      
      HAB.reflowHomepage();
    }    
    if ( $.root.find('.l-five-sixths .notice') ) {      
      HAB.reflowPageNotice();
    }    

    // In subcat page submit form if 'show images' input is changed
    HAB.setUpImageToggle();
    
    // Toggle mobile menu to mobile version
    HAB.collapseLocalNav(false);
    

    // As we have fluid layout for desktop, we may need to reapply inline heights 
    // each time the browser is resized
    $(window).on('resize',function() {
      // Note: IE7 gets sad if we fire equalHeight twice on page load, 
      // but that browser gets a fixed width 960 anyway so we don't need to do it
      if (! $('html').hasClass('lt-ie8') ) {
          $.root.find('.l-eq-height').has('.l-fit-bottom').each(function(index, item) {
              $(item).find('.promo-img').css('position','static');
          });
          
        $.root.find('.l-eq-height').each(function(index, item) {
          $(item).find('.panel').equalHeight();
        });

        /*$.root.find('.l-eq-height').has('.l-fit-bottom').each(function(index, item) {
            $(item).find('.l-fit-bottom').css({'bottom':0,'margin':0,'position':'absolute','right':0, 'left':0});
        });*/
      }
    }).trigger('resize');


    // Dynamically load images
    HAB.loadDesktopImages();

    HAB.hookProductImagesDT();
    HAB.hookBasketFlyout();
    HAB.initModule();
    postBreakpointInit();
    
    SFR.Utils.deleteResponsiveTables();
    
	HAB.mobileHamburgerNavigationModule.remove();
	HAB.mobileCheckoutBtnPos.remove();
  });

  //Post breakpoint init functions.
  // Put code here that is viewport agnostic, but needs to wait until breakpoints.js has fired
  var postBreakpointInit = function() {

    if($('body').is('.breakpoint-768')) {

      // equal heights
      $(window).load(function() {
//        $.root.find('.l-eq-height').each(function(index, item) {
//          $(item).find('.panel').equalHeight();
//        });

//        $.root.find('.l-eq-height').has('.l-fit-bottom').each(function(index, item) {
//          $(item).find('.panel p').equalHeight();
//        });
      });
    }
	HAB.mobileHamburgerNavigationModule.init();
	HAB.mobileCheckoutBtnPos.init();
  }; 
  
  /* Viewport-agnostic functions
   * These are executed regardless of viewport width
   */
  SFR.Utils.scaleFix();
  SFR.Utils.fixSizeSelectsIniOS();
  SFR.Utils.setupCustomRadioHandlers();
  SFR.Utils.niceUpInPageNav('.local');
  SFR.Utils.setupPrintLinks('.act-print');

  // Look for 'collapsible' modules and set up show/hide functionality
  SFR.Utils.setUpCollapsibles();

  // Define selectors for sorting select lists that should filter page contents on change
  SFR.Utils.activateSelectListNavs('.page-limit');
  
  SFR.Utils.activatePopUps();

  HAB.setupTooltips();

  HAB.hookSiteSearch();

  HAB.checkProdInfoOverflow();

  HAB.reStyleSelects();
  
  HAB.storeTooltip.init();

  // Initialise product teaser modules (grid/list view, show/hide, quick buy, sumbit)   
  HAB.setupProdTeasers();
  
  // Initialize product filters (showMore/showLess links)
  HAB.initProdFilters();
  
  // Initialise ‘email when in stock’ links
  HAB.setupStockEmailPrompts();
  
  HAB.hookSignupTeaser();
  
  HAB.hookProductSubmitButton();
  
  //HAB.hookFacetedSearch();
  
  HAB.hookQtyButtons();
  
  HAB.setMaxLength();

  HAB.limitChars();
  
  HAB.initBasket();
  
  HAB.hookSpecialBehaviour();
  
  HAB.hookRFLActivation();
  
  if ( $('.t-checkout').length ) {
    HAB.doCheckoutHooks();
  }  
    
  if ( $('.t-rfl-activation, .postcode-lookup-input').length) {
    HAB.postcodeLookup.init();
  }

  HAB.setupAddToFavourites();
  
  HAB.setupProdOptImages();
  
  HAB.setupProdOptOffers();
  
  HAB.hookHomeHero();
  
  HAB.hookFormValidation();
  
  HAB.doAccountHooks();
  
  HAB.addSubmitIcons();
  
  HAB.pdp.init(); // should be after HAB.addSubmitIcons because it hides/shows these icons
  
  HAB.setupReorderAllItemsLinks();

  HAB.lightboxes.setup();
  
  HAB.winMobilePopup.init();
  
  // Mostly CSS polyfills
  HAB.fixIE();

  //#MK highlight favorites
  HAB.loadFavorites();
  
  HAB.initScrollToError();
  
  // Password strength meter module
  HAB.passwordStrengthMeter.init();

  //Description on Category and Subcategory pages
  HAB.showMoreLessDescription();

  /*
   * Bind to document.body dom updated. 
   */
  $(document.body).on('domUpdated', function(e, ctx) {
    
    HAB.reStyleSelects();
    
    // Reinisitalise functions that set up AJAX loading and form auto-submission
    HAB.hookSpecialBehaviour();
  
    // The new content may include forms
    HAB.hookFormValidation();
    FORMALIZE.go();

  });
  
  //Terms and conditions tooltip
  HAB.termsAndConditionsTooltip.init();
  
  //Confirmation of registration
  HAB.confirmationOfRegistration.init();
  
  HAB.address.init();
};

HAB.hookLanguageSelection();

$(function() {HAB.init();});

function lEqHeight() {
 $('.adobe-recommendation').find('.l-eq-height').each(function(index, item) {
     $(item).find('.panel').equalHeight();
   });
}

// temporally place this script here
 var refreshURL="/modules/ajax/basket-masthead.jsp";
 function addItemToBasket(obj, reload){
     var form = $(obj).parents('.prod-teaser-form');
     var submitUrl = form.prop('action');
     $.post(submitUrl, form.serialize(), function(sHtml) {
      if(reload) {
  location.reload(true);
      } else {      
        // show message that item was added to the basket
        $(obj).parent().next().html(sHtml);
        $.root.find('.basket-nav-item>a').load(refreshURL);
        lEqHeight();
      } 
     });
     return false;
}
$(window).load(function(){
  $('.slick-carusel').slick({
    infinite: false,
    dots: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1025,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 769,
        settings: {
          arrows: false,
          slidesToShow: 1
        }
      }
    ]
  });
});
function spotlightCarusel() {
  $('.spotlight-carusel').slick({
    infinite: false,
    
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1025,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 769,
        settings: {
          arrows: false,
          dots: true,
          slidesToShow: 1
        }
      }
    ]
  });
}
$(document)
    .ready(function() {
    	if($("#all-product-tabs" ).html() !== undefined) {
    		$("#all-product-tabs" ).tabs();
    	}
    })
    .on('click', '.seo-text-button', function (ev) {
        var $this = $(this);

        $this.toggleClass('active');

        if($this.hasClass('active')){
            $this.text('Show less');
            $('.seo-text-additional').slideDown(100);
        } else {
            $this.text('Show more');
            $('.seo-text-additional').slideUp(100);
        }
    });
