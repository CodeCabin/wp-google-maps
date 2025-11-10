/**
 * @namespace WPGMZA
 * @module SettingsPage
 * @requires WPGMZA
 */

var $_GET = {};
if(document.location.toString().indexOf('?') !== -1) {
    var query = document.location
                   .toString()
                   // get the query string
                   .replace(/^.*?\?/, '')
                   // and remove any existing hash string (thanks, @vrijdenker)
                   .replace(/#.*$/, '')
                   .split('&');

    for(var wpgmza_i=0, wpgmza_l=query.length; wpgmza_i<wpgmza_l; wpgmza_i++) {
       var aux = decodeURIComponent(query[wpgmza_i]).split('=');
       $_GET[aux[0]] = aux[1];
    }
}

jQuery(function($) {
	
	WPGMZA.SettingsPage = function()
	{
		var self = this;
		
		this._keypressHistory = [];
		this._codemirrors = {};
		
		this.updateEngineSpecificControls();
		this.updateMarkerRenderSpecificControls();
		this.updateAddressProviderSpecificControls();
		this.updateStorageControls();
		this.updateBatchControls();
		this.updateGDPRControls();
		this.updateWooControls();
		this.updateInsightsControls();
		
		//$("#wpgmza-developer-mode").hide();
		$(window).on("keypress", function(event) {
			self.onKeyPress(event);
		});


		

		
		jQuery('body').on('click',".wpgmza_destroy_data", function(e) {
			e.preventDefault();
			var ttype = jQuery(this).attr('danger');
			var warning = 'Are you sure?';
			if (ttype == 'wpgmza_destroy_all_data') { warning = 'Are you sure? This will delete ALL data and settings for WP Go Maps!'; }

			let destroyPacket = {
				action: 'wpgmza_maps_settings_danger_zone_delete_data',
				type: ttype,
				nonce: wpgmza_dz_nonce
			};

			if(ttype == 'wpgmza_destroy_by_map'){
				destroyPacket.map_id = $('.wpgmza-danger-zone-map-target-select select').val();
				destroyPacket.data_type = $('.wpgmza-danger-zone-map-target-data-select').val();

				warning = `Are you sure? This will delete all ${destroyPacket.data_type} for map ID: ${destroyPacket.map_id}`;
			}

			if (window.confirm(warning)) {
				jQuery.ajax(WPGMZA.ajaxurl, {
		    		method: 'POST',
		    		data: destroyPacket,
		    		success: function(response, status, xhr) {
		    			if (ttype == 'wpgmza_destroy_all_data') {
		    				window.location.replace('admin.php?page=wp-google-maps-menu&action=welcome_page');
		    			} else if (ttype == 'wpgmza_reset_all_settings') {
		    				window.location.reload();
		    			}  else {
		    				alert('Complete.');
		    			}
		    			
	    			}
		    	});
	        }

			

		});

		
		$("select[name='wpgmza_maps_engine']").on("change", function(event) {
			self.updateEngineSpecificControls();
		});

		$("input[name='wpgmza_maps_engine']").on("change", function(event) {
			self.updateEngineSpecificControls();
		});

		$("select[name='googleMarkerMode']").on('change', function(event){
			/* For google maps, let's just trigger the event dispatch for render mode - Later, we'll do the same with OL I imagine */
			self.updateMarkerRenderSpecificControls();
		})

		$("select[name='address_provider']").on('change', function(event) {
			self.updateAddressProviderSpecificControls();
		});
		
		$('[name="wpgmza_settings_marker_pull"]').on('click', function(event) {
			self.updateStorageControls();
		});

		$('input[name="enable_batch_loading"]').on('change', function(event) {
			self.updateBatchControls();
		});
		
		$("input[name='wpgmza_gdpr_require_consent_before_load'], input[name='wpgmza_gdpr_require_consent_before_vgm_submit'], input[name='wpgmza_gdpr_override_notice']").on("change", function(event) {
			self.updateGDPRControls();
		});

		$('input[name="woo_checkout_map_enabled"]').on('change', function(event) {
			self.updateWooControls();
		});

		$('input[name="enable_insights"]').on('change', function(event) {
			self.updateInsightsControls();
		});

		$('select[name="tile_server_url"]').on('change', function(event){
			if($('select[name="tile_server_url"]').val() === "custom_override"){
				$('.wpgmza_tile_server_override_component').removeClass('wpgmza-hidden');
			} else {
				$('.wpgmza_tile_server_override_component').addClass('wpgmza-hidden');
			}
		});
		$('select[name="tile_server_url"]').trigger('change');
		
		jQuery('#wpgmza_flush_cache_btn').on('click', function(){
			jQuery(this).attr('disabled', 'disabled');
			WPGMZA.settingsPage.flushGeocodeCache();
		});
		
		$("#wpgmza-global-settings").tabs({
	       create: function(event, ui) {
	       		
	       	if (typeof $_GET['highlight'] !== 'undefined') {

					var elmnt = document.getElementById($_GET['highlight']);
					elmnt.classList.add('highlight-item');
					
					setTimeout(function() {
						elmnt.classList.add('highlight-item-step-2');	
					},1000);
					
					var yOffset = -100; 
					var y = elmnt.getBoundingClientRect().top + window.pageYOffset + yOffset;
					window.scrollTo({top: y, behavior: 'smooth'});
				
				}
	       },
	       activate: function(event, ui){
	       	for(var i in self._codemirrors){
	       		self._codemirrors[i].refresh();
	       	}

			/* Trigger tile server update changes */
			$(document.body).trigger('tileserverpreview.update.wpgmza');
	       }
	    });

	    $( "#wpgmza-global-setting" ).on( "create", function(event, ui) {
			/* Not used */
			// alert('now');
		});
		
		$("#wpgmza-global-settings fieldset").each(function(index, el) {
			
			var children = $(el).children(":not(legend)");
			children.wrapAll("<span class='settings-group'></span>");
			
		});

		$("textarea[name^='wpgmza_custom_']").each(function(){
			var name = $(this).attr('name');
			var type = name.replace("wpgmza_custom_", "") === "js" ? "javascript" : "css";

			self._codemirrors[name] = wp.CodeMirror.fromTextArea(this, {
				lineNumbers: true,
				mode: type,
				theme: "wpgmza"
			});

			self._codemirrors[name].on('change', function(instance){
				instance.save();
			});

			self._codemirrors[name].refresh();
		});

		$('.wpgmza-integration-tool-button').on('click', function(event){
			event.preventDefault();
			const type = $(this).data('tool-type');
			if(type){
				const data = {
					type : type
				};

				const button = $(this);
				button.attr('disabled', 'disabled');

				WPGMZA.restAPI.call("/integration-tools/", {
					method:	"POST",
					data:	data,
					success: function(data, status, xhr) {
						button.removeAttr('disabled');

						if(data){
							if(data.type){
								switch(data.type){
									case 'test_collation':
										if(!data.success){
											$('.wpgmza-integration-tool-button[data-tool-type="test_collation"]').addClass('wpgmza-hidden');
											$('.wpgmza-integration-tool-button[data-tool-type="resolve_collation"]').removeClass('wpgmza-hidden');
										}

										if(data.message){
											window.alert(data.message);
										}
										break;
									case 'resolve_collation':
										if(!data.success){
											$('.wpgmza-integration-tool-button[data-tool-type="test_collation"]').removeClass('wpgmza-hidden');
											$('.wpgmza-integration-tool-button[data-tool-type="resolve_collation"]').addClass('wpgmza-hidden');
										}

										if(data.message){
											window.alert(data.message);
										}
										break;
									default:
										if(data.message){
											window.alert(data.message);
										}
										break;
								}
							}
						}
					}
				});

			}
		});

		$('.wpgmza-system-health-tool-button').on('click', function(event){
			event.preventDefault();
			const type = $(this).data('tool-type');
			if(type){
				const data = {
					type : type
				};

				const button = $(this);
				button.attr('disabled', 'disabled');

				WPGMZA.restAPI.call("/system-health-tools/", {
					method:	"POST",
					data:	data,
					success: function(data, status, xhr) {
						button.removeAttr('disabled');
						if(data){
							if(data.message){
								window.alert(data.message);
							}
						}
					}
				});
			}
		});

		$('.wpgmza-performance-tool-button').on('click', function(event){
			event.preventDefault();
			const type = $(this).data('tool-type');
			if(type){
				const data = {
					type : type
				};

				const button = $(this);
				button.attr('disabled', 'disabled');

				WPGMZA.restAPI.call("/performance-tools/", {
					method:	"POST",
					data:	data,
					success: function(data, status, xhr) {
						button.removeAttr('disabled');
						if(data){
							if(data.message){
								window.alert(data.message);
							}
						}
					}
				});
			}
		});
	}
	
	WPGMZA.SettingsPage.createInstance = function()
	{
		return new WPGMZA.SettingsPage();
	}
	
	/**
	 * Updates engine specific controls, hiding irrelevant controls (eg Google controls when OpenLayers is the selected engine) and showing relevant controls.
	 * @method
	 * @memberof WPGMZA.SettingsPage
	 */
	WPGMZA.SettingsPage.prototype.updateEngineSpecificControls = function(){
		let engine = $("select[name='wpgmza_maps_engine']").val();
		if($("select[name='wpgmza_maps_engine']").length <= 0){
			/* Likely using the new grid selector */
			engine = $('input[type="radio"][name="wpgmza_maps_engine"]:checked').val();
		}
		
		$("[data-required-maps-engine]").each((index, element) => {
			element = $(element);
			let supported = element.data('required-maps-engine');
			if(supported){
				supported = supported.split('|');
				if(supported.indexOf(engine) !== -1){
					element.show();
				} else {
					element.hide();
				}
			}
		});

		/* Trigger tile server update changes */
		$(document.body).trigger('tileserverpreview.update.wpgmza');

		this.updateMarkerRenderSpecificControls();
	}

	WPGMZA.SettingsPage.prototype.updateMarkerRenderSpecificControls = function(){
		let engine = $("select[name='wpgmza_maps_engine']").val();
		if($("select[name='wpgmza_maps_engine']").length <= 0){
			/* Likely using the new grid selector */
			engine = $('input[type="radio"][name="wpgmza_maps_engine"]:checked').val();
		}
		
		let renderMode = false;
		if(engine === 'google-maps'){
			renderMode = $("select[name='googleMarkerMode']").val();
		} else if(engine === 'open-layers' || engine === 'open-layers-latest'){
			renderMode = $("select[name='olMarkerMode']").val();
		}

		const compileMode = `${engine}.${renderMode}`;
		$("[data-required-marker-renderer]").each((index, element) => {
			element = $(element);
			let target = element.data('required-marker-renderer');
			if(target){
				if(target === compileMode){
					element.show();
				} else {
					element.hide();
				}
			}
		});

		/* Trigger tile server update changes */
		$(document.body).trigger('tileserverpreview.update.wpgmza');
	}

	WPGMZA.SettingsPage.prototype.updateAddressProviderSpecificControls = function(){
		let provider = $("select[name='address_provider']").val();

		$("[data-required-address-provider]").each((index, element) => {
			element = $(element);
			let supported = element.data('required-address-provider');
			if(supported){
				supported = supported.split('|');
				if(supported.indexOf(provider) !== -1){
					element.show();
				} else {
					element.hide();
				}
			}
		});

		$(document.body).trigger('addressprovider.update.wpgmza');
	}
	
	WPGMZA.SettingsPage.prototype.updateStorageControls = function()
	{
		if($("input[name='wpgmza_settings_marker_pull'][value='1']").is(":checked"))
			$("#xml-cache-settings").show();
		else
			$("#xml-cache-settings").hide();
	}

	WPGMZA.SettingsPage.prototype.updateBatchControls = function(){
		if($("input[name='enable_batch_loading']").is(":checked")){
			$('#batch-loader-settings').show();
		} else {
			$('#batch-loader-settings').hide();
		}
	}
	
	/**
	 * Updates the GDPR controls (eg visibility state) based on the selected GDPR settings
	 * @method
	 * @memberof WPGMZA.SettingsPage
	 */
	WPGMZA.SettingsPage.prototype.updateGDPRControls = function()
	{
		var showNoticeControls = $("input[name='wpgmza_gdpr_require_consent_before_load']").prop("checked");
		
		var vgmCheckbox = $("input[name='wpgmza_gdpr_require_consent_before_vgm_submit']");
		
		if(vgmCheckbox.length)
			showNoticeControls = showNoticeControls || vgmCheckbox.prop("checked");
		
		var showOverrideTextarea = showNoticeControls && $("input[name='wpgmza_gdpr_override_notice']").prop("checked");
		
		if(showNoticeControls) {
			$("#wpgmza-gdpr-compliance-notice").show(WPGMZA.InternalEngine.isLegacy() ? "slow" : false);
		} else {
			$("#wpgmza-gdpr-compliance-notice").hide(WPGMZA.InternalEngine.isLegacy() ? "slow" : false);
		}
		
		if(showOverrideTextarea) {
			$("#wpgmza_gdpr_override_notice_text").show(WPGMZA.InternalEngine.isLegacy() ? "slow" : false);
		} else {
			$("#wpgmza_gdpr_override_notice_text").hide(WPGMZA.InternalEngine.isLegacy() ? "slow" : false);
		}
	}

	/**
	 * Update the Woo controls (visibility etc) based on toggle selections
	 * @method
	 * @memberof WPGMZA.SettingsPage
	*/
	WPGMZA.SettingsPage.prototype.updateWooControls = function(){
		const showMapSelect =  $("input[name='woo_checkout_map_enabled']").prop("checked");
		if(showMapSelect){
			$('.woo-checkout-maps-select-row').show();
		} else {
			$('.woo-checkout-maps-select-row').hide();
		}
	}

	/**
	 * Update the Insight controls (visibility etc) based on toggle selections
	 * @method
	 * @memberof WPGMZA.SettingsPage
	*/
	WPGMZA.SettingsPage.prototype.updateInsightsControls = function(){
		const showInsightControls =  $("input[name='enable_insights']").prop("checked");
		if(showInsightControls){
			$('.wpgmza-insights-controls').show();
		} else {
			$('.wpgmza-insights-controls').hide();
		}
	}

	/**
	 * Flushes the geocode cache
	 */
	WPGMZA.SettingsPage.prototype.flushGeocodeCache = function()
	{
		var OLGeocoder = new WPGMZA.OLGeocoder();
		OLGeocoder.clearCache(function(response){
			jQuery('#wpgmza_flush_cache_btn').removeAttr('disabled');
		});
	}
	
	WPGMZA.SettingsPage.prototype.onKeyPress = function(event)
	{
		var string;
		
		this._keypressHistory.push(event.key);
		
		if(this._keypressHistory.length > 9)
			this._keypressHistory = this._keypressHistory.slice(this._keypressHistory.length - 9);
		
		string = this._keypressHistory.join("");
		
		if(string == "codecabin" && !this._developerModeRevealed)
		{
			$("fieldset#wpgmza-developer-mode").show();
			this._developerModeRevealed = true;
		}
	}
	
	$(document).ready(function(event) {
		
		if(WPGMZA.getCurrentPage())
			WPGMZA.settingsPage = WPGMZA.SettingsPage.createInstance();
		
	});
	
});