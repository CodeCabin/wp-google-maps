<?php

namespace WPGMZA;

class MapListPage extends Page
{
	public function __construct()
	{
		global $wpgmza;
		
		$this->_document = new \WPGMZA\DOMDocument();
		$this->_document->loadPHPFile($wpgmza->internalEngine->getTemplate('map-list-page.html.php'));
		
		// Review nag
		if(isset($_GET['wpgmza-close-review-nag']))
			update_option('wpgmza-review-nag-closed', true);
		
		$daysSinceFirstRun = 0;
		if($str = get_option('wpgmza-first-run'))
		{
			$datetime	= \DateTime::createFromFormat(\DateTime::ISO8601, $str);
			$now		= new \DateTime();
			$diff		= $now->diff($datetime);
			
			$daysSinceFirstRun = $diff->days;
		}
		
		if($wpgmza->isProVersion() 
			|| get_option('wpgmza-review-nag-closed') 
			|| $daysSinceFirstRun < 10)
		{
			$this->document->querySelectorAll(".wpgmza-review-nag")->remove();

			if($wpgmza->isProVersion())
			{
				ProPage::enableProFeatures($this->document);
				ProPage::removeUpsells($this->document);
			}
		}

		$notices = $wpgmza->adminNotices->displayNext();
		$noticeWrapper = $this->document->querySelector('.wpgmza-persistent-notice-container');
		if(!empty($notices)){
			$noticeWrapper->import($notices);

			if($wpgmza->isProVersion()){
				/* Using Pro, but Pre V9 needs to hide persistent notices as they become unfunctional */
				if(method_exists($wpgmza, 'getProVersion')){
					if(version_compare($wpgmza->getProVersion(), '9.0.0', '<')){
						$noticeWrapper->remove();
					}
				}
			}
		} else {
			$noticeWrapper->remove();
		}
		
		// The map table
		$adminMapDataTableOptions = array(
			"pageLength" => 25,
			 "order" => [[ 1, "desc" ]]
		);

		$adminMapDataTable = new \WPGMZA\AdminMapDataTable(null, $adminMapDataTableOptions);
		$this->hideSelectedProFeatures();
		$this->_document->querySelector("#wpgmza-admin-map-table-container")->import($adminMapDataTable->document->html);

	    /* Developer Hook (Action) - Alter output of the map list page, passes DOMDocument for mutation */     
		do_action("wpgmza_map_list_page_created", $this->_document);
	}
	
	public function __get($name)
	{
		switch($name)
		{
			case "document":
				return $this->{"_$name"};
				break;
				
			case "html":
				return $this->document->html;
				break;
		}
	}
}