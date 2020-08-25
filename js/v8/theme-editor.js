/**
 * @namespace WPGMZA
 * @module ThemeEditor
 * @requires WPGMZA.EventDispatcher
 * @gulp-requires event-dispatcher.js
 */
jQuery(function($) {
	
	WPGMZA.ThemeEditor = function()
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this.element = $("#wpgmza-theme-editor");
		
		if(!this.element.length)
		{
			console.warn("No element to initialise theme editor on");
			return;
		}
		
		if(WPGMZA.settings.engine == "open-layers")
		{
			this.element.remove();
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
		
		var textarea = $('textarea[name="wpgmza_theme_data"]')
		
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
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aGVtZS1lZGl0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgVGhlbWVFZGl0b3JcclxuICogQHJlcXVpcmVzIFdQR01aQS5FdmVudERpc3BhdGNoZXJcclxuICogQGd1bHAtcmVxdWlyZXMgZXZlbnQtZGlzcGF0Y2hlci5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuVGhlbWVFZGl0b3IgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuRXZlbnREaXNwYXRjaGVyLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdHRoaXMuZWxlbWVudCA9ICQoXCIjd3BnbXphLXRoZW1lLWVkaXRvclwiKTtcclxuXHRcdFxyXG5cdFx0aWYoIXRoaXMuZWxlbWVudC5sZW5ndGgpXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUud2FybihcIk5vIGVsZW1lbnQgdG8gaW5pdGlhbGlzZSB0aGVtZSBlZGl0b3Igb25cIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLnNldHRpbmdzLmVuZ2luZSA9PSBcIm9wZW4tbGF5ZXJzXCIpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmpzb24gPSBbe31dO1xyXG5cdFx0dGhpcy5tYXBFbGVtZW50ID0gV1BHTVpBLm1hcHNbMF0uZWxlbWVudDtcclxuXHJcblx0XHR0aGlzLmVsZW1lbnQuYXBwZW5kVG8oJyN3cGdtemEtbWFwLXRoZW1lLWVkaXRvcl9faG9sZGVyJyk7XHJcblx0XHRcclxuXHRcdCQod2luZG93KS5vbihcInNjcm9sbFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHQvL3NlbGYudXBkYXRlUG9zaXRpb24oKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuXHRcdFx0Ly9zZWxmLnVwZGF0ZVBvc2l0aW9uKCk7XHJcblx0XHR9LCAyMDApO1xyXG5cdFx0XHJcblx0XHR0aGlzLmluaXRIVE1MKCk7XHJcblx0XHRcclxuXHRcdFdQR01aQS50aGVtZUVkaXRvciA9IHRoaXM7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5leHRlbmQoV1BHTVpBLlRoZW1lRWRpdG9yLCBXUEdNWkEuRXZlbnREaXNwYXRjaGVyKTtcclxuXHRcclxuXHRXUEdNWkEuVGhlbWVFZGl0b3IucHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdC8vdmFyIG9mZnNldCA9ICQodGhpcy5tYXBFbGVtZW50KS5vZmZzZXQoKTtcclxuXHRcdFxyXG5cdFx0Ly8gdmFyIHJlbGF0aXZlVG9wID0gb2Zmc2V0LnRvcCAtICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuXHRcdC8vIHZhciByZWxhdGl2ZUxlZnQgPSBvZmZzZXQubGVmdCAtICQod2luZG93KS5zY3JvbGxMZWZ0KCk7XHJcblx0XHQvLyB2YXIgaGVpZ2h0ID0gJCh0aGlzLm1hcEVsZW1lbnQpLmhlaWdodCgpO1xyXG5cdFx0Ly8gdmFyIHdpZHRoID0gJCh0aGlzLm1hcEVsZW1lbnQpLndpZHRoKCk7XHJcblxyXG5cdFx0Ly8gdGhpcy5lbGVtZW50LmNzcyh7XHJcblx0XHQvLyBcdHRvcDpcdChyZWxhdGl2ZVRvcCAtIChoZWlnaHQgKyA1KSkgKyBcInB4XCIsXHJcblx0XHQvLyBcdGxlZnQ6XHQocmVsYXRpdmVMZWZ0ICsgd2lkdGgpICsgXCJweFwiLFxyXG5cdFx0Ly8gXHRoZWlnaHQ6XHRoZWlnaHQgKyBcInB4XCIsXHJcblx0XHQvLyBcdHdpZHRoOiB3aWR0aCArICdweCdcclxuXHRcdC8vIH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuVGhlbWVFZGl0b3IuZmVhdHVyZXMgPSB7XHJcblx0XHQnYWxsJyA6IFtdLFxyXG5cdFx0J2FkbWluaXN0cmF0aXZlJyA6IFtcclxuXHRcdFx0J2NvdW50cnknLFxyXG5cdFx0XHQnbGFuZF9wYXJjZWwnLFxyXG5cdFx0XHQnbG9jYWxpdHknLFxyXG5cdFx0XHQnbmVpZ2hib3Job29kJyxcclxuXHRcdFx0J3Byb3ZpbmNlJ1xyXG5cdFx0XSxcclxuXHRcdCdsYW5kc2NhcGUnIDogW1xyXG5cdFx0XHQnbWFuX21hZGUnLFxyXG5cdFx0XHQnbmF0dXJhbCcsXHJcblx0XHRcdCduYXR1cmFsLmxhbmRjb3ZlcicsXHJcblx0XHRcdCduYXR1cmFsLnRlcnJhaW4nXHJcblx0XHRdLFxyXG5cdFx0J3BvaScgOiBbXHJcblx0XHRcdCdhdHRyYWN0aW9uJyxcclxuXHRcdFx0J2J1c2luZXNzJyxcclxuXHRcdFx0J2dvdmVybm1lbnQnLFxyXG5cdFx0XHQnbWVkaWNhbCcsXHJcblx0XHRcdCdwYXJrJyxcclxuXHRcdFx0J3BsYWNlX29mX3dvcnNoaXAnLFxyXG5cdFx0XHQnc2Nob29sJyxcclxuXHRcdFx0J3Nwb3J0c19jb21wbGV4J1xyXG5cdFx0XSxcclxuXHRcdCdyb2FkJyA6IFtcclxuXHRcdFx0J2FydGVyaWFsJyxcclxuXHRcdFx0J2hpZ2h3YXknLFxyXG5cdFx0XHQnaGlnaHdheS5jb250cm9sbGVkX2FjY2VzcycsXHJcblx0XHRcdCdsb2NhbCdcclxuXHRcdF0sXHJcblx0XHQndHJhbnNpdCcgOiBbXHJcblx0XHRcdCdsaW5lJyxcclxuXHRcdFx0J3N0YXRpb24nLFxyXG5cdFx0XHQnc3RhdGlvbi5haXJwb3J0JyxcclxuXHRcdFx0J3N0YXRpb24uYnVzJyxcclxuXHRcdFx0J3N0YXRpb24ucmFpbCdcclxuXHRcdF0sXHJcblx0XHQnd2F0ZXInIDogW11cclxuXHR9O1xyXG5cdFxyXG5cdFdQR01aQS5UaGVtZUVkaXRvci5lbGVtZW50cyA9IHtcclxuXHRcdCdhbGwnIDogW10sXHJcblx0XHQnZ2VvbWV0cnknIDogW1xyXG5cdFx0XHQnZmlsbCcsXHJcblx0XHRcdCdzdHJva2UnXHJcblx0XHRdLFxyXG5cdFx0J2xhYmVscycgOiBbXHJcblx0XHRcdCdpY29uJyxcclxuXHRcdFx0J3RleHQnLFxyXG5cdFx0XHQndGV4dC5maWxsJyxcclxuXHRcdFx0J3RleHQuc3Ryb2tlJ1xyXG5cdFx0XVxyXG5cdH07XHJcblx0XHJcblx0V1BHTVpBLlRoZW1lRWRpdG9yLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9mZWF0dXJlIG9wdGlvbiwgI3dwZ216YV90aGVtZV9lZGl0b3JfZWxlbWVudCBvcHRpb24nKS5jc3MoJ2ZvbnQtd2VpZ2h0JywgJ25vcm1hbCcpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZXJyb3InKS5oaWRlKCk7XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcicpLnNob3coKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2RvX2h1ZScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9odWUnKS52YWwoJyMwMDAwMDAnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2xpZ2h0bmVzcycpLnZhbCgnJyk7XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9zYXR1cmF0aW9uJykudmFsKCcnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2dhbW1hJykudmFsKCcnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2RvX2ludmVydF9saWdodG5lc3MnKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfdmlzaWJpbGl0eScpLnZhbCgnaW5oZXJpdCcpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZG9fY29sb3InKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfY29sb3InKS52YWwoJyMwMDAwMDAnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX3dlaWdodCcpLnZhbCgnJyk7XHJcblx0XHRcclxuXHRcdHZhciB0ZXh0YXJlYSA9ICQoJ3RleHRhcmVhW25hbWU9XCJ3cGdtemFfdGhlbWVfZGF0YVwiXScpXHJcblx0XHRcclxuXHRcdGlmICghdGV4dGFyZWEudmFsKCkgfHwgdGV4dGFyZWEudmFsKCkubGVuZ3RoIDwgMSkge1xyXG5cdFx0XHR0aGlzLmpzb24gPSBbe31dO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRyeSB7XHJcblx0XHRcdHRoaXMuanNvbiA9ICQucGFyc2VKU09OKCQoJ3RleHRhcmVhW25hbWU9XCJ3cGdtemFfdGhlbWVfZGF0YVwiXScpLnZhbCgpKTtcclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0dGhpcy5qc29uID0gW3t9XHJcblx0XHRcdF07XHJcblx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yJykuaGlkZSgpO1xyXG5cdFx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9lcnJvcicpLnNob3coKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCEkLmlzQXJyYXkodGhpcy5qc29uKSkge1xyXG5cdFx0XHR2YXIganNvbkNvcHkgPSB0aGlzLmpzb247XHJcblx0XHRcdHRoaXMuanNvbiA9IFtdO1xyXG5cdFx0XHR0aGlzLmpzb24ucHVzaChqc29uQ29weSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuaGlnaGxpZ2h0RmVhdHVyZXMoKTtcclxuXHRcdHRoaXMuaGlnaGxpZ2h0RWxlbWVudHMoKTtcclxuXHRcdHRoaXMubG9hZEVsZW1lbnRTdHlsZXJzKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5UaGVtZUVkaXRvci5wcm90b3R5cGUuaGlnaGxpZ2h0RmVhdHVyZXMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZmVhdHVyZSBvcHRpb24nKS5jc3MoJ2ZvbnQtd2VpZ2h0JywgJ25vcm1hbCcpO1xyXG5cdFx0JC5lYWNoKHRoaXMuanNvbiwgZnVuY3Rpb24gKGksIHYpIHtcclxuXHRcdFx0aWYgKHYuaGFzT3duUHJvcGVydHkoJ2ZlYXR1cmVUeXBlJykpIHtcclxuXHRcdFx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9mZWF0dXJlIG9wdGlvblt2YWx1ZT1cIicgKyB2LmZlYXR1cmVUeXBlICsgJ1wiXScpLmNzcygnZm9udC13ZWlnaHQnLCAnYm9sZCcpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2ZlYXR1cmUgb3B0aW9uW3ZhbHVlPVwiYWxsXCJdJykuY3NzKCdmb250LXdlaWdodCcsICdib2xkJyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLlRoZW1lRWRpdG9yLnByb3RvdHlwZS5oaWdobGlnaHRFbGVtZW50cyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgZmVhdHVyZSA9ICQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2ZlYXR1cmUnKS52YWwoKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2VsZW1lbnQgb3B0aW9uJykuY3NzKCdmb250LXdlaWdodCcsICdub3JtYWwnKTtcclxuXHRcdCQuZWFjaCh0aGlzLmpzb24sIGZ1bmN0aW9uIChpLCB2KSB7XHJcblx0XHRcdGlmICgodi5oYXNPd25Qcm9wZXJ0eSgnZmVhdHVyZVR5cGUnKSAmJiB2LmZlYXR1cmVUeXBlID09IGZlYXR1cmUpIHx8XHJcblx0XHRcdFx0KGZlYXR1cmUgPT0gJ2FsbCcgJiYgIXYuaGFzT3duUHJvcGVydHkoJ2ZlYXR1cmVUeXBlJykpKSB7XHJcblx0XHRcdFx0aWYgKHYuaGFzT3duUHJvcGVydHkoJ2VsZW1lbnRUeXBlJykpIHtcclxuXHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2VsZW1lbnQgb3B0aW9uW3ZhbHVlPVwiJyArIHYuZWxlbWVudFR5cGUgKyAnXCJdJykuY3NzKCdmb250LXdlaWdodCcsICdib2xkJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2VsZW1lbnQgb3B0aW9uW3ZhbHVlPVwiYWxsXCJdJykuY3NzKCdmb250LXdlaWdodCcsICdib2xkJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLlRoZW1lRWRpdG9yLnByb3RvdHlwZS5sb2FkRWxlbWVudFN0eWxlcnMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGZlYXR1cmUgPSAkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9mZWF0dXJlJykudmFsKCk7XHJcblx0XHR2YXIgZWxlbWVudCA9ICQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2VsZW1lbnQnKS52YWwoKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2RvX2h1ZScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9odWUnKS52YWwoJyMwMDAwMDAnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2xpZ2h0bmVzcycpLnZhbCgnJyk7XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9zYXR1cmF0aW9uJykudmFsKCcnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2dhbW1hJykudmFsKCcnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2RvX2ludmVydF9saWdodG5lc3MnKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfdmlzaWJpbGl0eScpLnZhbCgnaW5oZXJpdCcpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZG9fY29sb3InKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfY29sb3InKS52YWwoJyMwMDAwMDAnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX3dlaWdodCcpLnZhbCgnJyk7XHJcblx0XHQkLmVhY2godGhpcy5qc29uLCBmdW5jdGlvbiAoaSwgdikge1xyXG5cdFx0XHRpZiAoKHYuaGFzT3duUHJvcGVydHkoJ2ZlYXR1cmVUeXBlJykgJiYgdi5mZWF0dXJlVHlwZSA9PSBmZWF0dXJlKSB8fFxyXG5cdFx0XHRcdChmZWF0dXJlID09ICdhbGwnICYmICF2Lmhhc093blByb3BlcnR5KCdmZWF0dXJlVHlwZScpKSkge1xyXG5cdFx0XHRcdGlmICgodi5oYXNPd25Qcm9wZXJ0eSgnZWxlbWVudFR5cGUnKSAmJiB2LmVsZW1lbnRUeXBlID09IGVsZW1lbnQpIHx8XHJcblx0XHRcdFx0XHQoZWxlbWVudCA9PSAnYWxsJyAmJiAhdi5oYXNPd25Qcm9wZXJ0eSgnZWxlbWVudFR5cGUnKSkpIHtcclxuXHRcdFx0XHRcdGlmICh2Lmhhc093blByb3BlcnR5KCdzdHlsZXJzJykgJiYgJC5pc0FycmF5KHYuc3R5bGVycykgJiYgdi5zdHlsZXJzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRcdFx0JC5lYWNoKHYuc3R5bGVycywgZnVuY3Rpb24gKGlpLCB2dikge1xyXG5cdFx0XHRcdFx0XHRcdGlmICh2di5oYXNPd25Qcm9wZXJ0eSgnaHVlJykpIHtcclxuXHRcdFx0XHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2RvX2h1ZScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuXHRcdFx0XHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2h1ZScpLnZhbCh2di5odWUpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRpZiAodnYuaGFzT3duUHJvcGVydHkoJ2xpZ2h0bmVzcycpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9saWdodG5lc3MnKS52YWwodnYubGlnaHRuZXNzKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0aWYgKHZ2Lmhhc093blByb3BlcnR5KCdzYXR1cmF0aW9uJykpIHtcclxuXHRcdFx0XHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX3NhdHVyYXRpb24nKS52YWwodnYueGF0dXJhdGlvbik7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGlmICh2di5oYXNPd25Qcm9wZXJ0eSgnZ2FtbWEnKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZ2FtbWEnKS52YWwodnYuZ2FtbWEpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRpZiAodnYuaGFzT3duUHJvcGVydHkoJ2ludmVydF9saWdodG5lc3MnKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZG9faW52ZXJ0X2xpZ2h0bmVzcycpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0aWYgKHZ2Lmhhc093blByb3BlcnR5KCd2aXNpYmlsaXR5JykpIHtcclxuXHRcdFx0XHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX3Zpc2liaWxpdHknKS52YWwodnYudmlzaWJpbGl0eSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGlmICh2di5oYXNPd25Qcm9wZXJ0eSgnY29sb3InKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZG9fY29sb3InKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdFx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9jb2xvcicpLnZhbCh2di5jb2xvcik7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGlmICh2di5oYXNPd25Qcm9wZXJ0eSgnd2VpZ2h0JykpIHtcclxuXHRcdFx0XHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX3dlaWdodCcpLnZhbCh2di53ZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5UaGVtZUVkaXRvci5wcm90b3R5cGUud3JpdGVFbGVtZW50U3R5bGVycyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgZmVhdHVyZSA9ICQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2ZlYXR1cmUnKS52YWwoKTtcclxuXHRcdHZhciBlbGVtZW50ID0gJCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZWxlbWVudCcpLnZhbCgpO1xyXG5cdFx0dmFyIGluZGV4SlNPTiA9IG51bGw7XHJcblx0XHR2YXIgc3R5bGVycyA9IFtdO1xyXG5cdFx0XHJcblx0XHRpZiAoJCgnI3dwZ216YV90aGVtZV9lZGl0b3JfdmlzaWJpbGl0eScpLnZhbCgpICE9IFwiaW5oZXJpdFwiKSB7XHJcblx0XHRcdHN0eWxlcnMucHVzaCh7XHJcblx0XHRcdFx0J3Zpc2liaWxpdHknOiAkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl92aXNpYmlsaXR5JykudmFsKClcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRpZiAoJCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZG9fY29sb3InKS5wcm9wKCdjaGVja2VkJykgPT09IHRydWUpIHtcclxuXHRcdFx0c3R5bGVycy5wdXNoKHtcclxuXHRcdFx0XHQnY29sb3InOiAkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9jb2xvcicpLnZhbCgpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2RvX2h1ZScpLnByb3AoJ2NoZWNrZWQnKSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRzdHlsZXJzLnB1c2goe1xyXG5cdFx0XHRcdFwiaHVlXCI6ICQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2h1ZScpLnZhbCgpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2dhbW1hJykudmFsKCkubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRzdHlsZXJzLnB1c2goe1xyXG5cdFx0XHRcdCdnYW1tYSc6IHBhcnNlRmxvYXQoJCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZ2FtbWEnKS52YWwoKSlcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRpZiAoJCgnI3dwZ216YV90aGVtZV9lZGl0b3Jfd2VpZ2h0JykudmFsKCkubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRzdHlsZXJzLnB1c2goe1xyXG5cdFx0XHRcdCd3ZWlnaHQnOiBwYXJzZUZsb2F0KCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX3dlaWdodCcpLnZhbCgpKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdGlmICgkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9zYXR1cmF0aW9uJykudmFsKCkubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRzdHlsZXJzLnB1c2goe1xyXG5cdFx0XHRcdCdzYXR1cmF0aW9uJzogcGFyc2VGbG9hdCgkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9zYXR1cmF0aW9uJykudmFsKCkpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2xpZ2h0bmVzcycpLnZhbCgpLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0c3R5bGVycy5wdXNoKHtcclxuXHRcdFx0XHQnbGlnaHRuZXNzJzogcGFyc2VGbG9hdCgkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9saWdodG5lc3MnKS52YWwoKSlcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRpZiAoJCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZG9faW52ZXJ0X2xpZ2h0bmVzcycpLnByb3AoJ2NoZWNrZWQnKSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRzdHlsZXJzLnB1c2goe1xyXG5cdFx0XHRcdCdpbnZlcnRfbGlnaHRuZXNzJzogdHJ1ZVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0JC5lYWNoKHRoaXMuanNvbiwgZnVuY3Rpb24gKGksIHYpIHtcclxuXHRcdFx0aWYgKCh2Lmhhc093blByb3BlcnR5KCdmZWF0dXJlVHlwZScpICYmIHYuZmVhdHVyZVR5cGUgPT0gZmVhdHVyZSkgfHxcclxuXHRcdFx0XHQoZmVhdHVyZSA9PSAnYWxsJyAmJiAhdi5oYXNPd25Qcm9wZXJ0eSgnZmVhdHVyZVR5cGUnKSkpIHtcclxuXHRcdFx0XHRpZiAoKHYuaGFzT3duUHJvcGVydHkoJ2VsZW1lbnRUeXBlJykgJiYgdi5lbGVtZW50VHlwZSA9PSBlbGVtZW50KSB8fFxyXG5cdFx0XHRcdFx0KGVsZW1lbnQgPT0gJ2FsbCcgJiYgIXYuaGFzT3duUHJvcGVydHkoJ2VsZW1lbnRUeXBlJykpKSB7XHJcblx0XHRcdFx0XHRpbmRleEpTT04gPSBpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRpZiAoaW5kZXhKU09OID09PSBudWxsKSB7XHJcblx0XHRcdGlmIChzdHlsZXJzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHR2YXIgbmV3X2ZlYXR1cmVfZWxlbWVudF9zdHlsZXJzID0ge307XHJcblx0XHRcdFx0aWYgKGZlYXR1cmUgIT0gJ2FsbCcpIHtcclxuXHRcdFx0XHRcdG5ld19mZWF0dXJlX2VsZW1lbnRfc3R5bGVycy5mZWF0dXJlVHlwZSA9IGZlYXR1cmU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChlbGVtZW50ICE9ICdhbGwnKSB7XHJcblx0XHRcdFx0XHRuZXdfZmVhdHVyZV9lbGVtZW50X3N0eWxlcnMuZWxlbWVudFR5cGUgPSBlbGVtZW50O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRuZXdfZmVhdHVyZV9lbGVtZW50X3N0eWxlcnMuc3R5bGVycyA9IHN0eWxlcnM7XHJcblx0XHRcdFx0dGhpcy5qc29uLnB1c2gobmV3X2ZlYXR1cmVfZWxlbWVudF9zdHlsZXJzKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKHN0eWxlcnMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdHRoaXMuanNvbltpbmRleEpTT05dLnN0eWxlcnMgPSBzdHlsZXJzO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuanNvbi5zcGxpY2UoaW5kZXhKU09OLCAxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQkKCd0ZXh0YXJlYVtuYW1lPVwid3BnbXphX3RoZW1lX2RhdGFcIl0nKS52YWwoSlNPTi5zdHJpbmdpZnkodGhpcy5qc29uKS5yZXBsYWNlKC86L2csICc6ICcpLnJlcGxhY2UoLywvZywgJywgJykpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmhpZ2hsaWdodEZlYXR1cmVzKCk7XHJcblx0XHR0aGlzLmhpZ2hsaWdodEVsZW1lbnRzKCk7XHJcblx0XHRcclxuXHRcdFdQR01aQS50aGVtZVBhbmVsLnVwZGF0ZU1hcFRoZW1lKCk7XHJcblx0fVxyXG5cdFxyXG5cdC8vIFRPRE86IFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5nc1xyXG5cdFxyXG5cdFdQR01aQS5UaGVtZUVkaXRvci5wcm90b3R5cGUuaW5pdEhUTUwgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuXHRcdCQuZWFjaChXUEdNWkEuVGhlbWVFZGl0b3IuZmVhdHVyZXMsIGZ1bmN0aW9uIChpLCB2KSB7XHJcblx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2ZlYXR1cmUnKS5hcHBlbmQoJzxvcHRpb24gdmFsdWU9XCInICsgaSArICdcIj4nICsgaSArICc8L29wdGlvbj4nKTtcclxuXHRcdFx0aWYgKHYubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdCQuZWFjaCh2LCBmdW5jdGlvbiAoaWksIHZ2KSB7XHJcblx0XHRcdFx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9mZWF0dXJlJykuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiJyArIGkgKyAnLicgKyB2diArICdcIj4nICsgaSArICcuJyArIHZ2ICsgJzwvb3B0aW9uPicpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdCQuZWFjaChXUEdNWkEuVGhlbWVFZGl0b3IuZWxlbWVudHMsIGZ1bmN0aW9uIChpLCB2KSB7XHJcblx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2VsZW1lbnQnKS5hcHBlbmQoJzxvcHRpb24gdmFsdWU9XCInICsgaSArICdcIj4nICsgaSArICc8L29wdGlvbj4nKTtcclxuXHRcdFx0aWYgKHYubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdCQuZWFjaCh2LCBmdW5jdGlvbiAoaWksIHZ2KSB7XHJcblx0XHRcdFx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9lbGVtZW50JykuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiJyArIGkgKyAnLicgKyB2diArICdcIj4nICsgaSArICcuJyArIHZ2ICsgJzwvb3B0aW9uPicpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLnBhcnNlKCk7XHJcblx0XHRcclxuXHRcdC8vIEJpbmQgbGlzdGVuZXJzXHJcblx0XHQkKCd0ZXh0YXJlYVtuYW1lPVwid3BnbXphX3RoZW1lX2RhdGFcIl0nKS5vbignaW5wdXQgc2VsZWN0aW9uY2hhbmdlIHByb3BlcnR5Y2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNlbGYucGFyc2UoKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKCcud3BnbXphX3RoZW1lX3NlbGVjdGlvbicpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXskKCd0ZXh0YXJlYVtuYW1lPVwid3BnbXphX3RoZW1lX2RhdGFcIl0nKS50cmlnZ2VyKCdpbnB1dCcpO30sIDEwMDApO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2ZlYXR1cmUnKS5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0c2VsZi5oaWdobGlnaHRFbGVtZW50cygpO1xyXG5cdFx0XHRzZWxmLmxvYWRFbGVtZW50U3R5bGVycygpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2VsZW1lbnQnKS5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0c2VsZi5sb2FkRWxlbWVudFN0eWxlcnMoKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9kb19odWUsICN3cGdtemFfdGhlbWVfZWRpdG9yX2h1ZSwgI3dwZ216YV90aGVtZV9lZGl0b3JfbGlnaHRuZXNzLCAjd3BnbXphX3RoZW1lX2VkaXRvcl9zYXR1cmF0aW9uLCAjd3BnbXphX3RoZW1lX2VkaXRvcl9nYW1tYSwgI3dwZ216YV90aGVtZV9lZGl0b3JfZG9faW52ZXJ0X2xpZ2h0bmVzcywgI3dwZ216YV90aGVtZV9lZGl0b3JfdmlzaWJpbGl0eSwgI3dwZ216YV90aGVtZV9lZGl0b3JfZG9fY29sb3IsICN3cGdtemFfdGhlbWVfZWRpdG9yX2NvbG9yLCAjd3BnbXphX3RoZW1lX2VkaXRvcl93ZWlnaHQnKS5vbignaW5wdXQgc2VsZWN0aW9uY2hhbmdlIHByb3BlcnR5Y2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNlbGYud3JpdGVFbGVtZW50U3R5bGVycygpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUgPT0gXCJvcGVuLWxheWVyc1wiKVxyXG5cdFx0XHQkKFwiI3dwZ216YV90aGVtZV9lZGl0b3IgOmlucHV0XCIpLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoidGhlbWUtZWRpdG9yLmpzIn0=
