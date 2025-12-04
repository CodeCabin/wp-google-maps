<?php

namespace WPGMZA\UI;

class Admin extends \WPGMZA\Factory
{
	public function __construct()
	{
		add_action( 'admin_menu', array($this, 'onAdminMenu') );
		add_action( 'admin_enqueue_scripts', array($this, 'onAdminEnqueueScripts') );

		add_action( 'admin_init', array($this, 'onAdminInit') );

		add_action( 'wpgmza_admin_ui_render_footer_after', array($this, 'onAdminFooter'), 10, 1);
	}
	
	public function onAdminEnqueueScripts()
	{
		global $wpgmza;
		
		$wpgmza->loadScripts(false);
	}

	public function onAdminInit(){
		add_filter( 'wp_refresh_nonces', array($this, 'onAdminRefreshNonces') );
	}

	public function onAdminRefreshNonces($nonces){
		if(!empty($_POST) && !empty($_POST['screen_id'])){
			if(strpos($_POST['screen_id'], 'wp-google-maps') !== FALSE){
				/* Looking at a WP Go Maps Related page */
				$action = admin_url('admin-post.php');
				$nonces['wpgmza_nonce'] = wp_create_nonce("wpgmza_$action");
			}
		}
		return $nonces;
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

		if(!$wpgmza->isProVersion()){
			/* Upsell menu item */
			$proMenuTitle = __("Premium", "wp-google-maps");
			$proMenuTitle .= " <span class='update-plugins'><span class='update-count'>" . __("Upgrade", "wp-google-maps") . "</span></span>";
			
			add_submenu_page(
				'wp-google-maps-menu',
				"WP Go Maps - Pro Add-on",
				$proMenuTitle,
				$access_level,
				'wp-google-maps-menu-pro-features',
				'WPGMZA\\UI\\legacy_on_sub_menu',
				19
			);
		}

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

		/* Developer Hook (Action) - Render before our footer output */     
		do_action("wpgmza_admin_ui_render_footer_before", $action);

		/* Footer */
		$document = new \WPGMZA\DOMDocument();
		$document->loadPHPFile($wpgmza->internalEngine->getTemplate('footer.html.php'));
		echo $document->html;

		/* Developer Hook (Action) - Render after our footer output */  
		do_action("wpgmza_admin_ui_render_footer_after", $action);

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
			case 'wp-google-maps-menu-pro-features':
				$document = new \WPGMZA\DOMDocument();
				$document->loadPHPFile($wpgmza->internalEngine->getTemplate('pro-features.html.php'));

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

	public function onAdminFooter($action){
		global $wpgmza;
		if(empty($action)){
			if(!empty($_GET['page']) && $_GET['page'] === 'wp-google-maps-menu'){
				if(!$wpgmza->isProVersion() && !$wpgmza->internalEngine->isLegacy()){
					/* This is the main map list page, and we have hooked into the footer. User is not using pro, show demos */
					$document = new \WPGMZA\DOMDocument();
					$document->loadPHPFile($wpgmza->internalEngine->getTemplate('demo-showcase.html.php'));
					
					/* Randomly remove some of the demos */
					$demoCards = $document->querySelectorAll('[data-demo-showcase]');
					if(!empty($demoCards)){
						$maxDemos = count($demoCards) - 1; 
						$rangedIndexes = range(0, $maxDemos);
						shuffle($rangedIndexes);
						$randomIndexes = array_slice($rangedIndexes, 0, 3);
						
						foreach($demoCards as $index => $demoCard){
							if(!in_array($index, $randomIndexes)){
								$demoCard->remove();
							}
						}
					}

					echo $document->html;
				}
			}
		}
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


