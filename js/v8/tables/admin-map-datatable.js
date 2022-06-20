/**
 * @namespace WPGMZA
 * @module AdminDataTable
 * @requires WPGMZA.DataTable
 */
 jQuery(function($) {

 	WPGMZA.AdminMapDataTable = function(element) 
 	{	
 		var self = this;

		this.allSelected = false;

 		WPGMZA.DataTable.call(this, element);

    	$(element).on("mousedown", "button[data-action='edit']", function(event){
        	switch (event.which) {
                case 1:
					var map_id = $(event.target).attr("data-map-id");
					window.location.href = window.location.href + "&action=edit&map_id=" + map_id;
                    break;
                case 2:
                    var map_id = $(event.target).attr("data-map-id");
					window.open(window.location.href + "&action=edit&map_id=" + map_id);
                    break;
            }
        });

 		$(element).find(".wpgmza.select_all_maps").on("click", function(event) {
			self.onSelectAll(event); 
		});
		
		$(element).find(".wpgmza.bulk_delete_maps").on("click", function(event) {
			self.onBulkDelete(event);
		});

		$(element).on("click", "button[data-action='duplicate']", function(event) {

			var map_id = $(event.target).attr('data-map-id');

			WPGMZA.restAPI.call("/maps/", {
				method: "POST",
				data: {
					id: map_id,
					action: "duplicate"
				},
				success: function(response, status, xhr) {
					self.reload();
				}
			});

		}); 

 		$(element).on("click", "button[data-action='trash']", function(event) {

 			var result = confirm(WPGMZA.localized_strings.map_delete_prompt_text);

 			if (result) {

	 			var map_id = $(event.target).attr('data-map-id');

	 			WPGMZA.restAPI.call("/maps/", {
	 				method: "DELETE",
	 				data: {
	 					id: map_id
	 				},
	 				success: function(response, status, xhr) {
	 					self.reload();
	 				}
	 			})
	 		}

 		});
 	}

 	WPGMZA.extend(WPGMZA.AdminMapDataTable, WPGMZA.DataTable);

 	WPGMZA.AdminMapDataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var options = WPGMZA.DataTable.prototype.getDataTableSettings.call(this);
		
		options.createdRow = function(row, data, index)
		{
			var meta = self.lastResponse.meta[index];
			row.wpgmzaMapData = meta;
		}
		
		return options;
	}

 	WPGMZA.AdminMapDataTable.prototype.onSelectAll = function(event)
	{
		this.allSelected = !this.allSelected;

		var self = this;
		$(this.element).find("input[name='mark']").each(function(){
			if(self.allSelected){
				$(this).prop("checked", true);
			} else {
				$(this).prop("checked", false);
			}
		});
	}

	WPGMZA.AdminMapDataTable.prototype.onBulkDelete = function(event)
	{
		var self = this;
		var ids = [];
		
		$(this.element).find("input[name='mark']:checked").each(function(index, el) {
			var row = $(el).closest("tr")[0];
			ids.push(row.wpgmzaMapData.id);
		});
		
		var result = confirm(WPGMZA.localized_strings.map_bulk_delete_prompt_text);

		if (result) {
			WPGMZA.restAPI.call("/maps/", {
				method: "DELETE",
				data: {
					ids: ids
				},
				complete: function() {
					self.reload();
				}
			});		
		}
	}

 	$(document).ready(function(event){

 		$("[data-wpgmza-admin-map-datatable]").each(function(index, el) {
 			WPGMZA.AdminMapDataTable = new WPGMZA.AdminMapDataTable(el);
 		});

 	});

 });
