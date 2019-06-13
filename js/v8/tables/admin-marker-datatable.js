/**
 * @namespace WPGMZA
 * @module AdminMarkerDataTable
 * @requires WPGMZA.DataTable
 */
jQuery(function($) {
	
	WPGMZA.AdminMarkerDataTable = function(element)
	{
		var self = this;
		
		this.preventCaching = true;
		
		WPGMZA.DataTable.call(this, element);
		
		$(element).find(".wpgmza.select_all_markers").on("click", function(event) {
			self.onSelectAll(event);
		});
		
		$(element).find(".wpgmza.bulk_delete").on("click", function(event) {
			self.onBulkDelete(event);
		});
	}
	
	WPGMZA.AdminMarkerDataTable.prototype = Object.create(WPGMZA.DataTable.prototype);
	WPGMZA.AdminMarkerDataTable.prototype.constructor = WPGMZA.AdminMarkerDataTable;
	
	WPGMZA.AdminMarkerDataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var options = WPGMZA.DataTable.prototype.getDataTableSettings.call(this);
		
		options.createdRow = function(row, data, index)
		{
			var meta = self.lastResponse.meta[index];
			row.wpgmzaMarkerData = meta;
		}
		
		return options;
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onSelectAll = function(event)
	{
		$(this.element).find("input[name='mark']").prop("checked", true);
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onBulkDelete = function(event)
	{
		var self = this;
		var ids = [];
		
		$(this.element).find("input[name='mark']:checked").each(function(index, el) {
			var row = $(el).closest("tr")[0];
			ids.push(row.wpgmzaMarkerData.id);
		});
		
		WPGMZA.restAPI.call("/markers/?skip_cache=1", {
			method: "DELETE",
			data: {
				ids: ids
			},
			complete: function() {
				self.reload();
			}
		});
	}
	
	$(document).ready(function(event) {
		
		$("[data-wpgmza-admin-marker-datatable]").each(function(index, el) {
			WPGMZA.adminMarkerDataTable = new WPGMZA.AdminMarkerDataTable(el);
		});
		
	});
	
});