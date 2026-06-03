/**
 * @namespace WPGMZA
 * @module AtlasMajorFeatureList
 * @requires WPGMZA
 *
 * Custom feature list renderer for Atlas Major.
 * Renders clean lists for all shape types (polygons, polylines, circles,
 * rectangles, point labels, heatmaps, image overlays) matching the
 * Concept C mockup design. Same pattern as AtlasMajorMarkerList.
 */
jQuery(function($) {

	if(!document.querySelector('.wpgmza-atlas-major'))
		return;

	WPGMZA.AtlasMajorFeatureList = function(container, featureType){
		this.container = container;
		this.featureType = featureType;
		this.page = 1;
		this.perPage = 50;
		this.searchTerm = '';

		this.render();
		this.bindMapEvents();
	}

	/**
	 * Get features from the map by type
	 */
	WPGMZA.AtlasMajorFeatureList.prototype.getFeatures = function(){
		var map = WPGMZA.maps[0];
		if(!map) return [];

		var plural = this.featureType + 's';
		return map[plural] || [];
	}

	/**
	 * Get a display name for a feature
	 */
	WPGMZA.AtlasMajorFeatureList.prototype.getFeatureName = function(feature){
		/* Try common name properties */
		if(feature.title && feature.title.trim()) return feature.title;
		if(feature.name && feature.name.trim()) return feature.name;
		if(feature.text && feature.text.trim()) return feature.text;

		/* Fallback: type + ID */
		var type = WPGMZA.capitalizeWords(this.featureType);
		return type + ' #' + feature.id;
	}

	/**
	 * Get a subtitle/description for a feature
	 */
	WPGMZA.AtlasMajorFeatureList.prototype.getFeatureSubtitle = function(feature){
		if(feature.address && feature.address.trim()) return feature.address;
		if(feature.description && feature.description.trim()){
			var text = feature.description.replace(/<[^>]*>/g, '').trim();
			return text.length > 60 ? text.substring(0, 60) + '...' : text;
		}
		return '';
	}

	/**
	 * Render the list
	 */
	WPGMZA.AtlasMajorFeatureList.prototype.render = function(){
		if(!this.container) return;

		var features = this.getFeatures();
		var total = features.length;
		var totalPages = Math.ceil(total / this.perPage);
		if(this.page > totalPages) this.page = Math.max(1, totalPages);

		var start = (this.page - 1) * this.perPage;
		var pageItems = features.slice(start, start + this.perPage);

		var html = '';
		if(total === 0){
			html = '<div class="am-ml-empty"><div class="am-empty-text">No ' + this.featureType + 's yet</div></div>';
		} else {
			html = '<ul class="am-ml">';
			for(var i = 0; i < pageItems.length; i++){
				html += this.renderItem(pageItems[i]);
			}
			html += '</ul>';
		}
		this.container.innerHTML = html;
		this.bindItemEvents();
	}

	/**
	 * Render a single feature item
	 */
	WPGMZA.AtlasMajorFeatureList.prototype.renderItem = function(feature){
		var id = feature.id;
		var name = this.esc(this.getFeatureName(feature));
		var subtitle = this.esc(this.getFeatureSubtitle(feature));
		var type = this.featureType;

		return '<li class="am-mi" data-feature-id="' + id + '" data-feature-type="' + type + '">' +
			'<div class="am-mi-body">' +
				'<div class="am-mi-name">' + name + '</div>' +
				(subtitle ? '<div class="am-mi-addr">' + subtitle + '</div>' : '') +
			'</div>' +
			'<div class="am-mi-ops">' +
				'<button class="am-mi-btn" data-edit-' + type + '-id="' + id + '" title="Edit">' +
					'<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>' +
				'</button>' +
				'<button class="am-mi-btn" data-fit-feature-bounds-id="' + id + '" title="Center">' +
					'<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>' +
				'</button>' +
				'<button class="am-mi-btn am-mi-btn-danger" data-delete-' + type + '-id="' + id + '" title="Delete">' +
					'<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
				'</button>' +
			'</div>' +
		'</li>';
	}

	/**
	 * Bind click events
	 */
	WPGMZA.AtlasMajorFeatureList.prototype.bindItemEvents = function(){
		var self = this;
		var $container = $(this.container);

		$container.off('click.amflist');

		/* Row click → edit */
		$container.on('click.amflist', '.am-mi', function(e){
			if($(e.target).closest('.am-mi-ops').length) return;
			var id = $(this).data('feature-id');
			/* Trigger the edit click on the data attribute — core listens on body for these */
			$('<a data-edit-' + self.featureType + '-id="' + id + '">').appendTo('body').trigger('click').remove();
		});

		/* Edit button — let it bubble to body where FeaturePanel listens */
		$container.on('click.amflist', '[data-edit-' + self.featureType + '-id]', function(e){
			/* Already has the data attribute, event bubbles to body handler */
		});

		/* Center/fit bounds — let it bubble to AdminFeatureDataTable on body */
		$container.on('click.amflist', '[data-fit-feature-bounds-id]', function(e){
			e.stopPropagation();
			var id = $(this).attr('data-fit-feature-bounds-id');
			/* Trigger on the datatable element so the handler catches it */
			var dtElement = $('[data-wpgmza-feature-type="' + self.featureType + '"]');
			if(dtElement.length){
				$('<a data-fit-feature-bounds-id="' + id + '">').appendTo(dtElement).trigger('click').remove();
			}
		});

		/* Delete — let it bubble to body handler */
		$container.on('click.amflist', '[data-delete-' + self.featureType + '-id]', function(e){
			/* Already has the data attribute, event bubbles to body handler */
		});
	}

	/**
	 * Bind map events for live updates
	 */
	WPGMZA.AtlasMajorFeatureList.prototype.bindMapEvents = function(){
		var self = this;
		var map = WPGMZA.maps[0];
		if(!map) return;

		var type = this.featureType;
		map.on(type + 'added', function(){ self.render(); });
		map.on(type + 'removed', function(){ self.render(); });
	}

	WPGMZA.AtlasMajorFeatureList.prototype.esc = function(str){
		var d = document.createElement('div');
		d.textContent = str;
		return d.innerHTML;
	}

	/**
	 * Initialize all feature lists
	 */
	function initFeatureLists(){
		if(!WPGMZA.maps || !WPGMZA.maps[0]) return;

		$('.am-feature-list-container[data-feature-type]').each(function(){
			var el = this;
			var type = $(el).attr('data-feature-type');

			if(el._amFeatureList) return;

			el._amFeatureList = new WPGMZA.AtlasMajorFeatureList(el, type);
		});
	}

	$(document.body).on('wpgmza_map_edit_page_created', function(){
		setTimeout(initFeatureLists, 1000);
	});

	$(window).on('load', function(){
		setTimeout(initFeatureLists, 1500);
	});
});
