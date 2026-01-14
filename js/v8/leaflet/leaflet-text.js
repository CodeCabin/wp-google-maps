/**
 * @namespace WPGMZA
 * @module LeafletText
 * @requires WPGMZA.Text
 */
jQuery(function($) {
	
	WPGMZA.LeafletText = function(options){
		WPGMZA.Text.apply(this, arguments);
		this.options = options;
		this.overlay = new WPGMZA.LeafletTextOverlay(options);
	}

	WPGMZA.extend(WPGMZA.LeafletText, WPGMZA.Text);

	WPGMZA.LeafletText.prototype.refresh = function(){
		/* Only for OL */
		if(this.overlay){
			this.overlay.refresh();
		}
	}

	WPGMZA.LeafletText.prototype.setMap = function(map){
		if(this.overlay){
			if(map && map.leafletMap){
				if(this.overlay.leafletFeature){
					this.overlay.remove();
					this.overlay.leafletFeature.addTo(map.leafletMap);
					this.overlay.refresh();
				} else {
					this.options.map = map;
					this.overlay = new WPGMZA.LeafletTextOverlay(this.options);
					this.overlay.refresh();
				}
			} else {
				this.overlay.remove();
			}
		}
	}
});