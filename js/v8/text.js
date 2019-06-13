/**
 * @namespace WPGMZA
 * @module Text
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.Text = function(options)
	{
		if(options)
			for(var name in options)
				this[name] = options[name];
	}
	
	WPGMZA.Text.createInstance = function(options)
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				return new WPGMZA.OLText(options);
				break;
				
			default:
				return new WPGMZA.GoogleText(options);
				break;
		}
	}
	
});