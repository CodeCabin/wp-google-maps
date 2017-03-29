<?php

namespace WPGMZA;

require_once(WPGMZA_DIR . 'php/class.admin-page.php');
require_once(WPGMZA_DIR . 'php/class.map.php');

class MapEditPage extends AdminPage
{
	protected $map;
	
	public function __construct()
	{
		AdminPage::__construct();
		
		$this->enqueueScripts();
		$this->enqueueStyles();
		
		try{
			$this->map = new Map($_GET['map_id']);
		}catch(Exception $e) {
			$this->loadXML('<p class="error">
				'.__('There was a problem loading the specified map', 'wp-google-maps').'
			</p>');
			return;
		}
		
		$this->loadPHPFile(WPGMZA_DIR . 'html/map-edit-page.html');
		
		// Populate form
		$map = $this->map;
		
		$this->populate($map);
		$this->populate($map->settings);
		
		// TODO: Maybe do this stuff at migration time
		// Split width and height into amount and units
		$width_amount = intval($map->settings->width);
		$height_amount = intval($map->settings->height);
		$width_units = $height_units = null;
		
		if(preg_match('/%|vw|vh|px/i', $map->settings->width, $m))
			$width_units = strtolower($m[0]);
		if(preg_match('/%|vw|vh|px/i', $map->settings->height, $m))
			$height_units = strtolower($m[0]);
		
		$this->populate(array(
			'width_amount'	=> $width_amount,
			'height_amount'	=> $height_amount,
			'width_units'	=> $width_units,
			'height_units'	=> $height_units
		));
		
		// Add map
		$this->querySelector('#wpgmza-map-container')->import(
			$this->map
		);
		$this->querySelector('#wpgmza-map-container')->setAttribute('data-right-click-marker-image', WPGMZA_BASE . 'images/right-click-marker.png');
		
		// TODO: perhaps for any settings etc. that don't have a corresponding input element, add them as hidden inputs
		
		if(!empty($_POST))
			$this->onFormSubmitted();
	}
	
	protected function enqueueScripts()
	{
		wp_enqueue_script('wpgmza-event-dispatcher', WPGMZA_BASE . 'lib/eventDispatcher.min.js');
		wp_enqueue_script('wpgmza-spectrum', WPGMZA_BASE . 'lib/spectrum.js');
		wp_enqueue_script('wpgmza-modernizr', WPGMZA_BASE . 'lib/modernizr-custom.js');
		
		wp_enqueue_script('wpgmza-map', WPGMZA_BASE . 'js/map.js', array(
			'jquery',
			'wpgmza-event-dispatcher'
		));
		wp_enqueue_script('wpgmza-marker', WPGMZA_BASE . 'js/marker.js', array(
			'wpgmza-map'
		));
		wp_enqueue_script('wpgmza-polygon', WPGMZA_BASE . 'js/polygon.js', array(
			'wpgmza-map'
		));
		wp_enqueue_script('wpgmza-polyline', WPGMZA_BASE . 'js/polyline.js', array(
			'wpgmza-map'
		));
		
		wp_enqueue_script('wpgmza-map-settings', WPGMZA_BASE . 'js/map-settings.js', array(
			'wpgmza-map'
		));
		wp_enqueue_script('wpgmza-delete-menu', WPGMZA_BASE . 'js/delete-menu.js', array(
			'wpgmza-map'
		));
		wp_enqueue_script('wpgmza-map-edit-page', WPGMZA_BASE . 'js/map-edit-page.js', array(
			'wpgmza-map',
			'wpgmza-delete-menu'
		));
	}
	
	protected function enqueueStyles()
	{
		wp_enqueue_style('wpgmza-color-picker', WPGMZA_BASE . 'lib/spectrum.css');
	}
	
	protected function onFormSubmitted()
	{
		$form = $this->querySelector('form');
		
		if(!$form->validate())
			return;
		
		$map = $this->map;
		$exclude = array(
			'title',
			'shortcode',
			'width_amount',
			'width_units',
			'height_amount',
			'height_units',
			'wpgmza_savemap'
		);
		
		$map->title = stripslashes($_POST['title']);
		$map->settings->width = $_POST['width_amount'] . $_POST['width_units'];
		$map->settings->height = $_POST['height_amount'] . $_POST['height_units'];
		
		foreach($_POST as $key => $value)
		{
			if(array_search($key, $exclude) !== false)
				continue;
			
			$map->settings->{$key} = stripslashes($value);
		}
		
		$map->save();
		
		wp_redirect($_SERVER['REQUEST_URI']);
		exit;
	}
}

?>