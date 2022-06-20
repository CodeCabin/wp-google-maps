/**
 * @namespace WPGMZA
 * @module OLPointlabel
 * @requires WPGMZA.Text
 * @requires WPGMZA.Pointlabel
 * @pro-requires WPGMZA.ProPointlabel
 */
jQuery(function($) {
	var Parent = WPGMZA.Pointlabel;

	WPGMZA.OLPointlabel = function(options, pointFeature){
		Parent.call(this, options, pointFeature);

		if(pointFeature && pointFeature.textFeature){
			this.textFeature = pointFeature.textFeature;
		} else {
			this.textFeature = new WPGMZA.Text.createInstance({
				text: "",
				map: this.map,
				position: this.getPosition()
			});
		}
		this.updateNativeFeature();
	}

	if(WPGMZA.isProVersion()){
	 	Parent = WPGMZA.ProPointlabel;
	} else {
		Parent = WPGMZA.Pointlabel
	}

	WPGMZA.extend(WPGMZA.OLPointlabel, Parent);

	WPGMZA.OLPointlabel.prototype.updateNativeFeature = function(){
		var options = this.getScalarProperties();

		if(options.name){
			this.textFeature.setText(options.name);
		}

		this.textFeature.refresh();
	}
});
		