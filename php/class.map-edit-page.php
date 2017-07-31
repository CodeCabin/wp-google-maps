<?php

namespace WPGMZA;

require_once(WPGMZA_DIR . 'php/class.admin-page.php');
require_once(WPGMZA_DIR . 'php/class.map.php');

class MapEditPage extends AdminPage
{
	protected $map;
	
	public function __construct()
	{
		global $wpgmza;
		
		AdminPage::__construct();
		
		$this->enqueueScripts();
		$this->enqueueStyles();
		
		try{
			$this->map = $wpgmza->createMapInstance($_GET['map_id']);
		}catch(Exception $e) {
			$this->loadXML('<p class="error">
				'.__('There was a problem loading the specified map', 'wp-google-maps').'
			</p>');
			return;
		}
		
		$this->loadHTMLContent();
		
		// Populate form
		$map = $this->map;
		
		$this->populate($map);
		$this->populate($map->settings);
		
		$width_units = $height_units = null;
		
		if(empty($map->settings->width))
		{
			$map->settings->width = "100%";
			$width_amount = 100;
		}
		else
			$width_amount = intval($map->settings->width);
		
		if(empty($map->settings->height))
		{
			$map->settings->height = "400px";
			$height_amount = 400;
		}
		else
			$height_amount = intval($map->settings->height);
		
		
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
		
		$this->querySelector('.wpgmza-map')->setAttribute('data-right-click-marker-image', WPGMZA_BASE . 'images/right-click-marker.png');
		
		// Add marker table
		$this->querySelector('#marker-table-container')->import(
			$this->map->tables->marker
		);
		
		// POST?
		if(!empty($_POST))
		{
			$this->onFormSubmitted();
			wp_redirect($_SERVER['REQUEST_URI']);
			exit;
		}
	}
	
	protected function loadHTMLContent()
	{
		$this->loadPHPFile(WPGMZA_DIR . 'html/map-edit-page.html');
	}
	
	protected function enqueueScripts()
	{	
		global $wpgmza;
	
		// Dependencies
		wp_enqueue_script('jquery-ui-core');
		wp_enqueue_script('jquery-ui-slider');
		wp_enqueue_script('jquery-ui-tabs');
		wp_enqueue_script('jquery-ui-progressbar');
		wp_enqueue_script('jquery-ui-accordion');
		
		wp_enqueue_script('wpgmza-spectrum', WPGMZA_BASE . 'lib/spectrum.js');
		wp_enqueue_script('wpgmza-modernizr', WPGMZA_BASE . 'lib/modernizr-custom.js');
		
		// WPGMZA
		wp_enqueue_script('wpgmza-map-edit-page', WPGMZA_BASE . 'js/map-edit-page.js', array(
			'wpgmza-map'
		));
		
		// Generic drawing manager and context menu
		wp_enqueue_script('wpgmza-drawing-manager', WPGMZA_BASE . "js/drawing-manager.js", array('wpgmza-event-dispatcher'));
		wp_enqueue_script('wpgmza-vertex-context-menu', WPGMZA_BASE . 'js/vertex-context-menu.js', array('wpgmza-event-dispatcher'));
		
		$dependencies = array('wpgmza-map-edit-page');
		if($wpgmza->isProVersion())
			$dependencies[] = 'wpgmza-pro-map-edit-page';
		
		// Remodal dialog
		wp_enqueue_script('remodal', WPGMZA_BASE . 'lib/remodal.min.js');
		wp_enqueue_style('remodal', WPGMZA_BASE . 'lib/remodal.css');
		wp_enqueue_style('remodal-default-theme', WPGMZA_BASE . 'lib/remodal-default-theme.css');
		
		// Engine specific code
		switch(Plugin::$settings->engine)
		{
			case 'google-maps':
				wp_enqueue_script('wpgmza-google-vertex-context-menu', WPGMZA_BASE . "js/google-maps/google-vertex-context-menu.js", array('wpgmza_api_call', 'wpgmza-vertex-context-menu'));
				
				wp_enqueue_script('wpgmza-engine-drawing-manager', WPGMZA_BASE . "js/google-maps/google-drawing-manager.js", array('wpgmza-drawing-manager'));
				
				
				wp_enqueue_script('wpgmza-google-map-edit-page', WPGMZA_BASE . "js/google-maps/google-map-edit-page.js", $dependencies);
				break;
				
			default:
				wp_enqueue_script('wpgmza-engine-drawing-manager', WPGMZA_BASE . "js/open-street-map/osm-drawing-manager.js", $dependencies);
			
				wp_enqueue_script('wpgmza-osm-map-edit-page', WPGMZA_BASE . "js/open-street-map/osm-map-edit-page.js", $dependencies);
				break;
		}
	}
	
	protected function enqueueStyles()
	{
		wp_enqueue_style('wpgmza-color-picker', WPGMZA_BASE . 'lib/spectrum.css');
		wp_enqueue_style('datatables', '//cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css');
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
			'wpgmza_savemap',
			'map-objects',
			'map_id',
			'localized_strings'
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
		
		foreach($this->querySelectorAll('input[type="checkbox"][name]') as $input)
		{
			$name = $input->getAttribute('name');
			$map->settings->{$name} = isset($_POST[$name]);
		}
		
		$map_objects = json_decode(stripslashes($_POST['map-objects']));
		if(!$map_objects)
		{
			switch(json_last_error())
			{
				case JSON_ERROR_NONE:
					$msg = 'No error';
					break;
					
				case JSON_ERROR_DEPTH:
					$msg = 'Depth error';
					break;
					
				case JSON_ERROR_STATE_MISMATCH:
					$msg = 'State mismatch';
					break;
					
				case JSON_ERROR_CTRL_CHAR:
					$msg = 'Control character error';
					break;
					
				case JSON_ERROR_SYNTAX:
					$msg = 'Syntax error';
					break;
					
				case JSON_ERROR_UTF8:
					$msg = 'Malformed UTF-8';
					break;
					
				case JSON_ERROR_RECURSION:
					$msg = 'Recursion error';
					break;
					
				case JSON_ERROR_INF_OR_NAN:
					$msg = 'One or more NaN or INF values to be encoded';
					break;
					
				case JSON_ERROR_UNSUPPORTED_TYPE:
					$msg = 'Unsupported type';
					break;
					
				case JSON_ERROR_INVALID_PROPERTY_NAME:
					$msg = 'Invalid property name';
					break;
				
				case JSON_ERROR_UTF16:
					$msg = 'Malformed UTF-16';
					break;
					
				default:
					$msg = 'Unknown error';
					break;
			}
			
			throw new \Exception('Error decoding JSON data: ' . $msg);
		}
		
		$map->save($map_objects);
		
		Plugin::trackUsage();
	}
}

?>