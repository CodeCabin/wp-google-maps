<?php

namespace WPGMZA;

// header('Content-type: text/plain');

require_once(__DIR__ . '/class.marker.php');

// Create a new marker
$marker = Marker::create_instance();

// Trash it
$marker->trash();

// Create a new marker with data
$marker = Marker::create_instance(array(
	'map_id'	=> 1,
	'lat'		=> 52,
	'lng'		=> -2,
	'title'		=> 'Bristol',
	'link'		=> 'https://visitbristol.co.uk/'
));

// Access a field on the marker
$marker->address = "10 Weston Lodge, Weston-super-Mare, England";

// Alter a field on the marker
$marker->description = 'This is an example description';

// Add some variables to other_data
$marker->example = 'This will be automagically stored on other_data';

// Unset some data on the marker
unset($marker->example);

// Set multiple fields (to be economical with DB calls)
$marker->set(array(
	'lat'					=> 51.4545,
	'lng'					=> -2.5879,
	'address'				=> 'Bristol, UK',
	'some_arbitrary_data'	=> 'yes'	// This will be stored in other_data
));

// Store some object data on the marker
$marker->example_object_data = (object)array(
	'test'		=> 1,
	'arr'		=> array('apple', 'orange', 'banana')
);

// Iterate over the markers fields and do something with them
foreach($marker as $key => $value)
	echo "$key\t\t= " . print_r($value, true) . PHP_EOL;
	
// Save POST data to marker, without handling it!!
if(isset($_POST['action']) && $_POST['action'] == 'wpgmza_save_marker')
{
	$marker_id = $_POST['marker_id'];
	
	unset($_POST['marker_id']);
	unset($_POST['action']);
	
	$marker->set($_POST);
}
	
// Store the marker as JSON
$json = json_encode($marker);
echo "JSON string: " . $json . PHP_EOL;

// Get the new markers ID
$id = $marker->id;

echo "Marker ID: " . $id . PHP_EOL;

// Forget the marker
unset($marker);

// Load an existing marker
$marker = Marker::create_instance($id);

// Get rid of the marker now we're done with it
$marker->trash();

// Now lets do some really cool stuff
$marker = Marker::create_instance();

// The Marker object loads the markers custom fields through a CustomMarkerFields object
$marker->custom_fields->my_custom_field = 'How cool is this';

var_dump($marker->custom_fields->test);

exit;