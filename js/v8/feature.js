/**
 * @namespace WPGMZA
 * @module Feature
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	/**
	 * Base class for featuers (formerlly MapObjects), that is, markers, polygons, polylines, circles, rectangles and heatmaps. Implements functionality shared by all map objects, such as parsing geometry and serialization.
	 * @class WPGMZA.Feature
	 * @constructor WPGMZA.Feature
	 * @memberof WPGMZA
	 * @augments WPGMZA.EventDispatcher
	 */
	WPGMZA.Feature = function(options)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Feature");
		
		WPGMZA.EventDispatcher.call(this);
		
		this.id = -1;

		for(var key in options)
			this[key] = options[key];
	}
	
	WPGMZA.extend(WPGMZA.Feature, WPGMZA.EventDispatcher);
	
	// NB: Legacy compatibility
	WPGMZA.MapObject = WPGMZA.Feature;
	
	/**
	 * Scans a string for all floating point numbers and build an array of latitude and longitude literals from the matched numbers
	 * @method
	 * @memberof WPGMZA.Feature
	 * @param {string} string The string to parse numbers from
	 * @return {array} An array of LatLng literals parsed from the string
	 */
	WPGMZA.Feature.prototype.parseGeometry = function(subject)
	{
		// TODO: Rename "subject" to "subject". It's unclear right now
		
		if(typeof subject == "string" && subject.match(/^\[/))
		{
			try{
				
				var json = JSON.parse(subject);
				subject = json;
				
			}catch(e) {
				// Continue execution
			}
		}
		
		if(typeof subject == "object")
		{
			var arr = subject;
			
			for(var i = 0; i < arr.length; i++)
			{
				arr[i].lat = parseFloat(arr[i].lat);
				arr[i].lng = parseFloat(arr[i].lng);
			}
			
			return arr;
		}
		else if(typeof subject == "string")
		{
			// Guessing old format
			var stripped, pairs, coords, results = [];
			
			stripped = subject.replace(/[^ ,\d\.\-+e]/g, "");
			pairs = stripped.split(",");
			
			for(var i = 0; i < pairs.length; i++)
			{
				coords = pairs[i].split(" ");
				results.push({
					lat: parseFloat(coords[1]),
					lng: parseFloat(coords[0])
				});
			}
			
			return results;
		}
		
		throw new Error("Invalid geometry");
	}
	
	WPGMZA.Feature.prototype.setOptions = function(options)
	{
		for(var key in options)
			this[key] = options[key];


		this.updateNativeFeature();
	}
	
	WPGMZA.Feature.prototype.setEditable = function(editable)
	{
		this.setOptions({
			editable: editable
		});
	}
	
	WPGMZA.Feature.prototype.setDraggable = function(draggable)
	{
		this.setOptions({
			draggable: draggable
		});
		
		// this.layer.setVisible(visible ? true : false);
	}
	
	WPGMZA.Feature.prototype.getScalarProperties = function()
	{
		var options = {};
		
		for(var key in this)
		{
			switch(typeof this[key])
			{
				case "number":
					options[key] = parseFloat(this[key]);
					break;
				
				case "boolean":
				case "string":
					options[key] = this[key];
					break;
					
				default:
					break;
			}
		}
		
		return options;
	}
	
	WPGMZA.Feature.prototype.updateNativeFeature = function()
	{
		// NB: Because we don't have different base classes for GoogleFeature and OLFeature*, it's necessary to have an if/else here. This design pattern should be avoided wherever possible. Prefer adding engine specific code on the OL / Google modules.
		// * - OLFeature is actually a class, but nothing extends from it. It's purely provided as a utility.
		
		var props = this.getScalarProperties();
		
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
			
				// The native properties (strokeColor, fillOpacity, etc) have to be translated for OpenLayers.
				if(this.layer){
					this.layer.setStyle(WPGMZA.OLFeature.getOLStyle(props));
				}
				break;
			
			default:
			
				// For Google, because the native properties share the same name as the Google properties, we can just pass them straight in
				
				this.googleFeature.setOptions(props);
			
				break;
		}
	}
	
});