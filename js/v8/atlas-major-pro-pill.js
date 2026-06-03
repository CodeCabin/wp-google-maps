/**
 * @namespace WPGMZA
 * @module AtlasMajorProPill
 * @requires WPGMZA
 *
 * Click handler for the "Pro" pills that visually replace locked
 * toggle switches inside `.wpgmza-pro-feature` fieldsets / tab-rows
 * (see input.css `.wpgmza-pro-feature .switch` block). The pill
 * navigates to the Pro purchase page in a new tab when clicked.
 *
 * Body-delegated so it works for Pro fields rendered after page
 * load (Pro feature panels, dynamic templates) as well as static
 * ones on the settings page and map editor sidebar.
 */
jQuery(function($){

	if(!document.querySelector('.wpgmza-atlas-major'))
		return;

	var UPGRADE_URL = 'https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=pro-pill-locked-toggle-atlas-major-v10';

	$(document.body).on('click', '.wpgmza-pro-feature .switch', function(e){
		e.preventDefault();
		e.stopPropagation();
		window.open(UPGRADE_URL, '_blank', 'noopener');
	});

});
