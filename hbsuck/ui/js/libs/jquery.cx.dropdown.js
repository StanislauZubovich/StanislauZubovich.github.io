
/**
 * @fileOverview A jQuery UI Widget to add and removes classes to a list of links to allow keyboard accessibility
 * @author Russell Kirkland
 * @name $.ui.cx_dropdown
 * @dependencies: jQuery, jQuery UI widget factory, jQuery HoverIntent.
 *
 * @param string hoverClass
 * @param string menuClass
 * @param string ariaAttr
 * @param string ariaValue
 * @param int mouseDelay
 * 
 */
 
 /*=====================================
  Dropdown plugin
*/
;(function($) {

  $.widget("ui.cx_dropdown", {

    options: {
      hoverClass: 'active',
      menuClass: 'submenu',
      ariaAttr: 'aria-haspopup',
      ariaValue: 'true',
      fixPosition: false,
      mouseDelay: 200
    },

    _create: function() {
      /** The standard jQuery UI _create function. */
      
      // get the context
      this._self = this;

      // get the vars
      this._container  = $(this.element),
      this._li         = this._container.find('>li[' + this.options.ariaAttr + '=' + this.options.ariaValue + ']');

      // add periods to menu class
      var reg = /^\./;
      this.options.menuClass = !reg.test(this.options.menuClass) ? '.' + this.options.menuClass : this.options.menuClass; 

    },

    _init: function() {  

      // attach handlers
      this
        ._li
        .hoverIntent({
          over: $.proxy(this._tabOn, this),
          out: $.proxy(this._tabOff, this),
          interval: this.options.mouseDelay
        })
        .find('a')
       //.on('focus', $.proxy(this._tabOn, this))  // This was causing problems on firefox
        .on('blur', $.proxy(this._tabOff, this)); 

      // listen for flyout events
      $(window).on('flyoutOpened', $.proxy(this._tabOff, this));

      // Close the menu when we tap outside it
      this._on('[role=banner],#content,[role=contentinfo]', { 'click': this._resetAll });    

      // Main click handler on top level items to prevent first click
      this._on(this._li, {'click': this._click });

      // add an orientationchange listener to clear tabs
      $(window).on('orientationchange', $.proxy(this._resetAll, this));
    },

    _tabOn: function(e) {

      // get the vars
      var link = $(e.target), 
          winWidth = $(window).width(),
          li, liLeft,          
          submenu, subWidth;

      // reset all
      this._resetAll();

      // get the li we want
      li = this._closestListItem(link);
      liLeft = li.offset().left;

      // fix position if desired
      if (this.options.fixPosition)
      {        
        // get the submenu
        submenu = li.find(this.options.menuClass);
        subWidth = submenu.outerWidth(true);

        // pull the menu back if overflowing
        if (liLeft > 0 && (subWidth + liLeft) > winWidth)
        {
          if (subWidth > winWidth) submenu.css('left',  - liLeft);
          else submenu.css('left',  - ((liLeft + subWidth) - winWidth));
        }
      }

      // add the class
      li.addClass(this.options.hoverClass);

      // broadcast event
      $(window).trigger('flyoutOpened');
    },

    _tabOff: function(e) {
      this._closestListItem(e.target).removeClass(this.options.hoverClass).find(this.options.menuClass).removeAttr('style');
    },

    _click: function(e) {
      if(!this._closestListItem(e.target).hasClass(this.options.hoverClass)) {
        e.preventDefault();
      }
    },

    _resetAll: function(e) {
      this._li.removeClass(this.options.hoverClass).find(this.options.menuClass).removeAttr('style');
    },

    _closestListItem: function(el) {
      return $(el).is('li') ? $(el) : $(el).closest('li[' + this.options.ariaAttr + '=' + this.options.ariaValue + ']');
    },

    destroy: function() {  
     // remove handlers
      this
        ._li
        .unbind('mouseenter')
        .unbind('mouseleave')
        .removeProp('hoverIntent_t')
        .removeProp('hoverIntent_s')
        .find('a')
        .first()
        .off('focus', this._tabOn)
        .on('blur', this._tabOff)

      $(window).off('flyoutOpened', this._tabOff);
      $(document).off('touchend', this._onTouch);
      $(window).off('resize', this._resetAll);

      // call the base destroy function
      $.Widget.prototype.destroy.call(this);
    },

    _setOption: function(key, value) {
      /** The standard jQuery UI _setOption function. */
      this._super( key, value );
    }

  });
  
})(jQuery);