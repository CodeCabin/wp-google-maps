/**
 * @namespace WPGMZA
 * @module Shape
 * @requires WPGMZA.Feature
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Feature;

    /** 
     * A generic shape relay so that shapes can share common polygon features
    */
    WPGMZA.Shape = function(options, engineFeature)
    {
        var self = this;
        WPGMZA.assertInstanceOf(this, "Shape");
        
        Parent.apply(this, arguments);

        this.addEventListener("added", function(event) {
            self.onAdded();
        });
    }
    
    WPGMZA.extend(WPGMZA.Shape, WPGMZA.Feature);

    WPGMZA.Shape.BASE_LAYER_INDEX       = 99999;

    WPGMZA.Shape.prototype.onAdded = function(){
        
    }
});