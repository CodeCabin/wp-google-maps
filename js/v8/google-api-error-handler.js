/**
 * @namespace WPGMZA
 * @module GoogleAPIErrorHandler
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) { 

	/**
	 * This class catches Google Maps API errors and presents them in a friendly manner, before sending them on to the consoles default error handler.
	 * @class WPGMZA.GoogleAPIErrorHandler
	 * @constructor WPGMZA.GoogleAPIErrorHandler
	 * @memberof WPGMZA
	 */
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
		
		this.errorMessageList = this.element.find(".wpgmza-google-api-error-list");
		this.templateListItem = this.element.find("li.template").remove();
		
		this.messagesAlreadyDisplayed = {};
		
		//if(WPGMZA.settings.developer_mode)
			//return;
		
		// Override error function
		var _error = console.error;
		
		console.error = function(message)
		{
			self.onErrorMessage(message);
			
			_error.apply(this, arguments);
		}
		
		// Check for no API key
		if(
			WPGMZA.settings.engine == "google-maps" 
			&& 
			(!WPGMZA.settings.wpgmza_google_maps_api_key || !WPGMZA.settings.wpgmza_google_maps_api_key.length)
			&&
			WPGMZA.getCurrentPage() != WPGMZA.PAGE_MAP_EDIT
			)
			this.addErrorMessage(WPGMZA.localized_strings.no_google_maps_api_key, ["https://www.wpgmaps.com/documentation/creating-a-google-maps-api-key/"]);
	}
	
	/**
	 * Overrides console.error to scan the error message for Google Maps API error messages.
	 * @method 
	 * @memberof WPGMZA.GoogleAPIErrorHandler
	 * @param {string} message The error message passed to the console
	 */
	WPGMZA.GoogleAPIErrorHandler.prototype.onErrorMessage = function(message)
	{
		var m;
		var regexURL = /http(s)?:\/\/[^\s]+/gm;
		
		if(!message)
			return;
		
		if((m = message.match(/You have exceeded your (daily )?request quota for this API/)) || (m = message.match(/This API project is not authorized to use this API/)) || (m = message.match(/^Geocoding Service: .+/)))
		{
			var urls = message.match(regexURL);
			this.addErrorMessage(m[0], urls);
		}
		else if(m = message.match(/^Google Maps.+error: (.+)\s+(http(s?):\/\/.+)/m))
		{
			this.addErrorMessage(m[1].replace(/([A-Z])/g, " $1"), [m[2]]);
		}
	}
	
	/**
	 * Called by onErrorMessage when a Google Maps API error is picked up, this will add the specified message to the Maps API error message dialog, along with URLs to compliment it. This function ignores duplicate error messages.
	 * @method
	 * @memberof WPGMZA.GoogleAPIErrorHandler
	 * @param {string} message The message, or part of the message, intercepted from the console
	 * @param {array} [urls] An array of URLs relating to the error message to compliment the message.
	 */
	WPGMZA.GoogleAPIErrorHandler.prototype.addErrorMessage = function(message, urls)
	{
		var self = this;
		
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
				
				/*if(url.match(/google.+documentation/))
				{
					// icon = "fa-google";
					icon = "fa-wrench"
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
				}*/
				
				$(button).find("i").addClass(icon);
				$(button).append(text);
			}
			
			buttonContainer.append(button);
		}
		
		$(this.errorMessageList).append(li);
		
		/*if(!this.dialog)
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
		}*/
		
		$("#wpgmza_map, .wpgmza_map").each(function(index, el) {
			
			var container = $(el).find(".wpgmza-google-maps-api-error-overlay");

			if(container.length == 0)
			{
				container = $("<div class='wpgmza-google-maps-api-error-overlay'></div>");
				container.html(self.element.html());
			}
			
			setTimeout(function() {
				$(el).append(container);
			}, 1000);
		});
		
		$(".gm-err-container").parent().css({"z-index": 1});
		
		this.messagesAlreadyDisplayed[message] = true;
	}
	
	WPGMZA.googleAPIErrorHandler = new WPGMZA.GoogleAPIErrorHandler();

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtYXBpLWVycm9yLWhhbmRsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgR29vZ2xlQVBJRXJyb3JIYW5kbGVyXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHsgXHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoaXMgY2xhc3MgY2F0Y2hlcyBHb29nbGUgTWFwcyBBUEkgZXJyb3JzIGFuZCBwcmVzZW50cyB0aGVtIGluIGEgZnJpZW5kbHkgbWFubmVyLCBiZWZvcmUgc2VuZGluZyB0aGVtIG9uIHRvIHRoZSBjb25zb2xlcyBkZWZhdWx0IGVycm9yIGhhbmRsZXIuXHJcblx0ICogQGNsYXNzIFdQR01aQS5Hb29nbGVBUElFcnJvckhhbmRsZXJcclxuXHQgKiBAY29uc3RydWN0b3IgV1BHTVpBLkdvb2dsZUFQSUVycm9ySGFuZGxlclxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkFcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlQVBJRXJyb3JIYW5kbGVyID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0Ly8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgR29vZ2xlIGlzbid0IHRoZSBzZWxlY3RlZCBBUElcclxuXHRcdGlmKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUgIT0gXCJnb29nbGUtbWFwc1wiKVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcclxuXHRcdC8vIE9ubHkgYWxsb3cgb24gdGhlIG1hcCBlZGl0IHBhZ2UsIG9yIGZyb250IGVuZCBpZiB1c2VyIGhhcyBhZG1pbmlzdHJhdG9yIHJvbGVcclxuXHRcdGlmKCEoV1BHTVpBLmN1cnJlbnRQYWdlID09IFwibWFwLWVkaXRcIiB8fCAoV1BHTVpBLmlzX2FkbWluID09IDAgJiYgV1BHTVpBLnVzZXJDYW5BZG1pbmlzdHJhdG9yID09IDEpKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHR0aGlzLmVsZW1lbnQgPSAkKFdQR01aQS5odG1sLmdvb2dsZU1hcHNBUElFcnJvckRpYWxvZyk7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5pc19hZG1pbiA9PSAxKVxyXG5cdFx0XHR0aGlzLmVsZW1lbnQuZmluZChcIi53cGdtemEtZnJvbnQtZW5kLW9ubHlcIikucmVtb3ZlKCk7XHJcblx0XHRcclxuXHRcdHRoaXMuZXJyb3JNZXNzYWdlTGlzdCA9IHRoaXMuZWxlbWVudC5maW5kKFwiLndwZ216YS1nb29nbGUtYXBpLWVycm9yLWxpc3RcIik7XHJcblx0XHR0aGlzLnRlbXBsYXRlTGlzdEl0ZW0gPSB0aGlzLmVsZW1lbnQuZmluZChcImxpLnRlbXBsYXRlXCIpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1lc3NhZ2VzQWxyZWFkeURpc3BsYXllZCA9IHt9O1xyXG5cdFx0XHJcblx0XHQvL2lmKFdQR01aQS5zZXR0aW5ncy5kZXZlbG9wZXJfbW9kZSlcclxuXHRcdFx0Ly9yZXR1cm47XHJcblx0XHRcclxuXHRcdC8vIE92ZXJyaWRlIGVycm9yIGZ1bmN0aW9uXHJcblx0XHR2YXIgX2Vycm9yID0gY29uc29sZS5lcnJvcjtcclxuXHRcdFxyXG5cdFx0Y29uc29sZS5lcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpXHJcblx0XHR7XHJcblx0XHRcdHNlbGYub25FcnJvck1lc3NhZ2UobWVzc2FnZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRfZXJyb3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gQ2hlY2sgZm9yIG5vIEFQSSBrZXlcclxuXHRcdGlmKFxyXG5cdFx0XHRXUEdNWkEuc2V0dGluZ3MuZW5naW5lID09IFwiZ29vZ2xlLW1hcHNcIiBcclxuXHRcdFx0JiYgXHJcblx0XHRcdCghV1BHTVpBLnNldHRpbmdzLndwZ216YV9nb29nbGVfbWFwc19hcGlfa2V5IHx8ICFXUEdNWkEuc2V0dGluZ3Mud3BnbXphX2dvb2dsZV9tYXBzX2FwaV9rZXkubGVuZ3RoKVxyXG5cdFx0XHQmJlxyXG5cdFx0XHRXUEdNWkEuZ2V0Q3VycmVudFBhZ2UoKSAhPSBXUEdNWkEuUEFHRV9NQVBfRURJVFxyXG5cdFx0XHQpXHJcblx0XHRcdHRoaXMuYWRkRXJyb3JNZXNzYWdlKFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5ncy5ub19nb29nbGVfbWFwc19hcGlfa2V5LCBbXCJodHRwczovL3d3dy53cGdtYXBzLmNvbS9kb2N1bWVudGF0aW9uL2NyZWF0aW5nLWEtZ29vZ2xlLW1hcHMtYXBpLWtleS9cIl0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBPdmVycmlkZXMgY29uc29sZS5lcnJvciB0byBzY2FuIHRoZSBlcnJvciBtZXNzYWdlIGZvciBHb29nbGUgTWFwcyBBUEkgZXJyb3IgbWVzc2FnZXMuXHJcblx0ICogQG1ldGhvZCBcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkdvb2dsZUFQSUVycm9ySGFuZGxlclxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlIHBhc3NlZCB0byB0aGUgY29uc29sZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVBUElFcnJvckhhbmRsZXIucHJvdG90eXBlLm9uRXJyb3JNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSlcclxuXHR7XHJcblx0XHR2YXIgbTtcclxuXHRcdHZhciByZWdleFVSTCA9IC9odHRwKHMpPzpcXC9cXC9bXlxcc10rL2dtO1xyXG5cdFx0XHJcblx0XHRpZighbWVzc2FnZSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRpZigobSA9IG1lc3NhZ2UubWF0Y2goL1lvdSBoYXZlIGV4Y2VlZGVkIHlvdXIgKGRhaWx5ICk/cmVxdWVzdCBxdW90YSBmb3IgdGhpcyBBUEkvKSkgfHwgKG0gPSBtZXNzYWdlLm1hdGNoKC9UaGlzIEFQSSBwcm9qZWN0IGlzIG5vdCBhdXRob3JpemVkIHRvIHVzZSB0aGlzIEFQSS8pKSB8fCAobSA9IG1lc3NhZ2UubWF0Y2goL15HZW9jb2RpbmcgU2VydmljZTogLisvKSkpXHJcblx0XHR7XHJcblx0XHRcdHZhciB1cmxzID0gbWVzc2FnZS5tYXRjaChyZWdleFVSTCk7XHJcblx0XHRcdHRoaXMuYWRkRXJyb3JNZXNzYWdlKG1bMF0sIHVybHMpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihtID0gbWVzc2FnZS5tYXRjaCgvXkdvb2dsZSBNYXBzLitlcnJvcjogKC4rKVxccysoaHR0cChzPyk6XFwvXFwvLispL20pKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmFkZEVycm9yTWVzc2FnZShtWzFdLnJlcGxhY2UoLyhbQS1aXSkvZywgXCIgJDFcIiksIFttWzJdXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENhbGxlZCBieSBvbkVycm9yTWVzc2FnZSB3aGVuIGEgR29vZ2xlIE1hcHMgQVBJIGVycm9yIGlzIHBpY2tlZCB1cCwgdGhpcyB3aWxsIGFkZCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UgdG8gdGhlIE1hcHMgQVBJIGVycm9yIG1lc3NhZ2UgZGlhbG9nLCBhbG9uZyB3aXRoIFVSTHMgdG8gY29tcGxpbWVudCBpdC4gVGhpcyBmdW5jdGlvbiBpZ25vcmVzIGR1cGxpY2F0ZSBlcnJvciBtZXNzYWdlcy5cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Hb29nbGVBUElFcnJvckhhbmRsZXJcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSwgb3IgcGFydCBvZiB0aGUgbWVzc2FnZSwgaW50ZXJjZXB0ZWQgZnJvbSB0aGUgY29uc29sZVxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IFt1cmxzXSBBbiBhcnJheSBvZiBVUkxzIHJlbGF0aW5nIHRvIHRoZSBlcnJvciBtZXNzYWdlIHRvIGNvbXBsaW1lbnQgdGhlIG1lc3NhZ2UuXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZUFQSUVycm9ySGFuZGxlci5wcm90b3R5cGUuYWRkRXJyb3JNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSwgdXJscylcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMubWVzc2FnZXNBbHJlYWR5RGlzcGxheWVkW21lc3NhZ2VdKVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcclxuXHRcdHZhciBsaSA9IHRoaXMudGVtcGxhdGVMaXN0SXRlbS5jbG9uZSgpO1xyXG5cdFx0JChsaSkuZmluZChcIi53cGdtemEtbWVzc2FnZVwiKS5odG1sKG1lc3NhZ2UpO1xyXG5cdFx0XHJcblx0XHR2YXIgYnV0dG9uQ29udGFpbmVyID0gJChsaSkuZmluZChcIi53cGdtemEtZG9jdW1lbnRhdGlvbi1idXR0b25zXCIpO1xyXG5cdFx0XHJcblx0XHR2YXIgYnV0dG9uVGVtcGxhdGUgPSAkKGxpKS5maW5kKFwiLndwZ216YS1kb2N1bWVudGF0aW9uLWJ1dHRvbnM+YVwiKTtcclxuXHRcdGJ1dHRvblRlbXBsYXRlLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0XHRpZih1cmxzICYmIHVybHMubGVuZ3RoKVxyXG5cdFx0e1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciB1cmwgPSB1cmxzW2ldO1xyXG5cdFx0XHRcdHZhciBidXR0b24gPSBidXR0b25UZW1wbGF0ZS5jbG9uZSgpO1xyXG5cdFx0XHRcdHZhciBpY29uID0gXCJmYS1leHRlcm5hbC1saW5rXCI7XHJcblx0XHRcdFx0dmFyIHRleHQgPSBXUEdNWkEubG9jYWxpemVkX3N0cmluZ3MuZG9jdW1lbnRhdGlvbjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRidXR0b24uYXR0cihcImhyZWZcIiwgdXJsc1tpXSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0LyppZih1cmwubWF0Y2goL2dvb2dsZS4rZG9jdW1lbnRhdGlvbi8pKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdC8vIGljb24gPSBcImZhLWdvb2dsZVwiO1xyXG5cdFx0XHRcdFx0aWNvbiA9IFwiZmEtd3JlbmNoXCJcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBpZih1cmwubWF0Y2goL21hcHMtbm8tYWNjb3VudC8pKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGljb24gPSBcImZhLXdyZW5jaFwiXHJcblx0XHRcdFx0XHR0ZXh0ID0gV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLnZlcmlmeV9wcm9qZWN0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIGlmKHVybC5tYXRjaCgvY29uc29sZVxcLmRldmVsb3BlcnNcXC5nb29nbGUvKSlcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRpY29uID0gXCJmYS13cmVuY2hcIjtcclxuXHRcdFx0XHRcdHRleHQgPSBXUEdNWkEubG9jYWxpemVkX3N0cmluZ3MuYXBpX2Rhc2hib2FyZDtcclxuXHRcdFx0XHR9Ki9cclxuXHRcdFx0XHRcclxuXHRcdFx0XHQkKGJ1dHRvbikuZmluZChcImlcIikuYWRkQ2xhc3MoaWNvbik7XHJcblx0XHRcdFx0JChidXR0b24pLmFwcGVuZCh0ZXh0KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0YnV0dG9uQ29udGFpbmVyLmFwcGVuZChidXR0b24pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQkKHRoaXMuZXJyb3JNZXNzYWdlTGlzdCkuYXBwZW5kKGxpKTtcclxuXHRcdFxyXG5cdFx0LyppZighdGhpcy5kaWFsb2cpXHJcblx0XHRcdHRoaXMuZGlhbG9nID0gJCh0aGlzLmVsZW1lbnQpLnJlbW9kYWwoKTtcclxuXHRcdFxyXG5cdFx0c3dpdGNoKHRoaXMuZGlhbG9nLmdldFN0YXRlKCkpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJvcGVuXCI6XHJcblx0XHRcdGNhc2UgXCJvcGVuZWRcIjpcclxuXHRcdFx0Y2FzZSBcIm9wZW5pbmdcIjpcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHR0aGlzLmRpYWxvZy5vcGVuKCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9Ki9cclxuXHRcdFxyXG5cdFx0JChcIiN3cGdtemFfbWFwLCAud3BnbXphX21hcFwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNvbnRhaW5lciA9ICQoZWwpLmZpbmQoXCIud3BnbXphLWdvb2dsZS1tYXBzLWFwaS1lcnJvci1vdmVybGF5XCIpO1xyXG5cclxuXHRcdFx0aWYoY29udGFpbmVyLmxlbmd0aCA9PSAwKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Y29udGFpbmVyID0gJChcIjxkaXYgY2xhc3M9J3dwZ216YS1nb29nbGUtbWFwcy1hcGktZXJyb3Itb3ZlcmxheSc+PC9kaXY+XCIpO1xyXG5cdFx0XHRcdGNvbnRhaW5lci5odG1sKHNlbGYuZWxlbWVudC5odG1sKCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCQoZWwpLmFwcGVuZChjb250YWluZXIpO1xyXG5cdFx0XHR9LCAxMDAwKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKFwiLmdtLWVyci1jb250YWluZXJcIikucGFyZW50KCkuY3NzKHtcInotaW5kZXhcIjogMX0pO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1lc3NhZ2VzQWxyZWFkeURpc3BsYXllZFttZXNzYWdlXSA9IHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5nb29nbGVBUElFcnJvckhhbmRsZXIgPSBuZXcgV1BHTVpBLkdvb2dsZUFQSUVycm9ySGFuZGxlcigpO1xyXG5cclxufSk7Il0sImZpbGUiOiJnb29nbGUtYXBpLWVycm9yLWhhbmRsZXIuanMifQ==
