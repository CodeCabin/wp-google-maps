<?php

/*
 * Please make sure all the variables in here are prefixed with WPGMZA_ to avoid collisions
 */

global $wpdb;

global $WPGMZA_VERSION;
global $WPGMZA_TABLE_NAME_MAPS;
global $WPGMZA_TABLE_NAME_MARKERS;
global $WPGMZA_TABLE_NAME_POLYGONS;
global $WPGMZA_TABLE_NAME_POLYLINES;
global $WPGMZA_TABLE_NAME_CATEGORIES;	
global $WPGMZA_TABLE_NAME_CATEGORY_MAPS;

$WPGMZA_VERSION						= '7.0.0';
$WPGMZA_TABLE_NAME_MAPS				= $wpdb->prefix.'wpgmza_maps';
$WPGMZA_TABLE_NAME_MARKERS			= $wpdb->prefix.'wpgmza_markers';
$WPGMZA_TABLE_NAME_POLYGONS			= $wpdb->prefix.'wpgmza_polygons';
$WPGMZA_TABLE_NAME_POLYLINES	 	= $wpdb->prefix.'wpgmza_polylines';
$WPGMZA_TABLE_NAME_CATEGORIES		= $wpdb->prefix.'wpgmza_categories';
$WPGMZA_TABLE_NAME_CATEGORY_MAPS	= $wpdb->prefix.'wpgmza_category_maps';

define('WPGMZA_DIR', __DIR__ . '/');
define('WPGMZA_BASE', plugins_url() . '/' . basename(__DIR__) . '/');

// NB: IMPORTANT: If you leave this enabled, any changes you make in the map editor will appear to be IGNORED, as they are overwritten by V6 data being migrated in
// define('WPGMZA_FORCE_V7_INSTALL', true);

?>