<?php

namespace WPGMZA;

class MigrationWizard extends \Smart\Document
{
	private $user_email;
	
	public function __construct()
	{
		\Smart\Document::__construct();
		
		if(isset($_POST['wpgmza_confirm_migration']))
		{
			$this->loadPHPFile(WPGMZA_DIR . 'html/migration-wizard-result.html');
			
			if(!set_time_limit(-1))
				$this->querySelector("#time-limit-warning")->setInlineStyle("display", "block");
			
			try{
				Plugin::install();
			}catch(\Exception $e) {
				$readable 			= print_r($e, true);
				$follow_up_email 	= filter_var($_POST['user_email'], FILTER_SANITIZE_EMAIL);
				$today				= date('Y-m-d H-i-s');
				$report 			= "Error Report - $today\r\n\r\n$readable";
				
				// Show the report to the user
				$this->querySelector('#wpgzma-report')->appendText($readable);
				
				// Report error if they have agreed to it
				if(isset($_POST['report-errors']))
				{
					wp_mail('perry@codecabin.co.za', 'WPGM V7 Error Report', $report, array('Reply-To: ' . $follow_up_email));
					wp_mail('nick@codecabin.co.za', 'WPGM V7 Error Report', $report, array('Reply-To: ' . $follow_up_email));
				}
				
				// Write the report to a file
				$filename = "wpgmza-error-report_$today.log";
				file_put_contents(WPGMZA_DIR . $filename, $report);
				
				return;
			}
			
			if(isset($_POST['use_legacy_html']))
			{
				// NB: We have to create the settings object here because the plugin hasn't initialized
				$settings = new Settings();
				$settings->use_legacy_html = 1;
			}
			
			wp_redirect(get_admin_url() . 'admin.php?page=wp-google-maps-menu&action=welcome_page');
			exit;
		}
		
		$this->loadPHPFile(WPGMZA_DIR . 'html/migration-wizard.html');
		
		// Reply to email
		$user = wp_get_current_user();
		$this->querySelector("input[name='user_email']")->setAttribute('value', $user->user_email);
		
		// Don't allow migrate if previous version is below V6
		$db_version = get_option('wpgmza_db_version');
		$db_version = new Version($db_version);
		
		if($db_version->major < 6)
			$this->querySelector('input[type="submit"]')->setAttribute('disabled', 'disabled');
		else
			$this->querySelector('#under-version-6')->remove();
	}
}

?>