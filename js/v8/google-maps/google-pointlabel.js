/**
 * @namespace WPGMZA
 * @module GooglePointlabel
 * @requires WPGMZA.Text
 * @requires WPGMZA.Pointlabel
 * @pro-requires WPGMZA.ProPointlabel
 */
jQuery(function($) {
	var Parent;

	WPGMZA.GooglePointlabel = function(options, pointFeature){
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

		this.googleFeature = this;

		this.setOptions(options);
	}

	if(WPGMZA.isProVersion()){
	 	Parent = WPGMZA.ProPointlabel;
	} else {
		Parent = WPGMZA.Pointlabel
	}

	WPGMZA.extend(WPGMZA.GooglePointlabel, Parent);

	WPGMZA.GooglePointlabel.prototype.setOptions = function(options){
		/* We don't actually handle this here */
		if(options.name){
			this.textFeature.setText(options.name);
		}
	}

});
		