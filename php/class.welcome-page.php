<?php

namespace WPGMZA;

class WelcomePage extends \Smart\Document
{
	public function __construct()
	{
		\Smart\Document::__construct();
		
		$this->loadPHPFile(WPGMZA_DIR . 'html/welcome-page.html.php');
		
		if(isset($_POST['wpgmza_save_feedback']))
			$this->sendFeedback();
	}
	
	/**
	 * Sends feedback on the welcome page
	 * @return void
	 */
	public function sendFeedback()
	{
		$request_url = "http://www.wpgmaps.com/apif/rec.php";
		
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $request_url);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $_POST);
		curl_setopt($ch, CURLOPT_REFERER, $_SERVER['HTTP_HOST']);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$output = curl_exec($ch);
		
		setcookie('wpgmza_feedback_thanks', 'true');
		
		wp_redirect('admin.php?page=wp-google-maps-menu');
		exit;
	}
}

?>