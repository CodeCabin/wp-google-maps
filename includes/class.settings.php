<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

require_once(plugin_dir_path(__DIR__) . 'lib/codecabin/class.settings.php');

/**
 * This is a settings module for use with WP Go Maps.
 * This module handles remapping legacy, snake case settings into standardised, camel case names, with consistent prefixing and naming
 */
class Settings extends \codecabin\Settings
{
	public static $useLegacySettings = true;
	
	public function __construct($tableName)
	{
		\codecabin\Settings::__construct($tableName);
	}
	
	protected static function isIgnored($legacyName)
	{
		switch($legacyName)
		{
			case "google_maps_api_key":
			case "wpgmza_maps_engine":
			case "wpgmza_settings_use_timthumb":
				return true;
				break;
		}
		
		return false;
	}
	
	protected static function isCheckbox($legacyName)
	{
		switch($legacyName)
		{
			case "developer_mode":
			case "wpgmza_settings_map_striptags":
			case "wpgmza_settings_ugm_autoapprove":
			case "wpgmza_settings_ugm_email_new_marker":
			case "disable_compressed_path_variables":
			case "wpgmza_settings_disable_infowindows":
			case "wpgmza_gdpr_require_consent_before_load":
			case "wpgmza_gdpr_override_notice":
			case "wpgmza_settings_map_full_screen_control":
			case "wpgmza_settings_map_streetview":
			case "wpgmza_settings_map_zoom":
			case "wpgmza_settings_map_pan":
			case "wpgmza_settings_map_type":
			case "wpgmza_settings_map_scroll":
			case "wpgmza_settings_map_draggable":
			case "wpgmza_settings_map_clickzoom":
			case "wpgmza_settings_cat_display_qty":
			case "wpgmza_settings_remove_api":
			case "wpgmza_force_greedy_gestures":
			case "wpgmza_settings_infowindow_links":
			case "wpgmza_settings_infowindow_address":
			case "wpgmza_settings_markerlist_icon":
			case "wpgmza_settings_markerlist_link":
			case "wpgmza_settings_markerlist_title":
			case "wpgmza_settings_markerlist_address":
			case "wpgmza_settings_markerlist_category":
			case "wpgmza_settings_markerlist_description":
			case "wpgmza_do_not_enqueue_datatables":
			case "wpgmza_settings_carousel_markerlist_image":
			case "wpgmza_settings_carousel_markerlist_title":
			case "wpgmza_settings_carousel_markerlist_icon":
			case "wpgmza_settings_carousel_markerlist_address":
			case "wpgmza_settings_carousel_markerlist_description":
			case "wpgmza_settings_carousel_markerlist_marker_link":
			case "wpgmza_settings_carousel_markerlist_directions":
			case "carousel_lazyload":
			case "carousel_autoheight":
			case "carousel_pagination":
			case "carousel_navigation":
			case "wpgmza_prevent_other_plugins_and_theme_loading_api":
			case "disable_autoptimize_compatibility_fix":
			case "enable_live_tracking":
			case "wpgmza_near_vicinity_control_enabled":
			case "marker_separator_use_legacy_module":
			case "marker_separator_animate":
				return true;
				break;
		}
		
		return false;
	}
	
	public static function getRemappedInfoWindowType($legacyValue)
	{
		switch((int)$legacyValue)
		{
			case 0:
				return "default";
				break;
				
			case 1:
				return "modern";
				break;
			
			case 2:
				return "modern-plus";
				break;
				
			case 3:
				return "circular";
				break;
		}
		
		return "inherit";
	}
	
	public function jsonSerialize()
	{
		if(Settings::$useLegacySettings)
			$json = \codecabin\Settings::jsonSerialize();
		else
			$json = (object)array();
		
		$json = (object)array_merge((array)$json, (array)$this->getRemappedSettings());
		
		return $json;
	}
	
	protected function getRemappedSettings()
	{
		$remapped = array();
		
		foreach($this as $legacyName => $legacyValue)
		{
			if(Settings::isIgnored($legacyName))
				continue;
			
			$key	= $this->getRemappedName($legacyName);
			$value	= $this->getRemappedValue($legacyName, $legacyValue);
			
			$remapped[$key] = $value;
		}
		
		ksort($remapped);
		
		return $remapped;
	}
	
	protected function getRemappedName($legacyName)
	{
		$noPrefix		= preg_replace("/^(wpgm(za|aps)_)?(settings_)?/", "", $legacyName);
		
		$camelCase		= str_replace(' ', '', ucwords(str_replace('_', ' ', $noPrefix)));
		$camelCase[0]	= strtolower($camelCase[0]);
		
		$result			= $camelCase;
		
		$corrections	= array(
		
			'/([iI])nfowindow/'						=> '$1nfoWindow',
			'/([fF])ontawesome/'					=> '$1ontAwesome',
			'/mapOpenMarkerBy/'						=> 'openInfoWindowEvent',
			'/([aA])utoapprove/'					=> '$1utoApprove',
			'/mapStriptags/'						=> 'ugmStripTags',
			'/infoWindowWidth/'						=> 'infoWindowMaxWidth',
			'/(i)(mage(Resizing|Width|Height))/'	=> 'infoWindowI$2',
			'/defaultItems/'						=> 'markerListingPageSize',
			'/carouselMarkerlistTheme/'				=> 'carouselTheme',
			'/filterbycatType/'						=> 'categoryFilterDisplay',
			'/catLogic/'							=> 'categoryFilteringLogic',
			'/iwType/'								=> 'infoWindowType',
			'/catDisplayQty/'						=> 'categoryShowMarkerCount',
			
			'/mapFullScreenControl/'				=> 'disableFullScreenControl',
			'/mapStreetview/'						=> 'disableStreetViewControl',
			'/map(Zoom|Pan|Type)/'					=> 'disable$1Control',
			'/mapScroll/'							=> 'disableMouseWheelZoom',
			'/mapClickzoom/'						=> 'disableDoubleClickZoom',
			'/mapDraggable/'						=> 'disableDragPanning',
			
			'/markerlist(Icon|Link|Title|Address|Category|Description)/'				=> 'hideMarkerListing$1',
			'/carouselMarkerlist(Image|Title|Icon|Address|Description|Directions)/'		=> 'hideCarouselMarkerListing$1',
			'/carouselMarkerlistMarkerLink/'											=> 'hideCarouselMarkerListingLink',
			
			'/carousel(Pagination|Navigation)/'		=> 'enableCarousel$1',
			'/carousel(Lazyload)/'					=> 'enableCarouselLazyLoad',
			'/carousel(Autoheight)/'				=> 'enableCarouselAutoHeight'
			
		);
		
		foreach($corrections as $pattern => $replacement)
			$result = preg_replace($pattern, $replacement, $result);
		
		return $result;
	}
	
	protected function getRemappedValue($legacyName, $legacyValue)
	{
		switch($legacyName)
		{
			case 'wpgmza_settings_marker_pull':
				return ($legacyValue == 1 ? 'xml' : 'database');
				break;
			
			case 'wpgmza_settings_map_open_marker_by':
				return ($legacyValue == 2 ? 'hover' : 'click');
				break;
			
			case 'wpgmza_settings_filterbycat_type':
				return ($legacyValue == 2 ? 'checkboxes' : 'dropdown');
				break;
			
			case 'wpgmza_settings_cat_logic':
				return ($legacyValue == 1 ? 'and' : 'or');
				break;
			
			case 'wpgmza_iw_type':
				return Settings::getRemappedInfoWindowType($legacyValue);
				break;
		}
		
		if(Settings::isCheckbox($legacyName))
		{
			if(empty($legacyValue))
				return false;
			
			return ($legacyValue == "yes" || $legacyValue == "on" || $legacyValue == 1);
		}
		
		return $legacyValue;
	}
}