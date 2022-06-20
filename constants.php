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
global $WPGMZA_TABLE_NAME_HEATMAPS;

global $WPGMZA_TABLE_NAME_POINT_LABELS;
global $WPGMZA_TABLE_NAME_IMAGE_OVERLAYS;

global $WPGMZA_TABLE_NAME_ADMIN_NOTICES;

$WPGMZA_TABLE_NAME_MARKERS		= $wpdb->prefix . 'wpgmza';
$WPGMZA_TABLE_NAME_MAPS			= $wpdb->prefix . 'wpgmza_maps';
$WPGMZA_TABLE_NAME_POLYGONS		= $wpdb->prefix . 'wpgmza_polygon';
$WPGMZA_TABLE_NAME_POLYLINES	= $wpdb->prefix . 'wpgmza_polylines';
$WPGMZA_TABLE_NAME_CIRCLES		= $wpdb->prefix . 'wpgmza_circles';
$WPGMZA_TABLE_NAME_RECTANGLES	= $wpdb->prefix . 'wpgmza_rectangles';
$WPGMZA_TABLE_NAME_HEATMAPS					= $wpdb->prefix . 'wpgmza_datasets';

$WPGMZA_TABLE_NAME_POINT_LABELS	= $wpdb->prefix . 'wpgmza_point_labels';
$WPGMZA_TABLE_NAME_IMAGE_OVERLAYS = $wpdb->prefix . 'wpgmza_image_overlays';

$WPGMZA_TABLE_NAME_ADMIN_NOTICES = $wpdb->prefix . 'wpgmza_admin_notices';


