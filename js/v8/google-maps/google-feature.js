/**
 * @namespace WPGMZA
 * @module GoogleFeature
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.GoogleFeature = function(options)
	{
		WPGMZA.assertInstangeOf(this, "GoogleFeature");
		
		WPGMZA.Feature.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.GoogleFeature, WPGMZA.Feature);
	
	WPGMZA.GoogleFeature.getGoogleStyle = function(options) {
        if(options.lineDashArray){
            let dashArray = options.lineDashArray.split(" ");
            if(dashArray.length > 1){
                let [dashLength, dashGap] = dashArray;

                dashLength = parseInt(dashLength);
                dashGap = parseInt(dashGap);

                const lineSymbol = {
                    path : "M 0,-1 L 0,1",
                    strokeOpacity : parseFloat(options.strokeOpacity),
                    strokeWeight : options.strokeWeight,
                    strokeColor : options.strokeColor, 
                    scale : dashLength ? dashLength / 2 : 0.5,
                };

                options.icons = [{
                    icon : lineSymbol,
                    offset : "0%",
                    repeat : (dashLength + dashGap) + "px"
                }];

                options.strokeOpacity = 0;
            }
        }
		return options;
	}
});