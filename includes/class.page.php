<?php

namespace WPGMZA;

class Page extends Factory
{
	protected $_document;
	
	public function __construct()
	{
		$this->_document = $document = new DOMDocument();
	}
	
	protected function disableProFeatures()
	{
		global $wpgmza;
		
		if($wpgmza->isProVersion())
			return;
		
		$this->document->querySelectorAll('
			input.wpgmza-pro-feature, 
			select.wpgmza-pro-feature, 
			textarea.wpgmza-pro-feature, 
			.wpgmza-pro-feature input, 
			.wpgmza-pro-feature select, 
			.wpgmza-pro-feature textarea')
			->setAttribute('disabled', 'disabled')
			->setAttribute('title', __('Get the Pro add-on to enable this feature'));
		
		foreach($this->document->querySelectorAll('a[href="#marker-filtering"]') as $el)
			$el->parentNode->remove();

		$this->document->querySelectorAll('#heatmaps')->removeAttribute('data-wpgmza-feature-type');
		$this->document->querySelectorAll('#imageoverlays')->removeAttribute('data-wpgmza-feature-type');
	}

	protected function hideSelectedProFeatures() {
		global $wpgmza;
		
		if($wpgmza->isProVersion())
			return;

		$this->document->querySelectorAll('.sidebar .item.hide-pro')
			->setAttribute('style', 'display:none;');
		
		$this->document->querySelectorAll('.wpgmza-pro-feature-hide')
			->setAttribute('style', 'display:none;');

		$this->document->querySelectorAll('.wpgmza-pro-feature-upsell')
			->setAttribute('style', 'display:none;');
			
	}
	
	protected function addFormNonces()
	{
		foreach($this->_document->querySelectorAll("form") as $form)
		{
			if(!$form->hasAttribute("action"))
				throw new \Exception("Form has no action to generate nonce with");
			
			$action	= $form->getAttribute("action");
			$nonce	= wp_create_nonce("wpgmza_$action");
			
			$input = $this->_document->createElement("input");
			$input->setAttribute("type", "hidden");
			$input->setAttribute("name", "nonce");
			$input->setAttribute("value", $nonce);
			
			$form->prepend($input);
		}

	    /* Developer Hook (Action) - Add form nonces to Pages, or more speciically forms within pages, passes DOMDocument for mutation */     
		do_action("wpgmza_page_dom_add_form_nonces", $this->_document);
	}
	
	protected function isNonceValid($form, $nonce)
	{
		if(!($form instanceof DOMElement))
			throw new \Exception("Expected a DOMElement");
		
		if(!preg_match('/^form$/i', $form->nodeName))
			throw new \Exception("Method only valid on forms");
		
		$action	= $form->getAttribute("action");
		
		return wp_verify_nonce($nonce, "wpgmza_$action");
	}
	
	public function __get($name)
	{
		switch($name)
		{
			case "document":
				return $this->{"_$name"};
				break;
			
			case "html":
				return $this->_document->html;
				break;
		}
	}
	public static function hideChat() {
		update_user_meta( get_current_user_id(), 'wpgmza_hide_chat', 1 );
		die();
	}
}
add_action('wp_ajax_wpgmza_hide_chat', array('WPGMZA\\Page', 'hideChat'));
