/**
 * @namespace WPGMZA
 * @module MarkerPanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.MarkerPanel = function(element, mapEditPage)
	{
		WPGMZA.FeaturePanel.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.MarkerPanel, WPGMZA.FeaturePanel);
	
	WPGMZA.MarkerPanel.createInstance = function(element, mapEditPage)
	{
		if(WPGMZA.isProVersion())
			return new WPGMZA.ProMarkerPanel(element, mapEditPage);
		
		return new WPGMZA.MarkerPanel(element, mapEditPage);
	}

	WPGMZA.MarkerPanel.prototype.initDefaults = function(){
		var self = this;
		
		WPGMZA.FeaturePanel.prototype.initDefaults.apply(this, arguments);
		
		this.adjustSubMode = false;

		if(WPGMZA.InternalEngine.isLegacy()){
			/* Only applies in legacy */
			this.onTabActivated(null);
		}

		$(document.body).on("click", "[data-adjust-" + this.featureType + "-id]", function(event) {
			self.onAdjustFeature(event);
		});

		$(document.body).on("click", ".wpgmza_approve_btn", function(event) {
			self.onApproveMarker(event);
		});
		
	}

	WPGMZA.MarkerPanel.prototype.onAdjustFeature = function(event){
		var self		= this;
		var name		= "data-adjust-" + this.featureType + "-id";
		var id			= $(event.currentTarget).attr(name);

		this.discardChanges();

		this.adjustSubMode = true;

		this.select(id);
	}

	WPGMZA.MarkerPanel.prototype.onApproveMarker = function(event){
		var self		= this;
		
		var route		= "/" + this.featureType + "s/" + $(event.currentTarget).attr('id');
		WPGMZA.restAPI.call(route, {
			method:		"POST",
			data:		{
				approved : "1"
			},
			success:	function(data, status, xhr) {
				self.featureDataTable.reload();
			}
		});
	}

	WPGMZA.MarkerPanel.prototype.onFeatureChanged = function(event){
		if(this.adjustSubMode){
			var aPos = this.feature.getPosition();

			if(aPos){
				$(this.element).find("[data-ajax-name='lat']").val(aPos.lat);
				$(this.element).find("[data-ajax-name='lng']").val(aPos.lng);
			}
			// Exit early, we don't want to adjust the address
			return;
		}

		var addressField = $(this.element).find("input[data-ajax-name$='address']");
		
		if(!addressField.length)
			return;
		
		var pos = this.feature.getPosition();
		addressField.val(pos.lat + ', ' + pos.lng);
		addressField.trigger('change');
	}

	WPGMZA.MarkerPanel.prototype.setTargetFeature = function(feature){
		if(WPGMZA.FeaturePanel.prevEditableFeature){
			var prev = WPGMZA.FeaturePanel.prevEditableFeature;
			
			if(prev.setOpacity){
				prev.setOpacity(1);
			}
		}


		/**
		 * We could probably make this adjust mode code more elegant in the future
		 *
		 * Temporary solution as it is causing trouble for clients 
		 *
		 * Date: 2021-01-15
		*/
		$(this.element).find('[data-ajax-name]').removeAttr('disabled');
		$(this.element).find('fieldset').show();
		$(this.element).find('.wpgmza-adjust-mode-notice').addClass('wpgmza-hidden');

		$(this.element).find('[data-ajax-name="lat"]').attr('type', 'hidden');
		$(this.element).find('[data-ajax-name="lng"]').attr('type', 'hidden');

		$(this.element).find('.wpgmza-hide-in-adjust-mode').removeClass('wpgmza-hidden');				
		$(this.element).find('.wpgmza-show-in-adjust-mode').addClass('wpgmza-hidden');

		/* Re-add disabled attribute to pro feature fields */
		$(this.element).find('.wpgmza-pro-feature [data-ajax-name]').attr('disabled', 'disabled');

		if(feature){
			if(feature.setOpacity){
				feature.setOpacity(0.7);
			}

			feature.getMap().panTo(feature.getPosition());

			if(this.adjustSubMode){
				$(this.element).find('[data-ajax-name]').attr('disabled', 'disabled');
				$(this.element).find('fieldset:not(.wpgmza-always-on)').hide();
				$(this.element).find('.wpgmza-adjust-mode-notice').removeClass('wpgmza-hidden');

				$(this.element).find('[data-ajax-name="lat"]').attr('type', 'text').removeAttr('disabled');
				$(this.element).find('[data-ajax-name="lng"]').attr('type', 'text').removeAttr('disabled');

				$(this.element).find('.wpgmza-hide-in-adjust-mode').addClass('wpgmza-hidden');				
				$(this.element).find('.wpgmza-show-in-adjust-mode').removeClass('wpgmza-hidden');				
			}
		} else {
			this.adjustSubMode = false;
		}

		WPGMZA.FeaturePanel.prototype.setTargetFeature.apply(this, arguments);
	}
	
	WPGMZA.MarkerPanel.prototype.onSave = function(event)
	{
		var self		= this;
		var geocoder	= WPGMZA.Geocoder.createInstance();
		var address		= $(this.element).find("[data-ajax-name='address']").val();

		var geocodingData = {
			address: address
		}

		
		WPGMZA.mapEditPage.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		this.showPreloader(true);
		
		// New cloud functions
		var cloud_lat = false;
		var cloud_lng = false;

		// is the lat and lng set from the WPGM Cloud Search?
		if (document.getElementsByName("lat").length > 0) { cloud_lat = document.getElementsByName("lat")[0].value; }
		if (document.getElementsByName("lng").length > 0) { cloud_lng = document.getElementsByName("lng")[0].value; }

		if (cloud_lat && cloud_lng) {
			if(!WPGMZA_localized_data.settings.googleMapsApiKey || WPGMZA_localized_data.settings.googleMapsApiKey === ''){
				//Let's only do this if it's not their own key, this causes issues with repositioning a marker 
				geocodingData.lat = parseFloat(cloud_lat);
				geocodingData.lng = parseFloat(cloud_lng);
			}
		}
		
		var addressUnchanged = !this.hasDirtyField('address');

		if(this.adjustSubMode || addressUnchanged){
			// Trust the force!
			WPGMZA.FeaturePanel.prototype.onSave.apply(self, arguments);
		} else {
			geocoder.geocode(geocodingData, function(results, status) {
				switch(status)
				{
					case WPGMZA.Geocoder.ZERO_RESULTS:
						alert(WPGMZA.localized_strings.zero_results);
						self.showPreloader(false);
						return;
						break;
					
					case WPGMZA.Geocoder.SUCCESS:	
						break;

					case WPGMZA.Geocoder.NO_ADDRESS:
						alert(WPGMZA.localized_strings.no_address);
						self.showPreloader(false);
						return;
						break;

					
					case WPGMZA.Geocoder.FAIL:
					default:
						alert(WPGMZA.localized_strings.geocode_fail);
						self.showPreloader(false);
						return;
						break;
				}
				
				var result = results[0];
				
				$(self.element).find("[data-ajax-name='lat']").val(result.lat);
				$(self.element).find("[data-ajax-name='lng']").val(result.lng);
				WPGMZA.FeaturePanel.prototype.onSave.apply(self, arguments);
				
			});
		}

		WPGMZA.mapEditPage.map.resetBounds();
	}

});