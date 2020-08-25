/**
 * @namespace WPGMZA
 * @module Text
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0ZXh0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIFRleHRcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5UZXh0ID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHRpZihvcHRpb25zKVxyXG5cdFx0XHRmb3IodmFyIG5hbWUgaW4gb3B0aW9ucylcclxuXHRcdFx0XHR0aGlzW25hbWVdID0gb3B0aW9uc1tuYW1lXTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLlRleHQuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihvcHRpb25zKVxyXG5cdHtcclxuXHRcdHN3aXRjaChXUEdNWkEuc2V0dGluZ3MuZW5naW5lKVxyXG5cdFx0e1xyXG5cdFx0XHRjYXNlIFwib3Blbi1sYXllcnNcIjpcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFdQR01aQS5PTFRleHQob3B0aW9ucyk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBXUEdNWkEuR29vZ2xlVGV4dChvcHRpb25zKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoidGV4dC5qcyJ9
