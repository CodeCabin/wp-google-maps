<?php

namespace Smart;

class AjaxResponse
{
	const JSON		= 'application/json';
	const XML		= 'text/xml';
	const HTML		= 'text/html';
	const TEXT		= 'text/plain';

	private $format;

	public function __construct($format=AjaxResponse::XML)
	{
		switch($format)
		{
			case AjaxResponse::JSON:
			case AjaxResponse::XML:
			case AjaxResponse::HTML:
			case AjaxResponse::TEXT:
				$this->format = $format;
				break;
				
			default:
				throw new Exception('Invalid AJAX response format');
				break;
		}
	}
	
	public function send($object, $code=200)
	{
		http_response_code($code);
		
		header('Cache-Control: no-cache, must-revalidate');
		header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
		
		switch($this->format)
		{
			case AjaxResponse::XML:
			case AjaxResponse::HTML:
				$elem = ($object instanceof \DOMElement ? $object : null);
			
				if(!($object instanceof \DOMDocument || $object instanceof \DOMElement))
					throw new \Exception('XML/HTML format response can only send DOMDocument object');
				
				header('Content-type: ' . $this->format . '; charset=utf-8');
				
				if($this->format == AjaxResponse::XML)
					echo ($elem ? $object->ownerDocument->saveXML($elem) : $object->saveXML());
				else
					echo ($elem ? $object->ownerDocument->saveHTML($elem) : $object->saveHTML());
				
				break;
				
			case AjaxResponse::JSON:
				if(!(is_object($object) || is_array($object)))
					throw new \Exception('JSON format response can only send an object or an array');
				
				header('Content-type: application/json; charset=utf-8');
				echo json_encode($object);
			
				break;
				
			case AjaxResponse::TEXT:
				header('Content-type: text/plain; charset=utf-8');
				echo (string)$object;
				break;
		}
	}
}

?>