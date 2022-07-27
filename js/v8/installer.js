/**
 * @namespace WPGMZA
 * @module Installer
 * @requires WPGMZA.EventDispatcher
 */


jQuery(function($) {
	/*
	 * General note on this code:
	 * - This is messy at the moment, although modular, it needs to be restructured a bit later on
	*/
	if(WPGMZA.currentPage != "installer")
		return;

	WPGMZA.Installer = function(){
		var self = this;

        WPGMZA.EventDispatcher.apply(this);

		this.element = $(document.body).find('.wpgmza-installer-steps');
		this.skipButton = $(document.body).find('.wpgmza-installer-skip');

		if(this.element.length <= 0){
			return;
		}

		this.redirectUrl = this.element.data('redirect');

		this.step = 0;
		this.max = 0;
		this.findMax();

		

		$(this.element).on('click', '.next-step-button', function(event){
			self.next();
		});

		$(this.element).on('click', '.prev-step-button', function(event){
			self.prev();
		});

		$(this.element).on('click', '.sub-step-trigger', function(event){
			self.triggerSubStep($(this));
		});

		$(this.element).on('change', 'input[name="wpgmza_maps_engine"]', function(event){
			self.setEngine($(this).val());
		});

		$(this.element).on('keyup change', 'input[name="api_key"]', function(event){
			self.setApiKey($(this).val());
		});

		$(this.element).on('change', 'select[name="tile_server_url"]', function(event){
			self.setTileServer($(this).val());
		});

		$(this.element).on('click', '.google-maps-auto-key-form-wrapper .wpgmza-button', function(event){
			self.getAutoKey();
		});

		$(this.element).on('click', '.launcher-trigger', function(event){
			const launcher = $(this).data('launcher');
			if(launcher){
				switch(launcher){
					case 'google-maps-quick-start-launcher':
						self.launchQuickStart();
						break;
				}
			}
		});

		this.skipButton.on('click', function(event){
			event.preventDefault();
			self.skip();
		});

		let defaultEngine = (WPGMZA && WPGMZA.settings && WPGMZA.settings.engine) ? WPGMZA.settings.engine : 'google-maps';
		$(this.element).find('input[name="wpgmza_maps_engine"][value="' + defaultEngine + '"]').prop('checked', true).trigger('change');

		let currentApiKey = (WPGMZA && WPGMZA.settings && WPGMZA.settings.googleMapsApiKey) ? WPGMZA.settings.googleMapsApiKey : '';
		this.element.find('input[name="api_key"]').val(currentApiKey).trigger('change');

		this.trigger('init.installer.admin');
		this.loadStep(this.step);

		this.checkAutoSkip();
	}

	WPGMZA.extend(WPGMZA.Installer, WPGMZA.EventDispatcher);

	WPGMZA.Installer.NODE_SERVER = "https://wpgmaps.us-3.evennode.com/api/v1/";

	WPGMZA.Installer.createInstance = function(){
		return new WPGMZA.Installer();
	}

	WPGMZA.Installer.prototype.findMax = function(){
		var self = this;
		$(this.element).find('.step').each(function(){
			if(parseInt($(this).data('step')) > self.max){
				self.max = parseInt($(this).data('step'));
			}
		});
	}

	WPGMZA.Installer.prototype.prepareAddressFields = function(){
		$(this.element).find("input.wpgmza-address").each(function(index, el) {
			el.addressInput = WPGMZA.AddressInput.createInstance(el, null);
		});
	}

	WPGMZA.Installer.prototype.next = function(){
		if(this.step < this.max){
			this.loadStep(this.step + 1);
		} else {
			this.complete();
		}
	}

	WPGMZA.Installer.prototype.prev = function(){
		if(this.step > 0){
			this.loadStep(this.step - 1);
		}
	}

	WPGMZA.Installer.prototype.loadStep = function(index){
		this.loadSubSteps(index);

		$(this.element).find('.step').removeClass('active');
		$(this.element).find('.step[data-step="' + index + '"]').addClass('active');

		this.step = index;

		if(this.step === 0){
			$(this.element).find('.prev-step-button').addClass('wpgmza-hidden');
		} else {
			$(this.element).find('.prev-step-button').removeClass('wpgmza-hidden');
		}

		if(this.step === this.max){
			$(this.element).find('.next-step-button span').text($(this.element).find('.next-step-button').data('final'));
		} else {
			$(this.element).find('.next-step-button span').text($(this.element).find('.next-step-button').data('next'));
		}

		this.autoFocus();

		this.applyStepConditionState();

		$(window).scrollTop(0);

		this.trigger('step.installer.admin');
	}

	WPGMZA.Installer.prototype.loadSubSteps = function(index){
		const stepWrapper = $(this.element).find('.step[data-step="' + index + '"]');
		if(stepWrapper.find('.sub-step-container').length){
			stepWrapper.find('.sub-step').addClass('wpgmza-hidden');
			stepWrapper.find('.sub-step-container').removeClass('wpgmza-hidden');
		}	
	}

	WPGMZA.Installer.prototype.triggerSubStep = function(context){
		const stepWrapper = $(this.element).find('.step[data-step="' + this.step + '"]');
		if(stepWrapper.find('.sub-step-container').length){
			const target = context.data('sub-step');

			if(stepWrapper.find('.sub-step[data-sub-step="' + target + '"]').length){
				stepWrapper.find('.sub-step-container').addClass('wpgmza-hidden');
				stepWrapper.find('.sub-step').addClass('wpgmza-hidden');
				stepWrapper.find('.sub-step[data-sub-step="' + target + '"]').removeClass('wpgmza-hidden');

				if(target === 'google-maps-auto-key'){
					/* We should auto fetch the users location, this helps the onboarding flow substantially */
					try {
						const self = this;
						WPGMZA.getCurrentPosition(function(data){
						    if(data.coords){
						    	const coords = data.coords;
							    
							    $('.google-maps-auto-key-form-wrapper input[name="address"]').attr('placeholder', 'Fetching...');
							    if(coords.latitude && coords.longitude){
							    	const geocoder = WPGMZA.Geocoder.createInstance();

							    	geocoder.getAddressFromLatLng({ latLng : new WPGMZA.LatLng({lat : coords.latitude, lng : coords.longitude}) },
							    		function(address){
							    			$('.google-maps-auto-key-form-wrapper input[name="address"]').attr('placeholder', '');
							    			
							    			if(address){
							    				$('.google-maps-auto-key-form-wrapper input[name="address"]').val(address);
							    			}
							    		}
							    	)
							    } else {
							    	$('.google-maps-auto-key-form-wrapper input[name="address"]').attr('placeholder', '');
							    }
						    }
						});

						if($('.google-maps-auto-key-form-wrapper input[name="site_url"]').val().trim().length <= 0){
							var domain = window.location.hostname;
				            if(domain === 'localhost'){
				            	try{
				            		var paths = window.location.pathname.match(/\/(.*?)\//);
				            		if(paths && paths.length >= 2 && paths[1]){
				            			var path = paths[1];
				            			domain += "-" + path
				            		}
				            	} catch (ex){
				            		/* Leave it alone */
				            	}
				            }

				            $('.google-maps-auto-key-form-wrapper input[name="site_url"]').val(domain);
				            $('.google-maps-auto-key-form-wrapper input[name="site_url"]').attr('data-predicted-domain', domain);
						}
					} catch (ex) {
						/* No need to do anything */
					}
				}
			}
		}
		
	}

	WPGMZA.Installer.prototype.getActiveBlock = function(){
		return $(this.element).find('.step[data-step="' + this.step + '"]');
	}

	WPGMZA.Installer.prototype.autoFocus = function(){
		var block = this.getActiveBlock();
		if(block){
			if(block.find('input').length > 0){
				block.find('input')[0].focus();
			} else if(block.find('select').length > 0){
				block.find('select')[0].focus();
			} 
		}
	}

	WPGMZA.Installer.prototype.complete = function(){
		$(this.element).find('.step').removeClass('active');
		$(this.element).find('.step-controller').addClass('wpgmza-hidden');
		$(this.element).find('.step-loader').removeClass('wpgmza-hidden');

		$(this.element).find('.step-loader .progress-finish').removeClass('wpgmza-hidden');

		this.saveOptions();
	}

	WPGMZA.Installer.prototype.getData = function(){
		var data = {};

        $(this.element).find('.step').each(function(){
        	$(this).find('input,select').each(function(){
        		var name = $(this).attr('name');
        		if(name && name.trim() !== ""){
        			var value = $(this).val();
        			if(value.trim() !== ""){
        				data[name.trim()] = value.trim();
        			}
        		}
        	});
        });

        return data;

	}

	WPGMZA.Installer.prototype.setEngine = function(engine){
		this.engine = engine;
		$(this.element).attr('data-engine', engine);
	}

	WPGMZA.Installer.prototype.setApiKey = function(apiKey){
		this.apiKey = apiKey.trim();
		this.applyStepConditionState();
	}

	WPGMZA.Installer.prototype.setTileServer = function(server) {
		this.tileServer = server;

		let previewLink = server;
		previewLink = previewLink.replace("{a-c}", "a");
		previewLink = previewLink.replace("{z}/{x}/{y}", "7/20/49");

		$(this.element).find('.open_layers_sample_tile').attr('src', previewLink);
	}

	WPGMZA.Installer.prototype.applyStepConditionState = function(){
		const stepWrapper = this.getActiveBlock();
		const condition = stepWrapper.data('conditional');
		const continueButton = $(this.element).find('.next-step-button');
		
		if(condition){
			if(this.hasSatisfiedStepCondition(condition)){
				continueButton.removeClass('wpgmza-hidden');
			} else {
				continueButton.addClass('wpgmza-hidden');
			}
		} else {
			continueButton.removeClass('wpgmza-hidden');
		}
	}

	WPGMZA.Installer.prototype.hasSatisfiedStepCondition = function(condition){
		let satisfied = false;
		switch(condition){
			case 'engine-set-up':
				satisfied = (this.engine && this.engine === 'google-maps') ? (this.apiKey ? true : false) : true 
				break;
		}

		return satisfied;
	}

	WPGMZA.Installer.prototype.getAutoKey = function(){
		/* Not being deployed, meaning managed keys cannot be created */
		/* Instead quick start was introduced */
		return false;

		const self = this;
		const formData = this.getData();
		
		const fields = {
			site_name : false,
			site_url : false,
			user_email : false,
			address : false
		};

		/** 
		 * If the system has required the user to do additional manual entry, 
		 * lets force that here
		*/
		$('.google-maps-auto-key-form-wrapper .optional-sub-field').each(function(){
			if(!$(this).hasClass('wpgmza-hidden')){
				const forField = $(this).data('field');
				fields[forField] = false;
			}
		});

		this.hideAutoKeyError();

		for(let i in formData){
			let value = formData[i];
			if(typeof fields[i] !== 'undefined'){
				fields[i] = value;
			}
		}

		let hasRequiredFields = true;
		for(let i in fields){
			if(!fields[i]){
				hasRequiredFields = false;
				$('.google-maps-auto-key-form-wrapper input[name="' + i + '"]').focus();
			}
		}

		if(hasRequiredFields){
			$(this.element).find('.step').removeClass('active');
			$(this.element).find('.step-controller').addClass('wpgmza-hidden');
			$(this.element).find('.step-loader').removeClass('wpgmza-hidden');
			$(this.element).find('.step-loader .progress-busy').removeClass('wpgmza-hidden');


			$.post(WPGMZA.Installer.NODE_SERVER + 'create-managed-account', fields, function(response) {

				if(response instanceof Object){
					if(response.success && response.apikey){
						$(self.element).find('input[name="api_key"]').val(response.apikey).trigger('change');
						self.next();
					} else {
						if(response.error){
							if(response.error_code){
								if(response.error_code === "invalidField"){
									/* One or more fields are invalid, we need to relay this to the end user */
									if(response.error_field){
										if(response.error_field === "postal_code" || response.error_field === "region_code"){
											self.showAutoKeyError(response.error_field.replace('_', ''));

											if($('.google-maps-auto-key-form-wrapper .optional-sub-field[data-field="' + response.error_field + '"]').length){
												$('.google-maps-auto-key-form-wrapper .optional-sub-field[data-field="' + response.error_field + '"]').removeClass('wpgmza-hidden');
											}
										} else {
											self.showAutoKeyError('missing-fields');
										}
									} else {
										self.showAutoKeyError('missing-fields');
									}
								} else if(response.error_code === 'alreadyExists'){
									self.showAutoKeyError('already-exists');

									const nameField = $('.google-maps-auto-key-form-wrapper input[name="site_name"]');
									let siteName = nameField.val();

									if(siteName.length > 14){
										siteName = siteName.substring(0, 14);
									}

									const rands = [];
									for(let i = 0; i < 4; i++){
										rands.push(parseInt(Math.random() * 9));
									}

									siteName += " " + rands.join("");

									nameField.val(siteName);
									nameField.trigger('change');
									nameField.focus();
								} else {
									self.showAutoKeyError(response.error);
								}
							} else {
								self.showAutoKeyError(response.error);
							}
						} else {
							/* Show generic error? */
							self.showAutoKeyError('generic');
						}
					}
				}

				self.getActiveBlock().addClass('active');
				$(self.element).find('.step-controller').removeClass('wpgmza-hidden');
				$(self.element).find('.step-loader').addClass('wpgmza-hidden');
				$(self.element).find('.step-loader .progress-busy').addClass('wpgmza-hidden');

			});
		} else {
			this.showAutoKeyError('missing-fields');
		}
	}

	WPGMZA.Installer.prototype.launchQuickStart = function(){
		const popupDimensions = {
			width : 570,
			height : 700
		};

		popupDimensions.left = (screen.width - popupDimensions.width) / 2;
		popupDimensions.top = (screen.height - popupDimensions.height) / 2;

		if($('#adminmenuwrap').length){
			popupDimensions.left += $('#adminmenuwrap').width() / 2;
		}

		const title = "WP Go Maps - Create API Key";
		const url = "https://console.cloud.google.com/google/maps-hosted";
		
		let attributes = [];
		attributes.push("resizable=yes");
		attributes.push("width=" + popupDimensions.width);
		attributes.push("height=" + popupDimensions.height);
		attributes.push("left=" + popupDimensions.left);
		attributes.push("top=" + popupDimensions.top);
		attributes = attributes.join(",");

    	window.open(url, title, attributes);
	}

	WPGMZA.Installer.prototype.saveOptions = function(){
		const self = this;
		const formData = this.getData();

		const options = {
			action: "wpgmza_installer_page_save_options",
			nonce: this.element.attr("data-ajax-nonce"),
			wpgmza_maps_engine : this.engine,
			tile_server_url : formData.tile_server_url,
			api_key : formData.api_key
		};

		$(event.target).prop("disabled", true);
		
		$.ajax(WPGMZA.ajaxurl, {
			method: "POST",
			data: options,
			success: function(response, status, xhr) {
				window.location.href = self.redirectUrl;
			}
		});
	}

	WPGMZA.Installer.prototype.hideAutoKeyError = function(){
		$('.auto-key-error').addClass("wpgmza-hidden");
	}

	WPGMZA.Installer.prototype.showAutoKeyError = function(codeOrMsg){
		let message = "";
		if(codeOrMsg.indexOf(" ") === -1){
			const localizedError = $('.auto-key-error').data(codeOrMsg);
			if(localizedError){
				message = localizedError;
			} else {
				message = codeOrMsg;
			}
		} else {
			message = codeOrMsg;
		}


		if(message.length){
			$('.auto-key-error').find('.notice').text(message);
			$('.auto-key-error').removeClass('wpgmza-hidden');
		} else {
			this.hideAutoKeyError();
		}
	}

	WPGMZA.Installer.prototype.skip = function(){
		const self = this;

		$(this.element).find('.step').removeClass('active');
		$(this.element).find('.step-controller').addClass('wpgmza-hidden');
		$(this.element).find('.step-loader').removeClass('wpgmza-hidden');

		$(this.element).find('.step-loader .progress-finish').removeClass('wpgmza-hidden');

		this.skipButton.addClass('wpgmza-hidden');

		const options = {
			action: "wpgmza_installer_page_skip",
			nonce: this.element.attr("data-ajax-nonce")
		};

		$.ajax(WPGMZA.ajaxurl, {
			method: "POST",
			data: options,
			success: function(response, status, xhr) {
				window.location.href = self.redirectUrl;
			}
		});
	}

	WPGMZA.Installer.prototype.checkAutoSkip = function(){
		/* Check if the system was flagged for auto-skip mode */
		if( this.element.data('auto-skip')){
			this.skip();
		}
	}

	$(document).ready(function(event) {
		WPGMZA.installer = WPGMZA.Installer.createInstance();
	});
});

