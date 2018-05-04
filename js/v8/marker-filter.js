/**
 * @namespace WPGMZA
 * @module MarkerFilter
 * @requires WPGMZA
 */
(function($) {
	
	WPGMZA.MarkerFilter = function(options)
	{
		this.functionChain = [
			this.isMarkerAllowedByRadius,
			this.isMarkerAllowedByString
		];
		
		this.hideAll = null;
		
		this.center = null;
		this.radius = null;
		
		this.categories = null;
		
		this.string = null;
		
		this.logic = (WPGMZA.settings.cat_logic == 1 ? WPGMZA.MarkerFilter.LOGIC_AND : WPGMZA.MarkerFilter.LOGIC_OR);
		
		this.units = WPGMZA.MarkerFilter.UNITS_KILOMETERS;
		
		for(var name in options)
			this[name] = options[name];
	}
	
	WPGMZA.MarkerFilter.LOGIC_OR	= "or";
	WPGMZA.MarkerFilter.LOGIC_AND	= "and";
	
	WPGMZA.MarkerFilter.getConstructor = function()
	{
		if(WPGMZA.isProVersion())
			return WPGMZA.ProMarkerFilter;
		return WPGMZA.MarkerFilter;
	}
	
	WPGMZA.MarkerFilter.createInstance = function(options)
	{
		var constructor = WPGMZA.MarkerFilter.getConstructor();
		return new constructor(options);
	}
	
	// /**
	 // * Gets the current radius in meters
	 // * @return number
	 // */
	// WPGMZA.MarkerFilter.prototype.getRadiusInMeters = function()
	// {
		// // TODO: Check this uses the correct units
		// return this.radius * 1000;
	// }
	
	// /**
	 // * Gets the current radius in KM
	 // * @return number
	 // */
	// WPGMZA.MarkerFilter.prototype.getRadiusInKm = function()
	// {
		// return this.getRadiusInMeters() / 1000;
	// }
	
	// /**
	 // * Gets the current radius in miles
	 // * @return number
	 // */
	// WPGMZA.MarkerFilter.prototype.getRadiusInMiles = function()
	// {
		// return this.getRadiusInKm() * milesPerKm;
	// }
	
	/**
	 * Filters marker based on radius
	 * @return void
	 */
	WPGMZA.MarkerFilter.prototype.isMarkerAllowedByRadius = function(marker)
	{
		if(!this.radius)
			return true;	// Not filtering by radius
		
		if(!this.center)
			throw new Error("You must supply a center to filter by radius");
		
		var position = marker.getPosition();
		
		var distance = WPGMZA.Map.getGeographicDistance(
			position.lat,
			position.lng,
			this.center.lat,
			this.center.lng
		);
		
		var maximum = WPGMZA.Distance.uiToKilometers(this.radius);
		
		return (distance <= maximum);
	}
	
	/**
	 * If string search is disabled, or the marker contains the specified keyword, this function returns true
	 * @return boolean
	 */
	WPGMZA.MarkerFilter.prototype.isMarkerAllowedByString = function(marker)
	{
		if(this.string == null || this.string.length == 0)
			return true;	// Not filtering on string
		
		return this.cachedSearchRegex.test(marker.title);
	}
	
	/**
	 * Iterates through the function chain to determine if marker is allowed by filter
	 * @return boolean
	 */
	WPGMZA.MarkerFilter.prototype.isMarkerAllowed = function(marker)
	{
		if(this.hideAll)
			return false;
		
		for(var i = 0; i < this.functionChain.length; i++)
		{
			if(!this.functionChain[i].call(this, marker))
				return false;
		}
		
		return true;
	}
	
	/**
	 * Takes an array of markers and returns an array 
	 * of markers allowed by this filter
	 * @return array The filtered markers
	 */
	WPGMZA.MarkerFilter.prototype.apply = function(markers)
	{
		var result = [];
		
		this.map(markers, function(marker, allowed) {
			if(allowed)
				result.push(marker);
		});
		
		return result;
	}
	
	/**
	 * Takes an array of markers and filters them, executing
	 * the given callback on each marker
	 * @return void
	 */
	WPGMZA.MarkerFilter.prototype.map = function(markers, callback)
	{
		this.prepare();
		
		for(var i = 0; i < markers.length; i++)
			callback(markers[i], this.isMarkerAllowed(markers[i]));
	}
	
	WPGMZA.MarkerFilter.prototype.prepare = function()
	{
		this.categoryLookup = null;

		this.cachedSearchRegex = null;
		if(this.string && this.string.length > 0)
			this.cachedSearchRegex = new RegExp(this.string, "i");
	}
	
})(jQuery);