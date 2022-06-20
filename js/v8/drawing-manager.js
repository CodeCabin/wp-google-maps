/**
 * @namespace WPGMZA
 * @module DrawingManager
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.DrawingManager = function(map)
	{
		WPGMZA.assertInstanceOf(this, "DrawingManager");
		
		WPGMZA.EventDispatcher.call(this);
		
		var self = this;

		this.map = map;
		this.mode = WPGMZA.DrawingManager.MODE_NONE;

		this.map.on("click rightclick", function(event) {
			self.onMapClick(event);
		});
	}
	
	WPGMZA.DrawingManager.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.DrawingManager.prototype.constructor = WPGMZA.DrawingManager;
	
	WPGMZA.DrawingManager.MODE_NONE			= null;
	WPGMZA.DrawingManager.MODE_MARKER		= "marker";
	WPGMZA.DrawingManager.MODE_POLYGON		= "polygon";
	WPGMZA.DrawingManager.MODE_POLYLINE		= "polyline";
	WPGMZA.DrawingManager.MODE_CIRCLE		= "circle";
	WPGMZA.DrawingManager.MODE_RECTANGLE	= "rectangle";
	WPGMZA.DrawingManager.MODE_HEATMAP		= "heatmap";
	WPGMZA.DrawingManager.MODE_POINTLABEL	= "pointlabel";
	WPGMZA.DrawingManager.MODE_IMAGEOVERLAY	= "imageoverlay";
	
	WPGMZA.DrawingManager.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				return WPGMZA.GoogleDrawingManager;
				break;
				
			default:
				return WPGMZA.OLDrawingManager;
				break;
		}
	}
	
	WPGMZA.DrawingManager.createInstance = function(map)
	{
		var constructor = WPGMZA.DrawingManager.getConstructor();
		return new constructor(map);
	}
	
	WPGMZA.DrawingManager.prototype.setDrawingMode = function(mode) {
		this.mode = mode;
		
		this.trigger("drawingmodechanged");
	}

	WPGMZA.DrawingManager.prototype.onMapClick = function(event) {
		var self = this;
		
		if(!(event.target instanceof WPGMZA.Map))
			return;

		switch(this.mode){
			case WPGMZA.DrawingManager.MODE_POINTLABEL:
				if(!this.pointlabel){
					this.pointlabel = WPGMZA.Pointlabel.createInstance({
						center : new WPGMZA.LatLng({
							lat : event.latLng.lat,
							lng : event.latLng.lng
						}), 
						map : this.map
					});

					this.map.addPointlabel(this.pointlabel);
					this.pointlabel.setEditable(true);

					this.onPointlabelComplete(this.pointlabel);

					this.pointlabel = false;
				}
				break;
		}

	}

	WPGMZA.DrawingManager.prototype.onPointlabelComplete = function(pointlabel){
		var event = new WPGMZA.Event("pointlabelcomplete");
		event.enginePointlabel = pointlabel;
		this.dispatchEvent(event);
	}
	
});