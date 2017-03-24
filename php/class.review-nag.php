<?php
 
namespace WPGMZA;

use Smart;

class ReviewNag extends Smart\Document
{
	public function __construct()
	{
		Smart\Document::__construct();
		$this->loadPHPFile(WPGMZA_DIR . 'html/review-nag.html');
		
		$now = new \DateTime();
		
		if(isset($_GET['action2']) && $_GET['action2'] == 'close_review')
			Plugin::$settings->review_nag = $now->format('Y-m-d H:i:s');
	}
	
	public static function shouldBeDisplayed()
	{
		if(isset(Plugin::$settings->review_nag))
			return false;
		
		$now = new \DateTime();
		
		$firstAccess = Plugin::$statistics->dashboard->first_accessed;
		$firstAccess = \DateTime::createFromFormat('Y-m-d H:i:s', $firstAccess);
		$interval = $firstAccess->diff($now);
		
		return ($interval->d >= 10);
	}
}

?>