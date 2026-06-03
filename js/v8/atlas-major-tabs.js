/**
 * @namespace WPGMZA
 * @module AtlasMajorTabs
 * @requires WPGMZA.SidebarGroupings
 *
 * Bridges the Atlas Major tab bar to the existing SidebarGroupings navigation system.
 * Tabs carry data-am-group attributes that map to data-group values on groupings.
 */
jQuery(function($) {

	if(WPGMZA.currentPage != "map-edit")
		return;

	if(!document.querySelector('.wpgmza-atlas-major'))
		return;

	WPGMZA.AtlasMajorTabs = function(){
		var self = this;
		this.tabBar = $('.am-tabs');
		this.tabs = this.tabBar.find('.am-tab[data-am-group]');
		this.activeGroup = null;

		this.tabs.on('click', function(){
			var groupId = $(this).data('am-group');
			if(groupId){
				/* Belt-and-braces: discard any in-progress drawing
				   BEFORE switching tabs. The `grouping-closed`
				   listener further down also handles this path (via
				   closeAll → grouping-closed → our synthesized
				   feature-block-closed), but firing here too
				   guarantees the discard runs regardless of the
				   closeAll timing or any race with the tab switch.
				   discardChanges is gated on `this.feature` so a
				   double-discard is a no-op. */
				$('.grouping[data-feature-discard]').each(function(){
					$(this).trigger('feature-block-closed');
				});

				self.activateTab($(this), groupId);
			}
		});

		/* Make the entire .heading.has-back row clickable, not just
		   the small caret-left arrow on its left edge. The core
		   SidebarGroupings handler binds to `.grouping .item` clicks
		   only, so anywhere else in the heading row was inert.
		   This caused a confusing UX: the whole row hover-highlights
		   (signalling clickability) but only the arrow column actually
		   navigated back. We forward clicks anywhere on the row to
		   the inner .item.caret-left, which then bubbles through the
		   existing handler. Scoped to .wpgmza-atlas-major so Atlas
		   Novus behaviour is unchanged. */
		$(document.body).on('click', '.wpgmza-atlas-major .heading.has-back', function(event){
			/* If the click hit the .item directly, the existing
			   SidebarGroupings delegation will handle it — don't
			   double-fire. */
			if($(event.target).closest('.item').length) return;
			$(this).find('> .item').first().trigger('click');
		});

		/* Release the drawing manager when a feature grouping is
		   being closed by navigation away (e.g. clicking a settings
		   tab while in the Circles / Polygons / etc. feature panel
		   with the drawing manager active).
		   Background: sidebar-groupings.js:openTabByGroupId fires
		   `feature-block-closed` ONLY when the TARGET grouping has
		   `data-feature-discard="true"` — that's the
		   feature-to-feature switch path (Circles → Polygons fires
		   discard on the polygon grouping; all FeaturePanels
		   listen on `.grouping` and react). Settings groupings
		   don't carry `data-feature-discard`, so the
		   feature-to-settings path NEVER fires the trigger —
		   drawing manager stays active, the in-progress shape stays
		   parked, and the user can't return to that feature panel
		   without a page reload.
		   Fix: listen for `grouping-closed` (fired by
		   sidebar-groupings.js:closeAll for every closing
		   grouping) and synthesize a `feature-block-closed`
		   event on any closing grouping that carries
		   `data-feature-discard`. The existing
		   feature-panel.js:51 listener then triggers
		   onTabDeactivated → discardChanges and resets drawing
		   mode to MODE_NONE. Works regardless of navigation path
		   (tab bar, back arrow, programmatic switch). */
		$(document.body).on('grouping-closed', function(event, groupId){
			if(!groupId) return;
			var closingGrouping = $('.grouping[data-group="' + groupId + '"]').first();
			if(!closingGrouping.length) return;
			if(closingGrouping.data('feature-discard')){
				closingGrouping.trigger('feature-block-closed');
			}
		});

		/* Listen for grouping changes from other sources (context menu, quick actions) */
		$(document.body).on('grouping-opened', function(event, groupId){
			self.syncTabState(groupId);
		});

		/* Also catch the event on .grouping elements directly (jQuery trigger doesn't always bubble) */
		$('.grouping').on('grouping-opened', function(event, groupId){
			self.syncTabState(groupId);
		});

		/* Activate the first tab on load. Retry if
		 * WPGMZA.mapEditPage.sidebarGroupings isn't ready yet — the
		 * AtlasMajorTabs constructor runs on window.load, but
		 * sidebarGroupings is created during MapEditPage's own init
		 * which can lag. Without the retry we'd silently bail and the
		 * markers grouping would stay `display:none` until the user
		 * clicks the tab themselves. */
		var firstTab = this.tabs.filter('.on').first();
		if(firstTab.length){
			var initialGroup = firstTab.data('am-group');
			if(initialGroup){
				var attempts = 0;
				var tryActivate = function(){
					if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.sidebarGroupings){
						self.activateTab(firstTab, initialGroup);
						return true;
					}
					return false;
				};
				if(!tryActivate()){
					var retry = setInterval(function(){
						attempts++;
						if(tryActivate() || attempts > 30){
							clearInterval(retry);
						}
					}, 100);
				}
			}
		}

		/* Sub-tab navigation (horizontal tabs within panels like Store Locator) */
		$('.am-subnav').on('click', '.am-subnav-item', function(){
			var subnav = $(this).closest('.am-subnav');
			subnav.find('.am-subnav-item').removeClass('on');
			$(this).addClass('on');
		});

		/* Sync sub-tab active state when groupings open from other sources */
		$(document.body).on('grouping-opened', function(event, groupId){
			$('.am-subnav .am-subnav-item').each(function(){
				var itemGroup = $(this).data('group');
				if(itemGroup === groupId){
					$(this).closest('.am-subnav').find('.am-subnav-item').removeClass('on');
					$(this).addClass('on');
				}
			});
		});

		/* Auto-focus the Address/GPS input when the marker editor opens in
		   Add mode. FeaturePanel flips the visibility of
		   .wpgmza-feature-drawing-instructions vs
		   .wpgmza-feature-editing-instructions (showInstructions) on mode
		   change — we defer one tick so that DOM swap has landed before
		   we check. */
		$(document.body).on('grouping-opened', function(event, groupId){
			if(groupId !== 'map-markers-editor'){
				return;
			}
			setTimeout(function(){
				var grouping = $('[data-group="map-markers-editor"]');
				var drawing = grouping.find('.wpgmza-feature-drawing-instructions');
				if(drawing.length && drawing.is(':visible')){
					var addressInput = grouping.find('#wpgmza_add_address_map_editor');
					if(addressInput.length && !addressInput.is(':disabled')){
						addressInput.trigger('focus');
					}
				}
			}, 0);
		});

		/* Sync toolbar map name with the form field */
		this.syncToolbarFields();
	}

	/* Groupings that are navigation hubs — when opened, auto-navigate
	   to the first visible child item */
	WPGMZA.AtlasMajorTabs.AUTO_NAV_HUBS = [
		'map-settings-themes'
	];

	WPGMZA.AtlasMajorTabs.prototype.activateTab = function(tabElement, groupId){
		/* Update tab active state */
		this.tabs.removeClass('on');
		tabElement.addClass('on');
		this.activeGroup = groupId;

		/* Open the grouping via SidebarGroupings */
		if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.sidebarGroupings){
			WPGMZA.mapEditPage.sidebarGroupings.openTabByGroupId(groupId);

			/* For nav hubs, auto-click the first visible child sub-tab */
			if(WPGMZA.AtlasMajorTabs.AUTO_NAV_HUBS.indexOf(groupId) !== -1){
				setTimeout(function(){
					var grouping = $('[data-group="' + groupId + '"]');
					/* Try visible am-subnav-item first (Atlas Major sub-tabs) */
					var firstVisible = grouping.find('.am-subnav .am-subnav-item:visible').first();
					if(!firstVisible.length){
						/* Fallback to hidden nav items */
						firstVisible = grouping.find('.am-hidden-nav .item.caret-right').first();
					}
					if(firstVisible.length){
						firstVisible.trigger('click');
					}
				}, 50);
			}
		}
	}

	WPGMZA.AtlasMajorTabs.prototype.syncTabState = function(groupId){
		/* Find the tab that owns this group or a parent of it */
		var matched = false;
		var self = this;

		this.tabs.each(function(){
			var tabGroup = $(this).data('am-group');

			/* Direct match */
			if(tabGroup === groupId){
				self.tabs.removeClass('on');
				$(this).addClass('on');
				self.activeGroup = groupId;
				matched = true;
				return false;
			}

			/* Prefix match — e.g. tab targets "map-settings-store-locator-general"
			   but opened group is "map-settings-store-locator-style".
			   Strip the last segment of both and compare the prefix.
			   Only applies when prefix has 3+ segments to avoid false matches
			   like "map-markers" matching "map-datasets". */
			var tabPrefix = tabGroup.replace(/-[^-]+$/, '');
			var groupPrefix = groupId.replace(/-[^-]+$/, '');
			var segmentCount = tabPrefix.split('-').length;
			if(tabPrefix === groupPrefix && tabPrefix !== tabGroup && segmentCount >= 3){
				self.tabs.removeClass('on');
				$(this).addClass('on');
				self.activeGroup = tabGroup;
				matched = true;
				return false;
			}
		});

		if(!matched){
			/* Check if the opened group is a child of a tab's group */
			this.tabs.each(function(){
				var tabGroup = $(this).data('am-group');
				var openedGrouping = $('[data-group="' + groupId + '"]');

				/* Walk up the back-navigation chain to find parent */
				var backItem = openedGrouping.find('.heading .item.caret-left[data-group]');
				while(backItem.length){
					var parentGroup = backItem.data('group');
					if(parentGroup === tabGroup){
						self.tabs.removeClass('on');
						$(this).addClass('on');
						self.activeGroup = tabGroup;
						matched = true;
						return false;
					}
					var parentGrouping = $('[data-group="' + parentGroup + '"]');
					backItem = parentGrouping.find('.heading .item.caret-left[data-group]');
				}
			});
		}
	}

	WPGMZA.AtlasMajorTabs.prototype.syncToolbarFields = function(){
		var titleInput = $('#wpgmza_title');
		var toolbarTitle = $('#am_wpgmza_title');
		var shortcodeInput = $('#shortcode_input');
		var toolbarShortcode = $('#am_shortcode_display');

		if(titleInput.length && toolbarTitle.length){
			/* Initial sync */
			toolbarTitle.val(titleInput.val());

			/* Two-way bind */
			toolbarTitle.on('input change', function(){
				titleInput.val($(this).val()).trigger('change');
			});
			titleInput.on('input change', function(){
				toolbarTitle.val($(this).val());
			});
		}

		if(shortcodeInput.length && toolbarShortcode.length){
			/* Sync shortcode display — PHP sets the value attribute server-side */
			var updateShortcode = function(){
				/* Try property first, then attribute, then raw DOM */
				var val = shortcodeInput.val()
					|| shortcodeInput.attr('value')
					|| shortcodeInput[0].getAttribute('value')
					|| '';
				if(val && val.trim()){
					toolbarShortcode.text(val);
					return true;
				}
				return false;
			};

			shortcodeInput.on('input change', updateShortcode);

			/* Immediate attempt */
			if(!updateShortcode()){
				/* Poll until value appears */
				var pollCount = 0;
				var pollInterval = setInterval(function(){
					if(updateShortcode() || pollCount > 30){
						clearInterval(pollInterval);
					}
					pollCount++;
				}, 500);
			}
		}

		/* Copy shortcode on pill click */
		$('.am-sc-pill').on('click', function(){
			var text = (shortcodeInput.val() || toolbarShortcode.text() || '').trim();
			if(!text) return;

			/* Use temp input + execCommand as primary (works in all contexts) */
			var $temp = $('<input>');
			$('body').append($temp);
			$temp.val(text).select();
			document.execCommand('copy');
			$temp.remove();

			if(WPGMZA.notification){
				WPGMZA.notification("Shortcode Copied");
			}
		});

		/* Override the core .wpgmza_copy_shortcode handler — unbind then rebind with centered notification */
		$('body').off('click', '.wpgmza_copy_shortcode');
		$('body').on('click', '.wpgmza_copy_shortcode', function(){
			var text = $(this).val();
			if(!text) return;

			var $temp = $('<input>');
			$('body').append($temp);
			$temp.val(text).select();
			document.execCommand('copy');
			$temp.remove();

			if(WPGMZA.notification){
				WPGMZA.notification("Shortcode Copied");
			}
		});
	}

	/**
	 * Quick-add marker: when user types address in the markers tab bar
	 * and clicks Add, populate the editor's address field and navigate to editor.
	 */
	WPGMZA.AtlasMajorTabs.prototype.initQuickAddMarker = function(){
		var self = this;
		var quickInput = $('#am-quick-add-address');
		var quickBtn = $('.am-marker-quick-add');
		var resultsContainer = $('#am-quick-add-autocomplete-results');

		if(!quickInput.length || !quickBtn.length)
			return;

		/* Add wpgmza-address class NOW (after MapEditPage init has finished
		   its $("input.wpgmza-address").each loop) so the body-level keypress
		   delegation picks up our input, but no AddressInput/Google autocomplete
		   gets created on it. */
		quickInput.addClass('wpgmza-address');

		/* Override shouldAddressFieldUseEnhancedAutocomplete so the core
		   keypress handler on .wpgmza-address also fires for our input.
		   We wrap the original method — no core code changes needed. */
		if(WPGMZA.mapEditPage){
			var originalCheck = WPGMZA.mapEditPage.shouldAddressFieldUseEnhancedAutocomplete;
			WPGMZA.mapEditPage.shouldAddressFieldUseEnhancedAutocomplete = function(element){
				if(element && element.id === 'am-quick-add-address'){
					return true;
				}
				return originalCheck.call(this, element);
			};
		}

		/* The core renders results into #wpgmza_autocomplete_search_results
		   which lives inside the editor accordion. We observe that element
		   and mirror its content into our local results container. */
		var coreResults = $('#wpgmza_autocomplete_search_results');
		var quickAddActive = false;

		quickInput.on('focusin', function(){ quickAddActive = true; });
		quickInput.on('focusout', function(){
			setTimeout(function(){
				quickAddActive = false;
				resultsContainer.hide();
			}, 400);
		});

		var coreDisabled = $('#wpgmza_autoc_disabled');

		function mirrorCoreElement(coreEl, localContainer){
			if(!coreEl.length) return;

			var observer = new MutationObserver(function(){
				if(!quickAddActive) return;
				var html = coreEl.html();
				if(html && html.trim().length > 0){
					localContainer.html(html).show();
					coreEl.hide();
				} else {
					localContainer.hide();
				}
			});
			observer.observe(coreEl[0], { childList: true, subtree: true, characterData: true });

			var styleObserver = new MutationObserver(function(){
				if(!quickAddActive) return;
				if(coreEl.is(':visible') && coreEl.html().trim().length > 0){
					localContainer.html(coreEl.html()).show();
					coreEl.hide();
				}
			});
			styleObserver.observe(coreEl[0], { attributes: true, attributeFilter: ['style'] });
		}

		/* Mirror both the results and the disabled/warning div */
		mirrorCoreElement(coreResults, resultsContainer);

		if(coreDisabled.length){
			var disabledContainer = $('<div id="am-quick-add-autoc-disabled"></div>');
			quickInput.closest('.am-ml-bar').append(disabledContainer);
			disabledContainer.hide();
			mirrorCoreElement(coreDisabled, disabledContainer);
		}

		/* When a result is clicked in our container, fill our input */
		resultsContainer.on('click', '.wpgmza_ac_result', function(e){
			e.preventDefault();
			e.stopPropagation();
			var index = $(this).data('id');
			var lat = $(this).data('lat');
			var lng = $(this).data('lng');
			var name = $(this).find('[id^="wpgmza_item_address_"]').html() || $(this).text();
			quickInput.val(name.trim());
			resultsContainer.hide();
		});

		/* When "Add" is clicked, copy the address to the editor input
		   and navigate to the editor grouping */
		quickBtn.on('click', function(e){
			var address = quickInput.val().trim();

			setTimeout(function(){
				if(address){
					var editorAddress = $('#wpgmza_add_address_map_editor');
					if(editorAddress.length){
						editorAddress.val(address).trigger('change').trigger('input');
					}
				}
				quickInput.val('');
				resultsContainer.hide();
			}, 200);
		});

		/* Enter key in quick input triggers Add */
		quickInput.on('keydown', function(e){
			if(e.key === 'Enter'){
				e.preventDefault();
				quickBtn.trigger('click');
			}
		});
	}

	/* Initialize after map edit page is ready */
	$(document.body).on('wpgmza_map_edit_page_created', function(){
		if(!WPGMZA.atlasMajorTabs){
			WPGMZA.atlasMajorTabs = new WPGMZA.AtlasMajorTabs();
			WPGMZA.atlasMajorTabs.initQuickAddMarker();
		}
	});

	/* Fallback initialization */
	$(window).on('load', function(){
		if(!WPGMZA.atlasMajorTabs && document.querySelector('.wpgmza-atlas-major')){
			WPGMZA.atlasMajorTabs = new WPGMZA.AtlasMajorTabs();
			WPGMZA.atlasMajorTabs.initQuickAddMarker();
		}
		initDualZoomSliders();
	});

	/* ========================================================
	   DUAL-HANDLE ZOOM RANGE SLIDER
	   Visual wrapper around the hidden map_max_zoom / map_min_zoom
	   inputs. Two overlapping range inputs share a track; the fill
	   bar shows the allowed zoom range between them.
	   ======================================================== */
	function initDualZoomSliders(){
		$('.wpgmza-dual-zoom-slider').each(function(){
			var $slider = $(this);
			if($slider.data('wpgmza-dual-zoom-inited')) return;
			$slider.data('wpgmza-dual-zoom-inited', true);

			var $outInput  = $slider.find('.wpgmza-dual-zoom-out-input');
			var $inInput   = $slider.find('.wpgmza-dual-zoom-in-input');
			var $outLabel  = $slider.find('.wpgmza-dual-zoom-out-label');
			var $inLabel   = $slider.find('.wpgmza-dual-zoom-in-label');
			var $fill      = $slider.find('.wpgmza-dual-zoom-fill');

			/* Sync from hidden inputs (holds saved values) into the range inputs */
			var $hiddenOut = $slider.closest('fieldset').find('input[name="map_max_zoom"]');
			var $hiddenIn  = $slider.closest('fieldset').find('input[name="map_min_zoom"]');

			var savedOut = parseInt($hiddenOut.val());
			var savedIn  = parseInt($hiddenIn.val());
			if(!isNaN(savedOut)) $outInput.val(savedOut);
			if(!isNaN(savedIn))  $inInput.val(savedIn);

			var min = parseInt($slider.data('min')) || 0;
			var max = parseInt($slider.data('max')) || 22;

			function update(fromInput){
				var outVal = parseInt($outInput.val());
				var inVal  = parseInt($inInput.val());

				/* Enforce outVal <= inVal, push whichever handle is driving */
				if(outVal > inVal){
					if(fromInput === 'out'){
						$inInput.val(outVal);
						inVal = outVal;
					} else {
						$outInput.val(inVal);
						outVal = inVal;
					}
				}

				$outLabel.text(outVal);
				$inLabel.text(inVal);
				$hiddenOut.val(outVal);
				$hiddenIn.val(inVal);

				var range = max - min;
				var leftPct  = ((outVal - min) / range) * 100;
				var rightPct = ((inVal - min) / range) * 100;
				$fill.css({left: leftPct + '%', width: (rightPct - leftPct) + '%'});

				/* Trigger change on the hidden inputs so live preview picks it up */
				$hiddenOut.trigger('change');
				$hiddenIn.trigger('change');
			}

			$outInput.on('input', function(){ update('out'); });
			$inInput.on('input', function(){ update('in'); });

			/* Initial render */
			update();
		});
	}
});
