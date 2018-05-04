/**
 * @namespace WPGMZA
 * @module Tour
 * @requires WPGMZA
 */
(function($) {
	
	WPGMZA.Tour = function()
	{
		var self = this;
		
		if(!window.hopscotch)
			return;
		
		this.tour = {
			id: "wpgmza-tour",
			steps: []
		};
		
		for(var i = 0; i < wpgmza_tour_data.length; i++)
		{
			var item = wpgmza_tour_data[i];
			
			item.target = $(item.target)[0];
			
			if(!item.target)
				continue;
			
			item.zindex = 9999;
			
			this.tour.steps.push(item);
		}
		
		hopscotch.listen("beforeShow", function(event) {
			var step = self.tour.steps[hopscotch.getCurrStepNum()];
			
			if(step.javascript)
				eval(step.javascript);
		});
		
		hopscotch.listen("close", function() {
			window.Cookies.set("wpgmza-tour-taken", true);
		});
		hopscotch.listen("end", function() {
			window.Cookies.set("wpgmza-tour-taken", true);
		});
	}
	
	WPGMZA.Tour.prototype.start = function()
	{
		$("#wpgmza_tabs").tabs({active: 0});
		hopscotch.startTour(this.tour);
	}
	
	$(document).ready(function(event) {
		
		WPGMZA.tour = new WPGMZA.Tour();
		
		//|| (window.Cookies && !window.Cookies.get("wpgmza-tour-taken")))
		
		if(window.location.hash.match(/tour/))
			WPGMZA.tour.start();
			
		$("#take-a-tour a").on("click", function(event) {
			WPGMZA.tour.start();
		});
	});
	
})(jQuery);