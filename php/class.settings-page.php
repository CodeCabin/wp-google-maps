<?php

namespace WPGMZA;

require_once(WPGMZA_DIR . 'php/class.admin-page.php');

use Smart;

class SettingsPage extends AdminPage
{
	protected $form;
	
	public function __construct()
	{
		Smart\Document::__construct();
		$this->loadPHPFile(WPGMZA_DIR . 'html/settings-page.html');
		
		do_action('wpgmza_init_settings_page', $this);
		
		$this->form = $this->querySelector('form');
		$this->form->populate(Plugin::$settings);
		
		add_action('admin_post_wmgpza_save_settings', array($this, 'onFormSubmitted'));
		
		wp_enqueue_script('jquery-ui-core');
		wp_enqueue_script('jquery-ui-slider');
		wp_enqueue_script('jquery-ui-tabs');
		
		wp_enqueue_style('wpgmza_v7_style', WPGMZA_BASE . 'css/v7-style.css');
		
		// Remodal dialog
		wp_enqueue_script('remodal', WPGMZA_BASE . 'lib/remodal.min.js');
		wp_enqueue_style('remodal', WPGMZA_BASE . 'lib/remodal.css');
		wp_enqueue_style('remodal-default-theme', WPGMZA_BASE . 'lib/remodal-default-theme.css');
		
		if(!empty($_POST))
			$this->onFormSubmitted();

		do_action('wpgmza_basic_settings_page_enqueue_scripts');
	}
	
	/**
	 * Process admin POST
	 * @return void
	 */
	protected function onFormSubmitted()
	{
		$form = $this->querySelector('form');
		
		if(!$form->validate())
			return;
		
		foreach($_POST as $key => $value)
		{
			if($key == 'action')
				continue;
			
			Plugin::$settings->{$key} = stripslashes($value);
		}
		
		$checkboxes = $this->querySelectorAll('input[type="checkbox"][name]');
		foreach($checkboxes as $input)
		{
			$name = $input->getAttribute('name');
			Plugin::$settings->{$name} = isset($_POST[$name]);
		}
		
		wp_redirect($_SERVER['REQUEST_URI']);
		exit;
	}
}

?>