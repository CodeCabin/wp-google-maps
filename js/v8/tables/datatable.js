/**
 * @namespace WPGMZA
 * @module DataTable
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.DataTable = function(element)
	{
		$.fn.dataTable.ext.errMode = "throw";
		
		this.element = element;
		this.element.wpgmzaDataTable = this;

		this.phpClass			= $(element).attr("data-wpgmza-php-class");
		this.dataTable			= $(element).find("table").DataTable(this.getDataTableSettings());
		this.wpgmzaDataTable	= this;
	}
	
	WPGMZA.DataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var element = this.element;
		var options = {};
		var ajax;
		
		if($(element).attr("data-wpgmza-datatable-options"))
			options = JSON.parse($(element).attr("data-wpgmza-datatable-options"));
		
		if(ajax = $(element).attr("data-wpgmza-rest-api-route"))
		{
			options.ajax = {
				url: WPGMZA.resturl + ajax,
				method: "POST",	// We don't use GET because the request can get bigger than some browsers maximum URL lengths
				data: function(data, settings) {
					return self.onAJAXRequest(data, settings);
				}
			};
			
			options.processing = true;
			options.serverSide = true;
		}
		
		return options;
	}
	
	/**
	 * This function wraps the request so it doesn't collide with WP query vars,
	 * it also adds the PHP class so that the controller knows which class to 
	 * instantiate
	 * @return object
	 */
	WPGMZA.DataTable.prototype.onAJAXRequest = function(data, settings)
	{
		var params = {
			"phpClass":	this.phpClass
		};
		
		var attr = $(this.element).attr("data-wpgmza-ajax-parameters");
		if(attr)
			$.extend(params, JSON.parse(attr));
		
		$.extend(data, params);
		
		return {
			wpgmzaDataTableRequestData: data
		};
	}
	
	WPGMZA.DataTable.prototype.onAJAXResponse = function(response)
	{
		
	}
	
	WPGMZA.DataTable.prototype.reload = function()
	{
		this.dataTable.ajax.reload(null, false); // null callback, false for resetPaging
	}
	
	$(document).ready(function(event) {
		
		$("[data-wpgmza-datatable]:not([data-wpgmza-admin-marker-datatable])").each(function(index, el) {
			
			el.wpgmzaDataTable = new WPGMZA.DataTable(el);
			
		});
		
	});
	
});