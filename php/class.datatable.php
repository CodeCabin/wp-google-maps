<?php

namespace WPGMZA;

require_once(__DIR__ . '/../lib/smart/class.document.php');

use Smart;

class DataTable extends Smart\Document
{
	public function __construct($ajaxAction, $columns)
	{
		Smart\Document::__construct();
		
		$this->enqueueScripts();
		
		if(!is_string($ajaxAction) || empty($ajaxAction))
			throw new \Exception('First argument must be a string specifying AJAX action');
		
		if(!is_array($columns))
			throw new \Exception('Second argument must be an array of column names and friendly column labels');
		
		$this->loadHTML('
			<table class="wpgmza-datatable">
				<thead>
					<tr></tr>
				</thead>
				<tfoot>
					<tr></tr>
				</tfoot>
			</table>
		');
		
		$table = $this->querySelector('table');
		$table->setAttribute('data-ajax-action', $ajaxAction);
		
		$head = $this->querySelector('thead>tr');
		$foot = $this->querySelector('tfoot>tr');
		
		foreach($columns as $key => $label)
		{
			$th = $this->createElement('th');
			
			$th->appendText($label);
			$foot->appendChild($th->cloneNode(true));
			
			$th->setAttribute('data-column-key', $key);
			$head->appendChild($th);
		}
	}
	
	public function enqueueScripts()
	{
		wp_enqueue_script('datatables', '//cdn.datatables.net/1.10.13/js/jquery.dataTables.min.js', array('jquery'));
		wp_enqueue_script('wpgmza-datatable', WPGMZA_BASE . 'js/datatable.js', array(
			'jquery',
			'datatables'
		));
	}
	
	public function handleAjaxRequests()
	{
		throw new \Exception('Abstract function called');
	}
}

?>