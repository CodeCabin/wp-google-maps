/**
 * @namespace WPGMZA
 * @module Map
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	/**
	 * Base class for maps. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Map
	 * @constructor WPGMZA.Map
	 * @memberof WPGMZA
	 * @param {HTMLElement} element to contain map
	 * @param {object} [options] Options to apply to this map
	 * @augments WPGMZA.EventDispatcher
	 */
	WPGMZA.Map = function(element, options)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Map");
		
		WPGMZA.EventDispatcher.call(this);
		
		if(!(element instanceof HTMLElement) && !(element instanceof HTMLDivElement)){
			if(!window.elementor){
				/**
				 * Temporary Solution
				 * 
				 * If elementor is active, it won't be an HTML Element just yet, due to preview block loading
				 * 
				 * However, our timer initializer will load it later, so we just don't throw the error
				*/
				throw new Error("Argument must be a HTMLElement");
			}
		}
		
		// NB: This should be moved to a getID function or similar and offloaded to Pro. ID should be fixed to 1 in basic.
		if(element.hasAttribute("data-map-id"))
			this.id = element.getAttribute("data-map-id");
		else
			this.id = 1;
		
		if(!/\d+/.test(this.id))
			throw new Error("Map ID must be an integer");
		
		WPGMZA.maps.push(this);
		
		this.element = element;
		this.element.wpgmzaMap = this;
		$(this.element).addClass("wpgmza-initialized");
		
		this.engineElement = element;
		
		this.markers = [];
		this.polygons = [];
		this.polylines = [];
		this.circles = [];
		this.rectangles = [];

		this.pointlabels = [];

		// GDPR
		if(WPGMZA.googleAPIStatus && WPGMZA.googleAPIStatus.code == "USER_CONSENT_NOT_GIVEN") {
			$(element).append($(WPGMZA.api_consent_html));
			$(element).css({height: "auto"});
			return;
		}
		
		this.loadSettings(options);
		this.loadStyling();

		this.shortcodeAttributes = {};
		if($(this.element).attr("data-shortcode-attributes")){
			try{
				this.shortcodeAttributes = JSON.parse($(this.element).attr("data-shortcode-attributes"));
				if(this.shortcodeAttributes.zoom){
					this.settings.map_start_zoom = parseInt(this.shortcodeAttributes.zoom);
				}
			}catch(e) {
				console.warn("Error parsing shortcode attributes");
			}
		}

		this.innerStack = $(this.element).find('.wpgmza-inner-stack');

		/* Deprecated to allow for internal stack init (V9.0.0) */
		/*if(WPGMZA.getCurrentPage() != WPGMZA.PAGE_MAP_EDIT)
			this.initStoreLocator();*/
		
		this.setDimensions();
		this.setAlignment();

		/* V9.0.0 - Load internal viewport, this is a new system which allows for container specific redraw logic (More for stacks at the moment) */
		this.initInternalViewport();

		// Init marker filter
		this.markerFilter = WPGMZA.MarkerFilter.createInstance(this);
		
		// Initialisation
		this.on("init", function(event) {
			self.onInit(event);
		});

		this.on("click", function(event){
			self.onClick(event);
		});

		// Fullscreen delegates
		$(document.body).on('fullscreenchange.wpgmza', function(event){
			let fullscreen = self.isFullScreen();
			self.onFullScreenChange(fullscreen);
		});
		
		// Legacy support
		if(WPGMZA.useLegacyGlobals)
		{
			// NB: this.id stuff should be moved to Map
			wpgmzaLegacyGlobals.MYMAP[this.id] = {
				map: null,
				bounds: null,
				mc: null
			};
			
			wpgmzaLegacyGlobals.MYMAP.init =
				wpgmzaLegacyGlobals.MYMAP[this.id].init =
				wpgmzaLegacyGlobals.MYMAP.placeMarkers = 
				wpgmzaLegacyGlobals.MYMAP[this.id].placeMarkers = 
				function() {
				console.warn("This function is deprecated and should no longer be used");
			}
		}
	}
	
	WPGMZA.Map.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.Map.prototype.constructor = WPGMZA.Map;
	WPGMZA.Map.nightTimeThemeData = [{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#575663"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#80823e"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#1b737a"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]}];
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Map
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Map.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProMap;
				
				return WPGMZA.OLMap;
				break;
			
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProMap;
				
				return WPGMZA.GoogleMap;
				break;
		}
	}

	/**
	 * Creates an instance of a map, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {HTMLElement} element to contain map
	 * @param {object} [options] Options to apply to this map
	 * @return {WPGMZA.Map} An instance of WPGMZA.Map
	 */
	WPGMZA.Map.createInstance = function(element, options)
	{
		var constructor = WPGMZA.Map.getConstructor();
		return new constructor(element, options);
	}
	
	/**
	 * Whether or not the markers have been placed yet
	 *  
	 * @name WPGMZA.ProMap#markersPlaced
	 * @type Boolean
	 * @readonly
	 */
	Object.defineProperty(WPGMZA.Map.prototype, "markersPlaced", {
		
		get: function() {
			return this._markersPlaced;
		},
		
		set: function(value) {
			throw new Error("Value is read only");
		}
		
	});
	
	/**
	 * The maps current latitude
	 * 
	 * @property lat
	 * @memberof WPGMZA.Map
	 * @name WPGMZA.Map#lat
	 * @type Number
	 */
	Object.defineProperty(WPGMZA.Map.prototype, "lat", {
		
		get: function() {
			return this.getCenter().lat;
		},
		
		set: function(value) {
			var center = this.getCenter();
			center.lat = value;
			this.setCenter(center);
		}
		
	});
	
	/**
	 * The maps current longitude
	 * 
	 * @property lng
	 * @memberof WPGMZA.Map
	 * @name WPGMZA.Map#lng
	 * @type Number
	 */
	Object.defineProperty(WPGMZA.Map.prototype, "lng", {
		
		get: function() {
			return this.getCenter().lng;
		},
		
		set: function(value) {
			var center = this.getCenter();
			center.lng = value;
			this.setCenter(center);
		}
		
	});
	
	/**
	 * The maps current zoom level
	 *  
	 * @property zoom
	 * @memberof WPGMZA.Map
	 * @name WPGMZA.Map#zoom
	 * @type Number
	 */
	Object.defineProperty(WPGMZA.Map.prototype, "zoom", {
		
		get: function() {
			return this.getZoom();
		},
		
		set: function(value) {
			this.setZoom(value);
		}
		
	});
	
	/**
	 * Called by the engine specific map classes when the map has fully initialised
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Event} The event
	 * @listens module:WPGMZA.Map~init
	 */
	WPGMZA.Map.prototype.onInit = function(event)
	{
		var self = this;
		
		this.initPreloader();

		if(this.innerStack.length > 0){
			$(this.element).append(this.innerStack);

		}
		
		if(WPGMZA.getCurrentPage() != WPGMZA.PAGE_MAP_EDIT){
			this.initStoreLocator();
		}
		
		if(!("autoFetchFeatures" in this.settings) || (this.settings.autoFetchFeatures !== false))
			this.fetchFeatures();
	}
	
	/**
	 * Initialises the preloader
	 * @method
	 * @memberof WPGMZA.Map
	 * @protected
	 */
	WPGMZA.Map.prototype.initPreloader = function()
	{
		this.preloader = $(WPGMZA.preloaderHTML);

		$(this.preloader).hide();
		
		$(this.element).append(this.preloader);
	}
	
	/**
	 * Shows or hides the maps preloader
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.showPreloader = function(show)
	{
		if(show)
			$(this.preloader).show();
		else
			$(this.preloader).hide();
	}
	
	/**
	 * Loads the maps settings and sets some defaults
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.loadSettings = function(options)
	{
		var settings = new WPGMZA.MapSettings(this.element);
		var other_settings = settings.other_settings;
		
		delete settings.other_settings;
		
		/*if(other_settings)
			for(var key in other_settings)
				settings[key] = other_settings[key];*/
			
		if(options)
			for(var key in options)
				settings[key] = options[key];
			
		this.settings = settings;
	}

	/**
	 * Loads global component styling variables onto each map element as it is initialized
	 * 
	 * This is a global styling support, but it could be pivoted later into a per map option as well if needed. This is the primary reason for map instancing
	 * 
	 * @method
	 * @memberof WPGMZA.Map
	*/
	WPGMZA.Map.prototype.loadStyling = function(){
		if(!WPGMZA.InternalEngine.isLegacy()){
			if(WPGMZA.stylingSettings && WPGMZA.stylingSettings instanceof Object){
				if(Object.keys(WPGMZA.stylingSettings).length > 0){
					for(let name in WPGMZA.stylingSettings){
						if(name.indexOf('--') !== -1){
							/* This is a CSS variable, so it's okay to set this on the wrapper */
							const value = WPGMZA.stylingSettings[name];
							if(value){
								$(this.element).css(name, value);
							}
						}
					}
				}
			}

			if(this.settings && this.settings.wpgmza_ol_tile_filter){
				let tileFilter = this.settings.wpgmza_ol_tile_filter.trim();
				if(tileFilter){
					$(this.element).css('--wpgmza-ol-tile-filter', tileFilter);
				}
			}
		}
	}

	/**
	 * Loads and initializes internal viewport logic
	 * 
	 * This allows each stacked item in the map (placed in map, atlas novus) to listen to changes in the document
	 * 
	 * These changes are treated as an internal viewport for the map container, allowing panels to resize similar to media queries,
	 * but with the added benefit of being container based, and not screen based. This means we can resize stacked components/panels without being 
	 * reliant on the screen size, which is more effective in our opinion
	 * 
	 * Note: We could have looked into using container queries, but they just don't seem quite ready yet under the current CSS specification
	 * 
	 * This initialized a new module, which is dedicated to monitoring changes in the internal viewport 
	 * 
	 * @return void
	 */
	WPGMZA.Map.prototype.initInternalViewport = function(){
		if(WPGMZA.is_admin == "1")
			return;	// NB: Only on frontend (for now anyway)
		
		this.internalViewport = WPGMZA.InternalViewport.createInstance(this);
	}
	
	WPGMZA.Map.prototype.initStoreLocator = function()
	{
		let selectors = [
			".wpgmza-store-locator[data-id='" + this.id + "']",
			".wpgmza-store-locator",
			".wpgmza_sl_main_div"
		];

		let storeLocatorElement = false;
		for(let i in selectors){
			if($(selectors[i]).length > 0 && storeLocatorElement === false){
				storeLocatorElement = $(selectors[i]);
			}
		}
		if(storeLocatorElement.length){
			this.storeLocator = WPGMZA.StoreLocator.createInstance(this, storeLocatorElement[0]);
		}
	}
	
	/**
	 * Get's arrays of all features for each of the feature types on the map
	 * @method
	 * @protected
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.getFeatureArrays = function()
	{
		var arrays = WPGMZA.Map.prototype.getFeatureArrays.call(this);
		
		arrays.heatmaps = this.heatmaps;
		arrays.imageoverlays = this.imageoverlays;
		
		return arrays;
	}
	
	/**
	 * Sets options in bulk on map
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.setOptions = function(options)
	{
		for(var name in options)
			this.settings[name] = options[name];
	}
	
	WPGMZA.Map.prototype.getRESTParameters = function(options)
	{
		var defaults = {};
		
		if(!options || !options.filter)
			defaults.filter = JSON.stringify(this.markerFilter.getFilteringParameters());
		
		return $.extend(true, defaults, options);
	}
	
	WPGMZA.Map.prototype.fetchFeaturesViaREST = function()
	{
		var self = this;
		var data;
		var filter = this.markerFilter.getFilteringParameters();
		
		if(WPGMZA.is_admin == "1")
		{
			filter.includeUnapproved = true;
			filter.excludeIntegrated = true;
		}
		
		if(this.shortcodeAttributes.acf_post_id)
			filter.acfPostID = this.shortcodeAttributes.acf_post_id;
		
		this.showPreloader(true);
		
		if(this.fetchFeaturesXhr)
			this.fetchFeaturesXhr.abort();
			
		if(!WPGMZA.settings.fetchMarkersBatchSize || !WPGMZA.settings.enable_batch_loading)
		{
			data = this.getRESTParameters({
				filter: JSON.stringify(filter)
			});
			
			this.fetchFeaturesXhr = WPGMZA.restAPI.call("/features/", {
				
				useCompressedPathVariable: true,
				data: data,
				success: function(result, status, xhr) {
					self.onFeaturesFetched(result);
				}
				
			});
		} else {
			var offset = 0;
			var limit = parseInt(WPGMZA.settings.fetchMarkersBatchSize);
			
			function fetchNextBatch(){
				filter.offset = offset;
				filter.limit = limit;
				
				data = self.getRESTParameters({
					filter: JSON.stringify(filter)
				});
				
				self.fetchFeaturesXhr = WPGMZA.restAPI.call("/markers/", {
					
					useCompressedPathVariable: true,
					data: data,
					success: function(result, status, xhr) {
						
						if(result.length){
							self.onMarkersFetched(result, true);	// Expect more batches
							
							offset += limit;
							fetchNextBatch();
						} else {
							self.onMarkersFetched(result);			// Final batch
							
							data.exclude = "markers";
							
							WPGMZA.restAPI.call("/features/", {
								
								useCompressedPathVariable: true,
								data: data,
								success: function(result, status, xhr) {
									self.onFeaturesFetched(result);
								}
								
							});
						}
						
					}
					
				});
			}
			
			fetchNextBatch();
		}
	}
	
	WPGMZA.Map.prototype.fetchFeaturesViaXML = function()
	{
		var self = this;
		
		var urls = [
			WPGMZA.markerXMLPathURL + this.id + "markers.xml"
		];
		
		if(this.mashupIDs)
			this.mashupIDs.forEach(function(id) {
				urls.push(WPGMZA.markerXMLPathURL + id + "markers.xml")
			});
		
		var unique = urls.filter(function(item, index) {
			return urls.indexOf(item) == index;
		});
		
		urls = unique;
		
		function fetchFeaturesExcludingMarkersViaREST()
		{
			var filter = {
				map_id: this.id,
				mashup_ids: this.mashupIDs
			};
			
			var data = {
				filter: JSON.stringify(filter),
				exclude: "markers"
			};
			
			WPGMZA.restAPI.call("/features/", {
								
				useCompressedPathVariable: true,
				data: data,
				success: function(result, status, xhr) {
					self.onFeaturesFetched(result);
				}
				
			});
		}
		
		if(window.Worker && window.Blob && window.URL && WPGMZA.settings.enable_asynchronous_xml_parsing)
		{
			var source 	= WPGMZA.loadXMLAsWebWorker.toString().replace(/function\(\)\s*{([\s\S]+)}/, "$1");
			var blob 	= new Blob([source], {type: "text/javascript"});
			var worker	= new Worker(URL.createObjectURL(blob));
			
			worker.onmessage = function(event) {
				self.onMarkersFetched(event.data);
				
				fetchFeaturesExcludingMarkersViaREST();
			};
			
			worker.postMessage({
				command: "load",
				protocol: window.location.protocol,
				urls: urls
			});
		}
		else
		{
			var filesLoaded = 0;
			var converter = new WPGMZA.XMLCacheConverter();
			var converted = [];
			
			for(var i = 0; i < urls.length; i++)
			{
				$.ajax(urls[i], {
					success: function(response, status, xhr) {
						converted = converted.concat( converter.convert(response) );
						
						if(++filesLoaded == urls.length)
						{
							self.onMarkersFetched(converted);
							
							fetchFeaturesExcludingMarkersViaREST();
						}
					}
				});
			}
		}
	}
	
	WPGMZA.Map.prototype.fetchFeatures = function()
	{
		var self = this;
		
		if(WPGMZA.settings.wpgmza_settings_marker_pull != WPGMZA.MARKER_PULL_XML || WPGMZA.is_admin == "1")
		{
			this.fetchFeaturesViaREST();
		}
		else
		{
			this.fetchFeaturesViaXML();
		}
	}
	
	WPGMZA.Map.prototype.onFeaturesFetched = function(data)
	{
		if(data.markers)
			this.onMarkersFetched(data.markers);
		
		for(var type in data)
		{
			if(type == "markers")
				continue;	// NB: Ignore markers for now - onMarkersFetched processes them
			
			var module = type.substr(0, 1).toUpperCase() + type.substr(1).replace(/s$/, "");
			
			for(var i = 0; i < data[type].length; i++)
			{	
				var instance = WPGMZA[module].createInstance(data[type][i]);
				var addFunctionName = "add" + module;
				
				this[addFunctionName](instance);
			}
		}
	}
	
	WPGMZA.Map.prototype.onMarkersFetched = function(data, expectMoreBatches)
	{
		var self = this;
		var startFiltered = (this.shortcodeAttributes.cat && this.shortcodeAttributes.cat.length)
		
		for(var i = 0; i < data.length; i++)
		{
			var obj = data[i];
			var marker = WPGMZA.Marker.createInstance(obj);
			
			if(startFiltered)
			{
				marker.isFiltered = true;
				marker.setVisible(false);
			}
			
			this.addMarker(marker);
		}
		
		if(expectMoreBatches)
			return;
		
		this.showPreloader(false);
		
		var triggerEvent = function()
		{
			self._markersPlaced = true;
			self.trigger("markersplaced");
			self.off("filteringcomplete", triggerEvent);
		}
		
		if(this.shortcodeAttributes.cat)
		{
			var categories = this.shortcodeAttributes.cat.split(",");
			
			// Set filtering controls
			var select = $("select[mid='" + this.id + "'][name='wpgmza_filter_select']");
			
			for(var i = 0; i < categories.length; i++)
			{
				$("input[type='checkbox'][mid='" + this.id + "'][value='" + categories[i] + "']").prop("checked", true);
				select.val(categories[i]);
			}
			
			this.on("filteringcomplete", triggerEvent);
			
			// Force category ID's in case no filtering controls are present
			this.markerFilter.update({
				categories: categories
			});
		}
		else
			triggerEvent();

		//Check to see if they have added markers in the shortcode
		if(this.shortcodeAttributes.markers)
		{	 
			//remove all , from the shortcode to find ID's  
			var arr = this.shortcodeAttributes.markers.split(",");

			//Store all the markers ID's
			var markers = [];
		   
			//loop through the shortcode
			for (var i = 0; i < arr.length; i++) {
				var id = arr[i];
			    id = id.replace(' ', '');
				var marker = this.getMarkerByID(id);
		   
				//push the marker infromation to markers
				markers.push(marker);
			   }

			//call fitMapBoundsToMarkers function on markers ID's in shortcode
			this.fitMapBoundsToMarkers(markers);	   
		}
	}
	
	WPGMZA.Map.prototype.fetchFeaturesViaXML = function()
	{
		var self = this;
		
		var urls = [
			WPGMZA.markerXMLPathURL + this.id + "markers.xml"
		];
		
		if(this.mashupIDs)
			this.mashupIDs.forEach(function(id) {
				urls.push(WPGMZA.markerXMLPathURL + id + "markers.xml")
			});
		
		var unique = urls.filter(function(item, index) {
			return urls.indexOf(item) == index;
		});
		
		urls = unique;
		
		function fetchFeaturesExcludingMarkersViaREST()
		{
			var filter = {
				map_id: this.id,
				mashup_ids: this.mashupIDs
			};
			
			var data = {
				filter: JSON.stringify(filter),
				exclude: "markers"
			};
			
			WPGMZA.restAPI.call("/features/", {
								
				useCompressedPathVariable: true,
				data: data,
				success: function(result, status, xhr) {
					self.onFeaturesFetched(result);
				}
				
			});
		}
		
		if(window.Worker && window.Blob && window.URL && WPGMZA.settings.enable_asynchronous_xml_parsing)
		{
			var source 	= WPGMZA.loadXMLAsWebWorker.toString().replace(/function\(\)\s*{([\s\S]+)}/, "$1");
			var blob 	= new Blob([source], {type: "text/javascript"});
			var worker	= new Worker(URL.createObjectURL(blob));
			
			worker.onmessage = function(event) {
				self.onMarkersFetched(event.data);
				
				fetchFeaturesExcludingMarkersViaREST();
			};
			
			worker.postMessage({
				command: "load",
				protocol: window.location.protocol,
				urls: urls
			});
		}
		else
		{
			var filesLoaded = 0;
			var converter = new WPGMZA.XMLCacheConverter();
			var converted = [];
			
			for(var i = 0; i < urls.length; i++)
			{
				$.ajax(urls[i], {
					success: function(response, status, xhr) {
						converted = converted.concat( converter.convert(response) );
						
						if(++filesLoaded == urls.length)
						{
							self.onMarkersFetched(converted);
							
							fetchFeaturesExcludingMarkersViaREST();
						}
					}
				});
			}
		}
	}
	
	WPGMZA.Map.prototype.fetchFeatures = function()
	{
		var self = this;
		
		if(WPGMZA.settings.wpgmza_settings_marker_pull != WPGMZA.MARKER_PULL_XML || WPGMZA.is_admin == "1")
		{
			this.fetchFeaturesViaREST();
		}
		else
		{
			this.fetchFeaturesViaXML();
		}
	}
	
	WPGMZA.Map.prototype.onFeaturesFetched = function(data)
	{
		if(data.markers)
			this.onMarkersFetched(data.markers);
		
		for(var type in data)
		{
			if(type == "markers")
				continue;	// NB: Ignore markers for now - onMarkersFetched processes them
			
			var module = type.substr(0, 1).toUpperCase() + type.substr(1).replace(/s$/, "");
			
			for(var i = 0; i < data[type].length; i++)
			{
				var instance = WPGMZA[module].createInstance(data[type][i]);
				var addFunctionName = "add" + module;
				
				this[addFunctionName](instance);
			}
		}
	}
	
	WPGMZA.Map.prototype.onMarkersFetched = function(data, expectMoreBatches)
	{
		var self = this;
		var startFiltered = (this.shortcodeAttributes.cat && this.shortcodeAttributes.cat.length)
		
		for(var i = 0; i < data.length; i++)
		{
			var obj = data[i];
			var marker = WPGMZA.Marker.createInstance(obj);
			
			if(startFiltered)
			{
				marker.isFiltered = true;
				marker.setVisible(false);
			}
			
			this.addMarker(marker);
		}
		
		if(expectMoreBatches)
			return;
		
		this.showPreloader(false);
		
		var triggerEvent = function()
		{
			self._markersPlaced = true;
			self.trigger("markersplaced");
			self.off("filteringcomplete", triggerEvent);
		}
		
		if(this.shortcodeAttributes.cat)
		{
			var categories = this.shortcodeAttributes.cat.split(",");
			
			// Set filtering controls
			var select = $("select[mid='" + this.id + "'][name='wpgmza_filter_select']");
			
			for(var i = 0; i < categories.length; i++)
			{
				$("input[type='checkbox'][mid='" + this.id + "'][value='" + categories[i] + "']").prop("checked", true);
				select.val(categories[i]);
			}
			
			this.on("filteringcomplete", triggerEvent);
			
			// Force category ID's in case no filtering controls are present
			this.markerFilter.update({
				categories: categories
			});
		}
		else
			triggerEvent();

		//Check to see if they have added markers in the shortcode
		if(this.shortcodeAttributes.markers)
		{	 
			//remove all , from the shortcode to find ID's  
			var arr = this.shortcodeAttributes.markers.split(",");

			//Store all the markers ID's
			var markers = [];
		   
			//loop through the shortcode
			for (var i = 0; i < arr.length; i++) {
				var id = arr[i];
			    id = id.replace(' ', '');
				var marker = this.getMarkerByID(id);
		   
				//push the marker infromation to markers
				markers.push(marker);
			   }

			//call fitMapBoundsToMarkers function on markers ID's in shortcode
			this.fitMapBoundsToMarkers(markers);	   
		}
	}
	
	/**
	 * Gets the distance between two latLngs in kilometers
	 * NB: Static function
	 * @return number
	 */
	var earthRadiusMeters = 6371;
	var piTimes360 = Math.PI / 360;
	
	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	};
	
	/**
	 * This gets the distance in kilometers between two latitude / longitude points
	 * TODO: Move this to the distance class, or the LatLng class
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {number} lat1 Latitude from the first coordinate pair
	 * @param {number} lon1 Longitude from the first coordinate pair
	 * @param {number} lat2 Latitude from the second coordinate pair
	 * @param {number} lon1 Longitude from the second coordinate pair
	 * @return {number} The distance between the latitude and longitudes, in kilometers
	 */
	WPGMZA.Map.getGeographicDistance = function(lat1, lon1, lat2, lon2)
	{
		var dLat = deg2rad(lat2-lat1);
		var dLon = deg2rad(lon2-lon1); 
		
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
			
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = earthRadiusMeters * c; // Distance in km
		
		return d;
	}
	
	/**
	 * Centers the map on the supplied latitude and longitude
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {object|WPGMZA.LatLng} latLng A LatLng literal or an instance of WPGMZA.LatLng
	 */
	WPGMZA.Map.prototype.setCenter = function(latLng)
	{
		if(!("lat" in latLng && "lng" in latLng))
			throw new Error("Argument is not an object with lat and lng");
	}
	
	/**
	 * Sets the dimensions of the map engine element
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {number} width Width as a CSS string
	 * @param {number} height Height as a CSS string
	 */
	WPGMZA.Map.prototype.setDimensions = function(width, height)
	{
		if(arguments.length == 0)
		{
			if(this.settings.map_width)
				width = this.settings.map_width;
			else
				width = "100";
			
			if(this.settings.map_width_type)
				width += this.settings.map_width_type.replace("\\", "");
			else
				width += "%";
			
			if(this.settings.map_height)
				height = this.settings.map_height;
			else
				height = "400";
			
			if(this.settings.map_height_type)
				height += this.settings.map_height_type.replace("\\", "");
			else
				height += "px";
		}
	
		$(this.engineElement).css({
			width: width,
			height: height
		});
	}
	
	WPGMZA.Map.prototype.setAlignment = function()
	{
		switch(parseInt(this.settings.wpgmza_map_align))
		{
			case 1:
				/* Float rules result in unreliable placement in some themes, which can cause overlaps */
				/* $(this.element).css({"float": "left"}); */

				$(this.element).addClass('wpgmza-auto-left');
				break;
				
			case 2:
				/*
				$(this.element).css({
					"margin-left": "auto",
					"margin-right": "auto"
				});
				*/
				
				$(this.element).addClass('wpgmza-auto-left');
				break;
			
			case 3:
				/* Float rules result in unreliable placement in some themes, which can cause overlaps */
				/* $(this.element).css({"float": "right"}); */

				$(this.element).addClass('wpgmza-auto-right');
				break;
			
			default:
				break;
		}
	}
	
	/**
	 * Adds the specified marker to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Marker} marker The marker to add
	 * @fires markeradded
	 * @fires WPGMZA.Marker#added
	 * @throws Argument must be an instance of WPGMZA.Marker
	 */
	WPGMZA.Map.prototype.addMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		marker.map = this;
		marker.parent = this;
		
		this.markers.push(marker);
		this.dispatchEvent({type: "markeradded", marker: marker});
		marker.dispatchEvent({type: "added"});
	}
	
	/**
	 * Removes the specified marker from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Marker} marker The marker to remove
	 * @fires markerremoved
	 * @fires WPGMZA.Marker#removed
	 * @throws Argument must be an instance of WPGMZA.Marker
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removeMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		if(marker.map !== this)
			throw new Error("Wrong map error");
		
		if(marker.infoWindow)
			marker.infoWindow.close();
		
		marker.map = null;
		marker.parent = null;
		
		var index = this.markers.indexOf(marker);
		
		if(index == -1)
			throw new Error("Marker not found in marker array");
		
		this.markers.splice(index, 1);
		
		this.dispatchEvent({type: "markerremoved", marker: marker});
		marker.dispatchEvent({type: "removed"});
	}
	
	WPGMZA.Map.prototype.removeAllMarkers = function(options)
	{
		for(var i = this.markers.length - 1; i >= 0; i--)
			this.removeMarker(this.markers[i]);
	}
	
	/**
	 * Gets a marker by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the marker to get
	 * @return {WPGMZA.Marker|null} The marker, or null if no marker with the specified ID is found
	 */
	WPGMZA.Map.prototype.getMarkerByID = function(id)
	{
		for(var i = 0; i < this.markers.length; i++)
		{
			if(this.markers[i].id == id)
				return this.markers[i];
		}
		
		return null;
	}
	
	WPGMZA.Map.prototype.getMarkerByTitle = function(title)
	{
		if(typeof title == "string")
			for(var i = 0; i < this.markers.length; i++)
			{
				if(this.markers[i].title == title)
					return this.markers[i];
			}
		else if(title instanceof RegExp)
			for(var i = 0; i < this.markers.length; i++)
			{
				if(title.test(this.markers[i].title))
					return this.markers[i];
			}
		else
			throw new Error("Invalid argument");
		
		return null;
	}
	
	/**
	 * Removes a marker by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the marker to remove
	 * @fires markerremoved
	 * @fires WPGMZA.Marker#removed
	 */
	WPGMZA.Map.prototype.removeMarkerByID = function(id)
	{
		var marker = this.getMarkerByID(id);
		
		if(!marker)
			return;
		
		this.removeMarker(marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polygon} polygon The polygon to add
	 * @fires polygonadded
	 * @throws Argument must be an instance of WPGMZA.Polygon
	 */
	WPGMZA.Map.prototype.addPolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		polygon.map = this;
		
		this.polygons.push(polygon);
		this.dispatchEvent({type: "polygonadded", polygon: polygon});
		polygon.dispatchEvent({type: "added"});
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polygon} polygon The polygon to remove
	 * @fires polygonremoved
	 * @throws Argument must be an instance of WPGMZA.Polygon
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removePolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		if(polygon.map !== this)
			throw new Error("Wrong map error");
		
		polygon.map = null;
		
		this.polygons.splice(this.polygons.indexOf(polygon), 1);
		this.dispatchEvent({type: "polygonremoved", polygon: polygon});
	}
	
	/**
	 * Gets a polygon by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polygon to get
	 * @return {WPGMZA.Polygon|null} The polygon, or null if no polygon with the specified ID is found
	 */
	WPGMZA.Map.prototype.getPolygonByID = function(id)
	{
		for(var i = 0; i < this.polygons.length; i++)
		{
			if(this.polygons[i].id == id)
				return this.polygons[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a polygon by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polygon to remove
	 */
	WPGMZA.Map.prototype.removePolygonByID = function(id)
	{
		var polygon = this.getPolygonByID(id);
		
		if(!polygon)
			return;
		
		this.removePolygon(polygon);
	}
	
	/**
	 * Gets a polyline by ID
	 * @return void
	 */
	WPGMZA.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polyline} polyline The polyline to add
	 * @fires polylineadded
	 * @throws Argument must be an instance of WPGMZA.Polyline
	 */
	WPGMZA.Map.prototype.addPolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		polyline.map = this;
		
		this.polylines.push(polyline);
		this.dispatchEvent({type: "polylineadded", polyline: polyline});
		polyline.dispatchEvent({type: "added"});

	}
	
	/**
	 * Removes the specified polyline from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polyline} polyline The polyline to remove
	 * @fires polylineremoved
	 * @throws Argument must be an instance of WPGMZA.Polyline
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removePolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		if(polyline.map !== this)
			throw new Error("Wrong map error");
		
		polyline.map = null;
		
		this.polylines.splice(this.polylines.indexOf(polyline), 1);
		this.dispatchEvent({type: "polylineremoved", polyline: polyline});
	}
	
	/**
	 * Gets a polyline by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polyline to get
	 * @return {WPGMZA.Polyline|null} The polyline, or null if no polyline with the specified ID is found
	 */
	WPGMZA.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a polyline by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polyline to remove
	 */
	WPGMZA.Map.prototype.removePolylineByID = function(id)
	{
		var polyline = this.getPolylineByID(id);
		
		if(!polyline)
			return;
		
		this.removePolyline(polyline);
	}
	
	/**
	 * Adds the specified circle to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Circle} circle The circle to add
	 * @fires polygonadded
	 * @throws Argument must be an instance of WPGMZA.Circle
	 */
	WPGMZA.Map.prototype.addCircle = function(circle)
	{
		if(!(circle instanceof WPGMZA.Circle))
			throw new Error("Argument must be an instance of WPGMZA.Circle");
		
		circle.map = this;
		
		this.circles.push(circle);
		this.dispatchEvent({type: "circleadded", circle: circle});
		circle.dispatchEvent({type: "added"});

	}
	
	/**
	 * Removes the specified circle from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Circle} circle The circle to remove
	 * @fires circleremoved
	 * @throws Argument must be an instance of WPGMZA.Circle
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removeCircle = function(circle)
	{
		if(!(circle instanceof WPGMZA.Circle))
			throw new Error("Argument must be an instance of WPGMZA.Circle");
		
		if(circle.map !== this)
			throw new Error("Wrong map error");
		
		circle.map = null;
		
		this.circles.splice(this.circles.indexOf(circle), 1);
		this.dispatchEvent({type: "circleremoved", circle: circle});
	}
	
	/**
	 * Gets a circle by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the circle to get
	 * @return {WPGMZA.Circle|null} The circle, or null if no circle with the specified ID is found
	 */
	WPGMZA.Map.prototype.getCircleByID = function(id)
	{
		for(var i = 0; i < this.circles.length; i++)
		{
			if(this.circles[i].id == id)
				return this.circles[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a circle by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the circle to remove
	 */
	WPGMZA.Map.prototype.removeCircleByID = function(id)
	{
		var circle = this.getCircleByID(id);
		
		if(!circle)
			return;
		
		this.removeCircle(circle);
	}
	
	WPGMZA.Map.prototype.addRectangle = function(rectangle)
	{
		if(!(rectangle instanceof WPGMZA.Rectangle))
			throw new Error("Argument must be an instance of WPGMZA.Rectangle");
		
		rectangle.map = this;
		
		this.rectangles.push(rectangle);
		this.dispatchEvent({type: "rectangleadded", rectangle: rectangle});
		rectangle.dispatchEvent({type: "added"});
	}
	
	WPGMZA.Map.prototype.removeRectangle = function(rectangle)
	{
		if(!(rectangle instanceof WPGMZA.Rectangle))
			throw new Error("Argument must be an instance of WPGMZA.Rectangle");
		
		if(rectangle.map !== this)
			throw new Error("Wrong map error");
		
		rectangle.map = null;
		
		this.rectangles.splice(this.rectangles.indexOf(rectangle), 1);
		this.dispatchEvent({type: "rectangleremoved", rectangle: rectangle});
	}
	
	WPGMZA.Map.prototype.getRectangleByID = function(id)
	{
		for(var i = 0; i < this.rectangles.length; i++)
		{
			if(this.rectangles[i].id == id)
				return this.rectangles[i];
		}
		
		return null;
	}
	
	WPGMZA.Map.prototype.removeRectangleByID = function(id)
	{
		var rectangle = this.getRectangleByID(id);
		
		if(!rectangle)
			return;
		
		this.removeRectangle(rectangle);
	}

	/**
	 * Adds the specified pointlabel to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Pointlabel} pointlabel The Point Label to add
	 * @fires pointlabeladded
	 * @throws Argument must be an instance of WPGMZA.Pointlabel
	 */
	WPGMZA.Map.prototype.addPointlabel = function(pointlabel)
	{
		if(!(pointlabel instanceof WPGMZA.Pointlabel))
			throw new Error("Argument must be an instance of WPGMZA.Pointlabel");
		
		pointlabel.map = this;
		
		this.pointlabels.push(pointlabel);
		this.dispatchEvent({type: "pointlabeladded", pointlabel: pointlabel});
	}

	/**
	 * Removes the specified pointlabel from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Pointlabel} pointlabel The Point Label to remove
	 * @fires pointlabelremoved
	 * @throws Argument must be an instance of WPGMZA.Pointlabel
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removePointlabel = function(pointlabel)
	{
		if(!(pointlabel instanceof WPGMZA.Pointlabel))
			throw new Error("Argument must be an instance of WPGMZA.Pointlabel");
		
		if(pointlabel.map !== this)
			throw new Error("Wrong map error");
		
		pointlabel.map = null;
		
		this.pointlabels.splice(this.pointlabels.indexOf(pointlabel), 1);
		this.dispatchEvent({type: "pointlabelremoved", pointlabel: pointlabel});
	}

	WPGMZA.Map.prototype.getPointlabelByID = function(id){
		for(var i = 0; i < this.pointlabels.length; i++){
			if(this.pointlabels[i].id == id)
				return this.pointlabels[i];
		}
		
		return null;
	}
	
	WPGMZA.Map.prototype.removePointlabelByID = function(id){
		var pointlabel = this.getPointlabelByID(id);
		
		if(!pointlabel)
			return;
		
		this.removePointlabel(pointlabel);
	}
	
	/**
	 * Resets the map latitude, longitude and zoom to their starting values in the map settings.
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.resetBounds = function()
	{
		var latlng = new WPGMZA.LatLng(this.settings.map_start_lat, this.settings.map_start_lng);
		this.panTo(latlng);
		this.setZoom(this.settings.map_start_zoom);
	}
	
	/**
	 * Nudges the map viewport by the given pixel coordinates
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {number} x Number of pixels to nudge along the x axis
	 * @param {number} y Number of pixels to nudge along the y axis
	 * @throws Invalid coordinates supplied
	 */
	WPGMZA.Map.prototype.nudge = function(x, y)
	{
		var nudged = this.nudgeLatLng(this.getCenter(), x, y);
		
		this.setCenter(nudged);
	}
	
	WPGMZA.Map.prototype.nudgeLatLng = function(latLng, x, y)
	{
		var pixels = this.latLngToPixels(latLng);
		
		pixels.x += parseFloat(x);
		pixels.y += parseFloat(y);
		
		if(isNaN(pixels.x) || isNaN(pixels.y))
			throw new Error("Invalid coordinates supplied");
		
		return this.pixelsToLatLng(pixels);
	}
	
	WPGMZA.Map.prototype.animateNudge = function(x, y, origin, milliseconds)
	{
		var nudged;
		
		if(!origin)
			origin = this.getCenter();
		else if(!(origin instanceof WPGMZA.LatLng))
			throw new Error("Origin must be an instance of WPGMZA.LatLng");

		nudged = this.nudgeLatLng(origin, x, y);
		
		if(!milliseconds)
			milliseconds = WPGMZA.getScrollAnimationDuration();
		
		$(this).animate({
			lat: nudged.lat,
			lng: nudged.lng
		}, milliseconds);
	}
	
	/**
	 * Called when the window resizes
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.onWindowResize = function(event)
	{
		
	}
	
	/**
	 * Called when the engine map div is resized
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.onElementResized = function(event)
	{
		
	}
	
	/**
	 * Called when the map viewport bounds change. Fires the legacy bounds_changed event.
	 * @method
	 * @memberof WPGMZA.Map
	 * @fires boundschanged
	 * @fires bounds_changed
	 */
	WPGMZA.Map.prototype.onBoundsChanged = function(event)
	{
		// Native events
		this.trigger("boundschanged");
		
		// Google / legacy compatibility events
		this.trigger("bounds_changed");
	}
	
	/**
	 * Called when the map viewport becomes idle (eg movement done, tiles loaded)
	 * @method
	 * @memberof WPGMZA.Map
	 * @fires idle
	 */
	WPGMZA.Map.prototype.onIdle = function(event)
	{
		this.trigger("idle");
	}

	WPGMZA.Map.prototype.onClick = function(event){

	}

	/**
	 * On fullscreen change
	 * 
	 * @param bool fullscreen Is this map fullscreen
	 * 
	 * @return void 
	 */
	WPGMZA.Map.prototype.onFullScreenChange = function(fullscreen){
		this.trigger("fullscreenchange.map");

		/* Add or Remove the 'is-fullscreen' class */
		if(fullscreen){
			$(this.element).addClass('is-fullscreen');
		} else {
			$(this.element).removeClass('is-fullscreen');
		}
	}

	/**
	 * Find out if the map has visible markers. Only counts filterable markers (not the user location marker, store locator center point marker, etc.)
	 * @method
	 * @memberof WPGMZA.Map
	 * @returns {Boolean} True if at least one marker is visible
	 */
	WPGMZA.Map.prototype.hasVisibleMarkers = function()
	{
		var length = this.markers.length, marker;
		
		for(var i = 0; i < length; i++)
		{
			marker = this.markers[i];
			
			if(marker.isFilterable && marker.getVisible())
				return true;
		}
	
		return false;
	}

	/**
	 * Check if this map is full screen 
	 * 
	 * Note: Engine specific maps may need an override
	 * 
	 * @return bool
	*/
	WPGMZA.Map.prototype.isFullScreen = function(){
		if(WPGMZA.isFullScreen()){
			if(parseInt(window.screen.height) === parseInt(this.element.offsetHeight)){
				return true;
			}
		}
		return false;
	}
	
	WPGMZA.Map.prototype.closeAllInfoWindows = function()
	{
		this.markers.forEach(function(marker) {
			
			if(marker.infoWindow)
				marker.infoWindow.close();
				
		});
	}

	WPGMZA.Map.prototype.openStreetView = function(options){
		
	}

	WPGMZA.Map.prototype.closeStreetView = function(options){
		
	}
	
	$(document).ready(function(event) {
		
		if(!WPGMZA.visibilityWorkaroundIntervalID)
		{
			// This should handle all cases of tabs, accordions or any other offscreen maps
			var invisibleMaps = jQuery(".wpgmza_map:hidden");
			
			WPGMZA.visibilityWorkaroundIntervalID = setInterval(function() {
				
				jQuery(invisibleMaps).each(function(index, el) {
					
					if(jQuery(el).is(":visible"))
					{
						var id = jQuery(el).attr("data-map-id");
						var map = WPGMZA.getMapByID(id);
						
						map.onElementResized();
						
						invisibleMaps.splice(invisibleMaps.toArray().indexOf(el), 1);
					}
					
				});
				
			}, 1000);
		}
		
	});
	
});
