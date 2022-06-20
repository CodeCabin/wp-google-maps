/**
 * @namespace WPGMZA
 * @module ThemeEditor
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.ThemeEditor = function()
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this.element = $("#wpgmza-theme-editor");
		
		if(WPGMZA.settings.engine == "open-layers")
		{
			this.element.remove();

			/* Auto init OL Theme Editor, we could do this with a createInstance call, but the code here will be minimal, so lets skip this for the moment */
			this.olThemeEditor = new WPGMZA.OLThemeEditor();
			return;
		}
		
		if(!this.element.length)
		{
			console.warn("No element to initialise theme editor on");
			return;
		}
		
		this.json = [{}];
		this.mapElement = WPGMZA.maps[0].element;

		this.element.appendTo('#wpgmza-map-theme-editor__holder');
		
		$(window).on("scroll", function(event) {
			//self.updatePosition();
		});
		
		setInterval(function() {
			//self.updatePosition();
		}, 200);
		
		this.initHTML();
		
		WPGMZA.themeEditor = this;
	}
	
	WPGMZA.extend(WPGMZA.ThemeEditor, WPGMZA.EventDispatcher);
	
	WPGMZA.ThemeEditor.prototype.updatePosition = function()
	{
		//var offset = $(this.mapElement).offset();
		
		// var relativeTop = offset.top - $(window).scrollTop();
		// var relativeLeft = offset.left - $(window).scrollLeft();
		// var height = $(this.mapElement).height();
		// var width = $(this.mapElement).width();

		// this.element.css({
		// 	top:	(relativeTop - (height + 5)) + "px",
		// 	left:	(relativeLeft + width) + "px",
		// 	height:	height + "px",
		// 	width: width + 'px'
		// });
	}
	
	WPGMZA.ThemeEditor.features = {
		'all' : [],
		'administrative' : [
			'country',
			'land_parcel',
			'locality',
			'neighborhood',
			'province'
		],
		'landscape' : [
			'man_made',
			'natural',
			'natural.landcover',
			'natural.terrain'
		],
		'poi' : [
			'attraction',
			'business',
			'government',
			'medical',
			'park',
			'place_of_worship',
			'school',
			'sports_complex'
		],
		'road' : [
			'arterial',
			'highway',
			'highway.controlled_access',
			'local'
		],
		'transit' : [
			'line',
			'station',
			'station.airport',
			'station.bus',
			'station.rail'
		],
		'water' : []
	};
	
	WPGMZA.ThemeEditor.elements = {
		'all' : [],
		'geometry' : [
			'fill',
			'stroke'
		],
		'labels' : [
			'icon',
			'text',
			'text.fill',
			'text.stroke'
		]
	};
	
	WPGMZA.ThemeEditor.prototype.parse = function()
	{
		$('#wpgmza_theme_editor_feature option, #wpgmza_theme_editor_element option').css('font-weight', 'normal');
		$('#wpgmza_theme_editor_error').hide();
		$('#wpgmza_theme_editor').show();
		$('#wpgmza_theme_editor_do_hue').prop('checked', false);
		$('#wpgmza_theme_editor_hue').val('#000000');
		$('#wpgmza_theme_editor_lightness').val('');
		$('#wpgmza_theme_editor_saturation').val('');
		$('#wpgmza_theme_editor_gamma').val('');
		$('#wpgmza_theme_editor_do_invert_lightness').prop('checked', false);
		$('#wpgmza_theme_editor_visibility').val('inherit');
		$('#wpgmza_theme_editor_do_color').prop('checked', false);
		$('#wpgmza_theme_editor_color').val('#000000');
		$('#wpgmza_theme_editor_weight').val('');
		
		var textarea = $('textarea[name="wpgmza_theme_data"]');

		/* Refresh V9 Color Pickers */
		this.refreshColorInputs();
		
		if (!textarea.val() || textarea.val().length < 1) {
			this.json = [{}];
			return;
		}
		
		try {
			this.json = $.parseJSON($('textarea[name="wpgmza_theme_data"]').val());
		} catch (e) {
			this.json = [{}
			];
			$('#wpgmza_theme_editor').hide();
			$('#wpgmza_theme_editor_error').show();
			return;
		}
		if (!$.isArray(this.json)) {
			var jsonCopy = this.json;
			this.json = [];
			this.json.push(jsonCopy);
		}
		
		this.highlightFeatures();
		this.highlightElements();
		this.loadElementStylers();
	}
	
	WPGMZA.ThemeEditor.prototype.highlightFeatures = function()
	{
		$('#wpgmza_theme_editor_feature option').css('font-weight', 'normal');
		$.each(this.json, function (i, v) {
			if (v.hasOwnProperty('featureType')) {
				$('#wpgmza_theme_editor_feature option[value="' + v.featureType + '"]').css('font-weight', 'bold');
			} else {
				$('#wpgmza_theme_editor_feature option[value="all"]').css('font-weight', 'bold');
			}
		});

	}
	
	WPGMZA.ThemeEditor.prototype.highlightElements = function()
	{
		var feature = $('#wpgmza_theme_editor_feature').val();
		$('#wpgmza_theme_editor_element option').css('font-weight', 'normal');
		$.each(this.json, function (i, v) {
			if ((v.hasOwnProperty('featureType') && v.featureType == feature) ||
				(feature == 'all' && !v.hasOwnProperty('featureType'))) {
				if (v.hasOwnProperty('elementType')) {
					$('#wpgmza_theme_editor_element option[value="' + v.elementType + '"]').css('font-weight', 'bold');
				} else {
					$('#wpgmza_theme_editor_element option[value="all"]').css('font-weight', 'bold');
				}
			}
		});
	}
	
	WPGMZA.ThemeEditor.prototype.loadElementStylers = function()
	{
		const self = this;
		
		var feature = $('#wpgmza_theme_editor_feature').val();
		var element = $('#wpgmza_theme_editor_element').val();
		$('#wpgmza_theme_editor_do_hue').prop('checked', false);
		$('#wpgmza_theme_editor_hue').val('#000000');
		$('#wpgmza_theme_editor_lightness').val('');
		$('#wpgmza_theme_editor_saturation').val('');
		$('#wpgmza_theme_editor_gamma').val('');
		$('#wpgmza_theme_editor_do_invert_lightness').prop('checked', false);
		$('#wpgmza_theme_editor_visibility').val('inherit');
		$('#wpgmza_theme_editor_do_color').prop('checked', false);
		$('#wpgmza_theme_editor_color').val('#000000');
		$('#wpgmza_theme_editor_weight').val('');

		$.each(this.json, function (i, v) {
			if ((v.hasOwnProperty('featureType') && v.featureType == feature) ||
				(feature == 'all' && !v.hasOwnProperty('featureType'))) {
				if ((v.hasOwnProperty('elementType') && v.elementType == element) ||
					(element == 'all' && !v.hasOwnProperty('elementType'))) {
					if (v.hasOwnProperty('stylers') && $.isArray(v.stylers) && v.stylers.length > 0) {
						$.each(v.stylers, function (ii, vv) {
							if (vv.hasOwnProperty('hue')) {
								$('#wpgmza_theme_editor_do_hue').prop('checked', true);
								$('#wpgmza_theme_editor_hue').val(vv.hue);
							}
							if (vv.hasOwnProperty('lightness')) {
								$('#wpgmza_theme_editor_lightness').val(vv.lightness);
							}
							if (vv.hasOwnProperty('saturation')) {
								$('#wpgmza_theme_editor_saturation').val(vv.xaturation);
							}
							if (vv.hasOwnProperty('gamma')) {
								$('#wpgmza_theme_editor_gamma').val(vv.gamma);
							}
							if (vv.hasOwnProperty('invert_lightness')) {
								$('#wpgmza_theme_editor_do_invert_lightness').prop('checked', true);
							}
							if (vv.hasOwnProperty('visibility')) {
								$('#wpgmza_theme_editor_visibility').val(vv.visibility);
							}
							if (vv.hasOwnProperty('color')) {
								$('#wpgmza_theme_editor_do_color').prop('checked', true);
								$('#wpgmza_theme_editor_color').val(vv.color);
							}
							if (vv.hasOwnProperty('weight')) {
								$('#wpgmza_theme_editor_weight').val(vv.weight);
							}
						});
					}
				}
			}
		});

		/* Refresh V9 Color Pickers */
		this.refreshColorInputs();

	}
	
	WPGMZA.ThemeEditor.prototype.writeElementStylers = function()
	{
		var feature = $('#wpgmza_theme_editor_feature').val();
		var element = $('#wpgmza_theme_editor_element').val();
		var indexJSON = null;
		var stylers = [];
		
		if ($('#wpgmza_theme_editor_visibility').val() != "inherit") {
			stylers.push({
				'visibility': $('#wpgmza_theme_editor_visibility').val()
			});
		}
		if ($('#wpgmza_theme_editor_do_color').prop('checked') === true) {
			stylers.push({
				'color': $('#wpgmza_theme_editor_color').val()
			});
		}
		if ($('#wpgmza_theme_editor_do_hue').prop('checked') === true) {
			stylers.push({
				"hue": $('#wpgmza_theme_editor_hue').val()
			});
		}
		if ($('#wpgmza_theme_editor_gamma').val().length > 0) {
			stylers.push({
				'gamma': parseFloat($('#wpgmza_theme_editor_gamma').val())
			});
		}
		if ($('#wpgmza_theme_editor_weight').val().length > 0) {
			stylers.push({
				'weight': parseFloat($('#wpgmza_theme_editor_weight').val())
			});
		}
		if ($('#wpgmza_theme_editor_saturation').val().length > 0) {
			stylers.push({
				'saturation': parseFloat($('#wpgmza_theme_editor_saturation').val())
			});
		}
		if ($('#wpgmza_theme_editor_lightness').val().length > 0) {
			stylers.push({
				'lightness': parseFloat($('#wpgmza_theme_editor_lightness').val())
			});
		}
		if ($('#wpgmza_theme_editor_do_invert_lightness').prop('checked') === true) {
			stylers.push({
				'invert_lightness': true
			});
		}
		
		$.each(this.json, function (i, v) {
			if ((v.hasOwnProperty('featureType') && v.featureType == feature) ||
				(feature == 'all' && !v.hasOwnProperty('featureType'))) {
				if ((v.hasOwnProperty('elementType') && v.elementType == element) ||
					(element == 'all' && !v.hasOwnProperty('elementType'))) {
					indexJSON = i;
				}
			}
		});
		if (indexJSON === null) {
			if (stylers.length > 0) {
				var new_feature_element_stylers = {};
				if (feature != 'all') {
					new_feature_element_stylers.featureType = feature;
				}
				if (element != 'all') {
					new_feature_element_stylers.elementType = element;
				}
				new_feature_element_stylers.stylers = stylers;
				this.json.push(new_feature_element_stylers);
			}
		} else {
			if (stylers.length > 0) {
				this.json[indexJSON].stylers = stylers;
			} else {
				this.json.splice(indexJSON, 1);
			}
		}
		
		$('textarea[name="wpgmza_theme_data"]').val(JSON.stringify(this.json).replace(/:/g, ': ').replace(/,/g, ', '));
		
		this.highlightFeatures();
		this.highlightElements();
		
		WPGMZA.themePanel.updateMapTheme();
	}
	
	// TODO: WPGMZA.localized_strings
	
	WPGMZA.ThemeEditor.prototype.initHTML = function()
	{
		var self = this;

		$.each(WPGMZA.ThemeEditor.features, function (i, v) {
			$('#wpgmza_theme_editor_feature').append('<option value="' + i + '">' + i + '</option>');
			if (v.length > 0) {
				$.each(v, function (ii, vv) {
					$('#wpgmza_theme_editor_feature').append('<option value="' + i + '.' + vv + '">' + i + '.' + vv + '</option>');
				});
			}
		});
		$.each(WPGMZA.ThemeEditor.elements, function (i, v) {
			$('#wpgmza_theme_editor_element').append('<option value="' + i + '">' + i + '</option>');
			if (v.length > 0) {
				$.each(v, function (ii, vv) {
					$('#wpgmza_theme_editor_element').append('<option value="' + i + '.' + vv + '">' + i + '.' + vv + '</option>');
				});
			}
		});

		this.parse();
		
		// Bind listeners
		$('textarea[name="wpgmza_theme_data"]').on('input selectionchange propertychange', function() {
			self.parse();
		});
		
		$('.wpgmza_theme_selection').click(function(){
			setTimeout(function(){$('textarea[name="wpgmza_theme_data"]').trigger('input');}, 1000);
		});

		$('#wpgmza-theme-editor__toggle').click(function() {
			$('#wpgmza-theme-editor').removeClass('active');
		})
		
		$('#wpgmza_theme_editor_feature').on("change", function() {
			self.highlightElements();
			self.loadElementStylers();
		});
		
		$('#wpgmza_theme_editor_element').on("change", function() {
			self.loadElementStylers();
		});
		
		$('#wpgmza_theme_editor_do_hue, #wpgmza_theme_editor_hue, #wpgmza_theme_editor_lightness, #wpgmza_theme_editor_saturation, #wpgmza_theme_editor_gamma, #wpgmza_theme_editor_do_invert_lightness, #wpgmza_theme_editor_visibility, #wpgmza_theme_editor_do_color, #wpgmza_theme_editor_color, #wpgmza_theme_editor_weight').on('input selectionchange propertychange', function() {
			self.writeElementStylers();
		});
		
		if(WPGMZA.settings.engine == "open-layers")
			$("#wpgmza_theme_editor :input").prop("disabled", true);
	}

	WPGMZA.ThemeEditor.prototype.refreshColorInputs = function(){
		/* Will only run if wpgmzaColorInput is initialized, uses value as set */
		$('input#wpgmza_theme_editor_hue,input#wpgmza_theme_editor_color').each(function(){
			if(this.wpgmzaColorInput){
				this.wpgmzaColorInput.parseColor(this.value);
			}
		});
	}
	
});