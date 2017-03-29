<?php

session_start();

define('WPGMZA_FAST_AJAX', true);
define('DOING_AJAX', true);
define('SHORTINIT', true);

if(!isset($_GET['bounds']) || !isset($_GET['map_id']))
{
	http_response_code(400);
	die('Missing parameter');
}

ini_set('html_errors', 0);

$found = false;
for($i = 0; $i < 100; $i++)
{
	chdir('..');
	if(file_exists('wp-load.php'))
	{
		$found = true;
		break;
	}
}

if(!$found)
	die('wp-load.php not found');

require_once('wp-load.php');

ini_set("display_startup_errors", 1); 
ini_set("display_errors", 1);
error_reporting(E_ALL);

chdir(__DIR__ . '/..');

// TODO: Naughty repeating!!!!! Put this in a seperate tablenames file
$WPGMZA_VERSION						= '7.0.00';
$WPGMZA_TABLE_NAME_MAPS				= $wpdb->prefix.'wpgmza_maps';
$WPGMZA_TABLE_NAME_MARKERS			= $wpdb->prefix.'wpgmza_markers';
$WPGMZA_TABLE_NAME_POLYGONS			= $wpdb->prefix.'wpgmza_polygons';
$WPGMZA_TABLE_NAME_POLYLINES	 	= $wpdb->prefix.'wpgmza_polylines';
$WPGMZA_TABLE_NAME_CATEGORIES		= $wpdb->prefix.'wpgmza_categories';
$WPGMZA_TABLE_NAME_CATEGORY_MAPS	= $wpdb->prefix.'wpgmza_category_maps';

require_once('lib/smart/class.ajax-response.php');
require_once('php/class.plugin.php');
require_once('php/class.map.php');

$plugin = new WPGMZA\Plugin();
$map = new WPGMZA\Map($_GET['map_id']);

$results = $map->fetch(
	explode(',', $_GET['bounds']),
	(isset($_GET['sid']) ? $_GET['sid'] : null)
);

$response = new Smart\AjaxResponse(Smart\AjaxResponse::JSON);
$response->send($results);

?>