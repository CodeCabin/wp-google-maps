<?php

add_filter('wpgmza_output_filter', 'example');
function example($document)
{
	foreach($document->querySelectorAll(".wpgmza-marker-listing .wpgmza-item *[name='address']") as $element)
		$element->appendText(" - Filtered!");
	
	return $document;
}

?>