/**
 * @namespace WPGMZA
 * @module InfoWindow
 * @requires WPGMZA.EventDispatcher
 * @gulp-requires event-dispatcher.js
 */
jQuery(function($) {
	
	/**
	 * Base class for infoWindows. This acts as an abstract class so that infoWindows for both Google and OpenLayers can be interacted with seamlessly by the overlying logic. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.InfoWindow
	 * @constructor WPGMZA.InfoWindow
	 * @memberof WPGMZA
	 * @see WPGMZA.InfoWindow.createInstance
	 */
	WPGMZA.InfoWindow = function(mapObject)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		WPGMZA.assertInstanceOf(this, "InfoWindow");
		
		this.on("infowindowopen", function(event) {
			self.onOpen(event);
		});
		
		if(!mapObject)
			return;
		
		this.mapObject = mapObject;
		this.state = WPGMZA.InfoWindow.STATE_CLOSED;
		
		if(mapObject.map)
		{
			// This has to be slightly delayed so the map initialization won't overwrite the infowindow element
			setTimeout(function() {
				self.onMapObjectAdded(event);
			}, 100);
		}
		else
			mapObject.addEventListener("added", function(event) { 
				self.onMapObjectAdded(event);
			});
	}
	
	WPGMZA.InfoWindow.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.InfoWindow.prototype.constructor = WPGMZA.InfoWindow;
	
	WPGMZA.InfoWindow.OPEN_BY_CLICK = 1;
	WPGMZA.InfoWindow.OPEN_BY_HOVER = 2;
	
	WPGMZA.InfoWindow.STATE_OPEN	= "open";
	WPGMZA.InfoWindow.STATE_CLOSED	= "closed";
	
	/**
	 * Fetches the constructor to be used by createInstance, based on the selected maps engine
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return {function} The appropriate constructor
	 */
	WPGMZA.InfoWindow.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProInfoWindow;
				return WPGMZA.OLInfoWindow;
				break;
			
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProInfoWindow;
				return WPGMZA.GoogleInfoWindow;
				break;
		}
	}
	
	/**
	 * Creates an instance of an InfoWindow, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @param {object} options Options for the object (optional)
	 */
	WPGMZA.InfoWindow.createInstance = function(mapObject)
	{
		var constructor = this.getConstructor();
		return new constructor(mapObject);
	}
	
	/**
	 * Gets the content for the info window and passes it to the specified callback - this allows for delayed loading (eg AJAX) as well as instant content
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return void
	 */
	WPGMZA.InfoWindow.prototype.getContent = function(callback)
	{
		var html = "";
		
		if(this.mapObject instanceof WPGMZA.Marker)
			html = this.mapObject.address;
		
		callback(html);
	}
	
	/**
	 * Opens the info window on the specified map, with the specified map object as the subject.
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @param {WPGMZA.Map} map The map to open this InfoWindow on.
	 * @param {WPGMZA.MapObject} mapObject The map object (eg marker, polygon) to open this InfoWindow on.
	 * @return boolean FALSE if the info window should not and will not open, TRUE if it will. This can be used by subclasses to establish whether or not the subclassed open should bail or open the window.
	 */
	WPGMZA.InfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		this.mapObject = mapObject;
		
		if(WPGMZA.settings.disable_infowindows || WPGMZA.settings.wpgmza_settings_disable_infowindows == "1")
			return false;
		
		if(this.mapObject.disableInfoWindow)
			return false;
		
		this.state = WPGMZA.InfoWindow.STATE_OPEN;
		
		return true;
	}
	
	/**
	 * Abstract function, closes this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.close = function()
	{
		if(this.state == WPGMZA.InfoWindow.STATE_CLOSED)
			return;
		
		this.state = WPGMZA.InfoWindow.STATE_CLOSED;
		this.trigger("infowindowclose");
	}
	
	/**
	 * Abstract function, sets the content in this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.setContent = function(options)
	{
		
	}
	
	/**
	 * Abstract function, sets options on this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.setOptions = function(options)
	{
		
	}
	
	/**
	 * Event listener for when the map object is added. This will cause the info window to open if the map object has infoopen set
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return void
	 */
	WPGMZA.InfoWindow.prototype.onMapObjectAdded = function()
	{
		if(this.mapObject.settings.infoopen == 1)
			this.open();
	}
	
	WPGMZA.InfoWindow.prototype.onOpen = function()
	{
		
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJpbmZvLXdpbmRvdy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBJbmZvV2luZG93XHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuRXZlbnREaXNwYXRjaGVyXHJcbiAqIEBndWxwLXJlcXVpcmVzIGV2ZW50LWRpc3BhdGNoZXIuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQmFzZSBjbGFzcyBmb3IgaW5mb1dpbmRvd3MuIFRoaXMgYWN0cyBhcyBhbiBhYnN0cmFjdCBjbGFzcyBzbyB0aGF0IGluZm9XaW5kb3dzIGZvciBib3RoIEdvb2dsZSBhbmQgT3BlbkxheWVycyBjYW4gYmUgaW50ZXJhY3RlZCB3aXRoIHNlYW1sZXNzbHkgYnkgdGhlIG92ZXJseWluZyBsb2dpYy4gPHN0cm9uZz5QbGVhc2UgPGVtPmRvIG5vdDwvZW0+IGNhbGwgdGhpcyBjb25zdHJ1Y3RvciBkaXJlY3RseS4gQWx3YXlzIHVzZSBjcmVhdGVJbnN0YW5jZSByYXRoZXIgdGhhbiBpbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgZGlyZWN0bHkuPC9zdHJvbmc+IFVzaW5nIGNyZWF0ZUluc3RhbmNlIGFsbG93cyB0aGlzIGNsYXNzIHRvIGJlIGV4dGVybmFsbHkgZXh0ZW5zaWJsZS5cclxuXHQgKiBAY2xhc3MgV1BHTVpBLkluZm9XaW5kb3dcclxuXHQgKiBAY29uc3RydWN0b3IgV1BHTVpBLkluZm9XaW5kb3dcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICogQHNlZSBXUEdNWkEuSW5mb1dpbmRvdy5jcmVhdGVJbnN0YW5jZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5JbmZvV2luZG93ID0gZnVuY3Rpb24obWFwT2JqZWN0KVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0V1BHTVpBLkV2ZW50RGlzcGF0Y2hlci5jYWxsKHRoaXMpO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuYXNzZXJ0SW5zdGFuY2VPZih0aGlzLCBcIkluZm9XaW5kb3dcIik7XHJcblx0XHRcclxuXHRcdHRoaXMub24oXCJpbmZvd2luZG93b3BlblwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uT3BlbihldmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0aWYoIW1hcE9iamVjdClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1hcE9iamVjdCA9IG1hcE9iamVjdDtcclxuXHRcdHRoaXMuc3RhdGUgPSBXUEdNWkEuSW5mb1dpbmRvdy5TVEFURV9DTE9TRUQ7XHJcblx0XHRcclxuXHRcdGlmKG1hcE9iamVjdC5tYXApXHJcblx0XHR7XHJcblx0XHRcdC8vIFRoaXMgaGFzIHRvIGJlIHNsaWdodGx5IGRlbGF5ZWQgc28gdGhlIG1hcCBpbml0aWFsaXphdGlvbiB3b24ndCBvdmVyd3JpdGUgdGhlIGluZm93aW5kb3cgZWxlbWVudFxyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHNlbGYub25NYXBPYmplY3RBZGRlZChldmVudCk7XHJcblx0XHRcdH0sIDEwMCk7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHRcdG1hcE9iamVjdC5hZGRFdmVudExpc3RlbmVyKFwiYWRkZWRcIiwgZnVuY3Rpb24oZXZlbnQpIHsgXHJcblx0XHRcdFx0c2VsZi5vbk1hcE9iamVjdEFkZGVkKGV2ZW50KTtcclxuXHRcdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5JbmZvV2luZG93LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5JbmZvV2luZG93LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5JbmZvV2luZG93O1xyXG5cdFxyXG5cdFdQR01aQS5JbmZvV2luZG93Lk9QRU5fQllfQ0xJQ0sgPSAxO1xyXG5cdFdQR01aQS5JbmZvV2luZG93Lk9QRU5fQllfSE9WRVIgPSAyO1xyXG5cdFxyXG5cdFdQR01aQS5JbmZvV2luZG93LlNUQVRFX09QRU5cdD0gXCJvcGVuXCI7XHJcblx0V1BHTVpBLkluZm9XaW5kb3cuU1RBVEVfQ0xPU0VEXHQ9IFwiY2xvc2VkXCI7XHJcblx0XHJcblx0LyoqXHJcblx0ICogRmV0Y2hlcyB0aGUgY29uc3RydWN0b3IgdG8gYmUgdXNlZCBieSBjcmVhdGVJbnN0YW5jZSwgYmFzZWQgb24gdGhlIHNlbGVjdGVkIG1hcHMgZW5naW5lXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuSW5mb1dpbmRvd1xyXG5cdCAqIEByZXR1cm4ge2Z1bmN0aW9ufSBUaGUgYXBwcm9wcmlhdGUgY29uc3RydWN0b3JcclxuXHQgKi9cclxuXHRXUEdNWkEuSW5mb1dpbmRvdy5nZXRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRzd2l0Y2goV1BHTVpBLnNldHRpbmdzLmVuZ2luZSlcclxuXHRcdHtcclxuXHRcdFx0Y2FzZSBcIm9wZW4tbGF5ZXJzXCI6XHJcblx0XHRcdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIFdQR01aQS5PTFByb0luZm9XaW5kb3c7XHJcblx0XHRcdFx0cmV0dXJuIFdQR01aQS5PTEluZm9XaW5kb3c7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFxyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFx0XHRcdHJldHVybiBXUEdNWkEuR29vZ2xlUHJvSW5mb1dpbmRvdztcclxuXHRcdFx0XHRyZXR1cm4gV1BHTVpBLkdvb2dsZUluZm9XaW5kb3c7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYW4gSW5mb1dpbmRvdywgPHN0cm9uZz5wbGVhc2UgPGVtPmFsd2F5czwvZW0+IHVzZSB0aGlzIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGNhbGxpbmcgdGhlIGNvbnN0cnVjdG9yIGRpcmVjdGx5PC9zdHJvbmc+XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuSW5mb1dpbmRvd1xyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIE9wdGlvbnMgZm9yIHRoZSBvYmplY3QgKG9wdGlvbmFsKVxyXG5cdCAqL1xyXG5cdFdQR01aQS5JbmZvV2luZG93LmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24obWFwT2JqZWN0KVxyXG5cdHtcclxuXHRcdHZhciBjb25zdHJ1Y3RvciA9IHRoaXMuZ2V0Q29uc3RydWN0b3IoKTtcclxuXHRcdHJldHVybiBuZXcgY29uc3RydWN0b3IobWFwT2JqZWN0KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgY29udGVudCBmb3IgdGhlIGluZm8gd2luZG93IGFuZCBwYXNzZXMgaXQgdG8gdGhlIHNwZWNpZmllZCBjYWxsYmFjayAtIHRoaXMgYWxsb3dzIGZvciBkZWxheWVkIGxvYWRpbmcgKGVnIEFKQVgpIGFzIHdlbGwgYXMgaW5zdGFudCBjb250ZW50XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuSW5mb1dpbmRvd1xyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5JbmZvV2luZG93LnByb3RvdHlwZS5nZXRDb250ZW50ID0gZnVuY3Rpb24oY2FsbGJhY2spXHJcblx0e1xyXG5cdFx0dmFyIGh0bWwgPSBcIlwiO1xyXG5cdFx0XHJcblx0XHRpZih0aGlzLm1hcE9iamVjdCBpbnN0YW5jZW9mIFdQR01aQS5NYXJrZXIpXHJcblx0XHRcdGh0bWwgPSB0aGlzLm1hcE9iamVjdC5hZGRyZXNzO1xyXG5cdFx0XHJcblx0XHRjYWxsYmFjayhodG1sKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogT3BlbnMgdGhlIGluZm8gd2luZG93IG9uIHRoZSBzcGVjaWZpZWQgbWFwLCB3aXRoIHRoZSBzcGVjaWZpZWQgbWFwIG9iamVjdCBhcyB0aGUgc3ViamVjdC5cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5JbmZvV2luZG93XHJcblx0ICogQHBhcmFtIHtXUEdNWkEuTWFwfSBtYXAgVGhlIG1hcCB0byBvcGVuIHRoaXMgSW5mb1dpbmRvdyBvbi5cclxuXHQgKiBAcGFyYW0ge1dQR01aQS5NYXBPYmplY3R9IG1hcE9iamVjdCBUaGUgbWFwIG9iamVjdCAoZWcgbWFya2VyLCBwb2x5Z29uKSB0byBvcGVuIHRoaXMgSW5mb1dpbmRvdyBvbi5cclxuXHQgKiBAcmV0dXJuIGJvb2xlYW4gRkFMU0UgaWYgdGhlIGluZm8gd2luZG93IHNob3VsZCBub3QgYW5kIHdpbGwgbm90IG9wZW4sIFRSVUUgaWYgaXQgd2lsbC4gVGhpcyBjYW4gYmUgdXNlZCBieSBzdWJjbGFzc2VzIHRvIGVzdGFibGlzaCB3aGV0aGVyIG9yIG5vdCB0aGUgc3ViY2xhc3NlZCBvcGVuIHNob3VsZCBiYWlsIG9yIG9wZW4gdGhlIHdpbmRvdy5cclxuXHQgKi9cclxuXHRXUEdNWkEuSW5mb1dpbmRvdy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKG1hcCwgbWFwT2JqZWN0KVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dGhpcy5tYXBPYmplY3QgPSBtYXBPYmplY3Q7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5zZXR0aW5ncy5kaXNhYmxlX2luZm93aW5kb3dzIHx8IFdQR01aQS5zZXR0aW5ncy53cGdtemFfc2V0dGluZ3NfZGlzYWJsZV9pbmZvd2luZG93cyA9PSBcIjFcIilcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHJcblx0XHRpZih0aGlzLm1hcE9iamVjdC5kaXNhYmxlSW5mb1dpbmRvdylcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHJcblx0XHR0aGlzLnN0YXRlID0gV1BHTVpBLkluZm9XaW5kb3cuU1RBVEVfT1BFTjtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEFic3RyYWN0IGZ1bmN0aW9uLCBjbG9zZXMgdGhpcyBJbmZvV2luZG93XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuSW5mb1dpbmRvd1xyXG5cdCAqL1xyXG5cdFdQR01aQS5JbmZvV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZih0aGlzLnN0YXRlID09IFdQR01aQS5JbmZvV2luZG93LlNUQVRFX0NMT1NFRClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHR0aGlzLnN0YXRlID0gV1BHTVpBLkluZm9XaW5kb3cuU1RBVEVfQ0xPU0VEO1xyXG5cdFx0dGhpcy50cmlnZ2VyKFwiaW5mb3dpbmRvd2Nsb3NlXCIpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBYnN0cmFjdCBmdW5jdGlvbiwgc2V0cyB0aGUgY29udGVudCBpbiB0aGlzIEluZm9XaW5kb3dcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5JbmZvV2luZG93XHJcblx0ICovXHJcblx0V1BHTVpBLkluZm9XaW5kb3cucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbihvcHRpb25zKVxyXG5cdHtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBYnN0cmFjdCBmdW5jdGlvbiwgc2V0cyBvcHRpb25zIG9uIHRoaXMgSW5mb1dpbmRvd1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkluZm9XaW5kb3dcclxuXHQgKi9cclxuXHRXUEdNWkEuSW5mb1dpbmRvdy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpXHJcblx0e1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEV2ZW50IGxpc3RlbmVyIGZvciB3aGVuIHRoZSBtYXAgb2JqZWN0IGlzIGFkZGVkLiBUaGlzIHdpbGwgY2F1c2UgdGhlIGluZm8gd2luZG93IHRvIG9wZW4gaWYgdGhlIG1hcCBvYmplY3QgaGFzIGluZm9vcGVuIHNldFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkluZm9XaW5kb3dcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuSW5mb1dpbmRvdy5wcm90b3R5cGUub25NYXBPYmplY3RBZGRlZCA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZih0aGlzLm1hcE9iamVjdC5zZXR0aW5ncy5pbmZvb3BlbiA9PSAxKVxyXG5cdFx0XHR0aGlzLm9wZW4oKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkluZm9XaW5kb3cucHJvdG90eXBlLm9uT3BlbiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiaW5mby13aW5kb3cuanMifQ==
