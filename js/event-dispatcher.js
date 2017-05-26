WPGMZA.EventDispatcher = function()
{
	this._listenersByType = [];
}

WPGMZA.EventDispatcher.prototype.addEventListener = function(type, listener, thisObject, useCapture)
{
	var arr;
	
	if(!(listener instanceof Function))
		throw new Error("Listener must be a function");

	if(!(arr = this._listenersByType[type]))
		arr = this._listenersByType[type] = [];
		
	var obj = {
		listener: listener,
		thisObject: (thisObject ? thisObject : this),
		useCapture: (useCapture ? true : false)
		};
		
	arr.push(obj);
}

WPGMZA.EventDispatcher.prototype.removeEventListener = function(type, listener, thisObject, useCapture)
{
	var arr, index, obj;

	if(!(arr = this._listenersByType[type]))
		return;
		
	if(!thisObject)
		thisObject = this;
		
	useCapture = (useCapture ? true : false);
	
	for(var i = 0; i < arr.length; i++)
	{
		obj = arr[i];
	
		if(obj.listener == listener && obj.thisObject == thisObject && obj.useCapture == useCapture)
		{
			arr.splice(i, 1);
			return;
		}
	}
}

WPGMZA.EventDispatcher.prototype.hasEventListener = function(type)
{
	return (_listenersByType[type] ? true : false);
}

WPGMZA.EventDispatcher.prototype.dispatchEvent = function(event)
{
	if(!(event instanceof WPGMZA.Event))
	{
		var src = event;
		event = new WPGMZA.Event();
		for(var name in src)
			event[name] = src[name];
	}

	event.target = this;
		
	var path = [];
	for(var obj = this.parent; obj != null; obj = obj.parent)
		path.unshift(obj);
	
	event.phase = WPGMZA.Event.CAPTURING_PHASE;
	for(var i = 0; i < path.length && !event._cancelled; i++)
		path[i]._triggerListeners(event);
		
	if(event._cancelled)
		return;
		
	event.phase = WPGMZA.Event.AT_TARGET;
	this._triggerListeners(event);
		
	event.phase = WPGMZA.Event.BUBBLING_PHASE;
	for(i = path.length - 1; i >= 0 && !event._cancelled; i--)
		path[i]._triggerListeners(event);
}

WPGMZA.EventDispatcher.prototype._triggerListeners = function(event)
{
	var arr, obj;
	
	if(!(arr = this._listenersByType[event.type]))
		return;
		
	for(var i = 0; i < arr.length; i++)
	{
		obj = arr[i];
		
		if(event.phase == WPGMZA.Event.CAPTURING_PHASE && !obj.useCapture)
			continue;
			
		obj.listener.call(arr[i].thisObject, event);
	}
}