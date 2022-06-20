/**
 * @namespace WPGMZA
 * @module OLFeature
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.OLFeature = function(options)
	{
		WPGMZA.assertInstangeOf(this, "OLFeature");
		
		WPGMZA.Feature.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.OLFeature, WPGMZA.Feature);
	
	WPGMZA.OLFeature.getOLStyle = function(options)
	{
		var translated = {};
		
		if(!options)
			return new ol.style.Style();
		
		options = $.extend({}, options);
		
		// NB: Legacy name support
		var map = {
			"fillcolor":		"fillColor",
			"opacity":			"fillOpacity",
			"linecolor":		"strokeColor",
			"lineopacity":		"strokeOpacity",
			"linethickness":	"strokeWeight",
		};
		
		for(var name in options){
			if(name in map)
				options[map[name]] = options[name];
		}
		
		// Translate
		if(options.strokeColor){
			var opacity = 1.0;
			var weight = 1;
			
			if("strokeOpacity" in options)
				opacity = options.strokeOpacity;
			
			if("strokeWeight" in options)
				weight = options.strokeWeight;
			
			translated.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToString(options.strokeColor, opacity),
				width: weight
			});
		}
		
		if(options.fillColor){
			var opacity = 1.0;
			
			if("fillOpacity" in options)
				opacity = options.fillOpacity;
			
			var color = WPGMZA.hexOpacityToString(options.fillColor, opacity);
			
			translated.fill = new ol.style.Fill({
				color: color
			});
		}

		return new ol.style.Style(translated);
	}
	
	WPGMZA.OLFeature.setInteractionsOnFeature = function(feature, enable)
	{
		if(enable)
		{
			if(feature.modifyInteraction)
				return;
			
			feature.snapInteraction = new ol.interaction.Snap({
				source: feature.layer.getSource()
			});
			
			feature.map.olMap.addInteraction(feature.snapInteraction);
			
			feature.modifyInteraction = new ol.interaction.Modify({
				source: feature.layer.getSource()
			});
			
			feature.map.olMap.addInteraction(feature.modifyInteraction);
			
			feature.modifyInteraction.on("modifyend", function(event) {
				feature.trigger("change");
			});
			
			// NB: I believe this was causing issues with an older version of OpenLayers when two interactions were simultaneiously on, worth trying again.
			/*feature.translateInteraction = new ol.interaction.Translate({
				source: feature.layer.getSource()
			});
			
			feature.map.olMap.addInteraction(feature.translateInteraction);*/
		}
		else
		{
			if(!feature.modifyInteraction)
				return;
			
			if(feature.map)
			{
				feature.map.olMap.removeInteraction(feature.snapInteraction);
				feature.map.olMap.removeInteraction(feature.modifyInteraction);
				// feature.map.olMap.removeInteraction(feature.translateInteraction);
			}
			
			delete feature.snapInteraction;
			delete feature.modifyInteraction;
			// delete feature.translateInteraction;
		}
	}
	
});