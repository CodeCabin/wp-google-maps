WPGMZA.Event = function(type)
{
	this.type = type;
	
	this.bubbles		= true;
	this.cancelable		= true;
	this.phase			= WPGMZA.Event.PHASE_CAPTURE;
	this.target			= null;
	
	this._cancelled = false;
}

WPGMZA.Event.CAPTURING_PHASE		= 0;
WPGMZA.Event.AT_TARGET				= 1;
WPGMZA.Event.BUBBLING_PHASE			= 2;

WPGMZA.Event.prototype.stopPropagation = function()
{
	this._cancelled = true;
}