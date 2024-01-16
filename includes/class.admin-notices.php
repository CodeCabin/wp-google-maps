<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class AdminNotices {
	public $dynamicTitles;
	public $dynamicMessages;

	/**
	 * Constructor 
	*/
	public function __construct(){
		global $wpgmza;

		/**
		 * Dynamic notices are declared here, this means they can be changed without altering DB store
		 * 
		 * This doesn't stop you from registering your own messages using the create method, but it allows logic blocks to be build in to change these messages on the fly
		*/
    
		/* Developer Hook (Filter) - Register default dynamic titles for the admin notice system */
		$this->dynamicTitles = apply_filters("wpgmza_admin_persistent_notices_dynamic_titles", 
			array(
				"switch_engines" => __("Welcome to Atlas Novus", "wp-google-maps"),
				"disable_backups" => __("Automatic Backups Disabled", "wp-google-maps")
			)
		);

		
		/* Developer Hook (Filter) - Register default dynamic messages for the admin notice system */
		$this->dynamicMessages = apply_filters("wpgmza_admin_persistent_notices_dynamic_messages", 
			array(
				"switch_engines" => __("You're using our Atlas Novus build, which includes exciting new features and improvements. If you are experiencing issues, remember you can switch to the legacy build at any time from the settings area.", "wp-google-maps"),
				"disable_backups" => __("We've disabled automatic backups due to large marker counts in your database. You can still create manual backups as needed, or enable automatic backups if you are sure your server can process these requests.", "wp-google-maps")
			)
		);


		if($wpgmza->internalEngine->isLegacy()){
			$this->dynamicTitles['switch_engines'] = __("Try Atlas Novus", "wp-google-maps");

			$this->dynamicMessages['switch_engines'] = __("You're using our Legacy build, try our new Atlas Novus build for exciting new features, improved interface and better performance. You can switch at any time from the settings area.", "wp-google-maps");
		}

		/** 
		 * Should we register default notices here as well? I am not sure 
		 * 
		 * Gut says no, but for now this makes more sense than doing it inline
		*/
		if(!empty($wpgmza->settings->internal_engine)){
			/**
			 * This initial swap notice detracts from the first-time experience, so for the moment it has been disabled for new users 
			 * 
			 * Users can still swap via the settings area though
			 */

			/*
			$this->create('switch_engines', 
				array(
					'link' => 'admin.php?page=wp-google-maps-menu-settings',
					'link_label' => __("Go to Settings", "wp-google-maps"),
					'ajax_action' => 'swap_internal_engine',
					'ajax_label' => __("Switch Now", "wp-google-maps"),
					'title' => 'switch_engines'
				)
			);
			*/
		}

    	/* Developer Hook (Action) - Create additional persistent notices, be mindful of conditional creation */     
		do_action("wpgmza_admin_persistent_notices_create_defaults");

		add_action('wp_ajax_wpgmza_dismiss_persistent_notice', array($this, 'dismissFromPostAjax'));
		add_action('wp_ajax_wpgmza_persisten_notice_quick_action', array($this, 'processBackgroundAction'));
	}

	/**
	 * Create a persistent notice
	 * 
	 * This means a notice which can be dismissed, scheduled, and reactivated if/when necessary
	 * 
	 * @param string $slug The name for the notice, which will be ignored if it already exists
	 * @param array|object $options The options for the notice
	 * 
	 * @return void
	*/
	public function create($slug, $options = false){
		global $wpdb, $WPGMZA_TABLE_NAME_ADMIN_NOTICES;

		$slug = $this->cleanSlug($slug);
		$exists = $this->get($slug, array('id'));
		if(empty($exists)){
			$data = array(
				'name' => $slug,
				'message' => false,
				'active_date' => date('Y-m-d H:i:s'),
				'dismissed' => 0
			);

			$data = $this->buildData($data, $options);
			if(empty($data['message'])){
				if(!empty($this->dynamicMessages[$slug])){
					/* Missing a manually defined message, but we have a dynamic message linked to the slug. This means it will be replaced when it is displayed */
					$data['message'] = $slug;
				}
			}

			if(!empty($data['message'])){
				$types = $this->getPlaceholders($data);
				$columns = implode(",", array_keys($data));

				$sql = "INSERT INTO `{$WPGMZA_TABLE_NAME_ADMIN_NOTICES}` ({$columns}) VALUES ({$types})";

				try{
					$stmt = $wpdb->prepare($sql, $data);
					$result = $wpdb->query($stmt);
				} catch (\Exception $ex){
					// Do nothing
				} catch (\Error $err){
					// Say nothing
				}
			}
		}
	}

	/**
	 * Update a persistent notice
	 * 
	 * This allows you to update the options of the notice on a deeper level
	 * 
	 * @param string $slug The name of the notice
	 * @param array|object $options The options to be updated, unset values will be retained, meaning you only set what you want to change
	 * 
	 * @return void
	*/
	public function update($slug, $options = false){
		global $wpdb, $WPGMZA_TABLE_NAME_ADMIN_NOTICES;

		$slug = $this->cleanSlug($slug);
		$exists = $this->get($slug, array('id'));
		if(!empty($exists) && !empty($exists->id)){
			$data = array();
			$predefinedColumns = array('message', 'active_date', 'dismissed');
			if(!empty($options) && (is_array($options) || is_object($options))){
				foreach($options as $key => $value){
					if(in_array($key, $predefinedColumns)){
						$data[$key] = $value;
					}
				}
			}
			$data = $this->buildData($data, $options);

			if(!empty($data)){
				$types = $this->getPlaceholders($data, false);
				$set = array();

				$typeI = 0;
				foreach($data as $key => $value){
					$typeV = !empty($types[$typeI]) ? $types[$typeI] : '%s';
					$set[] = "$key=$typeV";
					$typeI ++;
				}

				$set = implode(", ", $set);
				$sql = "UPDATE `{$WPGMZA_TABLE_NAME_ADMIN_NOTICES}` SET {$set} WHERE `id` = %d";
				try {
					$data[] = intval($exists->id);
					$stmt = $wpdb->prepare($sql, $data);
					$result = $wpdb->query($stmt);
				} catch (\Exception $ex){
					// Do nothing
				} catch (\Error $err){
					// Say nothing
				}
			}		
		}
	}

	/**
	 * Get a specific notice, by it's slug
	 * 
	 * @param string $slug The name for the notice
	 * @param array $columns The columns you want to query
	 * 
	 * @return object
	*/
	public function get($slug, $columns = false){
		global $wpdb, $WPGMZA_TABLE_NAME_ADMIN_NOTICES;

		$columns = empty($columns) || !is_array($columns) ? '*' : implode(',', $columns);

		$sql = "SELECT {$columns} FROM `{$WPGMZA_TABLE_NAME_ADMIN_NOTICES}` WHERE `name` = '%s' LIMIT 1";
		$stmt = $wpdb->prepare($sql, array($slug));
		$result = $wpdb->get_results($stmt);

		if(!empty($result) && is_array($result)){
			return array_shift($result);
		} 
		return false;
	}

	/**
	 * Display the next X notices due to be shown
	 * 
	 * This method returns built HTML, which means it does not actively display/echo the output. This may seem confusing, but works better with DomDoc which we use everywhere else
	 * 
	 * @param int $max The maximum amount of notices to be shown, defaults to 1, but if set to 0 will show all due 
	 * 
	 * @return string
	*/
	public function displayNext($max = 1){
		global $wpdb, $WPGMZA_TABLE_NAME_ADMIN_NOTICES;
		$max = intval($max);

		$date =  date('Y-m-d H:i:s'); 
		$sql = array();
		$sql[] = "SELECT * FROM `{$WPGMZA_TABLE_NAME_ADMIN_NOTICES}` WHERE `dismissed` = 0 AND `active_date` <= '{$date}' ORDER BY `active_date` ASC";
		if(!empty($max)){
			$sql[] = "LIMIT {$max} OFFSET 0";
		}
		$sql = implode(" ", $sql);

		$html = "";
		try {
			$result = $wpdb->get_results($sql);

			if(!empty($result) && is_array($result)){
				foreach($result as $notice){
					$html .= $this->html($notice);
				}
			}
		} catch (\Exception $ex){
			// Do nothing
		} catch (\Error $err){
			// Say nothing
		}

		return $html;
	}

	/**
	 * Display a specific notice, by it's slug, it will be ignored if it has been dismissed before, but you should be using 'displayNext'
	 * if you want a truly dynamic notice output, so use this only when necessary
	 * 
	 * This method returns built HTML, which means it does not actively display/echo the output. This may seem confusing, but works better with DomDoc which we use everywhere else
	 * 
	 * @param string $slug The name of the notice 
	 * 
	 * @return string
	*/
	public function display($slug){
		$notice = $this->get($slug);
		if(!empty($notice)){
			return $this->html($notice);
		}
		return "";
	}

	/**
	 * Dismiss a notice by it's slug
	 * 
	 * This is done by ajax usually, but can be called anywhere you need
	 * 
	 * @param string $slug The name of the notice
	 * 
	 * @return void
	*/
	public function dismiss($slug){
		$this->update($slug, array('dismissed' => 1));
	}

	/**
	 * Delay a notice 
	 * 
	 * This allows you to set an amount of days to shit the 'active date' by, which effectively allows the notice to be delays
	 * 
	 * @param string $slug The name of the notice
	 * @param int $days The amount of days to delay by 
	 * 
	 * @return void
	*/
	public function delay($slug, $days = 7){
		$notice = $this->get($slug, array('id', 'active_date'));
		if(!empty($notice)){
			$date = strtotime($notice->active_date . " +{$days} day");
			$this->update($slug, array('active_date' => date('Y-m-d H:i:s', $date)));
		}
	}

	/**
	 * Delete a notice fully
	 * 
	 * This should only be done if you do not intend to use the slug again in the future, it's provided as a helper, 
	 * but really you should call dismiss for the notice if you don't want the notice to be recreated by other parts of the core
	 * 
	 * @param string $slug The name of the notice
	 * 
	 * @return void
	*/
	public function delete($slug){

	}

	/**
	 * Ajax relay for dismiss 
	 * 
	 * @return void
	*/
	public function dismissFromPostAjax(){
		if (empty($_POST['slug']) || empty($_POST['wpgmza_security']) || !wp_verify_nonce($_POST['wpgmza_security'], 'wpgmza_ajaxnonce')) {
			wp_send_json_error(__( 'Security check failed, import will continue, however, we cannot provide you with live updates', 'wp-google-maps' ));
		}

		$slug = sanitize_text_field($_POST['slug']);
		if (!empty($slug)){
			$this->dismiss($slug);
			wp_send_json_success('Complete');
		}

		wp_send_json_error('Could not complete');
	}

	/**
	 * Isolated background actions for persistent notices
	 * 
	 * @return void
	 */
	public function processBackgroundAction(){
		if (empty($_POST['relay']) || empty($_POST['wpgmza_security']) || !wp_verify_nonce($_POST['wpgmza_security'], 'wpgmza_ajaxnonce')) {
			wp_send_json_error(__( 'Security check failed, import will continue, however, we cannot provide you with live updates', 'wp-google-maps' ));
		}

		$relayAction = sanitize_text_field($_POST['relay']);
		if(!empty($relayAction)){
			switch($relayAction){
				case 'swap_internal_engine':
					global $wpgmza;
					$engine = $wpgmza->settings->internal_engine;
					if($engine === 'atlas-novus'){
						$engine = 'legacy';
					} else {
						$engine = 'atlas-novus';
					}

					$wpgmza->settings->internal_engine = $engine;
					break;
			}
		}

	    /* Developer Hook (Action) - Add processing for non standard background actions present in persistent notifications */     
		do_action("wpgmza_admin_notice_process_background_action", $relayAction);

		wp_send_json_success('Complete');
	}

	/**
	 * Converts a notice dataset to html using DOMDocument
	 * 
	 * @param object $data The data from the database
	 * 
	 * @return string
	*/
	private function html($data){
		global $wpgmza;

		$html = "";
		if(is_object($data)){
			$notice = new DOMDocument();
			$notice->loadPHPFile($wpgmza->internalEngine->getTemplate('admin-notice-persistent.html.php'));

			if(!empty($data->message)){
				/* Get link to wrapper, and lock in the ID */
				$wrapper = $notice->querySelector('.wpgmza-persistent-notice');
				if(!empty($data->id)){
					$wrapper->setAttribute('data-id', intval($data->id));
				}

				if(!empty($data->name)){
					$wrapper->setAttribute('data-slug', $data->name);
				}

				/* Additional options */

				if(!empty($data->options)){
					try{
						$decoded = json_decode($data->options);
						$data->options = $decoded;
					} catch (\Exception $ex){
						// Do nothing
					} catch (\Error $err){
						// Say nothing
					}
				}

				$title = $notice->querySelector('h2');
				$link = $notice->querySelector('a[data-link]');
				$ajax = $notice->querySelector('a[data-ajax]');
				if(!empty($data->options) && is_object($data->options)){
					if(!empty($data->options->title)){
						if(!empty($this->dynamicTitles[$data->options->title])){
							$data->options->title = $this->dynamicTitles[$data->options->title];
						}

						$title->appendText($data->options->title);
					} else {
						$title->remove();
					}

					if(!empty($data->options->link)){
						$link->setAttribute('href', admin_url($data->options->link));

						if(!empty($data->options->link_label)){
							$link->appendText($data->options->link_label);
						}
					} else {
						$link->remove();
					}

					if(!empty($data->options->ajax_action)){
						$ajax->setAttribute('href', "#");
						$ajax->setAttribute('data-ajax-action', $data->options->ajax_action);

						if(!empty($data->options->ajax_label)){
							$ajax->appendText($data->options->ajax_label);
						}
					} else {
						$ajax->remove();
					}

					if(!empty($data->options->class) && !empty($wrapper)){
						$wrapper->addClass($data->options->class);
					}
				} else {
					$title->remove();
					$link->remove();
					$ajax->remove();
				}

				/* Remap the slugged name to a dynamic message */
				if(strpos(" ", $data->message) === FALSE){
					/* No spaces, likely a slugged name */
					if(!empty($this->dynamicMessages[$data->message])){
						$data->message = $this->dynamicMessages[$data->message];
					}
				}				

				/* Populate */
				$notice->populate($data);
				$html = $notice->html;				
			}
		}

		/* Developer Hook (Filter) - Alter final output of an admin notice, passes HTML and Data */
		return apply_filters("wpgmza_admin_persistent_notice", $html, $data);
	}

	/**
	 * Clean up a slug 
	 * 
	 * @param string $slug The slug passed
	 * 
	 * @return string
	*/
	private function cleanSlug($slug){
		return strtolower(str_replace(array(" ", "-"), "_", trim($slug)));
	}

	/**
	 * Helper to populate options into a 'data' array
	 * 
	 * This allows for Crud like behavior, without needing to use crud here
	 * 
	 * Primary reason we aren't using crud, I suppose, is because of the looseness of the get queries, although we could probably have gone that route
	 * this is a simple class, so it doesn't need that much backbone, yet at least
	 * 
	 * @param array $data The started data, which options will be driven into
	 * @param array $options The custom data being pushed in
	 * @param string $arbitraryKey The default key in `data` to be set when no base column names exist, it is encoded at the end (defaults to 'options')
	 * 
	 * @return array
	*/
	private function buildData($data, $options = false, $arbitraryKey = 'options'){
		if(!empty($options) && (is_array($options) || is_object($options))){
			foreach($options as $key => $value){
				if(isset($data[$key])){
					$data[$key] = $value;
				} else {
					/* Add to arbitrary key */
					if(!isset($data[$arbitraryKey])){
						$data[$arbitraryKey] = array();
					}

					$data[$arbitraryKey][$key] = $value;
				}
			}
		}

		if(isset($data[$arbitraryKey])){
			if(is_array($data[$arbitraryKey]) || is_object($data[$arbitraryKey])){
				$data[$arbitraryKey] = json_encode($data[$arbitraryKey]);
			}
		}

		return $data;
	}

	/**
	 * Get query placeholders for a data array
	 * 
	 * @param array $data The data being tested 
	 * 
	 * @return array
	*/
	private function getPlaceholders($data, $implode = true){
		$placeholders = array();
		if(!empty($data) && is_array($data)){
			foreach($data as $value){
				$type = "%s";
				if(is_numeric($value)){
					$type = "%d";
				}

				$placeholders[] = $type;
			}
		}

		return $implode ? implode(",",$placeholders) : $placeholders;
	}
}