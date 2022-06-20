<?php

namespace WPGMZA\UI;

class Admin extends \WPGMZA\Factory
{
	public function __construct()
	{
		add_action( 'admin_menu', array($this, 'onAdminMenu') );
		add_action( 'admin_enqueue_scripts', array($this, 'onAdminEnqueueScripts') );
	}
	
	public function onAdminEnqueueScripts()
	{
		global $wpgmza;
		
		$wpgmza->loadScripts(false);
	}

	public function onAdminMenu()
	{
		global $wpgmza;
		global $wpgmza_pro_version;
		
		if(!empty($wpgmza_pro_version) && version_compare($wpgmza_pro_version, '8.1.0', '<'))
		{
			return wpgmaps_admin_menu();
		}
				
		$access_level = $wpgmza->getAccessCapability();
		
		add_menu_page(
			'WPGoogle Maps', 
			__('Maps', 'wp-google-maps'), 
			$access_level, 
			'wp-google-maps-menu', 
			'WPGMZA\\UI\\legacy_on_main_menu',
			WPGMZA_PLUGIN_DIR_URL . "images/menu-icon.png"
		);

	    /* Developer Hook (Action) - Add submenu items before defaults */     
		do_action("wpgmza_admin_ui_menu_registered");
		
		add_submenu_page(
			'wp-google-maps-menu', 
			'WP Go Maps - Settings', 
			__('Settings', 'wp-google-maps'), 
			$access_level,
			'wp-google-maps-menu-settings',
			'WPGMZA\\UI\\legacy_on_sub_menu',
			1
		);

		if(!$wpgmza->internalEngine->isLegacy()){
			add_submenu_page(
				'wp-google-maps-menu', 
				'WP Go Maps - Styling', 
				__('Styling', 'wp-google-maps'), 
				$access_level,
				'wp-google-maps-menu-styling',
				'WPGMZA\\UI\\legacy_on_sub_menu',
				2
			);			
		}
		
		add_submenu_page(
			'wp-google-maps-menu',
			'WP Go Maps - Support',
			__('Support','wp-google-maps'),
			$access_level ,
			'wp-google-maps-menu-support',
			'WPGMZA\\UI\\legacy_on_sub_menu',
			9
		);

		/* Developer Hook (Action) - Add submenu items after defaults */     
		do_action("wpgmza_admin_ui_menu_items_added");
	}
	
	public function onMainMenu()
	{
		global $wpgmza;
		
		$action = (isset($_GET['action']) ? $_GET['action'] : null);
		
		/* Developer Hook (Filter) - Alter the primary meny action */
		$action = apply_filters("wpgmza_admin_ui_menu_current_action", $action);
		
	    /* Developer Hook (Action) - Render content before page output, on any main menu item page */     
		do_action("wpgmza_admin_ui_render_content_before");
		if(!empty($action)){
	    	/* Developer Hook (Action) - Render content before page output, on specific action page */     
			do_action("wpgmza_admin_ui_render_{$action}_before");
		}

		switch($action)
		{
			case "welcome_page":
				$document = new \WPGMZA\DOMDocument();
				$document->loadPHPFile($wpgmza->internalEngine->getTemplate('welcome.html.php'));
				echo $document->html;
				break;
			
			case "credits":
				$document = new \WPGMZA\DOMDocument();
				$document->loadPHPFile($wpgmza->internalEngine->getTemplate('credits.html.php'));
				echo $document->html;
				break;

			case "newsletter_opt_in":
				/* This block only runs if the user opts-in to the newsletter */
				$document = new \WPGMZA\DOMDocument();
				$document->loadPHPFile($wpgmza->internalEngine->getTemplate('newsletter-opt-in.html.php'));
				echo $document->html;
				break;

			case "installer":
				$page = \WPGMZA\InstallerPage::createInstance();
				echo $page->html;
				break;

			default:
				
				if($action == 'edit'){					
					$page = \WPGMZA\MapEditPage::createInstance();
				} else if ($action == 'create-map-page'){
					$page = \WPGMZA\MapEditPage::createMapPage();
				} else {
					$page = \WPGMZA\MapListPage::createInstance();
				}
				
				echo $page->html;
				
				break;
		}

		if(!empty($action)){
	    	/* Developer Hook (Action) - Render content after page output, on specific action page */     
			do_action("wpgmza_admin_ui_render_{$action}_after");
		}
	    /* Developer Hook (Action) - Render content after page output, on any main menu item page */     
		do_action("wpgmza_admin_ui_render_content_after");

		
		$document = new \WPGMZA\DOMDocument();
		$document->loadPHPFile($wpgmza->internalEngine->getTemplate('footer.html.php'));
		echo $document->html;

	    /* Developer Hook (Action) - Legacy backwards compatibility hook for older version content */     
		do_action("wpgmza_check_map_editor_backwards_compat");
	}
	
	public function onSubMenu()
	{

		global $wpgmza;

	    /* Developer Hook (Action) - Render content before page output, on any sub menu item page */     
		do_action("wpgmza_admin_ui_render_content_before");
		$pageSlugged = !empty($_GET['page']) ? str_replace("wp-google-maps-menu-", "", $_GET['page']) : false;
		if(!empty($pageSlugged)){
	    	/* Developer Hook (Action) - Render content before page output, on specific slugged page */     
			do_action("wpgmza_admin_ui_render_{$pageSlugged}_before");
		}
		
		switch($_GET['page'])
		{
			case 'wp-google-maps-menu-settings':
				$page = \WPGMZA\SettingsPage::createInstance();
				echo $page->html;
				break;

			case 'wp-google-maps-menu-styling':
				$page = \WPGMZA\StylingPage::createInstance();
				echo $page->html;
				break;
			
			case 'wp-google-maps-menu-support':
				$document = new \WPGMZA\DOMDocument();
				$document->loadPHPFile($wpgmza->internalEngine->getTemplate('support.html.php'));

				$systemInfo = new \WPGMZA\SystemInfo();

				if($container = $document->querySelector('.system-info')){
					$container->appendText($systemInfo->compile());
				}

				echo $document->html;
				break;
		}

		if(!empty($pageSlugged)){
	    	/* Developer Hook (Action) - Render content after page output, on specific slugged page */     
			do_action("wpgmza_admin_ui_render_{$pageSlugged}_after");
		}
	    /* Developer Hook (Action) - Render content after page output, on any sub menu item page */     
		do_action("wpgmza_admin_ui_render_content_after");

	}
}

function legacy_on_main_menu()
{
	global $wpgmza;
	$wpgmza->adminUI->onMainMenu();
}

function legacy_on_sub_menu()
{
	global $wpgmza;
	$wpgmza->adminUI->onSubMenu();
}


