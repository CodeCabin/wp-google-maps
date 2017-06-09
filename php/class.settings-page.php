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
		
		$this->form = $this->querySelector('form');
		$this->form->populate(Plugin::$settings);
		
		add_action('admin_post_wmgpza_save_settings', array($this, 'onFormSubmitted'));
		
		wp_enqueue_script('jquery-ui-core');
		wp_enqueue_script('jquery-ui-slider');
		wp_enqueue_script('jquery-ui-tabs');
		
		if(!empty($_POST))
			$this->onFormSubmitted();
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