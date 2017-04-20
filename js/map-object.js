(function($) {
	
	WPGMZA.MapObject = function(row)
	{
		var self = this;
		
		this.id = -1;
		this.modified = false;
		this.settings = {};
		
		if(row)
		{
			for(var name in row)
			{
				if(name == "settings")
				{
					if(row["settings"] == null)
						this["settings"] = {};
					else switch(typeof row["settings"]) {
						case "string":
							this["settings"] = JSON.parse(row[name]);
							break;
						case "object":
							this["settings"] = row[name];
							break;
						default:
							throw new Error("Don't know how to interpret settings")
							break;
					}
					
					for(var name in this.settings)
					{
						var value = this.settings[name];
						if(String(value).match(/^-?\d+$/))
							this.settings[name] = parseInt(value);
					}
				}
				else
					this[name] = row[name];
			}
		}
		
		this.addEventListener("added", function(event) { self.onAdded(event); });
	}
	
	eventDispatcher.apply(WPGMZA.MapObject.prototype);
	
	WPGMZA.MapObject.prototype.onAdded = function(event)
	{
		if(this.settings.infoopen)
			this.infoWindow.open(event);
	}
	
})(jQuery);