/**
 * @namespace WPGMZA
 * @module LeafletFeature
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.LeafletFeature = function(options)
	{
		WPGMZA.assertInstangeOf(this, "LeafletFeature");
		
		WPGMZA.Feature.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.LeafletFeature, WPGMZA.Feature);
	
	WPGMZA.LeafletFeature.getLeafletStyle = function(options) {
		if(!options){
			return false;
		}
		
		options = $.extend({}, options);
		
		let compiled = {};
		let map = {
			"fillcolor":		"fillColor",
			"opacity":			"fillOpacity",
			"linecolor":		"color",
			"lineColor":		"color",
			"lineopacity":		"opacity",
			"lineOpacity":		"opacity",
			"linethickness":	"weight",
			"lineThickness":	"weight",
			"color":			"fillColor",
			"strokeColor": 		"color",
			"strokeOpacity":	"opacity",
			"lineDashArray":	"dashArray"
		};

		for(let name in options){
			if(name in map){
				compiled[map[name]] = options[name];
			}
		}

		return compiled;
	}

	WPGMZA.LeafletFeature.setEditable = function(feature, enable){
		if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.drawingManager){
			const drawingManager = WPGMZA.mapEditPage.drawingManager;
			if(enable){
				/* Enable editor */
				drawingManager.enableEditorInteraction(feature);
			} else {
				/* Disable editor */
				drawingManager.disableEditorInteraction(feature);
			}
		}
	}
	
});