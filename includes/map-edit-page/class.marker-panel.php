<?php

namespace WPGMZA;

class MarkerPanel extends FeaturePanel
{
	public function __construct($map_id)
	{
		global $wpgmza;
		
		FeaturePanel::__construct($map_id);
		
		wp_enqueue_script('jquery-ui');
		wp_enqueue_script('jquery-ui-sortable');
		// wp_enqueue_script('wpgmza-jquery-ui-sortable-animation', WPGMZA_PRO_DIR_URL . 'lib/jquery.ui.sortable-animation.js', array(), $wpgmza->getProVersion());

		if(!$wpgmza->internalEngine->isLegacy()){
			$wpgmza->scriptLoader->enqueueWritersblock();
		}
		
		if(!$wpgmza->isProVersion())
		{
			// Pro has a control for this, Basic does not. The default is 0. This is a workaround for that, and will make the markers approved in basic by default.
			$container	= $this->querySelector(".wpgmza-feature-panel");
			$input		= $this->createElement("input");
			
			$input->setAttribute("data-ajax-name", "approved");
			$input->setAttribute("value", "1");
			$input->setAttribute("type", "hidden");
			
			$container->append($input);
		}
	}
}
