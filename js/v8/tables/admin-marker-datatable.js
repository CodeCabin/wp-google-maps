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
		
		// NB: Pro marker panel currently manages edit marker buttons
		
		$(element).on("click", "[data-delete-marker-id]", function(event) {
			self.onDeleteMarker(event);
		});
		
		$(element).find(".wpgmza.select_all_markers").on("click", function(event) {
			self.onSelectAll(event);
		});
		
		$(element).find(".wpgmza.bulk_delete").on("click", function(event) {
			self.onBulkDelete(event);
		});

		$(element).on("click", "[data-center-marker-id]", function(event) {
			self.onCenterMarker(event);
		});
	}
	
	WPGMZA.AdminMarkerDataTable.prototype = Object.create(WPGMZA.DataTable.prototype);
	WPGMZA.AdminMarkerDataTable.prototype.constructor = WPGMZA.AdminMarkerDataTable;
	
	WPGMZA.AdminMarkerDataTable.createInstance = function(element)
	{
		return new WPGMZA.AdminMarkerDataTable(element);
	}
	
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
	
	WPGMZA.AdminMarkerDataTable.prototype.onEditMarker = function(event)
	{
		WPGMZA.animatedScroll("#wpgmaps_tabs_markers");
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onDeleteMarker = function(event)
	{
		var self	= this;
		var id		= $(event.currentTarget).attr("data-delete-marker-id");
		
		var data	= {
			action: 'delete_marker',
			security: WPGMZA.legacyajaxnonce,
			map_id: WPGMZA.mapEditPage.map.id,
			marker_id: id
		};
		
		$.post(ajaxurl, data, function(response) {
			
			WPGMZA.mapEditPage.map.removeMarkerByID(id);
			self.reload();
			
		});
	}
	
	// NB: Move this to UGM
	WPGMZA.AdminMarkerDataTable.prototype.onApproveMarker = function(event)
	{
		var self	= this;
		var cur_id	= $(this).attr("id");
		
		var data = {
			action:		'approve_marker',
			security:	WPGMZA.legacyajaxnonce,
			map_id:		WPGMZA.mapEditPage.map.id,
			marker_id:	cur_id
		};
		$.post(ajaxurl, data, function (response) {
			
			
			wpgmza_InitMap();
			wpgmza_reinitialisetbl();

		});
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onSelectAll = function(event)
	{
		$(this.element).find("input[name='mark']").prop("checked", true);
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onBulkDelete = function(event)
	{
		var self = this;
		var ids = [];
		var map = WPGMZA.maps[0];
		
		$(this.element).find("input[name='mark']:checked").each(function(index, el) {
			var row = $(el).closest("tr")[0];
			ids.push(row.wpgmzaMarkerData.id);
		});
		
		ids.forEach(function(marker_id) {
			var marker = map.getMarkerByID(marker_id);
			
			if(marker)
				map.removeMarker(marker);
		});
		
		WPGMZA.restAPI.call("/markers/", {
			method: "DELETE",
			data: {
				ids: ids
			},
			complete: function() {
				self.reload();
			}
		});
	}

	WPGMZA.AdminMarkerDataTable.prototype.onCenterMarker = function(event)
	{
		var id;

		//Check if we have selected the center on marker button or called this function elsewhere 
		if(event.currentTarget == undefined)
		{
			id = event;
		}
		else{
			id = $(event.currentTarget).attr("data-center-marker-id");
		}

		var marker = WPGMZA.mapEditPage.map.getMarkerByID(id);
		
		if(marker){
			var latLng = new WPGMZA.LatLng({
				lat: marker.lat,
				lng: marker.lng
			});
			
			//Set a static zoom level
			var zoom_value = 6;
			WPGMZA.mapEditPage.map.setCenter(latLng);
			WPGMZA.mapEditPage.map.setZoom(zoom_value);
			WPGMZA.animateScroll("#wpgmaps_tabs_markers");
		}


	}
	
	$(document).ready(function(event) {
		
		$("[data-wpgmza-admin-marker-datatable]").each(function(index, el) {
			WPGMZA.adminMarkerDataTable = WPGMZA.AdminMarkerDataTable.createInstance(el);
		});
		
	});
	
});