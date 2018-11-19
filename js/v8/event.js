/**
 * @namespace WPGMZA
 * @module Event
 * @requires WPGMZA
 */ 
jQuery(function($) {
		
	/**
	 * Base class used for events (for non-HTMLElement objects)
	 * @class WPGMZA.Event
	 * @constructor WPGMZA.Event
	 * @memberof WPGMZA
	 * @param {string|object} options The event type as a string, or an object of options to be mapped to this event
	 */
	WPGMZA.Event = function(options)
	{
		if(typeof options == "string")
			this.type = options;
		
		this.bubbles		= true;
		this.cancelable		= true;
		this.phase			= WPGMZA.Event.PHASE_CAPTURE;
		this.target			= null;
		
		this._cancelled = false;
		
		if(typeof options == "object")
			for(var name in options)
				this[name] = options[name];
	}

	WPGMZA.Event.CAPTURING_PHASE		= 0;
	WPGMZA.Event.AT_TARGET				= 1;
	WPGMZA.Event.BUBBLING_PHASE			= 2;

	/**
	 * Prevents any further propagation of this event
	 * @method
	 * @memberof WPGMZA.Event
	 */
	WPGMZA.Event.prototype.stopPropagation = function()
	{
		this._cancelled = true;
	}
	
});