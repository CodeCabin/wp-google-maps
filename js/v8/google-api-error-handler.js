/**
 * @namespace WPGMZA
 * @module GoogleAPIErrorHandler
 * @requires WPGMZA
 */
jQuery(function($) { 

	WPGMZA.GoogleAPIErrorHandler = function() {
		
		var self = this;
		
		// Don't do anything if Google isn't the selected API
		if(WPGMZA.settings.engine != "google-maps")
			return;
		
		// Only allow on the map edit page, or front end if user has administrator role
		if(!(WPGMZA.currentPage == "map-edit" || (WPGMZA.is_admin == 0 && WPGMZA.userCanAdministrator == 1)))
			return;
		
		this.element = $(WPGMZA.html.googleMapsAPIErrorDialog);
		
		if(WPGMZA.is_admin == 1)
			this.element.find(".wpgmza-front-end-only").remove();
		
		this.errorMessageList = this.element.find("#wpgmza-google-api-error-list");
		this.templateListItem = this.element.find("li.template").remove();
		
		this.messagesAlreadyDisplayed = {};
		
		if(WPGMZA.settings.developer_mode)
			return;
		
		// Override error function
		var _error = console.error;
		
		console.error = function(message)
		{
			self.onErrorMessage(message);
			
			_error.apply(this, arguments);
		}
	}
	
	WPGMZA.GoogleAPIErrorHandler.prototype.onErrorMessage = function(message)
	{
		var m;
		var regexURL = /http(s)?:\/\/[^\s]+/gm;
		
		if((m = message.match(/You have exceeded your (daily )?request quota for this API/)) || (m = message.match(/This API project is not authorized to use this API/)))
		{
			var urls = message.match(regexURL);
			this.addErrorMessage(m[0], urls);
		}
		else if(m = message.match(/^Google Maps.+error: (.+)\s+(http(s?):\/\/.+)/m))
		{
			this.addErrorMessage(m[1].replace(/([A-Z])/g, " $1"), [m[2]]);
		}
	}
	
	WPGMZA.GoogleAPIErrorHandler.prototype.addErrorMessage = function(message, urls)
	{
		if(this.messagesAlreadyDisplayed[message])
			return;
		
		var li = this.templateListItem.clone();
		$(li).find(".wpgmza-message").html(message);
		
		var buttonContainer = $(li).find(".wpgmza-documentation-buttons");
		
		var buttonTemplate = $(li).find(".wpgmza-documentation-buttons>a");
		buttonTemplate.remove();
		
		if(urls && urls.length)
		{
			for(var i = 0; i < urls.length; i++)
			{
				var url = urls[i];
				var button = buttonTemplate.clone();
				var icon = "fa-external-link";
				var text = WPGMZA.localized_strings.documentation;
				
				button.attr("href", urls[i]);
				
				if(url.match(/google.+documentation/))
				{
					icon = "fa-google";
				}
				else if(url.match(/maps-no-account/))
				{
					icon = "fa-wrench"
					text = WPGMZA.localized_strings.verify_project;
				}
				else if(url.match(/console\.developers\.google/))
				{
					icon = "fa-wrench";
					text = WPGMZA.localized_strings.api_dashboard;
				}
				
				$(button).find("i").addClass(icon);
				$(button).append(text);
			}
			
			buttonContainer.append(button);
		}
		
		$(this.errorMessageList).append(li);
		
		if(!this.dialog)
			this.dialog = $(this.element).remodal();
		
		switch(this.dialog.getState())
		{
			case "open":
			case "opened":
			case "opening":
				break;
				
			default:
				this.dialog.open();
				break;
		}
		
		this.messagesAlreadyDisplayed[message] = true;
	}
	
	WPGMZA.googleAPIErrorHandler = new WPGMZA.GoogleAPIErrorHandler();

});