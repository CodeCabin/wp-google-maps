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
		
		// Add marker table
		$this->querySelector('#marker-table-container')->import(
			$this->map->tables->marker
		);
		
		if(!empty($_POST))
			$this->onFormSubmitted();
	}
	
	protected function enqueueScripts()
	{
		// Dependencies
		wp_enqueue_script('jquery-ui-core');
		wp_enqueue_script('jquery-ui-slider');
		wp_enqueue_script('jquery-ui-tabs');
		wp_enqueue_script('jquery-ui-progressbar');
		
		wp_enqueue_script('wpgmza-spectrum', WPGMZA_BASE . 'lib/spectrum.js');
		wp_enqueue_script('wpgmza-modernizr', WPGMZA_BASE . 'lib/modernizr-custom.js');
		wp_enqueue_script('datatables', '//cdn.datatables.net/1.10.13/js/jquery.dataTables.min.js', array('jquery'));
		
		// WPGMZA
		wp_enqueue_script('wpgmza-delete-menu', WPGMZA_BASE . 'js/delete-menu.js', array(
			'wpgmza-map'
		));
		
		wp_enqueue_script('wpgmza-map-edit-page', WPGMZA_BASE . 'js/map-edit-page.js', array(
			'wpgmza-map',
			'wpgmza-delete-menu',
			'wpgmza-modernizr',
			'wpgmza-spectrum',
			'datatables'
		));
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
			'map_id'
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
		
		wp_redirect($_SERVER['REQUEST_URI']);
		exit;
	}
}

?>