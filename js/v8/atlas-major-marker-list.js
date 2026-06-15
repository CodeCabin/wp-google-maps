/**
 * @namespace WPGMZA
 * @module AtlasMajorMarkerList
 * @requires WPGMZA
 *
 * Custom marker list renderer for Atlas Major.
 * Replaces the DataTable in the markers tab with a clean list
 * matching the Concept C mockup design.
 *
 * Features: live search filtering, pagination, auto-sync with map events.
 */
jQuery(function($) {

	if(!document.querySelector('.wpgmza-atlas-major'))
		return;

	WPGMZA.AtlasMajorMarkerList = function(){
		var self = this;

		this.container = document.querySelector('.am-marker-list-container');
		this.paginationContainer = document.querySelector('.am-ml-pagination');
		this.searchInput = document.querySelector('.am-ml-search');
		this.countBadge = document.querySelector('.am-ml-count');
		this.datatableContainer = document.querySelector('#wpgmza-table-container-Marker');

		this.page = 1;
		this.perPage = 15;
		this.searchTerm = '';
		this.debounceTimer = null;
		this.selectedIds = {};

		if(!this.container)
			return;

		if(this.datatableContainer){
			$(this.datatableContainer).addClass('am-dt-hidden-in-list');
		}

		this.initBulkBar();
		this.bindSearch();
		this.initKebabDismiss();
		this.render();
		this.bindMapEvents();
		WPGMZA.AtlasMajorMarkerList.applySidebarLabels();

		/* Initial load busy state — if the map hasn't finished placing
		 * its initial marker batch, the list is empty until then.
		 * Show the busy overlay so the user sees a clear "loading"
		 * indicator instead of a deceptively empty list. bindMapEvents
		 * above hooks `markersplaced` (or fires render() immediately
		 * if it's already true); either path clears the busy state via
		 * setBusy(false) at the end of render(). */
		var map = WPGMZA.maps[0];
		if(map && !map.markersPlaced){
			this.setBusy(true);
		}
	}

	/**
	 * Toggle the busy/loading overlay on the list container.
	 *
	 * Adds/removes the `am-marker-list-busy` class on the container,
	 * which CSS (atlas-major.css, marker-list section) renders as a
	 * dimmed list + centred spinner overlay + pointer-events: none
	 * so the user can't click rows mid-action. Called by the action
	 * handlers (duplicate / delete / approve / move-map) around their
	 * AJAX calls, and once at constructor time while the map is still
	 * fetching its initial marker batch. Cleared at the end of
	 * render() too, as a safety net for code paths that forgot to
	 * unset it after their AJAX completes.
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.setBusy = function(busy){
		if(!this.container) return;
		if(busy){
			this.container.classList.add('am-marker-list-busy');
		} else {
			this.container.classList.remove('am-marker-list-busy');
		}
	}

	/**
	 * Install document-level handlers (once) that dismiss any open
	 * kebab menu on outside-click or Escape. Bound on the
	 * constructor rather than bindItemEvents() so we don't stack
	 * a fresh handler every render.
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.initKebabDismiss = function(){
		var self = this;

		$(document).on('click.ammkebab', function(e){
			/* Click inside a kebab or its menu → leave alone, the
			   per-row handlers in bindItemEvents() manage state. */
			if($(e.target).closest('.am-mi-kebab, .am-mi-menu').length) return;
			$(self.container).find('.am-mi.am-mi-menu-open').removeClass('am-mi-menu-open')
				.find('.am-mi-kebab').attr('aria-expanded', 'false');
		});

		$(document).on('keydown.ammkebab', function(e){
			if(e.key === 'Escape'){
				$(self.container).find('.am-mi.am-mi-menu-open').removeClass('am-mi-menu-open')
					.find('.am-mi-kebab').attr('aria-expanded', 'false');
			}
		});
	}

	/**
	 * Apply translated `data-am-label` attributes to sidebar
	 * `.navigation` and `.feature-list` elements inside per-feature
	 * groupings. These attributes are read by atlas-major.css via
	 * `content: attr(data-am-label)` for the section heading labels
	 * ("Add Marker", "Marker List", etc.).
	 *
	 * Previously those labels were hardcoded English in the CSS itself
	 * (`::before { content: "Add Marker" }`), which made them
	 * impossible to translate. This init runs once at editor load and
	 * pushes the translated strings (from WPGMZA.localized_strings)
	 * into the DOM as attributes so the CSS just reads them back.
	 *
	 * Runs idempotently (re-applies don't break anything) and is a
	 * no-op outside the editor (no matching elements).
	 */
	WPGMZA.AtlasMajorMarkerList.applySidebarLabels = function() {
		var L = (WPGMZA.localized_strings) || {};

		var addLabel = function(group) {
			if(group === 'map-markers')         return L.am_sidebar_add_marker || 'Add Marker';
			return L.am_sidebar_add_default || 'Add';
		};

		var listLabel = function(group) {
			switch(group) {
				case 'map-markers':         return L.am_sidebar_list_marker         || 'Marker List';
				case 'map-polygons':        return L.am_sidebar_list_polygon        || 'Polygon List';
				case 'map-polylines':       return L.am_sidebar_list_polyline       || 'Polyline List';
				case 'map-circles':         return L.am_sidebar_list_circle         || 'Circle List';
				case 'map-rectangles':      return L.am_sidebar_list_rectangle      || 'Rectangle List';
				case 'map-heatmaps':        return L.am_sidebar_list_heatmap        || 'Heatmap List';
				case 'map-point-labels':    return L.am_sidebar_list_point_label    || 'Point Label List';
				case 'map-image-overlays':  return L.am_sidebar_list_image_overlay  || 'Image Overlay List';
				default:                    return L.am_sidebar_list_default        || 'List';
			}
		};

		jQuery('.wpgmza-atlas-major .wpgmza-editor .sidebar .grouping[data-group]').each(function() {
			var $grouping = jQuery(this);
			var group = $grouping.attr('data-group');

			$grouping.children('.navigation').attr('data-am-label', addLabel(group));
			$grouping.find('.feature-list').attr('data-am-label', listLabel(group));
		});
	};

	WPGMZA.AtlasMajorMarkerList.PIN_COLORS = [
		'#e8473f', '#3b82f6', '#10b981', '#f59e0b',
		'#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
	];

	/**
	 * Get the filtered marker list based on search term
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.getFilteredMarkers = function(){
		var map = WPGMZA.maps[0];
		if(!map) return [];

		var markers = map.markers || [];
		var term = this.searchTerm.toLowerCase().trim();

		if(!term)
			return markers;

		return markers.filter(function(m){
			var title = (m.title || '').toLowerCase();
			var address = (m.address || '').toLowerCase();
			var id = String(m.id || '');

			if(title.indexOf(term) !== -1 || address.indexOf(term) !== -1 || id.indexOf(term) !== -1)
				return true;

			/* Search description (strip HTML tags) */
			if(m.description){
				var desc = m.description.replace(/<[^>]*>/g, '').toLowerCase();
				if(desc.indexOf(term) !== -1)
					return true;
			}

			/* Search category names */
			if(m.categories && m.categories.length && WPGMZA.categories){
				for(var i = 0; i < m.categories.length; i++){
					var cat = WPGMZA.categories.getCategoryByID(parseInt(m.categories[i]));
					if(cat && cat.name && cat.name.toLowerCase().indexOf(term) !== -1)
						return true;
				}
			}

			return false;
		});
	}

	/**
	 * Render the list with pagination
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.render = function(){
		if(!this.container) return;

		var filtered = this.getFilteredMarkers();
		var total = filtered.length;
		var totalPages = Math.ceil(total / this.perPage);

		if(this.page > totalPages) this.page = Math.max(1, totalPages);

		var start = (this.page - 1) * this.perPage;
		var pageItems = filtered.slice(start, start + this.perPage);

		/* Render list */
		var html = '';
		if(total === 0){
			var msg = this.searchTerm
				? (WPGMZA.localized_strings.no_results_found || 'No markers match your search')
				: (WPGMZA.localized_strings.no_markers_found || 'No markers yet');
			html = '<div class="am-ml-empty"><div class="am-empty-text">' + msg + '</div></div>';
		} else {
			html = '<ul class="am-ml">';
			for(var i = 0; i < pageItems.length; i++){
				html += this.renderItem(pageItems[i], start + i);
			}
			html += '</ul>';
		}
		this.container.innerHTML = html;

		/* Render pagination */
		this.renderPagination(total, totalPages);

		/* Update count badge */
		this.updateCount(total);

		/* Bind events */
		this.bindItemEvents();
	}

	/**
	 * Coalesced render — collapses a burst of render requests into a
	 * single actual render on the next animation frame.
	 *
	 * Why: map mutations fire `markeradded` / `markerremoved` ONE PER
	 * MARKER. During a bulk operation (initial load of a large map,
	 * a re-fetch, a multi-delete) that's potentially thousands of
	 * synchronous events, and a naive `render()` per event re-runs an
	 * O(n) filter over the whole marker set + rebuilds the page + re-
	 * binds events every time — locking the tab on large maps.
	 * requestAnimationFrame batches the whole synchronous burst into
	 * one render after the burst settles.
	 *
	 * Also skips entirely while the map's initial marker load is still
	 * in progress (`markersPlaced` false) — the single `markersplaced`
	 * render at the end of load covers that case, so we don't render
	 * thousands of times against a half-populated list during boot.
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.scheduleRender = function(){
		var self = this;
		var map = WPGMZA.maps[0];

		/* Initial bulk load — defer to the end-of-load markersplaced
		   render rather than re-rendering per marker. */
		if(map && !map.markersPlaced)
			return;

		if(self._renderScheduled)
			return;
		self._renderScheduled = true;

		var run = function(){
			self._renderScheduled = false;
			self.render();
		};

		if(typeof window.requestAnimationFrame === 'function')
			window.requestAnimationFrame(run);
		else
			setTimeout(run, 16);
	}

	/**
	 * Render a single marker list item
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.renderItem = function(marker, index){
		var title = this.esc(marker.title || '');
		var address = this.esc(marker.address || '');
		var id = marker.id;

		if(!title && address){ title = address; address = ''; }
		if(!title) title = 'Marker #' + id;

		/* Resolve the actual icon URL — custom, map default, or global default */
		var iconUrl = '';
		var rawIcon = marker.icon;
		if(rawIcon && rawIcon !== ''){
			if(typeof rawIcon === 'object' && rawIcon.url){
				iconUrl = rawIcon.url;
			} else if(typeof rawIcon === 'string'){
				try {
					var parsed = JSON.parse(rawIcon);
					iconUrl = parsed.url || rawIcon;
				} catch(e){
					iconUrl = rawIcon;
				}
			}
		} else if(typeof marker.getIcon === 'function'){
			var fetched = marker.getIcon();
			if(typeof fetched === 'object' && fetched.url){
				iconUrl = fetched.url;
			} else if(typeof fetched === 'string'){
				iconUrl = fetched;
			}
		}
		if(!iconUrl && WPGMZA.defaultMarkerIcon){
			iconUrl = WPGMZA.defaultMarkerIcon;
		}
		if(!iconUrl && WPGMZA.settings && WPGMZA.settings.default_marker_icon){
			iconUrl = WPGMZA.settings.default_marker_icon;
		}

		var iconHtml = iconUrl
			? '<img src="' + this.esc(iconUrl) + '" alt="" />'
			: '<div style="width:10px;height:10px;border-radius:50%;background:#e8473f;"></div>';

		/* Resolve category pills (Pro only) */
		var catHtml = '';
		if(marker.categories && marker.categories.length && WPGMZA.categories){
			var pills = [];
			for(var c = 0; c < marker.categories.length; c++){
				var cat = WPGMZA.categories.getCategoryByID(parseInt(marker.categories[c]));
				if(cat && cat.name && cat.name.trim() !== ''){
					pills.push('<span class="am-mi-cat">' + this.esc(cat.name) + '</span>');
				}
			}
			if(pills.length){
				catHtml = '<div class="am-mi-cats">' + pills.join('') + '</div>';
			}
		}

		var checked = this.selectedIds[id] ? ' checked' : '';

		/* Pending approval detection — UGM (visitor-generated markers)
		   submits with approved=0 until an admin approves. The base
		   marker model defaults approved=1, so a value of 0 (number
		   or string) means "needs admin action". Pro's
		   ProAdminMarkerDataTable injects an Approve action when UGM
		   is loaded and approved=0; we mirror that here so VGM users
		   keep this critical workflow in the Atlas Major list. */
		var needsApproval = (typeof marker.approved !== 'undefined' && parseInt(marker.approved) === 0);

		/* Build the action menu items. Pro-only items (Duplicate,
		   Move Map) are gated on WPGMZA.isProVersion(). Approve is
		   gated on needsApproval and is the only item that carries
		   its own red-dot indicator inside the menu (so users can
		   spot the pending action without scanning every label). */
		var isPro = WPGMZA.isProVersion();
		var menuItems = '';
		menuItems += this.renderMenuItem('edit-marker-id', id, 'Edit',
			'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>');
		menuItems += this.renderMenuItem('adjust-marker-id', id, 'Adjust',
			'<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>');
		menuItems += this.renderMenuItem('center-marker-id', id, 'Center',
			'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>');
		if(isPro){
			menuItems += this.renderMenuItem('duplicate-feature-id', id, 'Duplicate',
				'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>');
			menuItems += this.renderMenuItem('move-map-feature-id', id, 'Move Map',
				'<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>');
		}
		if(needsApproval){
			menuItems += this.renderMenuItem('approve-marker-id', id, 'Approve',
				'<polyline points="20 6 9 17 4 12"/>',
				'am-mi-mi-approve am-mi-mi-attention');
		}
		menuItems += this.renderMenuItem('delete-marker-id', id, 'Delete',
			'<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
			'am-mi-mi-danger');

		/* ---- Developer hook: row PARTS (filter-style) ----
		   Atlas Major has no DataTable, so the column-extension pattern
		   third-party clients used under Atlas Novus (adding <td>s /
		   filtering cell content) doesn't apply. This is the supported
		   replacement: handlers receive a single mutable `parts` object
		   and can rewrite any rendered segment (title, address, icon,
		   category pills, action-menu items) or read `parts.marker` for
		   context. Mutations are read back below when the row is
		   assembled. WPGMZA's JS has no applyFilters(), so we use the
		   codebase's established jQuery-trigger-with-mutable-payload
		   convention. Underscored event name (no jQuery namespace
		   parsing), mirroring WP's PHP filter naming for familiarity.

		   Example — append the marker ID to every title:
		     jQuery(document.body).on('wpgmza_atlas_major_marker_list_item', function(e, parts){
		         parts.title += ' #' + parts.marker.id;
		     });
		   Example — add a custom menu action (reuse renderMenuItem):
		     jQuery(document.body).on('wpgmza_atlas_major_marker_list_item', function(e, parts){
		         parts.menuItems += WPGMZA.atlasMajorMarkerList.renderMenuItem(
		             'my-custom-id', parts.id, 'My Action', '<circle cx="12" cy="12" r="10"/>');
		     }); */
		var parts = {
			marker:        marker,
			id:            id,
			title:         title,
			address:       address,
			iconHtml:      iconHtml,
			catHtml:       catHtml,
			menuItems:     menuItems,
			checked:       checked,
			needsApproval: needsApproval
		};
		$(document.body).trigger('wpgmza_atlas_major_marker_list_item', [parts]);

		var rowHtml = '<li class="am-mi' + (parts.checked ? ' am-mi-selected' : '') + (parts.needsApproval ? ' am-mi-needs-approval' : '') + '" data-marker-id="' + id + '">' +
			'<label class="am-mi-check"><input type="checkbox" data-bulk-marker-id="' + id + '"' + parts.checked + '/></label>' +
			'<div class="am-mi-pin">' + parts.iconHtml + '</div>' +
			'<div class="am-mi-body">' +
				'<div class="am-mi-name">' + parts.title + '</div>' +
				(parts.address ? '<div class="am-mi-addr">' + parts.address + '</div>' : '') +
				parts.catHtml +
			'</div>' +
			'<div class="am-mi-ops">' +
				/* Single kebab trigger replacing the previous inline
				   icon strip. Matches Novus's "..." menu affordance.
				   The red attention dot sits on this button (via the
				   .am-mi-needs-approval class on the parent <li>),
				   mirroring exactly where Novus places it. */
				'<button class="am-mi-kebab" data-marker-menu-id="' + id + '" aria-label="Marker actions" aria-haspopup="true" aria-expanded="false">' +
					'<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>' +
				'</button>' +
				'<div class="am-mi-menu" data-marker-menu-for="' + id + '" role="menu">' +
					parts.menuItems +
				'</div>' +
			'</div>' +
		'</li>';

		/* ---- Developer hook: whole-row HTML (filter-style) ----
		   Final escape hatch for clients that need to rewrite the row
		   markup wholesale. Handlers receive a mutable `result` object;
		   set `result.html` to replace. `result.marker` provided for
		   context. Runs after the PARTS hook so part-level tweaks are
		   already baked into `result.html`. NB: data-* attributes the
		   list relies on for event delegation (data-marker-id,
		   data-*-marker-id, etc.) must be preserved if you rebuild. */
		var result = { html: rowHtml, marker: marker, id: id };
		$(document.body).trigger('wpgmza_atlas_major_marker_list_item_html', [result]);

		return result.html;
	}

	/**
	 * Render a single menu item button. SVG body is the inner
	 * <path>/<circle>/etc. — we wrap with the standard SVG attrs
	 * so menu items render consistently.
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.renderMenuItem = function(dataKey, id, label, svgBody, extraClass){
		var cls = 'am-mi-mi' + (extraClass ? ' ' + extraClass : '');
		return '<button class="' + cls + '" data-' + dataKey + '="' + id + '" role="menuitem">' +
			'<svg class="am-mi-mi-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + svgBody + '</svg>' +
			'<span class="am-mi-mi-label">' + label + '</span>' +
		'</button>';
	}

	/**
	 * Render pagination controls
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.renderPagination = function(total, totalPages){
		if(!this.paginationContainer) return;

		if(totalPages <= 1){
			this.paginationContainer.innerHTML = '';
			return;
		}

		var self = this;
		var html = '<div class="am-pag">';

		/* Prev */
		html += '<button class="am-pag-btn' + (this.page <= 1 ? ' disabled' : '') + '" data-page="' + (this.page - 1) + '">' +
			'<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
		'</button>';

		/* Page numbers — show max 5 around current */
		var startPage = Math.max(1, this.page - 2);
		var endPage = Math.min(totalPages, startPage + 4);
		if(endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

		for(var p = startPage; p <= endPage; p++){
			html += '<button class="am-pag-btn am-pag-num' + (p === this.page ? ' on' : '') + '" data-page="' + p + '">' + p + '</button>';
		}

		/* Next */
		html += '<button class="am-pag-btn' + (this.page >= totalPages ? ' disabled' : '') + '" data-page="' + (this.page + 1) + '">' +
			'<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><polyline points="9 6 15 12 9 18"/></svg>' +
		'</button>';

		html += '<span class="am-pag-info">' + this.page + ' / ' + totalPages + '</span>';
		html += '</div>';

		this.paginationContainer.innerHTML = html;

		/* Bind pagination clicks */
		$(this.paginationContainer).off('click.ampag').on('click.ampag', '.am-pag-btn:not(.disabled)', function(){
			var page = parseInt($(this).attr('data-page'));
			if(page >= 1 && page <= totalPages){
				self.page = page;
				self.render();
				/* Scroll to top of list */
				$(self.container).closest('.am-panel-scroll')[0].scrollTop = 0;
			}
		});
	}

	/**
	 * Bind search input with debounce
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.bindSearch = function(){
		var self = this;
		if(!this.searchInput) return;

		$(this.searchInput).on('input', function(){
			clearTimeout(self.debounceTimer);
			self.debounceTimer = setTimeout(function(){
				self.searchTerm = $(self.searchInput).val();
				self.page = 1;
				self.render();
			}, 200);
		});
	}

	/**
	 * Update the count badge next to "Markers" heading
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.updateCount = function(filteredCount){
		if(!this.countBadge) return;

		var map = WPGMZA.maps[0];
		var total = (map && map.markers) ? map.markers.length : 0;

		if(this.searchTerm){
			this.countBadge.textContent = filteredCount + ' / ' + total;
		} else {
			this.countBadge.textContent = total;
		}
	}

	/**
	 * Bind click events on rendered list items
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.bindItemEvents = function(){
		var self = this;
		var container = $(this.container);

		container.off('click.amlist').on('click.amlist', '.am-mi', function(e){
			if($(e.target).closest('.am-mi-ops').length) return;
			if($(e.target).closest('.am-mi-check').length) return;
			self.editMarker($(this).data('marker-id'));
		});

		/* Kebab toggle — opens the per-row action menu. We close any
		   other open menu first so only one is visible at a time.
		   The menu closes via the document-level handler installed
		   in initKebabDismiss(). */
		container.on('click.amlist', '.am-mi-kebab', function(e){
			e.stopPropagation();
			var $kebab = $(this);
			var $li = $kebab.closest('.am-mi');
			var alreadyOpen = $li.hasClass('am-mi-menu-open');

			/* Close all other menus */
			$(self.container).find('.am-mi.am-mi-menu-open').removeClass('am-mi-menu-open')
				.find('.am-mi-kebab').attr('aria-expanded', 'false');

			if(!alreadyOpen){
				$li.addClass('am-mi-menu-open');
				$kebab.attr('aria-expanded', 'true');
			}
		});

		/* Close-on-action: clicking any menu item should close the
		   menu after the action's own handler fires. */
		container.on('click.amlist', '.am-mi-menu .am-mi-mi', function(){
			$(this).closest('.am-mi').removeClass('am-mi-menu-open')
				.find('.am-mi-kebab').attr('aria-expanded', 'false');
		});

		self.bindBulkCheckboxes();
		self.updateBulkBar();

		container.on('click.amlist', '[data-edit-marker-id]', function(e){
			e.stopPropagation();
			self.editMarker($(this).attr('data-edit-marker-id'));
		});

		container.on('click.amlist', '[data-center-marker-id]', function(e){
			e.stopPropagation();
			self.centerMarker($(this).attr('data-center-marker-id'));
		});

		/* Adjust — do NOT stopPropagation. The core MarkerPanel listens on
		   document.body for [data-adjust-marker-id] clicks. We just need
		   to ensure the editor grouping opens. */
		container.on('click.amlist', '[data-adjust-marker-id]', function(e){
			/* Let the event bubble to MarkerPanel.onAdjustFeature on body */
		});

		container.on('click.amlist', '[data-duplicate-feature-id]', function(e){
			e.stopPropagation();
			self.duplicateMarker($(this).attr('data-duplicate-feature-id'));
		});

		container.on('click.amlist', '[data-move-map-feature-id]', function(e){
			e.stopPropagation();
			self.moveMarkerToMap($(this).attr('data-move-map-feature-id'));
		});

		container.on('click.amlist', '[data-approve-marker-id]', function(e){
			e.stopPropagation();
			self.approveMarker($(this).attr('data-approve-marker-id'));
		});

		container.on('click.amlist', '[data-delete-marker-id]', function(e){
			e.stopPropagation();
			self.deleteMarker($(this).attr('data-delete-marker-id'));
		});
	}

	/**
	 * Bind to map events for live updates
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.bindMapEvents = function(){
		var self = this;
		var map = WPGMZA.maps[0];
		if(!map) return;

		/* Coalesced (scheduleRender) rather than a direct render per
		   event — on large maps these fire once per marker during bulk
		   adds/removes and would otherwise re-render thousands of times.
		   scheduleRender also no-ops while the initial load is still in
		   progress; the markersplaced handler below renders once at the
		   end of that load. */
		map.on('markeradded', function(){ self.scheduleRender(); });
		map.on('markerremoved', function(){ self.scheduleRender(); });

		/* Authoritative "all initial markers are loaded" event. This
		 * covers the case where the marker list constructor runs
		 * BEFORE the map has finished fetching its initial marker
		 * batch — constructor's render() sees 0 markers, tab shows
		 * empty, and without this listener we'd miss the later load.
		 * If `markersplaced` already fired (map.markersPlaced is true),
		 * we render once right now instead of waiting. Direct render()
		 * here (not scheduleRender) since it's a single end-of-load
		 * call and scheduleRender would no-op if markersPlaced flips
		 * true mid-frame.
		 * Either path clears the initial-load busy state (set in the
		 * constructor when !map.markersPlaced) — render is the real
		 * "list is up to date" signal here. */
		if(map.markersPlaced){
			self.render();
			self.setBusy(false);
		} else {
			map.on('markersplaced', function(){
				self.render();
				self.setBusy(false);
			});
		}

		$(document.body).on('datatable.reload', function(){
			setTimeout(function(){ self.render(); }, 500);
		});
	}

	WPGMZA.AtlasMajorMarkerList.prototype.editMarker = function(id){
		var panel = WPGMZA.mapEditPage ? WPGMZA.mapEditPage.markerPanel : null;

		if(panel && typeof panel.select === 'function'){
			panel.select(id);
		}

		if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.sidebarGroupings){
			WPGMZA.mapEditPage.sidebarGroupings.openTabByGroupId('map-markers-editor');
		}

		/* Open the marker's infowindow on the Live Preview map so the
		   user sees what they're editing in its rendered state. Safe
		   in the editor because the viewportGroupings null-guards in
		   pro-info-window.js (and siblings) make populatePanel
		   tolerant of admin context where viewportGroupings is absent. */
		var map = WPGMZA.maps[0];
		var marker = map ? map.getMarkerByID(id) : null;
		if(marker && typeof marker.openInfoWindow === 'function'){
			marker.openInfoWindow();
		}
	}

	WPGMZA.AtlasMajorMarkerList.prototype.centerMarker = function(id){
		var marker = WPGMZA.maps[0].getMarkerByID(id);
		if(marker){
			WPGMZA.maps[0].setCenter(new WPGMZA.LatLng({ lat: marker.lat, lng: marker.lng }));
		}
	}

	/**
	 * Duplicate a marker via REST API (Pro only)
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.duplicateMarker = function(id){
		var self = this;
		var map = WPGMZA.maps[0];

		self.setBusy(true);

		WPGMZA.restAPI.call("/markers/", {
			method: "POST",
			data: {
				id: id,
				action: "duplicate"
			},
			success: function(response, status, xhr) {
				/* The list renders from map.markers (no server-backed
				   DataTable like Novus), so the freshly-created marker
				   has to be pushed into the map. The duplicate endpoint
				   now returns the new marker (see ProRestAPI::markers
				   duplicate case); instantiate + addMarker, which fires
				   `markeradded` -> render() via bindMapEvents. */
				if(response && response.marker && map && typeof map.addMarker === 'function'){
					var marker = WPGMZA.Marker.createInstance(response.marker);
					map.addMarker(marker);
				} else {
					/* Fallback for older Pro that doesn't return the
					   marker — at least re-render from current state. */
					self.render();
				}

				/* Keep the hidden DataTable (bulk-edit modal source) in
				   sync with the new row. */
				if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.markerAdminDataTable){
					WPGMZA.mapEditPage.markerAdminDataTable.reload();
				}

				self.setBusy(false);
			},
			error: function(){
				self.setBusy(false);
			}
		});
	}

	/**
	 * Move marker to a different map (Pro only)
	 * Reuses the existing AdminFeatureDataTable.onMoveMap which
	 * shows the .wpgmza-map-select-modal generic modal. The modal
	 * is created during datatable construction; we just delegate
	 * the call so the modal lifecycle stays in one place.
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.moveMarkerToMap = function(id){
		var self = this;

		var dt = WPGMZA.mapEditPage ? WPGMZA.mapEditPage.markerAdminDataTable : null;
		if(!dt || typeof dt.onMoveMap !== 'function')
			return;

		/* onMoveMap accepts either an event OR a bare id when event is
		   undefined. Passing the id directly fires the modal flow. */
		dt.onMoveMap(id);
	}

	/**
	 * Approve a pending marker (Pro + UGM)
	 * Mirrors MarkerPanel.onApproveMarker — POST /markers/{id} with
	 * approved=1. Pro's existing handler updates the datatable; we
	 * additionally flip the local marker.approved so the list
	 * re-renders without the red-dot indicator + approve button.
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.approveMarker = function(id){
		var self = this;
		var map = WPGMZA.maps[0];
		if(!map) return;

		self.setBusy(true);

		WPGMZA.restAPI.call("/markers/" + id, {
			method: "POST",
			data: { approved: "1" },
			success: function(){
				/* Update the local marker model so the list reflects
				   the new state immediately without waiting for a
				   full markers refetch. */
				var marker = map.getMarkerByID(id);
				if(marker){
					marker.approved = 1;
				}
				self.render();

				/* Keep the hidden DataTable (used by bulk-edit modal
				   lookups) in sync as well. */
				if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.markerAdminDataTable){
					WPGMZA.mapEditPage.markerAdminDataTable.reload();
				}

				self.setBusy(false);
			},
			error: function(){
				self.setBusy(false);
			}
		});
	}

	WPGMZA.AtlasMajorMarkerList.prototype.deleteMarker = function(id){
		var self = this;
		if(!confirm(WPGMZA.localized_strings.general_delete_prompt_text || 'Are you sure you want to delete this marker?'))
			return;

		var map = WPGMZA.maps[0];
		var marker = map.getMarkerByID(id);

		/* Delete via the REST API (DELETE /markers/{id}) — the same
		   path FeaturePanel.onDeleteFeature() uses (feature-panel.js
		   ~L592). The previous legacy `$.post(ajaxurl, action:
		   delete_marker)` call relied on `wp_ajax_delete_marker`,
		   which is only registered by the pro-below-8.1 compatibility
		   layer (hooking a deprecated empty stub); on current Pro no
		   handler is registered, so admin-ajax returned 400 and the
		   marker was never actually deleted. We also now remove the
		   marker only AFTER the delete succeeds, rather than
		   optimistically before a request that could fail. */
		self.setBusy(true);

		WPGMZA.restAPI.call("/markers/" + id, {
			method: "DELETE",
			success: function(data, status, xhr){
				if(marker)
					map.removeMarker(marker); /* fires markerremoved -> render() */
				else
					map.removeMarkerByID(id);

				self.render();
				if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.markerAdminDataTable){
					WPGMZA.mapEditPage.markerAdminDataTable.reload();
				}

				self.setBusy(false);
			},
			error: function(){
				self.setBusy(false);
			}
		});
	}

	/**
	 * Create the bulk action bar (inserted after search field)
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.initBulkBar = function(){
		var self = this;
		var searchField = document.querySelector('.am-search-field');
		if(!searchField) return;

		var bar = document.createElement('div');
		bar.className = 'am-bulk-bar';
		bar.style.display = 'none';
		bar.innerHTML =
			'<button type="button" class="am-bulk-btn" data-bulk-action="select-all">' + (WPGMZA.localized_strings.select_all || 'Select All') + '</button>' +
			'<button type="button" class="am-bulk-btn" data-bulk-action="deselect-all">' + (WPGMZA.localized_strings.deselect_all || 'Deselect All') + '</button>' +
			'<button type="button" class="am-bulk-btn" data-bulk-action="bulk-edit">' + (WPGMZA.localized_strings.bulk_edit || 'Bulk Edit') + '</button>' +
			'<button type="button" class="am-bulk-btn am-bulk-btn-danger" data-bulk-action="bulk-delete">' + (WPGMZA.localized_strings.bulk_delete || 'Bulk Delete') + '</button>';

		searchField.after(bar);
		this.bulkBar = bar;

		$(bar).on('click', '[data-bulk-action]', function(e){
			var action = $(this).attr('data-bulk-action');
			if(action === 'select-all') self.bulkSelectAll();
			else if(action === 'deselect-all') self.bulkDeselectAll();
			else if(action === 'bulk-edit') self.bulkEdit();
			else if(action === 'bulk-delete') self.bulkDelete();
		});
	}

	/**
	 * Get the bulk edit modal (Pro only)
	 * Reuses the modal already created by the hidden AdminFeatureDataTable
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.getBulkEditModal = function(){
		/* Try the datatable's lazy getter first */
		var tables = WPGMZA.mapEditPage ? WPGMZA.mapEditPage.markerDataTable || WPGMZA.mapEditPage.markerAdminDataTable : null;
		if(tables && typeof tables.getBulkEditorModal === 'function'){
			return tables.getBulkEditorModal();
		}

		/* Fallback: find any AdminFeatureDataTable for markers */
		if(WPGMZA.AdminFeatureDataTable){
			var el = $('[data-wpgmza-table][data-wpgmza-feature-type="marker"]')[0];
			if(el && el.wpgmzaDataTable && typeof el.wpgmzaDataTable.getBulkEditorModal === 'function'){
				return el.wpgmzaDataTable.getBulkEditorModal();
			}
		}

		return false;
	}

	/**
	 * Update bulk bar visibility and info
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.updateBulkBar = function(){
		if(!this.bulkBar) return;

		var count = Object.keys(this.selectedIds).length;
		if(count > 0){
			this.bulkBar.style.display = 'flex';
		} else {
			this.bulkBar.style.display = 'none';
		}
	}

	/**
	 * Bind checkbox change events (called after render)
	 */
	WPGMZA.AtlasMajorMarkerList.prototype.bindBulkCheckboxes = function(){
		var self = this;
		$(this.container).off('change.ambulk').on('change.ambulk', '[data-bulk-marker-id]', function(e){
			e.stopPropagation();
			var id = $(this).attr('data-bulk-marker-id');
			if(this.checked){
				self.selectedIds[id] = true;
			} else {
				delete self.selectedIds[id];
			}
			$(this).closest('.am-mi').toggleClass('am-mi-selected', this.checked);
			self.updateBulkBar();
		});

		/* Prevent checkbox click from triggering marker edit */
		$(this.container).off('click.ambulkstop').on('click.ambulkstop', '.am-mi-check', function(e){
			e.stopPropagation();
		});
	}

	WPGMZA.AtlasMajorMarkerList.prototype.bulkSelectAll = function(){
		var filtered = this.getFilteredMarkers();
		for(var i = 0; i < filtered.length; i++){
			this.selectedIds[filtered[i].id] = true;
		}
		this.render();
	}

	WPGMZA.AtlasMajorMarkerList.prototype.bulkDeselectAll = function(){
		this.selectedIds = {};
		this.render();
	}

	WPGMZA.AtlasMajorMarkerList.prototype.getSelectedIds = function(){
		return Object.keys(this.selectedIds).map(function(id){ return parseInt(id); });
	}

	WPGMZA.AtlasMajorMarkerList.prototype.bulkDelete = function(){
		var self = this;
		var ids = this.getSelectedIds();
		if(!ids.length) return;

		if(!confirm(WPGMZA.localized_strings.general_delete_prompt_text || 'Are you sure you want to delete these markers?'))
			return;

		var map = WPGMZA.maps[0];
		ids.forEach(function(id){
			try { map.removeMarkerByID(id); } catch(e){}
		});

		WPGMZA.restAPI.call("/markers/", {
			method: "DELETE",
			data: { ids: ids },
			complete: function(){
				self.selectedIds = {};
				self.render();
				if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.markerAdminDataTable){
					WPGMZA.mapEditPage.markerAdminDataTable.reload();
				}
			}
		});
	}

	WPGMZA.AtlasMajorMarkerList.prototype.bulkEdit = function(){
		var self = this;
		var ids = this.getSelectedIds();
		if(!ids.length) return;

		var modal = this.getBulkEditModal();
		if(modal){
			modal.show(function(data){
				data.ids = ids;
				data.action = "bulk_edit";

				WPGMZA.restAPI.call("/markers/", {
					method: "POST",
					data: data,
					success: function(){
						self.selectedIds = {};
						self.render();
						if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.markerAdminDataTable){
							WPGMZA.mapEditPage.markerAdminDataTable.reload();
						}
					}
				});
			});
		}
	}

	WPGMZA.AtlasMajorMarkerList.prototype.esc = function(str){
		var d = document.createElement('div');
		d.textContent = str;
		return d.innerHTML;
	}

	/* Init */
	function initMarkerList(){
		if(WPGMZA.maps && WPGMZA.maps[0] && document.querySelector('.am-marker-list-container')){
			if(!WPGMZA.atlasMajorMarkerList){
				WPGMZA.atlasMajorMarkerList = new WPGMZA.AtlasMajorMarkerList();
			}
		}
	}

	$(document.body).on('wpgmza_map_edit_page_created', function(){
		setTimeout(initMarkerList, 1000);
	});

	$(window).on('load', function(){
		setTimeout(initMarkerList, 1500);
	});

	$(document.body).on('markersfetched', function(){
		if(WPGMZA.atlasMajorMarkerList){
			WPGMZA.atlasMajorMarkerList.render();
		}
	});

	/* (Removed) Previously this file installed a sidebar-delegate-created
	 * handler that scrolled the Add Marker panel back to the top and
	 * refocused the address input — the old request was to keep users
	 * on the Add Marker form for bulk-add workflows. That requirement
	 * has been reversed: after a successful Add, the editor should now
	 * return to the marker list panel (consistent with what Edit Marker
	 * already does via sidebar-groupings.js's `sidebar-delegate-saved`
	 * handler). The navigate-back is handled in sidebar-groupings.js's
	 * `sidebar-delegate-created` handler — nothing Atlas-Major-specific
	 * needs to run here anymore. */
});
