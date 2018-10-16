jQuery(function($) {

	var mapid = jQuery("#wpgmza_id").val();

	var data = {
		action: 'track_usage',
		mapid: mapid
	}

	jQuery.post(ajaxurl, data, function( response ){

	});

});