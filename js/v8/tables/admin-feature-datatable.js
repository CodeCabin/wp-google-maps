/**
 * @namespace WPGMZA
 * @module AdminFeatureDataTable
 * @requires WPGMZA.DataTable
 */
jQuery(function($) {
	
	WPGMZA.AdminFeatureDataTable = function(element)
	{
		var self = this;

		this.allSelected = false;

		
		WPGMZA.DataTable.call(this, element);
		
		this.initModals();

		$(element).on("click", ".wpgmza.bulk_delete", function(event) {
			self.onBulkDelete(event);
		});

		$(element).on("click", ".wpgmza.select_all_markers", function(event) {
			self.onSelectAll(event);
		});

		$(element).on("click", ".wpgmza.bulk_edit", function(event) {
			self.onBulkEdit(event);
		});
		
		// TODO: Move to dedicated marker class, or center feature ID instead
		$(element).on("click", "[data-center-marker-id]",function(event) {
			self.onCenterMarker(event);
		});

		$(element).on("click", "[data-duplicate-feature-id]", function(event) {
			self.onDuplicate(event);
		});

		$(element).on("click", "[data-move-map-feature-id]", function(event) {
			self.onMoveMap(event);
		});
	}
	
	WPGMZA.extend(WPGMZA.AdminFeatureDataTable, WPGMZA.DataTable);
	
	Object.defineProperty(WPGMZA.AdminFeatureDataTable.prototype, "featureType", {
		
		"get": function() {
			return $(this.element).attr("data-wpgmza-feature-type");
		}
		
	});
	
	Object.defineProperty(WPGMZA.AdminFeatureDataTable.prototype, "featurePanel", {
		
		"get": function() {
			return WPGMZA.mapEditPage[this.featureType + "Panel"];
		}
		
	});

	WPGMZA.AdminFeatureDataTable.prototype.initModals = function(){
		this.moveModal = false;
		this.bulkEditorModal = false;

		if(this.featureType === 'marker'){
			if($('.wpgmza-map-select-modal').length){
				this.moveModal = WPGMZA.GenericModal.createInstance($('.wpgmza-map-select-modal'));
			}

			if($('.wpgmza-bulk-marker-editor-modal').length){
				this.bulkEditorModal = WPGMZA.GenericModal.createInstance($('.wpgmza-bulk-marker-editor-modal'));
			}
		}
	}
	
	WPGMZA.AdminFeatureDataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var options = WPGMZA.DataTable.prototype.getDataTableSettings.call(this);
		
		options.createdRow = function(row, data, index)
		{
			var meta = self.lastResponse.meta[index];
			row.wpgmzaFeatureData = meta;

			try {
				if($(row).find('.wpgmza-toolbar .wpgmza_approve_btn').length){
					$(row).addClass('wpgmza-row-needs-approval')
					$(row).attr('title', 'Pending Approval')
				}
			} catch (ex){	
				/* Nothing to do here */
			}
		}
		
		return options;
	}
	
	WPGMZA.AdminFeatureDataTable.prototype.onBulkDelete = function(event){
		var self = this;
		var ids = [];
		var map = WPGMZA.maps[0];
		var plural = this.featureType + "s";
		
		$(this.element).find("input[name='mark']:checked").each(function(index, el) {
			var row = $(el).closest("tr")[0];
			ids.push(row.wpgmzaFeatureData.id);
		});

		var result = confirm(WPGMZA.localized_strings.general_delete_prompt_text);
		if (result) {
			ids.forEach(function(marker_id) {
				var marker = map.getMarkerByID(marker_id);
				
				if(marker)
					map.removeMarker(marker);
			});
			
			WPGMZA.restAPI.call("/" + plural + "/", {
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

	WPGMZA.AdminFeatureDataTable.prototype.onSelectAll = function(event){
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

	WPGMZA.AdminFeatureDataTable.prototype.onBulkEdit = function(event){
		const self = this;
		const ids = [];
		const map = WPGMZA.maps[0];
		const plural = this.featureType + "s";

		$(this.element).find("input[name='mark']:checked").each(function(index, el) {
			var row = $(el).closest("tr")[0];
			ids.push(row.wpgmzaFeatureData.id);
		});

		if(this.bulkEditorModal && ids.length){
			this.bulkEditorModal.show(function(data){
				data.ids = ids;
				data.action = "bulk_edit";

				WPGMZA.restAPI.call("/" + plural + "/", {
					method: "POST",
					data: data,
					success: function(response, status, xhr) {
						self.reload();
					}
				});
			});
		}
	}
	
	// TODO: Move to dedicated marker class, or center feature ID instead
	WPGMZA.AdminFeatureDataTable.prototype.onCenterMarker = function(event){
		var id;

		//Check if we have selected the center on marker button or called this function elsewhere 
		if(event.currentTarget == undefined){
			id = event;
		} else {
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
			//WPGMZA.mapEditPage.map.setZoom(zoom_value);
			if(WPGMZA.InternalEngine.isLegacy()){
				/* Only applies in legacy */
				WPGMZA.animateScroll("#wpgmaps_tabs_markers");
			}
		}


	}

	WPGMZA.AdminFeatureDataTable.prototype.onDuplicate = function(event){
		const self = this;

		let id = false;
		if(event.currentTarget == undefined){
			id = event;
		} else {
			id = $(event.currentTarget).attr("data-duplicate-feature-id");
		}

		let plural = this.featureType + "s";
		
		WPGMZA.restAPI.call("/" + plural + "/", {
			method: "POST",
			data: {
				id: id,
				action: "duplicate"
			},
			success: function(response, status, xhr) {
				self.reload();
			}
		});

	}

	WPGMZA.AdminFeatureDataTable.prototype.onMoveMap = function(event){
		const self = this;

		let id = false;
		if(event.currentTarget == undefined){
			id = event;
		} else {
			id = $(event.currentTarget).attr("data-move-map-feature-id");
		}

		let plural = this.featureType + "s";
		
		if(this.moveModal){
			this.moveModal.show(function(data){
				const map = data.map_id ? parseInt(data.map_id) : false;

				if(map){
					WPGMZA.restAPI.call("/" + plural + "/", {
						method: "POST",
						data: {
							id: id,
							map_id : map,
							action: "move_map"
						},
						success: function(response, status, xhr) {
							self.reload();
						}
					});		
				}
			});
		}

	}
	
});