<?php

if(!defined('ABSPATH'))
	exit;

global $wpdb;

define('WPGMZA_PLUGIN_DIR_PATH', plugin_dir_path(__FILE__));
define('WPGMZA_PLUGIN_DIR_URL', plugin_dir_url(__FILE__));

global $WPGMZA_TABLE_NAME_MARKERS;
global $WPGMZA_TABLE_NAME_MAPS;
global $WPGMZA_TABLE_NAME_POLYGONS;
global $WPGMZA_TABLE_NAME_POLYLINES;
global $WPGMZA_TABLE_NAME_CIRCLES;
global $WPGMZA_TABLE_NAME_RECTANGLES;

$WPGMZA_TABLE_NAME_MARKERS		= $wpdb->prefix . 'wpgmza';
$WPGMZA_TABLE_NAME_MAPS			= $wpdb->prefix . 'wpgmza_maps';
$WPGMZA_TABLE_NAME_POLYGONS		= $wpdb->prefix . 'wpgmza_polygon';
$WPGMZA_TABLE_NAME_POLYLINES	= $wpdb->prefix . 'wpgmza_polylines';
$WPGMZA_TABLE_NAME_CIRCLES		= $wpdb->prefix . 'wpgmza_circles';
$WPGMZA_TABLE_NAME_RECTANGLES	= $wpdb->prefix . 'wpgmza_rectangles';
