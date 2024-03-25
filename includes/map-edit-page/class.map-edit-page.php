<?php

namespace WPGMZA;

class MapEditPage extends Page
{
	protected $_document;
	protected $form;
	
	public function __construct($map_id = null) {
		global $wpgmza;

		if($map_id === null)
			$map_id = intval($_REQUEST['map_id']);

		$map = $this->map = Map::createInstance($map_id);
		$map->element->setInlineStyle('min-height', '400px');	// Safeguard for map edit page zero height
		$map->element->setAttribute('id', 'wpgmza_map');		// Legacy HTML
		
		// Load the document
		$this->_document = $document = new DOMDocument();
		$this->_document->loadPHPFile($wpgmza->internalEngine->getTemplate('map-edit-page/map-edit-page.html.php'));
		
		// Add-on span
		if(!$wpgmza->isProVersion())
			$document->querySelectorAll("#wpgmza-title-label, .add-new-editor")->remove();
		
		// HTTP referrer input
		if($element = $document->querySelector("input[name='http_referer']"))
			// NB: Used to be PHP_SELF. We're going to alter this to the current URI. Shouldn't be used, will need checking
			$element->setAttribute('value', $_SERVER['REQUEST_URI']);
		
		// Map ID
		if($element = $document->querySelector('#wpgmza_id'))
			$element->setAttribute('value', $map_id);
		
		// Shortcode
		if($element = $document->querySelector('.wpgmza_copy_shortcode'))
			$element->setAttribute('value', "[wpgmza id=\"$map_id\"]");
		
		// Version string
		if($element = $document->querySelector('.versions-text')){
			/* Build version standardized in InternalEngine - This allows it to be used in other locations, and extended by additional plugins */
			$buildVersion = $wpgmza->internalEngine->getBuildVersion();
			$element->import("(Build: {$buildVersion})");	
		}
			

		// Theme panel
		if($element = $document->querySelector('.wpgmza-theme-panel')){
			if($wpgmza->settings->engine != "open-layers"){
				$themePanel = new ThemePanel($map);
				$element->import($themePanel);
			} else {
				if(!$wpgmza->internalEngine->isLegacy()){
					$themePanel = new OLThemePanel($map);
					$element->import($themePanel);
				}
			}
		}
		
		// User interface style logic
		if($wpgmza->settings->user_interface_style == "legacy"){
			foreach($document->querySelectorAll("[data-require-legacy-user-interface-style='false']") as $element)
				$element->remove();
		} else {
			foreach($document->querySelectorAll("[data-require-legacy-user-interface-style='true']") as $element)
				$element->remove();
		}
		
		// Store locator radius dropdown
		if($element = $document->querySelector('.wpgmza-store-locator-default-radius'))
		{
			$suffix  = ($map->store_locator_distance == 1 ? __('mi', 'wp-google-maps') : __('km', 'wp-google-maps'));
			
			$default = 10;
			
			if(!empty($map->store_locator_default_radius))
				$default = $map->store_locator_default_radius;
			
			$radii = StoreLocator::DEFAULT_RADII;
			
			if(!empty($wpgmza->settings->wpgmza_store_locator_radii) && preg_match_all('/\d+/', $wpgmza->settings->wpgmza_store_locator_radii, $m))
				$radii = $m[0];
			
			foreach($radii as $radius)
			{
				$option = $document->createElement('option');
				
				$option->setAttribute('value', $radius);
				$option->appendText($radius);
				
				if($radius == $default)
					$option->setAttribute('selected', 'selected');
				
				$element->appendChild($option);
			}
			
			$element->parentNode->appendText($suffix);
		}

		// Anchor Controls
		$anchorControls = $document->querySelectorAll(".wpgmza-anchor-control");
		foreach($anchorControls as $control){
			$select = new UI\ComponentAnchorControl($control);
		}
		
		// Now populate from the map, we need to wait until now so that all the controls are ready
		// NB: Do NOT populate from the map when POSTing - because checkboxes will get stuck ON
		if($_SERVER["REQUEST_METHOD"] != "POST")
			@$document->populate($map);
		
		$document->populate(array(
			'map_id'			=> $map_id,
			'real_post_nonce'	=> wp_create_nonce('wpgmza')
		));
		
		// Form setup
		$this->form = $document->querySelector('form');
		$this->form->setAttribute('action', admin_url('admin-post.php'));
		$this->form->querySelector("input[name='redirect_to']")->setAttribute('value', $_SERVER['REQUEST_URI']);
		
		$this->addFormNonces();
		
		// The map itself
		$document->querySelector("#wpgmza-map-container")->import($map->element);
		
		// Feature accordions
		$containers = $document->querySelectorAll(".wpgmza-feature-accordion");
		
		foreach($containers as $container)
		{
			$featureTypePlural = rtrim(ucwords($container->getAttribute('id')), 's');
			$featureTypeSingle = preg_replace('/s$/', '', $featureTypePlural);
			
			// Panel
			$featurePanelClass = "WPGMZA\\{$featureTypeSingle}Panel";
			$panel = new $featurePanelClass($map_id);


			$container->querySelector('.wpgmza-feature-panel-container')->import($panel);
			


			// Table
			$featureTableClass = "WPGMZA\\Admin{$featureTypePlural}DataTable";
			
			if($this->isProFeatureType($featureTypePlural) && !$wpgmza->isProVersion()){
				//We require a more elegant solution. Move this to Pro entirely, to be addressed later
				continue;
			}

			$table = new $featureTableClass(array(
				'map_id' => $map_id
			));
			
			
			$document->querySelector("#wpgmza-table-container-".$featureTypePlural)->import($table->element);
		
		}

		if(empty($wpgmza->settings->wpgmza_google_maps_api_key) && $wpgmza->settings->engine == "google-maps"){
			$document->querySelector(".wpgmza-missing-key-notice")->removeClass('wpgmza-hidden');
		}

		$engineDialog = new MapsEngineDialog();
		@$document->querySelector("#wpgmza-map-container")->import($engineDialog->html());

		if(!$wpgmza->internalEngine->isLegacy()){
			$mapSelectDialog = new MapSelectDialog();
			@$document->querySelector(".wpgmza-wrap")->import($mapSelectDialog);


			$bulkMarkerEditorDialog = BulkMarkerEditorDialog::createInstance();
			@$document->querySelector(".wpgmza-wrap")->import($bulkMarkerEditorDialog->document);

			$editorTour = new MapEditorTour();
			if($editorTour->canTour()){
				@$document->querySelector(".wpgmza-wrap")->import($editorTour);
			}

		}

		/* This will be reworked into the page module, OR, into a dedicated method */
		$upsellParams = wpgmzaGetUpsellLinkParams("&");
		if(!empty($upsellParams)){
			$upsellLinks = $document->querySelectorAll('a[href^="https://www.wpgmaps.com/purchase-pro"]');
			foreach($upsellLinks as $link){
				$href = $link->getAttribute('href');
				if(strpos($href, $upsellParams) === FALSE){
					$href .= $upsellParams;
					$link->setAttribute('href', $href);
				}
			}
		}

		$this->applyEditorHooks();
		
		$this->addShortcodeIDs();

		$this->disableProFeatures();
		$this->hideSelectedProFeatures();
		$this->removeProMarkerFeatures();

		$this->handleEngineSpecificFeatures();
		
		$this->populateAdvancedMarkersPanel();
		
		/* Developer Hook (Action) - Alter output of the map edit page, passes DOMDocument for mutation */     
		do_action("wpgmza_map_edit_page_created", $document);
	}

	public function applyEditorHooks(){
		global $wpgmza;

		if($wpgmza->internalEngine->isLegacy()){
			return;
		}

		$groupings = $this->document->querySelectorAll(".wpgmza-editor .sidebar .grouping");
		if(!empty($groupings)){
			foreach($groupings as $group){
				if($group->hasAttribute('data-group')){
					$dataGroup = $group->getAttribute('data-group');
					if($navigation = $group->querySelector(".navigation")){
						/* Developer Hook (Filter) - Add new navigation items within existing eitor blocks, atlas novus only */
						$data = apply_filters("wpgmza-map-editor-navigation-{$dataGroup}", "");
						if(!empty($data)){
							$navigation->import($data);
						}
					}
					
					if($settings = $group->querySelector(".settings")){
						/* Developer Hook (Filter) - Add new settings within existing blocks, atlas novus only */
						$data = apply_filters("wpgmza-map-editor-settings-{$dataGroup}", "");
						if(!empty($data)){
							$settings->import($data);
						}
					}
				}
			}
		}

		if($settingsForm = $this->document->querySelector(".wpgmza-editor .wpgmza-map-settings-form")){
			/* 
			 * Note: Any new fields added within this hook will store directly to the maps setting object
			 * Meaning you do not need to add any storage processors
			*/
			/* Developer Hook (Filter) - Import values to your new components, raw import, atlast novus only */
			$data = apply_filters("wpgmza-map-editor-settings-blocks", "");
			if(!empty($data)){
				$settingsForm->import($data);
			}
		}

		if($sidebar = $this->document->querySelector('.wpgmza-editor .sidebar')){
			/*
			 * Note: Any new block fields added within this hook will not be stored automatically
			 * You will need to handle your own storage in this case
			*/
			/* Developer Hook (Filter) - Additional import control for sidebar, raw import, atlas novus only */
			$data = apply_filters("wpgmza-map-editor-sidebar-blocks", "");
			if(!empty($data)){
				$sidebar->import($data);
			}	
		}

	}



	public static function createMapPage() {
		if (isset($_GET) && $_GET['action'] == 'create-map-page' && isset($_GET['map_id'])) {
			
			// NB: Suggest using $this->map->id, global functions should be dropped
	    	$res = wpgmza_get_map_data(intval($_GET['map_id']));
	    	
	        // Set the post ID to -1. This sets to no action at moment
	        $post_id = -1;
	     
	        // Set the Author, Slug, title and content of the new post
	        $author_id = get_current_user_id();
	        if ($author_id) {
		        $slug = 'map';
		        $title = $res->map_title;
		        $content = '[wpgmza id="'.$res->id.'"]';
		        

		        // do we have this slug?
		        $args_posts = array(
				    'post_type'      => 'page',
				    'post_status'    => 'any',
				    'name'           => $slug,
				    'posts_per_page' => 1,
				);
				
				$loop_posts = new \WP_Query( $args_posts );
				if ( ! $loop_posts->have_posts() ) {
				    
				    // we dont
				    $post_id = wp_insert_post(
		                array(
		                    'comment_status'    =>   'closed',
		                    'ping_status'       =>   'closed',
		                    'post_author'       =>   $author_id,
		                    'post_name'         =>   $slug,
		                    'post_title'        =>   $title,
		                    'post_content'      =>  $content,
		                    'post_status'       =>   'publish',
		                    'post_type'         =>   'page'
		                )
		            );
		            echo '<script>window.location.href = "post.php?post='.intval($post_id).'&action=edit";</script>';
		            return;
				} else {
				    $loop_posts->the_post();
				    
				    // we do!
				    $post_id = wp_insert_post(
		                array(
		                    'comment_status'    =>   'closed',
		                    'ping_status'       =>   'closed',
		                    'post_author'       =>   $author_id,
		                    'post_name'         =>   $slug."-".$res->id,
		                    'post_title'        =>   $title,
		                    'post_content'      =>  $content,
		                    'post_status'       =>   'publish',
		                    'post_type'         =>   'page'
		                )
		            );
		            
		            echo '<script>window.location.href = "post.php?post='.intval($post_id).'&action=edit";</script>';
		            return;
				}
			} else {
				echo "There was a problem creating the map page.";
				return;
			}
	            
	        return;
	    }
	}
	
	// NB: This function is static because only the >= 8.1.0 admin UI manager will instantiate MapEditPage. Called by ScriptLoader.
	public static function enqueueLegacyScripts()
	{
		// NB: Legacy map edit page JavaScript support. This was historically called from basic, which is why it resides here now.
		add_action('admin_head', 'wpgmaps_admin_javascript_pro');
	}
	
	protected function removeProMarkerFeatures()
	{
		$this->document->querySelectorAll(".wpgmza-marker-panel .wpgmza-pro-feature")->remove();
	}
	
	protected function handleEngineSpecificFeatures()
	{
		global $wpgmza;
		
		if($wpgmza->settings->engine == "open-layers")
			$this->document->querySelectorAll("[data-wpgmza-require-engine='google-maps']")->remove();
		else
			$this->document->querySelectorAll("[data-wpgmza-require-engine='open-layers']")->remove();
	}
	
	protected function populateAdvancedMarkersPanel() {
		global $wpgmza;

		$panel		= new MarkerPanel($this->map->id);
		if($wpgmza->internalEngine->isLegacy()){
			/* Legacy */
			$container	= $this->document->querySelector("#advanced-markers");
			
			$source		= $panel->querySelector(".wpgmza-feature-panel.wpgmza-marker-panel");
			
			$source->removeAttribute("data-wpgmza-feature-type");
			$source->removeAttribute("class");
			
			$container->import($source);
			
			$container->querySelectorAll("input, select, textarea")
				->setAttribute("disabled", "disabled")
				->setAttribute("title", __('Enable this feature with WP Go Maps - Pro add-on', 'wp-google-maps'));
		} else {
			/* Atlas Novus */
			$panel->querySelectorAll("input, select, textarea")
				->setAttribute("disabled", "disabled")
				->setAttribute("title", __('Enable this feature with WP Go Maps - Pro add-on', 'wp-google-maps'));
			
				
			

			$panel->querySelectorAll('button')->remove();
			$panel->querySelectorAll('.wpgmza-css-state-block')->remove();
			$panel->querySelectorAll('.wpgmza-marker-gallery-input-container')->remove();

			$elements = $panel->querySelectorAll('.wpgmza-marker-panel .wpgmza-pro-feature');
			$container = $this->document->querySelector(".wpgmza-marker-panel");
			
			foreach($elements as $element){
				/* This shouldnt be necessary again, but for some reason it is */
				$element->querySelectorAll('input,select')->setAttribute('disabled', 'disabled');
				$container->import($element);
			}
		}

	}
	
	public function onSubmit()
	{
		$ignore = array(
			'redirect_to',
			'shortcode',
			'nonce',
			'wpgmza_savemap'
		);
		
		// Check nonces
		if(!$this->isNonceValid($this->form, $_POST['nonce']))
			throw new \Exception("Invalid nonce");
		
		// Copy the data
		$data = stripslashes_deep($_POST);

		// Don't write "redirect_to" to the map settings
		foreach($ignore as $key)
			unset($data[$key]);

		// Patch for XSS report (Will be rebuilt later)
		if(!empty($data['map_title'])){
			$data['map_title'] = sanitize_text_field($data['map_title']);
		}
		
		// Fill out the form
		$this->form->populate($data);
		
		// Get the form data back
		$data = $this->form->serializeFormData();
		
		// Set the data on the map settings
		$this->map->set($data);
		
		// Done! Redirect to the specified URL
		wp_redirect(wp_strip_all_tags($_POST['redirect_to']));
	}

	/** 
	 * Simple method to flag pro-only features to the basic
	 *
	 * This doesn't actually control handling logic, just stops the datatables from being initialized if a feature is missing from the build
	 * 
	 * @param string $feature The feature being processed, in it's singular name
	 * 
	 * @return bool
	*/
	public function isProFeatureType($feature){
		$feature = strtolower($feature);
		$features = array("heatmap", "imageoverlay");
		if(in_array($feature, $features)){
			return true;
		}
		return false;
	}

	/**
	 * Finds additional shortcodes in the editor and hydrates their ID's via button nested spans
	 * 
	 * @return void
	*/
	public function addShortcodeIDs(){
		$shortcodes = $this->document->querySelectorAll('.wpgmza-shortcode-button');
		foreach($shortcodes as $shortcode){
			$span = $shortcode->querySelector('span');
			if($span){
				$span->appendText($this->map->id);
			}
		}
	}

}

add_action('admin_post_wpgmza_save_map', function() {
	
	$mapEditPage = MapEditPage::createInstance();
	$mapEditPage->onSubmit();
	
});
