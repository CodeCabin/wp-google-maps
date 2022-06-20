<?php

namespace WPGMZA;

class ThemePanel extends DOMDocument
{
	public function __construct($map=null)
	{
		global $wpgmza;
		
		DOMDocument::__construct();
		
		$this->loadPHPFile($wpgmza->internalEngine->getTemplate('theme-panel.html.php'));
		
		$base = plugin_dir_url(__DIR__);
		
		wp_enqueue_script('owl-carousel', 				$base . 'lib/owl.carousel.min.js', array('jquery'), $wpgmza->getBasicVersion());
		wp_enqueue_style('owl-carousel',				$base . 'lib/owl.carousel.css', array(), $wpgmza->getBasicVersion());
		wp_enqueue_style('owl-carousel_theme',			$base . 'lib/owl.theme.css', array(), $wpgmza->getBasicVersion());
		
		
		/* 
		 * Deprecating code mirror enqueue, we don't actually use this with V8
		 * 
		 * This will be reintroduced with V9, but we will need to use the included version from WordPress core 
		 * 
		 * Since 8.1.18, code removed, comment left as placeholder  
		*/
		
		if($map)
			$this->populate($map);
	}
}
