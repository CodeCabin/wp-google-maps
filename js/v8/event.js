/**
 * @namespace WPGMZA
 * @module Event
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJldmVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBFdmVudFxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICovIFxyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFx0XHJcblx0LyoqXHJcblx0ICogQmFzZSBjbGFzcyB1c2VkIGZvciBldmVudHMgKGZvciBub24tSFRNTEVsZW1lbnQgb2JqZWN0cylcclxuXHQgKiBAY2xhc3MgV1BHTVpBLkV2ZW50XHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5FdmVudFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkFcclxuXHQgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IG9wdGlvbnMgVGhlIGV2ZW50IHR5cGUgYXMgYSBzdHJpbmcsIG9yIGFuIG9iamVjdCBvZiBvcHRpb25zIHRvIGJlIG1hcHBlZCB0byB0aGlzIGV2ZW50XHJcblx0ICovXHJcblx0V1BHTVpBLkV2ZW50ID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHRpZih0eXBlb2Ygb3B0aW9ucyA9PSBcInN0cmluZ1wiKVxyXG5cdFx0XHR0aGlzLnR5cGUgPSBvcHRpb25zO1xyXG5cdFx0XHJcblx0XHR0aGlzLmJ1YmJsZXNcdFx0PSB0cnVlO1xyXG5cdFx0dGhpcy5jYW5jZWxhYmxlXHRcdD0gdHJ1ZTtcclxuXHRcdHRoaXMucGhhc2VcdFx0XHQ9IFdQR01aQS5FdmVudC5QSEFTRV9DQVBUVVJFO1xyXG5cdFx0dGhpcy50YXJnZXRcdFx0XHQ9IG51bGw7XHJcblx0XHRcclxuXHRcdHRoaXMuX2NhbmNlbGxlZCA9IGZhbHNlO1xyXG5cdFx0XHJcblx0XHRpZih0eXBlb2Ygb3B0aW9ucyA9PSBcIm9iamVjdFwiKVxyXG5cdFx0XHRmb3IodmFyIG5hbWUgaW4gb3B0aW9ucylcclxuXHRcdFx0XHR0aGlzW25hbWVdID0gb3B0aW9uc1tuYW1lXTtcclxuXHR9XHJcblxyXG5cdFdQR01aQS5FdmVudC5DQVBUVVJJTkdfUEhBU0VcdFx0PSAwO1xyXG5cdFdQR01aQS5FdmVudC5BVF9UQVJHRVRcdFx0XHRcdD0gMTtcclxuXHRXUEdNWkEuRXZlbnQuQlVCQkxJTkdfUEhBU0VcdFx0XHQ9IDI7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFByZXZlbnRzIGFueSBmdXJ0aGVyIHByb3BhZ2F0aW9uIG9mIHRoaXMgZXZlbnRcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5FdmVudFxyXG5cdCAqL1xyXG5cdFdQR01aQS5FdmVudC5wcm90b3R5cGUuc3RvcFByb3BhZ2F0aW9uID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHRoaXMuX2NhbmNlbGxlZCA9IHRydWU7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6ImV2ZW50LmpzIn0=
