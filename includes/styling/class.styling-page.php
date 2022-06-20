<?php
/* 
 * Manages styling page 
*/
namespace WPGMZA;

class StylingPage extends Page {
	public function __construct() {
		global $wpgmza;
		
		Page::__construct();
		
		$this->document->loadPHPFile($wpgmza->internalEngine->getTemplate('styling-page.html.php'));

		$storeDemo = new DOMDocument();
		$storeDemo->loadPHPFile($wpgmza->internalEngine->getTemplate('store-locator.html.php'));

		@$this->document->querySelector('.wpgmza-styling-preview-wrap .wpgmza-inner-stack.top')->import($storeDemo->html);

		$this->form = $this->document->querySelector('form');

	    /* Developer Hook (Action) - Alter output of the styling page, passes DOMDocument for mutation */     
		do_action("wpgmza_styling_page_created", $this->document);

		if(empty($_POST)) {
			$this->document->populate($wpgmza->stylingSettings);
			$this->addFormNonces();
		} else {
			if(!$this->isNonceValid($this->form, $_POST['nonce']))
				throw new \Exception("Invalid nonce");

			$data = array_map('stripslashes', $_POST);

			$this->document->populate($data);
			
			$data = $this->form->serializeFormData();

			/* Developer Hook (Filter) - Modify storage data for styling tab */
			$data = apply_filters("wpgmza_styling_settings_save", $data);
			
			foreach($data as $key => $value){
				$wpgmza->stylingSettings->{$key} = $value;
			}
			
			wp_redirect($_SERVER['HTTP_REFERER']);
			return;
		}
	}
}


add_action('admin_post_wpgmza_save_styling_settings', function() {
	$stylingPage = StylingPage::createInstance();
});
