/**
 * @namespace WPGMZA
 * @module AtlasMajorLivePreview
 * @requires WPGMZA
 *
 * Live preview of frontend map components inside the Atlas Major map editor.
 * Base plugin handles: Store Locator.
 * Pro components are added by atlas-major-live-preview-pro.js via registerComponent().
 */
jQuery(function($) {

	if(!document.querySelector('.wpgmza-atlas-major'))
		return;

	/* ========================================================
	   ANCHOR MAP — mirrors ComponentAnchorControl PHP constants
	   ======================================================== */
	var ANCHOR_NAMES = {
		0: 'top',
		1: 'left',
		2: 'center',
		3: 'right',
		4: 'bottom',
		5: 'top_left',
		6: 'top_right',
		7: 'bottom_left',
		8: 'bottom_right'
	};
	var ANCHOR_ABOVE = 9;
	var ANCHOR_BELOW = 10;

	/* ========================================================
	   COMPONENT REGISTRY — base plugin only registers store locator.
	   Pro adds its own via registerComponent().
	   ======================================================== */
	var COMPONENTS = {
		'store-locator': {
			enabledCheck: function(){ return $('input[name="store_locator_enabled"]').is(':checked'); },
			anchorField: 'select[name="store_locator_component_anchor"]',
			defaultAnchor: 0,
			proOnly: false,
			onInit: function(map, clone){
				/* Set data-id so initStoreLocator() finds it */
				clone.find('.wpgmza-store-locator').attr('data-id', map.id);
				/* Call the real init */
				map.initStoreLocator();
				/* The map "init" event has already fired, so the filteringcomplete
				   listener inside the StoreLocator constructor never bound.
				   Bind it manually now. */
				if(map.storeLocator && map.markerFilter){
					map.markerFilter.on("filteringcomplete", function(event){
						map.storeLocator.onFilteringComplete(event);
					});
				}
			},
			onTeardown: function(map){
				if(map.storeLocator){
					/* Destroy the search-radius circle before dropping the
					 * storeLocator reference. Otherwise the next render
					 * leaves the circle drawn on the leaflet/google map
					 * with no live storeLocator owning it — visible but
					 * orphaned, can't be cleared by reset/search. Mirrors
					 * the cleanup in initStoreLocatorSettingsSync's
					 * destroyAndRedrawCircle() — handles both classic
					 * (removeCircle on the engine map) and modern
					 * (canvas overlay needs explicit destroy) circle
					 * subclasses. */
					var circle = map.storeLocator._circle;
					if(circle){
						try { circle.setVisible(false); } catch(e){}
						if(!(circle instanceof WPGMZA.ModernStoreLocatorCircle) && circle.map){
							try { circle.map.removeCircle(circle); } catch(e){}
						} else if(circle instanceof WPGMZA.ModernStoreLocatorCircle && typeof circle.destroy === 'function'){
							try { circle.destroy(); } catch(e){}
						}
						map.storeLocator._circle = null;
					}
					map.storeLocator = null;
				}
			}
		}
	};

	/* ========================================================
	   CONSTRUCTOR
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview = function(){
		var self = this;

		this.map = WPGMZA.maps[0];
		if(!this.map || !this.map.element) return;

		this.mapElement = $(this.map.element);
		this.templates = $('#wpgmza-live-preview-templates');
		this.previewFrame = $('.am-preview-frame');
		this.slotAbove = $('.am-preview-slot-above');
		this.slotBelow = $('.am-preview-slot-below');
		this.enabled = localStorage.getItem('wpgmza-live-preview') !== '0';
		this._activeComponents = {};

		if(!this.templates.length) return;

		/* Create inner-stack scaffold */
		this.stacks = {};
		this.createInnerStacks();

		/* Set viewport CSS variables */
		this.setViewportVariables();
		$(window).on('resize', function(){ self.setViewportVariables(); });

		/* Toggle */
		this.previewFrame.toggleClass('am-preview-off', !this.enabled);
		this.initToggle();

		/* Initial render */
		this.render();

		/* Bind reactivity */
		this.bindEvents();

		/* Store locator live settings sync */
		this.initStoreLocatorSettingsSync();

		/* Map init/start state sync (center, zoom, bounds, streetview) */
		this.initMapStateSync();

		/* Marker click/interaction behaviour sync */
		this.initMarkerBehaviourSync();

		/* Advanced: map controls & layers */
		this.initControlsAndLayersSync();

		/* Save reminder — show when any setting changes */
		this.initSaveReminder();

		/* Click outside to close color pickers */
		$(document).on('mousedown', function(e){
			if(!$(e.target).closest('.wpgmza-color-input-wrapper, .wpgmza-color-input-host').length){
				$('.wpgmza-color-picker.active').removeClass('active');
			}
		});
	}

	/* ========================================================
	   INNER-STACK SCAFFOLD
	   ======================================================== */
	/**
	 * Register a newly-created inner-stack element so clicks/drags on
	 * it don't propagate down to the underlying Leaflet map (which
	 * would interpret the drag as a map pan). Mirrors the
	 * `L.DomEvent.disableClickPropagation` calls in
	 * leaflet-map.js:288-295 (which only run on inner-stacks present at
	 * map-construction time — dynamic stacks created later by the live
	 * preview need the same treatment manually).
	 *
	 * No-op for non-Leaflet engines (Google Maps, OpenLayers) — Google
	 * Maps' own overlay layer handles event isolation; OpenLayers' map
	 * surface only listens on its own canvas. Kept on the public
	 * AtlasMajorLivePreview namespace so Pro can call it too.
	 *
	 * @param {jQuery|HTMLElement} stack — the inner-stack element.
	 */
	WPGMZA.AtlasMajorLivePreview.registerInnerStack = function(stack){
		if(!stack) return;
		if(typeof window.L === 'undefined' || !window.L.DomEvent) return;
		var el = stack instanceof jQuery ? stack[0] : stack;
		if(!el) return;
		try {
			L.DomEvent.disableClickPropagation(el);
			L.DomEvent.disableScrollPropagation(el);
			L.DomEvent.on(el, 'mousedown', L.DomEvent.stopPropagation);
		} catch(e){ }
	};

	WPGMZA.AtlasMajorLivePreview.prototype.createInnerStacks = function(){
		var mapEl = this.mapElement;

		for(var code in ANCHOR_NAMES){
			var name = ANCHOR_NAMES[code];
			var existing = mapEl.children('.wpgmza-inner-stack.' + name);
			if(existing.length){
				this.stacks[code] = existing;
			} else {
				var stack = $('<div class="wpgmza-inner-stack ' + name + ' wpgmza-live-preview-stack"></div>');
				mapEl.append(stack);
				WPGMZA.AtlasMajorLivePreview.registerInnerStack(stack);
				this.stacks[code] = stack;
			}
		}
	}

	/* ========================================================
	   VIEWPORT CSS VARIABLES
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview.prototype.setViewportVariables = function(){
		var el = this.mapElement[0];
		if(!el) return;
		var w = el.offsetWidth || 800;
		var oMult = w < 760 ? 1 : (w < 960 ? 0.7 : 0.5);
		var pMult = w < 760 ? 1 : (w < 960 ? 0.5 : 0.3);
		el.style.setProperty('--wpgmza--viewport-overlays-max-width', (oMult * 100) + '%');
		el.style.setProperty('--wpgmza--viewport-panels-max-width', (pMult * 100) + '%');
		el.style.setProperty('--wpgmza--viewport-container-width', w + 'px');
		el.style.setProperty('--wpgmza--viewport-container-height', (el.offsetHeight || 500) + 'px');
	}

	/* ========================================================
	   TOGGLE
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview.prototype.initToggle = function(){
		var self = this;
		var checkbox = $('#am-live-preview-toggle');
		checkbox.prop('checked', this.enabled);
		checkbox.on('change', function(){
			self.enabled = $(this).is(':checked');
			self.previewFrame.toggleClass('am-preview-off', !self.enabled);
			localStorage.setItem('wpgmza-live-preview', self.enabled ? '1' : '0');
			self.render();

			/* The map container's dimensions change when the mockup
			 * frame is toggled (the mockup wraps it to ~1000px wide vs
			 * full editor width in the off state). Leaflet / OpenLayers
			 * cache viewport size and only recalculate on explicit
			 * resize — without this the map tiles stay sized to the
			 * old container and subsequent height changes look broken.
			 * The CSS transition needs ~250ms to settle, so defer the
			 * resize slightly. */
			setTimeout(function(){
				if(self.map && typeof self.map.onElementResized === 'function'){
					self.map.onElementResized();
				}
				/* Leaflet-specific: force an invalidateSize as a belt-
				 * and-suspenders for any engine that doesn't fully
				 * resize from onElementResized. */
				if(self.map && self.map.leafletMap && typeof self.map.leafletMap.invalidateSize === 'function'){
					self.map.leafletMap.invalidateSize();
				}
			}, 300);
		});
	}

	/* ========================================================
	   STATE CHECKS
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview.prototype.isComponentEnabled = function(key){
		var def = COMPONENTS[key];
		if(!def) return false;
		if(def.proOnly && (!WPGMZA.isProVersion || !WPGMZA.isProVersion()))
			return false;
		return def.enabledCheck();
	}

	WPGMZA.AtlasMajorLivePreview.prototype.getComponentAnchor = function(key){
		var def = COMPONENTS[key];
		if(!def) return 0;
		var field = $(def.anchorField);
		if(field.length){
			var val = parseInt(field.val());
			if(!isNaN(val)) return val;
		}
		return def.defaultAnchor;
	}

	/* ========================================================
	   RENDER — places components and calls init methods
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview.prototype.render = function(){
		var self = this;
		var map = this.map;

		/* Teardown all active components */
		for(var activeKey in this._activeComponents){
			this.teardownComponent(activeKey);
		}

		/* Clear DOM */
		$('.wpgmza-live-preview-component').remove();
		this.slotAbove.empty();
		this.slotBelow.empty();

		if(!this.enabled){
			$(document.body).trigger('wpgmza_live_preview_rendered', [this]);
			return;
		}

		for(var key in COMPONENTS){
			if(!this.isComponentEnabled(key)) continue;

			var anchor = this.getComponentAnchor(key);
			var templateEl = this.templates.find('[data-preview-component="' + key + '"]');
			if(!templateEl.length || !templateEl.children().length) continue;

			var clone = templateEl.children().first().clone();
			clone.addClass('wpgmza-live-preview-component');
			clone.attr('data-live-preview-key', key);

			/* Place in correct position */
			var target;
			if(anchor === ANCHOR_ABOVE){
				this.slotAbove.append(clone);
				target = this.slotAbove;
			} else if(anchor === ANCHOR_BELOW){
				this.slotBelow.append(clone);
				target = this.slotBelow;
			} else {
				var stack = this.stacks[anchor] || this.stacks[0];
				if(stack && stack.length){
					stack.append(clone);
					target = stack;
				}
			}

			/* Ensure inner stacks with content are visible */
			if(target && target.hasClass('wpgmza-live-preview-stack')){
				target.css('display', 'flex');
			}

			/* Call component init */
			var def = COMPONENTS[key];
			if(def.onInit){
				try {
					def.onInit(map, clone);
				} catch(e){
					console.warn('AtlasMajorLivePreview: init failed for ' + key, e);
				}
			}

			this._activeComponents[key] = true;
		}

		/* Hide empty stacks */
		this.mapElement.find('.wpgmza-live-preview-stack').each(function(){
			if(!$(this).children('.wpgmza-live-preview-component').length){
				$(this).css('display', '');
			}
		});

		/* Fire event for Pro to hook into */
		$(document.body).trigger('wpgmza_live_preview_rendered', [this]);
	}

	/* ========================================================
	   TEARDOWN — removes component and cleans up JS instance
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview.prototype.teardownComponent = function(key){
		var def = COMPONENTS[key];
		if(def && def.onTeardown){
			try {
				def.onTeardown(this.map);
			} catch(e){
				console.warn('AtlasMajorLivePreview: teardown failed for ' + key, e);
			}
		}
		delete this._activeComponents[key];
	}

	/* ========================================================
	   EVENT BINDING
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview.prototype.bindEvents = function(){
		var self = this;
		var timer = null;

		function debouncedRender(){
			clearTimeout(timer);
			timer = setTimeout(function(){ self.render(); }, 200);
		}

		/* Watch all known component fields */
		var selectors = [];
		for(var key in COMPONENTS){
			var def = COMPONENTS[key];
			if(def.anchorField) selectors.push(def.anchorField);
		}
		/* Toggle checkboxes */
		selectors.push('input[name="store_locator_enabled"]');

		$(document.body).on('change', selectors.join(','), debouncedRender);

		/* cmn-toggle labels */
		$(document.body).on('click', 'label[for="store_locator_enabled"]', function(){
			setTimeout(debouncedRender, 50);
		});

		/* Allow Pro to add more watched fields */
		$(document.body).on('wpgmza_live_preview_watch_field', function(e, selector){
			$(document.body).on('change', selector, debouncedRender);
		});
	}

	/* ========================================================
	   STORE LOCATOR SETTINGS SYNC
	   Updates live-changeable settings without full rebuild.
	   Structural changes trigger a full rebuild via render().
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview.prototype.initStoreLocatorSettingsSync = function(){
		var self = this;
		var map = this.map;

		/* --- Circle settings (color, opacity, radius style) ---
		   Sync value into map.settings, destroy cached circle,
		   re-trigger filtering to redraw with new values */
		/* Destroy circle and re-trigger filtering to recreate it */
		function destroyAndRedrawCircle(){
			if(map.storeLocator && map.storeLocator._circle){
				var circle = map.storeLocator._circle;
				circle.setVisible(false);
				if(!(circle instanceof WPGMZA.ModernStoreLocatorCircle) && circle.map){
					/* Classic circle — remove from map cleanly. */
					try { circle.map.removeCircle(circle); } catch(e){}
				} else if(circle instanceof WPGMZA.ModernStoreLocatorCircle && typeof circle.destroy === 'function'){
					/* Modern circle is a canvas overlay — setVisible(false)
					 * only hides, leaving the canvas attached to the DOM.
					 * Without destroy(), a subsequent modern→modern cycle
					 * (radar→classic→radar) stacks orphaned canvases which
					 * block the new canvas's paint. Engine-specific
					 * subclasses all implement destroy() to detach canvas
					 * + unbind map events. */
					try { circle.destroy(); } catch(e){}
				}
				map.storeLocator._circle = null;
			}
			if(map.storeLocator && map.storeLocator.state === WPGMZA.StoreLocator.STATE_APPLIED && map.storeLocator._center){
				map.markerFilter.update({}, map.storeLocator);
			}
		}

		/* Update modern circle color/draw without destroying */
		function updateModernCircleColor(){
			if(map.storeLocator && map.storeLocator._circle && map.storeLocator._circle instanceof WPGMZA.ModernStoreLocatorCircle){
				map.storeLocator._circle.settings.color = map.storeLocator.circleStrokeColor;
				if(typeof map.storeLocator._circle.draw === 'function'){
					map.storeLocator._circle.draw();
				}
				return true;
			}
			return false;
		}

		/* Color fields — live update for modern circle, destroy+redraw for classic */
		['sl_stroke_color', 'sl_fill_color'].forEach(function(name){
			$(document.body).on('change input', '[name="' + name + '"]', function(){
				map.settings[name] = $(this).val();
				if(!updateModernCircleColor()){
					destroyAndRedrawCircle();
				}
			});
		});

		/* Opacity fields — only affect classic circle */
		['sl_stroke_opacity', 'sl_fill_opacity'].forEach(function(name){
			$(document.body).on('change input', '[name="' + name + '"]', function(){
				map.settings[name] = $(this).val();
				destroyAndRedrawCircle();
			});
		});

		/* Radius style switch — always needs full destroy+recreate (different circle class) */
		$(document.body).on('change input', '[name="wpgmza_store_locator_radius_style"]', function(){
			map.settings.wpgmza_store_locator_radius_style = $('[name="wpgmza_store_locator_radius_style"]:checked').val();
			destroyAndRedrawCircle();
		});

		/* --- Live-updatable simple settings (just sync into map.settings) ---
		 * Some fields (store_locator_button_style, store_locator_style)
		 * are ALSO in rebuildFields below — the rebuildFields handler
		 * triggers a render but doesn't sync map.settings. We include
		 * them here too so map.settings has the new value by the time
		 * render() finishes and wpgmza_live_preview_rendered fires
		 * (post-render transforms like applyButtonStyleToPreview read
		 * from map.settings). Both handlers fire on change; simpleFields
		 * is bound first so the sync lands before render is scheduled. */
		var simpleFields = [
			'wpgmza_store_locator_bounce',
			'store_locator_distance',
			'store_locator_auto_area_max_zoom',
			'store_locator_show_distance',
			'wpgmza_store_locator_use_their_location',
			'wpgmza_store_locator_hide_before_search',
			'store_locator_nearby_searches',
			'wpgmza_store_locator_restrict',
			'store_locator_button_style',
			'store_locator_style',
			/* Info window settings — handled separately below */
			'close_infowindow_on_map_click'
		];

		simpleFields.forEach(function(name){
			$(document.body).on('change input', '[name="' + name + '"]', function(){
				var el = $(this);
				if(el.is(':checkbox')){
					/* Unchecked = '' (falsy) NOT '0' — the string '0' is
					 * truthy in JS so downstream `if(map.settings.foo)`
					 * checks treat unchecked checkboxes as enabled. */
					map.settings[name] = el.is(':checked') ? '1' : '';
				} else if(el.is(':radio')){
					map.settings[name] = $('[name="' + name + '"]:checked').val();
				} else {
					map.settings[name] = el.val();
				}
			});
		});

		/* --- Live text updates — modify the cloned DOM directly ---
		   Fallbacks route through WPGMZA.localized_strings so translated
		   copy shows when the user hasn't entered a custom override.
		   Strings are registered in class.strings.php::getLocalizedStrings(). */
		var LS = (WPGMZA && WPGMZA.localized_strings) || {};
		var textFieldMap = {
			'store_locator_query_string': function(val){
				$('.wpgmza-live-preview-component.wpgmza-store-locator label.wpgmza-address, .wpgmza-live-preview-component .wpgmza-store-locator label.wpgmza-address').text(val || LS.atlas_major_sl_address_label || 'ZIP / Address:');
			},
			'store_locator_location_placeholder': function(val){
				$('.wpgmza-live-preview-component.wpgmza-store-locator input.wpgmza-address, .wpgmza-live-preview-component .wpgmza-store-locator input.wpgmza-address').attr('placeholder', val || LS.autcomplete_placeholder || 'Enter a location');
			},
			'store_locator_name_string': function(val){
				$('.wpgmza-live-preview-component.wpgmza-store-locator label.wpgmza-keywords, .wpgmza-live-preview-component .wpgmza-store-locator label.wpgmza-keywords').text(val || LS.atlas_major_sl_keywords_label || 'Title / Description:');
				$('.wpgmza-live-preview-component.wpgmza-store-locator input.wpgmza-keywords, .wpgmza-live-preview-component .wpgmza-store-locator input.wpgmza-keywords').attr('placeholder', val || LS.atlas_major_sl_keywords_placeholder || 'Enter a title');
			},
			'store_locator_not_found_message': function(val){
				map.settings.store_locator_not_found_message = val;
			},
			'store_locator_default_address': function(val){
				map.settings.store_locator_default_address = val;
				$('.wpgmza-live-preview-component.wpgmza-store-locator input.wpgmza-address, .wpgmza-live-preview-component .wpgmza-store-locator input.wpgmza-address').val(val || '');
			},
			'wpgmza_store_locator_default_radius': function(val){
				map.settings.wpgmza_store_locator_default_radius = val;
				$('.wpgmza-live-preview-component.wpgmza-store-locator select.wpgmza-radius, .wpgmza-live-preview-component .wpgmza-store-locator select.wpgmza-radius').val(val);
			}
		};

		for(var tfName in textFieldMap){
			(function(name, handler){
				$(document.body).on('change input', '[name="' + name + '"]', function(){
					handler($(this).val());
				});
			})(tfName, textFieldMap[tfName]);
		}

		/* Re-apply every textFieldMap handler from the current form
		 * value. Used after a full live-preview render() — toggling a
		 * structural field (Enable Title Search, Enable Categories,
		 * etc.) reclones the store locator template, which resets all
		 * the user's customised labels/placeholders/default address/
		 * default radius back to template defaults. Re-running each
		 * handler against the current form state restores those
		 * customisations on the freshly-cloned DOM. */
		function reapplyTextFieldValues(){
			for(var name in textFieldMap){
				var $input = $('[name="' + name + '"]');
				if(!$input.length) continue;
				try {
					textFieldMap[name]($input.val());
				} catch(e){ }
			}
		}

		/* Distance unit DOM sync — bring the SL DOM (suffix span +
		 * radius option text) in line with the current form-state
		 * unit. Idempotent: safe to call any time, including
		 * immediately after a fresh template clone whose option
		 * text was server-rendered with the SAVED unit baked in.
		 *
		 * The `oldSuffix` derivation reads from the live form value
		 * (`isMiles ? 'km' : 'mi'`) and the regex only matches
		 * options ending with that opposite suffix — so calling
		 * this on a DOM that already matches the form is a no-op
		 * (the regex fails to match, nothing changes).
		 *
		 * Localised strings aren't available client-side, so we
		 * fall back to English — acceptable because this is the
		 * admin-only live preview. */
		function applyDistanceUnitToDOM(){
			var isMiles = $('input[name="store_locator_distance"]').is(':checked');
			var oldSuffix = isMiles ? 'km' : 'mi';
			var newSuffix = isMiles ? 'mi' : 'km';
			map.settings.store_locator_distance = isMiles ? '1' : '0';

			/* Swap the suffix text. class.map-edit-page.php wraps the
			 * suffix in <span class="wpgmza-distance-unit-suffix">. */
			$('.wpgmza-distance-unit-suffix').text(newSuffix);

			/* Each <option> in the live-preview store locator's radius
			 * dropdown has its unit baked into the text ("10km",
			 * "25km", etc.) because StoreLocator::populateRadiusSelect
			 * writes `$radius . $suffix` at server render. Swap the
			 * trailing unit on every option so the dropdown reflects
			 * the current toggle state. The underlying `value`
			 * attribute (just the number) is unchanged. */
			$('.wpgmza-live-preview-component .wpgmza-radius option, .wpgmza-live-preview-component select.wpgmza-radius option').each(function(){
				var $opt = $(this);
				var text = $opt.text();
				/* Only rewrite options that end with the old suffix,
				 * so we don't double-suffix on repeat toggles. */
				var re = new RegExp('(\\d+)\\s*' + oldSuffix + '\\s*$', 'i');
				if(re.test(text)){
					$opt.text(text.replace(re, '$1' + newSuffix));
				}
			});
		}

		/* User toggled the distance unit — full update including
		 * circle redraw and info-window clear (in case "X miles
		 * away" is currently showing). */
		$(document.body).on('change', 'input[name="store_locator_distance"]', function(){
			applyDistanceUnitToDOM();

			/* Rebuild the circle so its radius recalculates under the
			 * new unit. Modern circles redraw in-place via draw();
			 * classic circles need a full destroy+recreate. */
			if(!updateModernCircleColor()){
				destroyAndRedrawCircle();
			}

			/* Info window "X miles/km away" text is cached in the open
			 * popup — rebuild it so the unit flips too. info-window.js
			 * reads map.settings.store_locator_distance live in
			 * getContent, so reopening the popup regenerates the text
			 * with the new unit. */
			clearCachedInfoWindows();
		});

		/* Live preview re-rendered (most importantly: SL toggled
		 * back on after being off). The freshly-cloned SL template
		 * was server-rendered with the SAVED unit baked into the
		 * radius option text + suffix span, so if the user changed
		 * the unit while SL was disabled, the re-enabled template
		 * would still display the saved unit. Re-applying the DOM
		 * sync brings it in line with the current form value.
		 *
		 * Lightweight only — no circle redraw, no info-window
		 * clear, since the re-init path handles those naturally
		 * (no circle yet on a fresh re-enable, info windows already
		 * cleared by the marker teardown/rebuild). Mirrors the
		 * pattern used by `applyKeywordSearchVisibility` in
		 * atlas-major-live-preview-pro.js. */
		$(document.body).on('wpgmza_live_preview_rendered', function(){
			applyDistanceUnitToDOM();
		});

		/* --- Info window settings — sync + clear cached info windows so new style applies --- */
		var iwFields = ['wpgmza_iw_type', 'iw_primary_color', 'iw_accent_color', 'iw_text_color'];

		function clearCachedInfoWindows(){
			if(!map.markers) return;

			/* Find which marker has an open info window */
			var openMarker = null;
			for(var i = 0; i < map.markers.length; i++){
				var m = map.markers[i];
				if(m.infoWindow && m.infoWindow.element && $(m.infoWindow.element).is(':visible')){
					openMarker = m;
				}
			}
			if(!openMarker && map.lastInteractedMarker && map.lastInteractedMarker.infoWindow){
				openMarker = map.lastInteractedMarker;
			}

			/* Close and delete all cached info windows */
			for(var i = 0; i < map.markers.length; i++){
				if(map.markers[i].infoWindow){
					try { map.markers[i].infoWindow.close(); } catch(e){}
					delete map.markers[i].infoWindow;
				}
			}

			/* Clear lastInteractedMarker so openInfoWindow doesn't try to close a deleted infoWindow */
			map.lastInteractedMarker = null;

			/* Reopen on the same marker with new style */
			if(openMarker){
				setTimeout(function(){
					openMarker.openInfoWindow();
				}, 100);
			}
		}

		iwFields.forEach(function(name){
			$(document.body).on('change input', '[name="' + name + '"]', function(){
				var el = $(this);
				if(el.is(':radio')){
					map.settings[name] = $('[name="' + name + '"]:checked').val();
				} else {
					map.settings[name] = el.val();
				}
				clearCachedInfoWindows();
			});
		});

		/* "Show distance from search" — toggles whether marker info windows
		 * include "X miles/km away" after a store locator search.
		 *
		 * Two problems `simpleFields` above introduces that we fix here:
		 *
		 * 1. simpleFields writes a STRING '1'/'0' into map.settings. The
		 *    info-window.js check `if(map.settings.store_locator_show_distance
		 *    && ...)` is ALWAYS truthy for a non-empty string — the string
		 *    '0' reads as true, leaving the distance visible after OFF.
		 *    We overwrite with an integer 0/1 so the truthy check works.
		 *
		 * 2. simpleFields binds on `'change input'` — a checkbox click
		 *    fires BOTH events. simpleFields thus writes the string value
		 *    twice (once per event). If we only listen for 'change', our
		 *    integer gets clobbered by the subsequent 'input' event
		 *    writing the string back. We bind on both events too so our
		 *    integer wins reliably.
		 *
		 * clearCachedInfoWindows is called once (on the 'change' event
		 * only) so we close + reopen the info window exactly once per
		 * user toggle — not twice per click. */
		$(document.body).on('change input', 'input[name="store_locator_show_distance"]', function(e){
			map.settings.store_locator_show_distance = $(this).is(':checked') ? 1 : 0;
			if(e.type === 'change'){
				clearCachedInfoWindows();
			}
		});

		/* Enable Store Locator toggle — when turned OFF mid-search, tear
		 * down the side-effects of the previous search: destroy the
		 * circle, reset state to INITIAL, and refresh info windows so
		 * they drop the "X miles/km away" line (the check in
		 * info-window.js gates on storeLocator.state === STATE_APPLIED,
		 * which no longer holds after the reset). Without this teardown
		 * the circle stayed painted on the map and info windows kept
		 * the stale distance text after the toggle flipped off. */
		$(document.body).on('change', 'input[name="store_locator_enabled"]', function(){
			if($(this).is(':checked')) return; // turning ON — render() handles it via bindEvents

			if(map.storeLocator){
				/* Destroy circle (same logic as destroyAndRedrawCircle
				 * but without the follow-up redraw). */
				if(map.storeLocator._circle){
					var circle = map.storeLocator._circle;
					circle.setVisible(false);
					if(!(circle instanceof WPGMZA.ModernStoreLocatorCircle) && circle.map){
						try { circle.map.removeCircle(circle); } catch(e){}
					} else if(circle instanceof WPGMZA.ModernStoreLocatorCircle && typeof circle.destroy === 'function'){
						try { circle.destroy(); } catch(e){}
					}
					map.storeLocator._circle = null;
				}
				/* Reset search state so info-window.js' distance check
				 * (storeLocator.state === STATE_APPLIED) no longer
				 * passes. We don't touch map.storeLocator._center /
				 * _bounds — if the user toggles SL back on the state
				 * goes back to INITIAL and they'll need to search
				 * again, which matches the expected reset UX. */
				map.storeLocator.state = WPGMZA.StoreLocator.STATE_INITIAL;
			}

			clearCachedInfoWindows();
		});

		/* --- Map width/height — apply to the map wrapper (NOT the mockup
		 * page). Previously this wrote `max-width` onto
		 * `.am-preview-page-inner`, which shrank the entire mockup
		 * "website" frame instead of just the map. It also caused a
		 * visual shift because .am-preview-page-inner has
		 * `margin-left: max(70px, calc((100% - 1000px) / 2))` that
		 * still assumes max-width: 1000px — once JS overwrote that
		 * with 100%, the margin calc went off-grid. Now we target the
		 * map wrapper, which sits inside the page-inner and is what
		 * the frontend equivalent (.wpgmza_map inline style) also
		 * sizes. */
		function updateMapDimensions(){
			var width = $('input[name="map_width"]').val();
			var widthType = $('select[name="map_width_type"]').val() || '%';
			var height = $('input[name="map_height"]').val();
			var heightType = $('select[name="map_height_type"]').val() || 'px';

			var mapWrapper = $('.am-preview-page-inner .map_wrapper');
			var mapEl = $(map.element);

			if(width && widthType){
				mapWrapper.css({
					'width': width + widthType,
					'max-width': '100%' // so % values remain parent-bound
				});
			}
			if(height && heightType){
				mapWrapper.css({
					'height': height + heightType,
					'min-height': height + heightType
				});
				mapEl.css({
					'height': height + heightType,
					'min-height': height + heightType
				});
			}

			/* Tell the map engine to resize to fit its new container.
			 * onElementResized handles most engines; Leaflet needs an
			 * explicit invalidateSize() because it caches viewport
			 * dimensions and doesn't recalc unless told to. */
			setTimeout(function(){
				if(map.onElementResized){
					map.onElementResized();
				}
				if(map.leafletMap && typeof map.leafletMap.invalidateSize === 'function'){
					map.leafletMap.invalidateSize();
				}
				self.setViewportVariables();
			}, 100);
		}

		$(document.body).on('change input', 'input[name="map_width"], select[name="map_width_type"], input[name="map_height"], select[name="map_height_type"]', function(){
			updateMapDimensions();
		});

		/* Apply the saved width/height once on initial load too — the
		 * change handler only fires on user interaction, so without
		 * this initial call the preview shows the map at its CSS
		 * default (100% width) regardless of the saved map_width value
		 * (e.g. 500px). Defer slightly so the form values have been
		 * populated by the upstream WPGMZA init. */
		setTimeout(updateMapDimensions, 500);

		/* Apply store_locator_button_style (SVG icons vs. text buttons)
		 * to any currently-rendered live preview component. The hidden
		 * template always holds the icon (SVG) version — we transform
		 * to text buttons here when the setting calls for it. Mirrors
		 * the PHP logic in class.store-locator.php that does the same
		 * transformation at server render time. */
		function applyButtonStyleToPreview(){
			var style = (map.settings && map.settings.store_locator_button_style) || '';
			$('.wpgmza-live-preview-component.wpgmza-store-locator, .wpgmza-live-preview-component .wpgmza-store-locator').each(function(){
				var wrapper = this;
				if(style === 'text'){
					$(wrapper).find('svg[role="button"]').each(function(){
						var svg = this;
						var btn = document.createElement('button');
						btn.textContent = svg.getAttribute('title') || '';
						var attrs = ['class', 'aria-label'];
						for(var i = 0; i < attrs.length; i++){
							if(svg.hasAttribute(attrs[i])){
								btn.setAttribute(attrs[i], svg.getAttribute(attrs[i]));
							}
						}
						/* The PHP strips .wpgmza-aria-bridge on buttons */
						btn.classList.remove('wpgmza-aria-bridge');
						svg.parentNode.insertBefore(btn, svg.nextSibling);
						svg.parentNode.removeChild(svg);
					});
				}
				/* For 'icons' (default) we don't need to do anything — the
				 * template clone already has SVG buttons. The reverse
				 * transform (text → SVG) isn't possible without a
				 * template copy, which is why we force the PHP template
				 * render to always use icons. */
			});
		}

		/* Re-apply button style after every live-preview render. The
		 * render() flow clones the template (always icons) and replaces
		 * existing components, so we need to re-transform to 'text'
		 * after each render. Same reasoning for reapplyTextFieldValues:
		 * a structural rebuild (Enable Title Search etc.) reclones the
		 * store locator template, dropping any user-customised labels/
		 * placeholders/defaults. Re-applying the textFieldMap handlers
		 * from the current form state restores them. */
		$(document.body).on('wpgmza_live_preview_rendered', function(){
			applyButtonStyleToPreview();
			reapplyTextFieldValues();
		});

		/* Also apply right now — the constructor calls render() BEFORE
		 * initStoreLocatorSettingsSync binds listeners, so the initial
		 * render's `wpgmza_live_preview_rendered` event fires before
		 * we're listening. Running once here covers that initial pass;
		 * subsequent renders go through the listener above. */
		applyButtonStyleToPreview();

		/* --- Structural changes — need full store locator rebuild --- */
		var rebuildFields = [
			'store_locator_name_search',
			'store_locator_category',
			'store_locator_search_area',
			'store_locator_button_style',
			'store_locator_style'
		];

		var rebuildTimer = null;
		rebuildFields.forEach(function(name){
			$(document.body).on('change', '[name="' + name + '"]', function(){
				clearTimeout(rebuildTimer);
				rebuildTimer = setTimeout(function(){ self.render(); }, 300);
			});
		});

		/* Toggle labels for structural fields (need full rebuild) */
		$(document.body).on('click',
			'label[for="wpgmza_store_locator_name_search"], label[for="wpgmza_store_locator_category_enabled"]',
			function(){
				clearTimeout(rebuildTimer);
				rebuildTimer = setTimeout(function(){ self.render(); }, 300);
			}
		);

		/* Toggle labels for simple settings (just sync).
		 *
		 * NOTE: `store_locator_show_distance` was intentionally REMOVED
		 * from this selector list. The dedicated change handler above
		 * writes an INTEGER (0/1) so the truthy check in
		 * info-window.js works correctly; this label-click handler
		 * fires a 50ms-delayed STRING write ('0'/'1') that ran AFTER
		 * change/input events and clobbered the integer with a string
		 * (which reads as truthy — causing the distance line to stick
		 * even when the toggle was off). Clicking a <label for="X">
		 * natively toggles the checkbox and fires change/input events
		 * on the input, so `simpleFields` already syncs — this
		 * click-delayed write is redundant for all four toggles. */
		$(document.body).on('click',
			'label[for="wpgmza_store_locator_use_their_location"], label[for="wpgmza_store_locator_hide_before_search"], label[for="store_locator_nearby_searches"]',
			function(){
				var forId = $(this).attr('for');
				var checkbox = $('#' + forId);
				setTimeout(function(){
					/* Unchecked = '' (falsy), NOT '0' (truthy string) */
					map.settings[checkbox.attr('name')] = checkbox.is(':checked') ? '1' : '';
				}, 50);
			}
		);
	}

	/* ========================================================
	   MAP STATE SYNC
	   Apply map-level settings (start position, zoom, bounds,
	   streetview) directly to the map via existing APIs — no
	   component rebuild needed.
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview.prototype.initMapStateSync = function(){
		var self = this;
		var map = this.map;

		function readFloat(sel){
			var v = parseFloat($(sel).val());
			return isNaN(v) ? null : v;
		}

		function readInt(sel){
			var v = parseInt($(sel).val());
			return isNaN(v) ? null : v;
		}

		/* Note: map_start_lat/lng/zoom and wpgmza_start_location/zoom are
		   implicit hidden fields — they auto-update as the user pans/zooms
		   the map. No explicit watcher needed. */

		/* --- Max/min zoom limits ---
		   NOTE: the form field names are misleading. Per the UI labels:
		     map_max_zoom  = "Maximum Zoom Out Level" → Google minZoom
		     map_min_zoom  = "Maximum Zoom In Level"  → Google maxZoom */
		function applyZoomLimits(){
			var outLimit = readInt('input[name="map_max_zoom"]'); /* most zoomed out */
			var inLimit  = readInt('input[name="map_min_zoom"]'); /* most zoomed in */

			map.settings.map_max_zoom = outLimit;
			map.settings.map_min_zoom = inLimit;

			/* Engine-specific — Google Maps is the primary engine */
			if(map.googleMap && typeof map.googleMap.setOptions === 'function'){
				var opts = {};
				if(outLimit !== null) opts.minZoom = outLimit;
				if(inLimit !== null)  opts.maxZoom = inLimit;
				map.googleMap.setOptions(opts);
			}
			/* Leaflet */
			if(map.leafletMap){
				if(outLimit !== null && typeof map.leafletMap.setMinZoom === 'function') map.leafletMap.setMinZoom(outLimit);
				if(inLimit !== null  && typeof map.leafletMap.setMaxZoom === 'function') map.leafletMap.setMaxZoom(inLimit);
			}
		}

		$(document.body).on('change input', 'input[name="map_max_zoom"], input[name="map_min_zoom"]', applyZoomLimits);

		/* --- Start in streetview (Google Maps only) ---
		 * The editor workflow (Atlas Novus behaviour) is: toggle ON → .streetview-starting-editor
		 * fieldset fades in and WPGMZA.StreetViewEditor enters add mode. The user drags the
		 * native Google pegman from the map's top-right control onto a location; position/
		 * heading/pitch then populate. All of that is handled by Pro's ProMapEditPage +
		 * StreetViewEditor (pro-map-edit-page.js + streetview-editor.js) bound to the single
		 * admin map instance — the live preview shares that same map, so no extra wiring is
		 * needed here. We only mirror the raw setting value onto map.settings.
		 */
		$(document.body).on('change', 'input[name="map_starts_in_streetview"]', function(){
			var enabled = $(this).is(':checked');
			map.settings.map_starts_in_streetview = enabled ? '1' : '0';

			/* If the map currently has streetview open (e.g. loaded with this setting
			   already enabled + a saved location) and the user toggles OFF, close it
			   so the user isn't stuck looking at streetview. */
			if(!enabled && typeof map.closeStreetView === 'function'){
				map.closeStreetView();
			}
		});

		/* --- Jump to nearest marker on init — trigger the effect on toggle --- */
		$(document.body).on('change', 'input[name="jump_to_nearest_marker_on_initialization"]', function(){
			map.settings.jump_to_nearest_marker_on_initialization = $(this).is(':checked') ? '1' : '';
			if(!$(this).is(':checked')) return;

			/* Find nearest marker to current center and pan to it */
			if(!map.markers || !map.markers.length) return;
			var center = map.getCenter();
			if(!center) return;

			var nearest = null;
			var nearestDist = Infinity;
			for(var i = 0; i < map.markers.length; i++){
				var m = map.markers[i];
				if(!m.lat || !m.lng) continue;
				var dLat = m.lat - center.lat;
				var dLng = m.lng - center.lng;
				var dist = dLat*dLat + dLng*dLng;
				if(dist < nearestDist){
					nearestDist = dist;
					nearest = m;
				}
			}
			if(nearest && WPGMZA.LatLng){
				map.setCenter(new WPGMZA.LatLng({lat: nearest.lat, lng: nearest.lng}));
			}
		});

		/* --- Fit bounds to markers --- */
		function fitBoundsToMarkers(){
			if(!map.markers || !map.markers.length) return;
			if(typeof map.fitBoundsToVisibleMarkers === 'function'){
				map.fitBoundsToVisibleMarkers();
				return;
			}
			/* Fallback */
			if(WPGMZA.LatLngBounds){
				var bounds = new WPGMZA.LatLngBounds();
				for(var i = 0; i < map.markers.length; i++){
					var m = map.markers[i];
					if(m.lat && m.lng) bounds.extend(new WPGMZA.LatLng({lat: m.lat, lng: m.lng}));
				}
				if(typeof map.fitBounds === 'function') map.fitBounds(bounds);
			}
		}

		$(document.body).on('change', 'input[name="fit_maps_bounds_to_markers"]', function(){
			map.settings.fit_maps_bounds_to_markers = $(this).is(':checked') ? '1' : '';
			if($(this).is(':checked')) fitBoundsToMarkers();
		});

		/* --- Fit bounds to markers after filtering --- */
		var fitOnFilterHandler = null;
		function setFitOnFilterHandler(enable){
			if(fitOnFilterHandler){
				$(document.body).off('filteringcomplete.wpgmza.fitOnFilter');
				fitOnFilterHandler = null;
			}
			if(enable){
				fitOnFilterHandler = function(event){
					if(event.map && event.map.id === map.id){
						fitBoundsToMarkers();
					}
				};
				$(document.body).on('filteringcomplete.wpgmza.fitOnFilter', fitOnFilterHandler);
			}
		}

		$(document.body).on('change', 'input[name="fit_maps_bounds_to_markers_after_filtering"]', function(){
			var enabled = $(this).is(':checked');
			map.settings.fit_maps_bounds_to_markers_after_filtering = enabled ? '1' : '0';
			setFitOnFilterHandler(enabled);
		});

		/* Initial state on load */
		if($('input[name="fit_maps_bounds_to_markers_after_filtering"]').is(':checked')){
			setFitOnFilterHandler(true);
		}

		/* --- Map alignment ---
		 * Align the map within the live preview's mockup page.
		 * Values mirror the select options:
		 *   1 = Left (default), 2 = Center, 3 = Right, 4 = None
		 * We apply margin-* on the .map_wrapper so the map element
		 * sits in the requested position when its width is < 100%.
		 * For 100%-wide maps the alignment is visually a no-op. */
		function applyMapAlignment(){
			var v = parseInt($('select[name="wpgmza_map_align"]').val(), 10);
			var wrapper = $('.am-preview-page-inner .map_wrapper');
			if(!wrapper.length) return;

			/* Reset alignment-related margins first so we don't stack */
			wrapper.css({ 'margin-left': '', 'margin-right': '' });

			switch(v){
				case 2: /* Center */
					wrapper.css({ 'margin-left': 'auto', 'margin-right': 'auto' });
					break;
				case 3: /* Right */
					wrapper.css({ 'margin-left': 'auto', 'margin-right': '0' });
					break;
				case 4: /* None — no alignment, sits at default flow position */
				case 1: /* Left — default */
				default:
					wrapper.css({ 'margin-left': '0', 'margin-right': 'auto' });
					break;
			}
		}

		$(document.body).on('change input', 'select[name="wpgmza_map_align"]', applyMapAlignment);
		/* Apply once on load so the saved alignment takes effect without
		 * requiring user interaction. Slight delay so the form value
		 * is populated. */
		setTimeout(applyMapAlignment, 500);
	}

	/* ========================================================
	   MARKER BEHAVIOUR SYNC
	   Mirror marker click / info-window click-behaviour flags into
	   map.settings so Pro's runtime code (ProMarker.onClick,
	   ProMap.onMapClick) picks them up on the next interaction.
	   For enable_marker_labels, iterate existing markers and apply
	   setLabel() immediately so the change is visible without a reload.
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview.prototype.initMarkerBehaviourSync = function(){
		var map = WPGMZA.maps[0];
		if(!map) return;

		/* --- Click marker opens link --- */
		$(document.body).on('change', 'input[name="click_open_link"]', function(){
			map.settings.click_open_link = $(this).is(':checked') ? 1 : 0;
		});

		/* --- Zoom on marker click (+ zoom level from slider) ---
		 * The slider writes its value to input[name="wpgmza_zoom_on_marker_click_slider"];
		 * the existing zoom-slider UI fires change events on that input already. */
		$(document.body).on('change', 'input[name="wpgmza_zoom_on_marker_click"]', function(){
			map.settings.wpgmza_zoom_on_marker_click = $(this).is(':checked') ? 1 : 0;
		});

		$(document.body).on('change input', 'input[name="wpgmza_zoom_on_marker_click_slider"]', function(){
			var v = parseInt($(this).val(), 10);
			if(!isNaN(v)) map.settings.wpgmza_zoom_on_marker_click_slider = v;
		});

		/* close_infowindow_on_map_click is already synced by initStoreLocatorSettingsSync's
		   simpleFields array — no handler needed here. */

		/* --- Enable marker labels (beta) ---
		 * ProMarker applies labels at onAdd/setVisible time using map.settings.enable_marker_labels
		 * and the marker's own title. Iterate existing markers and flip them live. */
		$(document.body).on('change', 'input[name="enable_marker_labels"]', function(){
			var enabled = $(this).is(':checked');
			map.settings.enable_marker_labels = enabled ? 1 : 0;

			if(!map.markers) return;
			for(var i = 0; i < map.markers.length; i++){
				var m = map.markers[i];
				if(typeof m.setLabel !== 'function') continue;
				if(enabled){
					if(m.title){
						m.setLabel(m.title);
					}
				} else {
					m.setLabel(null);
				}
			}
		});
	}

	/* ========================================================
	   CONTROLS & LAYERS SYNC (Map Settings → Advanced)
	   Live-apply layer toggles and scale control via the existing
	   engine methods. All of these are idempotent — calling them
	   with the same enable state is a no-op.
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview.prototype.initControlsAndLayersSync = function(){
		var map = WPGMZA.maps[0];
		if(!map) return;

		function syncAndApply(name, method){
			$(document.body).on('change', 'input[name="' + name + '"]', function(){
				var enabled = $(this).is(':checked');
				map.settings[name] = enabled ? '1' : '0';
				if(typeof map[method] === 'function'){
					map[method](enabled);
				}
			});
		}

		syncAndApply('bicycle',          'enableBicycleLayer');
		syncAndApply('traffic',          'enableTrafficLayer');
		syncAndApply('transport_layer',  'enablePublicTransportLayer');
		syncAndApply('enable_scale_control', 'enableScaleControl');
	}

	/* ========================================================
	   SAVE REMINDER
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview.prototype.initSaveReminder = function(){
		var self = this;
		var shown = false;

		var fadeTimer = null;
		var frontendOnlyFadeTimer = null;

		/* Settings whose changes do NOT affect the live preview. When these
		   change, show a "frontend only" notice instead of the save reminder. */
		var FRONTEND_ONLY_SETTINGS = [
			'only_load_markers_within_viewport',
			'lazyload_info_window_content',
			/* Mobile overrides — preview frame is fixed-size desktop,
			   these only take effect on a real mobile viewport. */
			'zoom_level_mobile_override_enabled',
			'zoom_level_mobile_override',
			'map_dimensions_mobile_override_enabled',
			'map_mobile_width',
			'map_mobile_width_type',
			'map_mobile_height',
			'map_mobile_height_type',
			/* Advanced tab — frontend-only behaviours */
			'disable_lightbox_images',   /* takes effect on marker image click on frontend */
			'use_Raw_Jpeg_Coordinates',  /* admin-side JPEG exif reader, no live preview effect */
			/* Marker Listing — click-triggered effects only */
			'marker_listing_nudge_marker_center',
			'marker_listing_nudge_x',
			'marker_listing_nudge_y',
			'zoom_level_on_marker_listing_override',
			'zoom_level_on_marker_listing_click',
			'marker_listing_disable_zoom',
			/* Directions — fires only when user runs directions */
			'directions_behaviour',
			'force_google_directions_app',
			/* UGM / VGM — all settings only affect the frontend visitor-
			   facing submission form (rendered via shortcode on public
			   pages). None has a live preview effect inside the editor. */
			'wpgmza_ugm_enbaled',
			'wpgmza_ugm_access',
			'wpgmza_ugm_desc_enabled',
			'wpgmza_ugm_category_enbaled',
			'wpgmza_ugm_upload_images',
			'wpgmza_ugm_link_enabled',
			'zoom_after_ugm_submission',
			'wpgmza_ugm_form_header',
			'wpgmza_ugm_form_title',
			'wpgmza_ugm_form_title_ph',
			'wpgmza_ugm_form_address',
			'wpgmza_ugm_form_address_ph',
			'wpgmza_ugm_form_address_help',
			'wpgmza_ugm_form_desc',
			'wpgmza_ugm_form_link',
			'wpgmza_ugm_form_link_ph',
			'wpgmza_ugm_form_image',
			'wpgmza_ugm_form_category'
		];

		function showReminder(){
			if(shown) return;
			shown = true;

			if(self.enabled){
				$('.am-save-reminder-preview').show();
				$('.am-save-reminder-toolbar').hide();
			} else {
				$('.am-save-reminder-toolbar').show();
				$('.am-save-reminder-preview').hide();
			}

			/* Fade out after 8 seconds */
			clearTimeout(fadeTimer);
			fadeTimer = setTimeout(function(){
				$('.am-save-reminder').fadeOut(400, function(){
					shown = false;
				});
			}, 8000);
		}

		function showFrontendOnlyNotice(){
			if(self.enabled){
				$('.am-frontend-only-notice-preview').stop(true, true).show();
				$('.am-frontend-only-notice-toolbar').hide();
			} else {
				$('.am-frontend-only-notice-toolbar').stop(true, true).show();
				$('.am-frontend-only-notice-preview').hide();
			}

			clearTimeout(frontendOnlyFadeTimer);
			frontendOnlyFadeTimer = setTimeout(function(){
				$('.am-frontend-only-notice').fadeOut(400);
			}, 8000);
		}

		function isFrontendOnlySetting(el){
			var name = $(el).attr('name');
			if(!name) return false;
			return FRONTEND_ONLY_SETTINGS.indexOf(name) !== -1;
		}

		/* Listen for ANY form change inside the sidebar */
		$('.wpgmza-editor .sidebar').on('change input', 'input, select, textarea', function(){
			if(isFrontendOnlySetting(this)){
				showFrontendOnlyNotice();
			} else {
				showReminder();
			}
		});

		/* Also catch cmn-toggle label clicks */
		$('.wpgmza-editor .sidebar').on('click', 'label[for]', function(){
			var targetId = $(this).attr('for');
			var targetEl = document.getElementById(targetId);
			if(targetEl && FRONTEND_ONLY_SETTINGS.indexOf($(targetEl).attr('name')) !== -1){
				setTimeout(showFrontendOnlyNotice, 50);
			} else {
				setTimeout(showReminder, 50);
			}
		});

		/* Map move/zoom triggers save reminder */
		if(self.map){
			self.map.on('dragend', function(){ showReminder(); });
			self.map.on('zoomchanged', function(){ showReminder(); });
		}

		/* Update visibility when preview is toggled */
		$('#am-live-preview-toggle').on('change', function(){
			if(shown){
				if(self.enabled){
					$('.am-save-reminder-preview').show();
					$('.am-save-reminder-toolbar').hide();
				} else {
					$('.am-save-reminder-toolbar').show();
					$('.am-save-reminder-preview').hide();
				}
			}
		});
	}

	/* ========================================================
	   PUBLIC API — for Pro to register components
	   ======================================================== */
	WPGMZA.AtlasMajorLivePreview.prototype.registerComponent = function(key, config){
		COMPONENTS[key] = config;

		/* Watch the enabled field and anchor field */
		var self = this;
		if(config.anchorField){
			$(document.body).trigger('wpgmza_live_preview_watch_field', [config.anchorField]);
		}
	}

	WPGMZA.AtlasMajorLivePreview.prototype.getTemplatesContainer = function(){
		return this.templates;
	}

	WPGMZA.AtlasMajorLivePreview.prototype.getMap = function(){
		return this.map;
	}

	/* ========================================================
	   LIVE TILESET SWAP — Themes > Tileset card click applies
	   the new tileset to the live preview map without needing a
	   save. Map editor under Atlas Major previously showed only
	   "Save map to apply tileset!" notification; this hooks the
	   click and reloads the leaflet/maplibre tile layer in place.

	   Pulls config from the public tileservers.json (same source
	   the PHP-side `TileServers::getList()` reads). One-shot
	   fetch, cached on `WPGMZA.atlasMajorTileServers` so repeat
	   clicks don't re-hit the network.

	   Engine guard: only runs on Leaflet-family engines (Google
	   Maps tilesets are managed by Google's own type selector,
	   not the OpenFreeMap/OSM tileset cards in this panel).
	   ======================================================== */
	jQuery(function($){
		var tilesetCache = null;

		function fetchTileServers(callback){
			if(WPGMZA.atlasMajorTileServers){
				callback(WPGMZA.atlasMajorTileServers);
				return;
			}
			if(tilesetCache){
				callback(tilesetCache);
				return;
			}
			$.ajax({
				url: WPGMZA.pluginDirURL + 'js/tileservers.json',
				dataType: 'json',
				cache: true,
				success: function(data){
					/* Stamp slug into each entry, mirroring the PHP
					   getList() behaviour. */
					for(var slug in data){
						if(data[slug] && typeof data[slug] === 'object'){
							data[slug].slug = slug;
						}
					}
					tilesetCache = data;
					WPGMZA.atlasMajorTileServers = data;
					callback(data);
				},
				error: function(){
					/* Silent fail — tileset just won't update live; the
					   pre-existing "Save map to apply" notification
					   already covers the fallback path. */
				}
			});
		}

		/* CRS is locked at leaflet map construction (leaflet-map.js:29-38
		   sets it from `customTileMode` at init only). Trying to swap
		   the layer type (custom image overlay <-> XYZ tiles) into a
		   map whose CRS doesn't match the new layer renders the map
		   grey — XYZ tiles request URLs in Web Mercator coords that
		   don't translate inside L.CRS.Simple, and L.imageOverlay
		   bounds get interpreted as lat/lng inside EPSG3857. The
		   extended Simple CRS preserves `infinite: true`; EPSG3857
		   doesn't set it — that's our reliable signal. */
		function mapHasSimpleCRS(map){
			return !!(map && map.leafletMap && map.leafletMap.options.crs && map.leafletMap.options.crs.infinite);
		}

		/* Reload the leaflet/maplibre tile layer in place using the
		   current map.settings values. Used by both the tileset card
		   click handler and the custom-image field handlers — anything
		   that changes a tile-layer-relevant setting calls this to
		   visualise the change without a save. */
		function reloadLiveTileLayer(){
			if(!WPGMZA.atlasMajorLivePreview) return;
			var lp = WPGMZA.atlasMajorLivePreview;
			var map = lp.getMap && lp.getMap();
			if(!map || !map.leafletMap) return; /* Leaflet-only path */
			if(typeof map.getTileLayers !== 'function') return;

			/* CRS-compat guard: only proceed when the map's locked CRS
			   is appropriate for the layer we're about to add. The
			   modal that fires on custom_tile_enabled toggle already
			   tells the user a save+reload is needed — a fresh map
			   construction will reset the CRS to match. Skipping the
			   reload here keeps the visual stable (last good state)
			   instead of going grey/blank. */
			var wantSimple = !!(map.settings && map.settings.custom_tile_enabled);
			if(mapHasSimpleCRS(map) !== wantSimple) return;

			if(map.tileLayers && map.tileLayers.length){
				map.tileLayers.forEach(function(layer){
					try { map.leafletMap.removeLayer(layer); } catch(e){}
				});
			}

			try {
				map.tileLayers = map.getTileLayers();
				map.tileLayers.forEach(function(layer){
					layer.addTo(map.leafletMap);
				});

				/* Deliberately NOT calling fitBounds(customTileBounds)
				   here. The custom-image branch of getTileLayers sets
				   customTileBounds to `[[0,0],[height,width]]` which is
				   only valid in L.CRS.Simple — but the map was already
				   constructed in EPSG3857 (Mercator) and CRS is locked
				   at construction. Calling fitBounds against those
				   bounds in Mercator pans the map to invalid lat/lng,
				   which onCenterChanged writes into map_start_lat /
				   map_start_lng form fields. Saving then sends garbage
				   coords to the REST endpoint. The custom image
				   overlay visually requires save+reload to display
				   correctly anyway (so the map can be reconstructed
				   with CRS.Simple), so live preview just no-ops the
				   view shift here — the toggle still applies cleanly
				   and the save path stays valid. */
			} catch(e){
				/* If something throws, fall back silently. */
			}
		}

		function applyTilesetToLivePreview(slug){
			if(!WPGMZA.atlasMajorLivePreview) return;
			var lp = WPGMZA.atlasMajorLivePreview;
			var map = lp.getMap && lp.getMap();
			if(!map) return;

			fetchTileServers(function(servers){
				var config = servers[slug];
				if(!config){
					/* Empty slug = "Global Default" — fall back to whatever
					   the engine's default tile server URL is. */
					if(!slug){
						config = WPGMZA.tileServer || null;
					}
					if(!config) return;
				}

				/* Update the in-memory settings so configureTileServer
				   picks up the new override. tile_server_override is
				   the slug; tile_server_override_config is the hydrated
				   definition that getTileLayers reads via
				   configureTileServer (map-settings.js:472-482). */
				map.settings.tile_server_override = slug || '';
				map.settings.tile_server_override_config = config;

				/* For zerocost engine the URL also lives on the global
				   settings under tile_server_url_leaflet_zerocost. Keep
				   it in sync so getTileLayers' switch/case path returns
				   the right base URL. */
				if(WPGMZA.settings && WPGMZA.settings.engine === 'leaflet-zerocost' && config.url){
					WPGMZA.settings.tile_server_url_leaflet_zerocost = config.url;
				}

				reloadLiveTileLayer();
			});
		}

		/* Bind the tileset card click. Body-delegated so it survives
		   the panel re-renders that SidebarGroupings can do. */
		$(document.body).on('click', '#wpgmza-tileset-panel .tileset-option', function(){
			if(!document.querySelector('.wpgmza-atlas-major .am-preview-frame')) return;
			var slug = $(this).find('input[name="tile_server_override"]').val();
			applyTilesetToLivePreview(slug);
		});

		/* Custom Image overlay — Themes > Custom Image tab.
		   `configureTileServer` (map-settings.js:644-676) flips into
		   `type: 'custom'` mode when `custom_tile_enabled` is true and
		   `custom_tile_image` is set. getTileLayers then renders an
		   L.imageOverlay over the explicit bounds derived from
		   width/height. We mirror each form field into map.settings
		   and reload the tile layer so the image appears immediately.

		   Toggling OFF reverts to the active tileset (via the same
		   reload path — when custom_tile_enabled=false, configureTileServer
		   skips the custom branch and returns the regular tile config).
		   Field debounced so dragging width/height inputs doesn't
		   spam reloads on every keystroke. */
		var customTileTimer = null;
		function syncCustomTileFromForm(){
			if(!WPGMZA.atlasMajorLivePreview) return;
			var lp = WPGMZA.atlasMajorLivePreview;
			var map = lp.getMap && lp.getMap();
			if(!map || !map.settings) return;

			map.settings.custom_tile_enabled = $('input[name="custom_tile_enabled"]').is(':checked') ? 1 : 0;
			map.settings.custom_tile_image = $('input[name="custom_tile_image"]').val() || '';
			map.settings.custom_tile_image_width = $('input[name="custom_tile_image_width"]').val() || '';
			map.settings.custom_tile_image_height = $('input[name="custom_tile_image_height"]').val() || '';
			map.settings.custom_tile_image_attribution = $('input[name="custom_tile_image_attribution"]').val() || '';

			/* getTileLayers' custom branch only ever sets customTileMode
			   and customTileBounds — never resets them. If the user
			   toggles custom_tile_enabled off, those flags would stay
			   true from the previous enable, leaking custom-tile state
			   into subsequent renders (and into the saved form payload
			   where leaflet-map.js reads them at construction). Reset
			   them explicitly here whenever the toggle is off. */
			if(!map.settings.custom_tile_enabled){
				map.customTileMode = false;
				map.customTileBounds = null;
				map.customTileDimensions = null;

				/* If the saved map_start_lat / map_start_lng came from a
				   previous custom-tile session they're in L.CRS.Simple
				   pixel coords (e.g., 400, 600 for an 800x600 image),
				   not lat/lng. Saving those would break the map on
				   next reload (leaflet-map.js constructs in EPSG3857
				   without the customTileMode bounds-check at line
				   40-44). Detect out-of-range values and reset to the
				   plugin defaults from class.map.php:195-200 +
				   class.database.php:334 (zoom 4). The setView call
				   triggers MapEditPage.onCenterChanged which writes
				   the new values into map_start_lat / map_start_lng /
				   map_start_zoom inputs. */
				var lat = parseFloat($('input[name="map_start_lat"]').val());
				var lng = parseFloat($('input[name="map_start_lng"]').val());
				var coordsInvalid = isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180;

				if(coordsInvalid && map.leafletMap){
					var defaultLat = 36.778261;
					var defaultLng = -119.4179323999;
					var defaultZoom = 4;

					try {
						map.leafletMap.setView([defaultLat, defaultLng], defaultZoom);
					} catch(e){}

					/* Force-write in case setView's moveend doesn't fire
					   in time before a save click. */
					$('input[name="map_start_lat"]').val(defaultLat).trigger('change');
					$('input[name="map_start_lng"]').val(defaultLng).trigger('change');
					$('input[name="map_start_zoom"]').val(defaultZoom).trigger('change');
				}
			}
		}

		function applyCustomTileLive(){
			clearTimeout(customTileTimer);
			customTileTimer = setTimeout(function(){
				syncCustomTileFromForm();
				reloadLiveTileLayer();
			}, 200);
		}

		/* Modal that intercepts custom-image enable/disable. Because
		   the leaflet CRS is locked at map construction
		   (leaflet-map.js:29-38), live preview can't visually swap
		   between image overlay (CRS.Simple) and XYZ tiles (EPSG3857)
		   without rebuilding the entire engine. Instead, we ask the
		   user to confirm a save+reload — clicking the savemap submit
		   button POSTs the form and the page reloads with the new
		   CRS. Cancel reverts the toggle so the form state stays
		   consistent with what's on screen. */
		var customTileModal = null;
		var customTilePreviousState = null;

		/* Full-screen blocking overlay shown while the editor saves and
		   reloads. Inline-styled so we don't have to ship CSS through
		   the build pipeline for a one-off element. z-index sits above
		   modals (99999) and Leaflet's panes. The reload typically
		   takes <2s; the overlay is removed automatically when the
		   page navigates. */
		function showLivePreviewReloadingMask(){
			if(document.getElementById('wpgmza-live-preview-reloading-mask')) return;

			var mask = document.createElement('div');
			mask.id = 'wpgmza-live-preview-reloading-mask';
			mask.style.cssText = [
				'position:fixed',
				'top:0',
				'left:0',
				'width:100vw',
				'height:100vh',
				'background:rgba(0,0,0,0.55)',
				'z-index:999999',
				'display:flex',
				'align-items:center',
				'justify-content:center',
				'cursor:wait',
				'font-family:"Plus Jakarta Sans",system-ui,sans-serif'
			].join(';');

			var inner = document.createElement('div');
			inner.style.cssText = [
				'background:#fff',
				'color:#1f2937',
				'padding:20px 28px',
				'border-radius:10px',
				'font-size:14px',
				'font-weight:600',
				'box-shadow:0 8px 32px rgba(0,0,0,0.25)',
				'display:flex',
				'align-items:center',
				'gap:12px'
			].join(';');

			var spinner = document.createElement('div');
			spinner.style.cssText = [
				'width:18px',
				'height:18px',
				'border:2px solid #e5e7eb',
				'border-top-color:#e8473f',
				'border-radius:50%',
				'animation:wpgmza-mask-spin 0.7s linear infinite'
			].join(';');

			/* Inject the keyframes once. Scoped via the unique id so
			   we don't collide with anything else. */
			if(!document.getElementById('wpgmza-mask-keyframes')){
				var style = document.createElement('style');
				style.id = 'wpgmza-mask-keyframes';
				style.textContent = '@keyframes wpgmza-mask-spin{to{transform:rotate(360deg)}}';
				document.head.appendChild(style);
			}

			inner.appendChild(spinner);
			inner.appendChild(document.createTextNode('Saving and reloading editor…'));
			mask.appendChild(inner);
			document.body.appendChild(mask);
		}

		function buildCustomTileModal(){
			/* Must inject inside the .wpgmza-atlas-major wrapper —
			   the generic-modal CSS in input.css (~line 2548) is
			   scoped under that selector, so appending to <body>
			   leaves the modal unstyled and stuck in document flow
			   below the page. */
			var $host = $('.wpgmza-atlas-major').first();
			if(!$host.length) $host = $('body');

			var html = ''
				+ '<div class="wpgmza-generic-modal wpgmza-custom-tile-modal" data-type="custom_tile_save_reload">'
				+   '<div class="wpgmza-generic-modal-inner">'
				+     '<div class="wpgmza-generic-modal-title">'
				+       'Save and reload required'
				+     '</div>'
				+     '<div class="wpgmza-generic-modal-content">'
				+       'Disabling or enabling this feature requires the map to be saved and the editor reloaded. Click <strong>Save &amp; Reload</strong> to apply this change now, or <strong>Cancel</strong> to revert.'
				+     '</div>'
				+     '<div class="wpgmza-generic-modal-actions">'
				+       '<div class="wpgmza-row">'
				+         '<div class="wpgmza-col">'
				+           '<div class="wpgmza-button" data-action="cancel"><span>Cancel</span></div>'
				+           '<div class="wpgmza-button" data-action="complete"><span>Save &amp; Reload</span></div>'
				+         '</div>'
				+       '</div>'
				+     '</div>'
				+   '</div>'
				+ '</div>';
			$host.append(html);

			return WPGMZA.GenericModal.createInstance(
				$host.find('.wpgmza-custom-tile-modal').get(0),
				/* complete -> save+reload */
				function(){
					/* Atlas Major's autosave hijacks form submit and
					   saves via REST instead of POST, so a plain
					   submit-button click only saves — the page
					   never reloads. Set the reloadAfterSave flag
					   on the autosave so its REST success handler
					   triggers location.reload() (atlas-major-
					   autosave.js, success branch). */
					if(WPGMZA.atlasMajorAutoSave){
						WPGMZA.atlasMajorAutoSave.reloadAfterSave = true;
					}

					/* Cover the editor with a non-interactive overlay
					   so the user can't fire other actions during the
					   save+reload window. */
					showLivePreviewReloadingMask();

					/* Trigger the same submit input the visible Save
					   Map label points at — keeps the save flow
					   identical to a manual click. */
					var $btn = $('input[name="wpgmza_savemap"]');
					if($btn.length){
						$btn.trigger('click');
					}
				},
				/* cancel -> revert checkbox */
				function(){
					if(customTilePreviousState !== null){
						$('input[name="custom_tile_enabled"]')
							.prop('checked', customTilePreviousState)
							.trigger('change.revert');
					}
				}
			);
		}

		function showCustomTileSaveReloadModal(){
			if(!customTileModal){
				customTileModal = buildCustomTileModal();
			}
			customTileModal.show();
		}

		$(document.body).on('change',
			'input[name="custom_tile_enabled"]',
			function(event){
				if(!document.querySelector('.wpgmza-atlas-major .am-preview-frame')) return;

				/* Skip when the change is our own revert — namespaced
				   `change.revert` lets us put the checkbox back without
				   re-firing the modal. */
				if(event && event.namespace === 'revert') return;

				/* Stash the inverse of the new state so cancel can
				   revert. The change event fires AFTER the checkbox
				   value flipped, so previous = !current. */
				customTilePreviousState = !$(this).is(':checked');

				applyCustomTileLive();
				showCustomTileSaveReloadModal();
			}
		);

		$(document.body).on('change',
			'input[name="custom_tile_image"]',
			function(){
				if(!document.querySelector('.wpgmza-atlas-major .am-preview-frame')) return;
				applyCustomTileLive();
			}
		);
		$(document.body).on('change input',
			'input[name="custom_tile_image_width"], input[name="custom_tile_image_height"], input[name="custom_tile_image_attribution"]',
			function(){
				if(!document.querySelector('.wpgmza-atlas-major .am-preview-frame')) return;
				applyCustomTileLive();
			}
		);
	});

	/* ========================================================
	   BOOTSTRAP
	   ======================================================== */
	function tryInitLivePreview(){
		if(WPGMZA.atlasMajorLivePreview) return;
		if(WPGMZA.maps && WPGMZA.maps[0] && document.querySelector('.am-preview-frame')){
			WPGMZA.atlasMajorLivePreview = new WPGMZA.AtlasMajorLivePreview();
		}
	}

	$(document.body).on('wpgmza_map_edit_page_created', function(){
		setTimeout(tryInitLivePreview, 1200);
	});

	/* Fallback poll */
	var pollCount = 0;
	var pollInterval = setInterval(function(){
		pollCount++;
		if(WPGMZA.atlasMajorLivePreview || pollCount > 30){
			clearInterval(pollInterval);
			return;
		}
		tryInitLivePreview();
	}, 1000);


	/* ========================================================
	   COLOR PICKER REPARENT (Live Preview mode)
	   --------------------------------------------------------
	   Lives in this file (rather than a standalone module) so
	   it inherits a known-good loading position in the base
	   combined bundle. A previous attempt as its own file got
	   misrouted into the Pro bundle by the build CLI, throwing
	   WPGMZA-is-not-defined and breaking the whole Pro bundle.
	   --------------------------------------------------------
	   Why this exists: the color picker is appended to
	   `.map_wrapper` via data-container, ending up nested in
	   the map engine's DOM. The map engine applies transforms
	   on inner layers, which hijack `position: fixed`
	   (containing block becomes the transformed ancestor
	   instead of the viewport). Plus `.content` and
	   `.am-preview-page` both clip overflow. CSS-only fixes
	   can't escape both.
	   --------------------------------------------------------
	   When LP is on: detach picker from map DOM, append to a
	   body-level host wrapper, position via getBoundingClientRect
	   relative to the trigger swatch. Host carries
	   `.wpgmza-color-input-host` so the existing picker CSS
	   (sizing, palette layout, .active display toggle) still
	   applies. When LP is off (or toggled off mid-session):
	   restore picker to original parent on next open so the
	   base `left: 10px inside .map_wrapper` rule applies. */
	if(document.querySelector('.wpgmza-atlas-major') && WPGMZA.currentPage === 'map-edit'){
		var $lpColorHost = null;

		var ensureLpColorHost = function(){
			if(!$lpColorHost){
				$lpColorHost = $('<div class="wpgmza-color-input-host wpgmza-atlas-major am-lp-color-host"></div>');
				$lpColorHost.css({
					position: 'fixed',
					zIndex: 100000,
					width: '200px'
				});
				$('body').append($lpColorHost);
			}
			return $lpColorHost;
		};

		var repositionLpColorHostNear = function(triggerEl){
			var host = ensureLpColorHost();
			var rect = triggerEl.getBoundingClientRect();
			var $picker = host.find('.wpgmza-color-picker').first();
			var pickerHeight = ($picker.length && $picker[0].offsetHeight) || 370;
			var vh = window.innerHeight;
			var vw = window.innerWidth;

			/* Default placement: below the trigger swatch, aligned
			   to its left edge. Standard popover behaviour. */
			var topPos = rect.bottom + 4;
			var leftPos = rect.left;

			/* Flip above the trigger if there's no room below. */
			if(topPos + pickerHeight > vh - 10){
				var aboveTop = rect.top - pickerHeight - 4;
				if(aboveTop >= 10){
					topPos = aboveTop;
				} else {
					topPos = Math.max(10, vh - pickerHeight - 10);
				}
			}

			/* Clamp horizontally so the 200px-wide picker can't
			   render off-screen. */
			if(leftPos + 200 > vw - 10) leftPos = vw - 210;
			if(leftPos < 10) leftPos = 10;

			host.css({
				top: topPos + 'px',
				left: leftPos + 'px'
			});
		};

		var restoreLpPicker = function($picker){
			var origParent = $picker.data('wpgmza-orig-parent');
			if(origParent && document.body.contains(origParent)){
				$(origParent).append($picker);
			}
		};

		/* Track the currently-open ColorInput instance so the
		   outside-click handler below can close it on any tab /
		   panel click that would otherwise leave the picker
		   stranded. color-input.js binds its own body-click
		   autoClose listener, but tab navigation in Atlas Major
		   (sidebar groupings) sometimes stops propagation, so the
		   picker's own listener doesn't fire and the picker stays
		   visible — and because the host gets re-evaluated against
		   a stale/hidden trigger, it can shoot to viewport-top-left.
		   This defensive document-level handler ensures the picker
		   closes whenever the user clicks anywhere outside the
		   picker and its trigger swatch. */
		var lpActiveColorInstance = null;

		$(document.body).on('colorpicker.open.wpgmza', function(event){
			if(!event.instance || !event.instance.picker) return;

			lpActiveColorInstance = event.instance;

			var $picker = $(event.instance.picker);
			var trigger = event.instance.preview;
			if(!trigger || !trigger.length) return;

			var lpActive = !!document.querySelector('.am-preview-frame:not(.am-preview-off)');
			var inHost = $picker.closest('.am-lp-color-host').length > 0;

			if(lpActive){
				if(!inHost){
					if(!$picker.data('wpgmza-orig-parent')){
						$picker.data('wpgmza-orig-parent', $picker.parent()[0]);
					}
					ensureLpColorHost().append($picker);
				}
				repositionLpColorHostNear(trigger[0]);
			} else if(inHost){
				/* LP toggled off between open events — return picker
				   to original parent so the base `left: 10px inside
				   .map_wrapper` CSS rule applies again. */
				restoreLpPicker($picker);
			}
		});

		/* Defensive outside-click handler — runs on mousedown
		   (earlier than click) so we close the picker even if the
		   downstream click handler (e.g. a sidebar tab switch)
		   later stops propagation and prevents color-input.js's
		   own body listener from firing.
		   Bind once on document; uses lpActiveColorInstance tracked
		   above to know which instance to close. Safe to fire even
		   if the picker's own listener also closes it — onTogglePicker
		   is gated on `state.open` so the second call is a no-op. */
		$(document).on('mousedown.amlpcolor', function(e){
			if(!lpActiveColorInstance) return;
			if(!lpActiveColorInstance.state || !lpActiveColorInstance.state.open) return;

			var $target = $(e.target);
			/* Clicks inside the body-level host (where the picker
			   itself lives once reparented) should NOT close. */
			if($target.closest('.am-lp-color-host').length) return;
			/* Clicks on any color preview / swatch should NOT close
			   either — the preview's own click handler manages the
			   toggle and stopPropagation. */
			if($target.closest('.wpgmza-color-preview').length) return;
			/* Clicks inside the picker (if not reparented, e.g.
			   LP off) should also be ignored. */
			if($target.closest('.wpgmza-color-picker').length) return;

			try {
				lpActiveColorInstance.onTogglePicker();
			} catch(e){}
			lpActiveColorInstance = null;
		});
	}

});
