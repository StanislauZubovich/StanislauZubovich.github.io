(function ($) {
  "use strict";

  $.fn.exists = function() {
    return this.length !== 0;
  };

  String.prototype.endsWith = function (pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  };

  var EmptyResultEnum = {
        NotEmpty: 0,
        TooManyResults: 1,
        NoMatchesFound: 2,
        NoSearchParams: 3
      },
      AutoComplete = function (settings, owner) {

        this.ownerDiv = $(owner);
        this.settings = settings;
        this.validator = null;

        this.init = function (fromStart) {

          if (this.settings.StartPoint === 'End' && fromStart) {
            this.revert();
          } else {

            this.ownerDiv.hide();
            this.setSelectedGeoCode('');

            this.showPromptsForCountry(false);

            $(".bfpoBox", this.ownerDiv).hide();
            $("select", this.ownerDiv).val("229");

          }
        };

        this.showPromptsForCountry = function (focusPrompts) {

          this.showWaiting($('.selectCountry'));

          var geoCode = this.getSelectedGeoCode();
          if (geoCode === 'XXX') {
            this.noSearchForCountry();
            return;
          }

          this.showWaiting();
          $.post('/AddressCapture/PromptsPerGeoCode', { geoCode: geoCode }, {}, 'json')
              .error(showErrorCallback(this))
              .success(promptsGeoCodeCallback(this, focusPrompts));

        };

        var promptsGeoCodeCallback = function (context, focusPrompts) {
          return function (data) {

            context.settings.Ready(context);

            context.hideWaiting();


            var html = $.render.promptTemplate(data.prompts),
                buttonsHtml = $.render.findAddressButtonTemplate(data),
                div = context.ensureDiv(),
                requiresValidation = false;

            //Must trigger the blur so that the tool tips go away
            $(":focus", div).trigger('blur');

            div.empty();

            if (settings.LineWrapper.length > 0) {
              div.append($(html).wrapAll(settings.LineWrapper).parent());
            } else {
              div.append($(html));
            }

            div.append(buttonsHtml);

            var validation = {
              ignore: ":not(#" + div[0].id + ">input)",
              messages: {}
            };

            $("form>#" + div[0].id + " input.required").each(function () {

              var element = $(this);
              validation.messages[element[0].id] = {
                required: element.data("required-message")
              };

              var elementMessage = element.data("required-message");
              $(this).rules("add", {
                messages: {
                  required: elementMessage
                }
              });

              requiresValidation = true;
            });

            $(div.parents("form")).bind("invalid-form.validate", function (form, validator) {
              var errors = validator.numberOfInvalids();
              if (errors) {
                div = context.ensureDiv();
                var i, lastError;
                for (i = 0; validator.errorList[i]; i++) {
                  var error = validator.errorList[i];
                  if (div.has($(error.element)).length > 0) {
                    lastError = error;
                  }
                }

                if (lastError) {
                  if (!lastError.message.endsWith(settings.CantSearch)) {
                    var messageWithNoFullStop = lastError.message.slice(0, -1);
                    lastError.message = messageWithNoFullStop + " " + settings.CantSearch;
                  }

                  //This is a nasty hack to get around the fact that I don't know deterministically when the errors have been drawn.
                  setTimeout(function () {
                    $(".CantSearch", div).click(function (event) {
                      event.preventDefault();
                      context.revert();
                    });
                  }, 750);
                }
              }
            });

            if (requiresValidation) {
              context.validator = $("form>#" + div[0].id).validate(validation);
            }

            $(".findButton", div).click(function (event) {
              event.preventDefault();
              context.searchForAddress();
            });

            $(":input", div).keypress(function (event) {
              if (event.which === 13) {
                context.searchForAddress();
                event.preventDefault();
              }
            });

            $(".nonUKCountryButton", div).click(function (event) {
              event.preventDefault();
              context.pickNewCountry();
            });

            if (focusPrompts) {
              $(":text:first", div).focus();
            }

            settings.AfterPromptsShown();
          };
        };

        this.searchForAddress = function () {

          var div = this.ensureDiv();

          if (this.validator == null || this.validator.form()) {
            $('.noResults', div).remove();
            $('.noSearchOptions', div).remove();

            this.showWaiting($('.findButton'));

            var searchData = $("#" + settings.TemplateId + " :input").serialize() + "&geoCode=" + this.getSelectedGeoCode();
            $.post('/AddressCapture/AddressSearch', searchData, {}, 'json')
                .error(showErrorCallback(this))
                .success(addressSearchCallback(this));
          } else {
            var messageWithNoFullStop = div.find("label.error").last().text().slice(0, -1);
            div.find("label.error").last().text(messageWithNoFullStop + " ");
            div.find("label.error").last().append(settings.CantSearch);
            var context = this;
            $(".CantSearch", div).click(function (event) {
              event.preventDefault();
              context.revert();
            });
          }
        };

        var addressSearchCallback = function (context) {

          return function (data) {
            context.hideWaiting();
            //    console.log(data);
            if (data.hasOwnProperty("addresses")) {

              var div = context.ensureDiv();

              $('.noResults', div).remove();
              $('.noSearchOptions', div).remove();

              if (data.emptyDataReason === EmptyResultEnum.TooManyResults) {
                div.prepend(settings.TooManyResults);
                $(".noresult-manual").click(function (event) {
                  event.preventDefault();
                  context.revert();
                  $(settings.AddresLine1).removeAttr('readonly');
                  $(settings.AddresLine2).removeAttr('readonly');
                  $(settings.Town).removeAttr('readonly');
                  $(settings.County).removeAttr('readonly');
                  $(settings.Country).removeAttr('readonly');
                  $(settings.CountryValue).removeAttr('readonly');
                  $(settings.CountryText).removeAttr('readonly');
                  $(settings.Postcode).removeAttr('readonly');

                  //Must focus on something else first so IE doesn still think the input is disabled
                  $(settings.AddresLine2).focus();
                  $(settings.AddresLine1).focus();
                });
              } else if (data.emptyDataReason === EmptyResultEnum.NoSearchParams) {
                div.prepend(settings.NoSearchOptions);
              } else if (data.addresses.length > 0) {

                //Must trigger the blur so that the tool tips go away
                $(":focus", div).trigger('blur');

                div.empty()
                    .append($.render.addressTemplate(data));

                $('body').data('Address-Search-Data' + settings.TemplateId, data);

                $(" #addressSelector", div).prop("selectedIndex", 0);

                $(".selectAddress", div).click(function (event) {
                  event.preventDefault();
                  context.getFullAddress();
                });

                $("a.newSearch", div).click(function (event) {
                  event.preventDefault();
                  context.showPromptsForCountry('', true);
                  $(context.ownerDiv).hide();
                  $(":text:first", div).focus();
                });

                $("a.manualEntry", div).click(function (event) {
                  event.preventDefault();
                  context.revert();
                  $(settings.AddresLine1).removeAttr('readonly').focus();
                  $(settings.AddresLine2).removeAttr('readonly');
                  $(settings.Town).removeAttr('readonly');
                  $(settings.County).removeAttr('readonly');
                  $(settings.Country).removeAttr('readonly');
                  $(settings.CountryValue).removeAttr('readonly');
                  $(settings.CountryText).removeAttr('readonly');
                  $(settings.Postcode).removeAttr('readonly');
                });

              } else {
                div.append(settings.NoResultsFound);
                $(".noresult-manual").click(function (event) {
                  event.preventDefault();
                  context.revert();
                  $(settings.AddresLine1).removeAttr('readonly');
                  $(settings.AddresLine2).removeAttr('readonly');
                  $(settings.Town).removeAttr('readonly');
                  $(settings.County).removeAttr('readonly');
                  $(settings.Country).removeAttr('readonly');
                  $(settings.CountryValue).removeAttr('readonly');
                  $(settings.CountryText).removeAttr('readonly');
                  $(settings.Postcode).removeAttr('readonly');

                  //Must focus on something else first so IE doesn still think the input is disabled
                  $(settings.AddresLine2).focus();
                  $(settings.AddresLine1).focus();
                });
              }
            } else {
              $(context.ownerDiv).show();
              context.showAddress(data.fullAddress);
            }
          };
        };

        this.getFullAddress = function () {

          var addressMoniker = $("#addressSelector").val();

          this.showWaiting($('.selectAddress'));

          $.post('/AddressCapture/LoadAddress', { 'addressMoniker': addressMoniker, 'geoCode': this.getSelectedGeoCode() }, {}, 'json')
              .error(showErrorCallback(this))
              .success(loadAddressCallback(this));
        };

        var loadAddressCallback = function (context) {

          return function (data) {
            $('#' + settings.TemplateId).remove();
            context.ownerDiv.show();
            context.showAddress(data.fullAddress);
            context.revert();
          };
        };

        this.showAddress = function (fullAddress) {

          var div = this.ensureDiv(),
              context = this;

          //Must trigger the blur so that the tool tips go away
          $(":focus", div).trigger('blur');

          div.empty();
          //.append(settings.NotYourAddress);

          $("a", div).click(function (event) {
            context.showPromptsForCountry(context.getSelectedGeoCode(), true);
            context.ownerDiv.hide();
            event.preventDefault();
          });

          $(settings.AddresLine1).val(fullAddress.Address1).trigger('change');
          $(settings.AddresLine2).val(fullAddress.Address2).trigger('change');
          $(settings.Town).val(fullAddress.Town).trigger('change');
          $(settings.County).val(fullAddress.County).trigger('change');
          $(settings.Country).val(fullAddress.CountryId).trigger('change');

          $(settings.CountryValue).val(fullAddress.CountryId).trigger('change');
          $(settings.CountryValue).selectBox('value', fullAddress.CountryId);

          $(settings.CountryText).val(fullAddress.Country).trigger('change');
          $(settings.Postcode).val(fullAddress.Postcode).trigger('change');

          settings.SearchComplete();

          $(".postSearchLinks", this.ownerDiv).remove();

          var lastAddressElement = $("select", this.ownerDiv);
          if (!lastAddressElement.exists()) {
            //this might be on the Irish site (no country selector)
            lastAddressElement = $("input", this.ownerDiv).last();
          }

          $("a.searchAgain", this.ownerDiv).click(function (event) {
            event.preventDefault();
            context.init(false);
          });

          $("a.editAddress", this.ownerDiv).click(function (event) {
            event.preventDefault();
            $(settings.AddresLine1).removeAttr('readonly').focus();
            $(settings.AddresLine2).removeAttr('readonly');
            $(settings.Town).removeAttr('readonly');
            $(settings.County).removeAttr('readonly');
            $(settings.Country).removeAttr('readonly');
            $(settings.CountryValue).removeAttr('readonly');
            $(settings.CountryText).removeAttr('readonly');
            $(settings.Postcode).removeAttr('readonly');
          });

          $(".serviceErrorMessage", context.ownerDiv).remove();
        };

        this.pickNewCountry = function () {

          this.showWaiting($('.anotherCountry'));

          $.post('/AddressCapture/GetCountries', {}, {}, 'json')
              .error(showErrorCallback(this))
              .success(pickNewCountryCallback(this));
        };

        var pickNewCountryCallback = function (context) {

          return function (data) {

            context.hideWaiting();

            var html = $.render.countrySelectorTemplate(data),
                div = context.ensureDiv();

            //Must trigger the blur so that the tool tips go away
            $(":focus", div).trigger('blur');

            div.empty()
                .append(html);

            /*
             * This isn't great - AddressCapture.js is now dependant on our libraries
             * @todo refactor so that it triggers an event.
             */
            $.root.domUpdated();

            if (typeof $.fn.selectToAutocomplete == "function") {
              $("select", div).selectToAutocomplete({ 'sort': true });
            }

            $(":input", div).keypress(function (event) {
              if (event.which === 13) {
                context.setSelectedGeoCode($("#addresspicker-country").val());
                context.showPromptsForCountry(true);
                event.preventDefault();
              }
            });

            $(".selectCountry", div).click(function (event) {

              var countryVal = $("#addresspicker-country").selectBox('value');
              //$("#addresspicker-country").val(countryVal)

              context.setSelectedGeoCode(countryVal);
              context.showPromptsForCountry(true);
              event.preventDefault();
            });

            $(".BFPOPrompt a", div).click(function (event) {
              event.preventDefault();
              context.revert();
              $(".bfpoBox", context.ownerDiv).show();

            });

            $(":text:first", div).focus();
          };
        };

        this.getSelectedGeoCode = function () {

          return $('body').data('GeoCode' + settings.TemplateId);

        };

        this.setSelectedGeoCode = function (geoCode) {
          $('body').data('GeoCode' + settings.TemplateId, geoCode);
        };

        this.noSearchForCountry = function () {

          var div = this.ensureDiv(),
              selectedCountry;

          if (typeof $.fn.selectToAutocomplete == "function") {
            selectedCountry = $(":text", div).val();
          } else {
            selectedCountry = $("option:selected", div).text();
          }

          $(".countryErrorMessage", this.ownerDiv).remove();
          var html = $($.render.noCountrySearchTemplate({ 'Country': selectedCountry })).addClass("countryErrorMessage");

          this.ownerDiv.prepend(html);

          var self = this;

          $("a", this.ownerDiv).click(function (event) {
            event.preventDefault();
            $(".noCountryMessage", self.ownerDiv).remove();
            self.ownerDiv.hide();
            self.pickNewCountry();
          });
          this.revert();

          $(settings.AddresLine1).removeAttr('readonly').focus();
          $(settings.AddresLine2).removeAttr('readonly');
          $(settings.Town).removeAttr('readonly');
          $(settings.County).removeAttr('readonly');
          $(settings.Country).removeAttr('readonly');
          $(settings.CountryValue).removeAttr('readonly');
          $(settings.CountryText).removeAttr('readonly');
          $(settings.Postcode).removeAttr('readonly');
        };

        this.revert = function () {

          //Must trigger the blur so that the tool tips go away
          $("#" + settings.TemplateId + " :focus").trigger("blur");

          $("#" + settings.TemplateId).remove();
          this.ownerDiv.show();

          settings.SearchComplete();

          $(".postSearchLinks", this.ownerDiv).remove();

          var lastAddressElement = $("select", this.ownerDiv);
          if (!lastAddressElement.exists()) {
            //this might be on the Irish site (no country selector)
            lastAddressElement = $("input", this.ownerDiv).last();
          }

          $(settings.AddresLine1).focus();
          $(settings.AddresLine2);
          $(settings.Town);
          $(settings.County);
          $(settings.Country);
          $(settings.CountryValue);
          $(settings.CountryValue);
          $(settings.CountryText);
          $(settings.Postcode);

          var context = this;
          $("a.searchAgain", this.ownerDiv).click(function (event) {
            event.preventDefault();
            context.init(false);
          });

          $("a.editAddress", this.ownerDiv).click(function (event) {
            event.preventDefault();
            $(settings.AddresLine1).removeAttr('readonly').focus();
            $(settings.AddresLine2).removeAttr('readonly');
            $(settings.Town).removeAttr('readonly');
            $(settings.County).removeAttr('readonly');
            $(settings.Country).removeAttr('readonly');
            $(settings.CountryValue).removeAttr('readonly');
            $(settings.CountryText).removeAttr('readonly');
            $(settings.Postcode).removeAttr('readonly');
          });

        };

        var showErrorCallback = function (context) {
          return function () {
            $(".serviceErrorMessage", context.ownerDiv).remove();
            var html = $($.render.serviceErrorTemplate({})).addClass("serviceErrorMessage");
            context.ownerDiv.prepend(html);
            context.revert();

            $(settings.AddresLine1).removeAttr('readonly').focus();
            $(settings.AddresLine2).removeAttr('readonly');
            $(settings.Town).removeAttr('readonly');
            $(settings.County).removeAttr('readonly');
            $(settings.Country).removeAttr('readonly');
            $(settings.CountryValue).removeAttr('readonly');
            $(settings.CountryText).removeAttr('readonly');
            $(settings.Postcode).removeAttr('readonly');
          };
        };

        this.showWaiting = function (elem) {

          if ( elem ) {
            elem.addClass('waiting');
            elem.attr('disabled', 'disabled');
          }

          var div = this.ensureDiv();

          if ( !$('.waiting').is('*') ) {
           div.append("<div class='waiting'>Loading...</div>");
          }
        };

        this.hideWaiting = function () {

          if ( $('.waiting').get(0).tagName === 'DIV' ) {
            return;
          }

          $('.waiting')
              .removeAttr('disabled')
              .removeClass('waiting');
        };

        this.ensureDiv = function () {
          var div = $("ol#" + settings.TemplateId);
          if (div.length === 0) {
            $('<ol id="' + settings.TemplateId + '" class="AddressFinder"></ol>').insertBefore(this.ownerDiv);
          }
          return $("ol#" + settings.TemplateId);
        };
      };

  $.fn.addressCapture = function (options) {

    var defaultPromptTemplate = '<li><label for="{{>ControlName}}">{{>Prompt}}:</label><input id="{{>ControlName}}" name="{{>ControlName}}" title="{{>Example}}" /></li>',
        defaultAdressSelectorTemplate = '<li><label for="addressSelector">Select Adress:</label><select size="6" id="addressSelector">{{for addresses}}<option value="{{>Monkier}}">{{>PartialAddress}}</option>{{/for}}</select><br /><span>Address not listed? <a class="newSearch" href="#">Search again</a> or <a href="#">enter address manually</a></span><br /><input type="submit" class="selectAddress" value="Select Address" /></li>',
        defaultFindButtons = '<li class="buttons"><input type="submit" name="postcode-lookup-trigger" class="findButton" value="Look up address"><br /><a class="nonUKCountryButton" href="#">{{>countryPrompt}}</a></li>',
        defaultCountrySelector = '<li class="buttons"><label for="addresspicker-country">Country</label><select id="addresspicker-country" name="addresspicker-country" class="addresspicker-country"><option value="">Please Select..</option>{{for countries}}<option value="{{>GeoCode}}"{{if AlternativeSpellings}} data-alternative-spellings="{{>AlternativeSpellings}}"{{/if}}{{if Boost}}relevancy-score-booster="{{>Boost}}"{{/if}}>{{>Country}}</option>{{/for}}</select><p class="BFPOPrompt"><a href="#">British Forces Post Office address?</a></p><div class="clearer"></div><input type="submit" class="selectCountry bluebutton" value="Confirm Country"><div class="clearer">&nbsp;</div></li>',
        defaultNoCountrySearch = '<li class="error"><div class="noCountryMessage"><em>Sorry, but we are unable to search for addresses in your country at this time, please enter your address manually.</em><p><a class="anotherCountry" href="#">Choose Another Country</a></p></div></li>',
        defaultServiceError = '<li class="error"><div class="serviceErrorMessage"><em>Sorry, but we are unable to search for addresses at this time, please enter your address manually.</em></div></li>',
        defaultNotYourAddress = '<li><div class="notYourAddress"><p>Not your address? <a href="#">Search Again</a>.</p></div></li>',
        defaultNoResultsFound = '<li class="error"><div class="noResults"><em>No addresses found, please provide more information and try again, or <a class="noresult-manual" href="#">enter your address manually</a>.</em></div></li>',
        defaultTooManyResultsFound = '<li class="error"><div class="noResults"><em>Too many matches were found, please try to give more specific details and try again, or <a class="noresult-manual" href="#">enter your address manually</a>.</em></div></li>',
        defaultNoSearchOptions = '<li class="error"><div class="noSearchOptions"><em>Please specify at least one search option and try again.</em></div></li>',
        defaultCantSearch = '<li><span class="CantSearch">or <a href="#">enter your address manually</a>.</span></li>',
        settings = $.extend({
          'StartPoint': '',
          'AddresLine1': '',
          'AddresLine2': '',
          'Town': '',
          'County': '',
          'Country': '',
          'Postcode': '',
          'LineWrapper': '',
          'LineTemplate': defaultPromptTemplate,
          'AddressTemplate': defaultAdressSelectorTemplate,
          'TemplateId': 'AddressLookup',
          'FindButtons': defaultFindButtons,
          'CountrySelectorLine': defaultCountrySelector,
          'NoCountrySearch': defaultNoCountrySearch,
          'ServiceError': defaultServiceError,
          'NotYourAddress': defaultNotYourAddress,
          'NoResultsFound': defaultNoResultsFound,
          'TooManyResults': defaultTooManyResultsFound,
          'NoSearchOptions': defaultNoSearchOptions,
          'CantSearch': defaultCantSearch,
          'SearchComplete': function () { },
          'AfterPromptsShown': function () { },
          'Ready': function() { }
        }, options);

    $.templates({
      promptTemplate: settings.LineTemplate,
      addressTemplate: settings.AddressTemplate,
      countrySelectorTemplate: settings.CountrySelectorLine,
      findAddressButtonTemplate: settings.FindButtons,
      noCountrySearchTemplate: settings.NoCountrySearch,
      serviceErrorTemplate: settings.ServiceError
    });

    return this.each(function () {
      var autocomplete = new AutoComplete(settings, this);

      autocomplete.init(true);
    });
  };
})(jQuery);